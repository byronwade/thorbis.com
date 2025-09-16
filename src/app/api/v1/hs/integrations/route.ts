import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Integration schemas
const IntegrationSchema = z.object({
  integration_type: z.enum([
    'accounting', 'payment', 'crm', 'marketing', 'inventory', 'calendar', 
    'communication', 'mapping', 'weather', 'background_check', 'insurance',
    'parts_supplier', 'dispatch', 'mobile_app', 'iot_device', 'webhook'
  ]),
  provider_name: z.string().min(1).max(100),
  display_name: z.string().min(1).max(255),
  description: z.string().optional(),
  
  // Configuration
  config: z.object({
    api_key: z.string().optional(),
    secret_key: z.string().optional(),
    endpoint_url: z.string().url().optional(),
    webhook_url: z.string().url().optional(),
    auth_type: z.enum(['api_key', 'oauth2', 'basic_auth', 'bearer_token']).optional(),
    refresh_token: z.string().optional(),
    expires_at: z.string().datetime().optional(),
    
    // Provider-specific settings
    sandbox_mode: z.boolean().optional(),
    rate_limit: z.number().min(1).optional(),
    timeout: z.number().min(1000).optional(),
    retry_attempts: z.number().min(0).max(5).optional(),
    
    // Sync settings
    sync_enabled: z.boolean().default(false),
    sync_frequency: z.enum(['real_time', 'hourly', 'daily', 'weekly']).optional(),
    last_sync: z.string().datetime().optional(),
    
    // Field mapping
    field_mappings: z.record(z.string()).optional(),
    sync_direction: z.enum(['import', 'export', 'bidirectional']).optional(),
  }),
  
  // Status and metadata
  status: z.enum(['active', 'inactive', 'pending', 'error', 'testing']).default('pending'),
  enabled: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
});

const IntegrationQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  search: z.string().optional(),
  integration_type: z.enum([
    'accounting', 'payment', 'crm', 'marketing', 'inventory', 'calendar', 
    'communication', 'mapping', 'weather', 'background_check', 'insurance',
    'parts_supplier', 'dispatch', 'mobile_app', 'iot_device', 'webhook'
  ]).optional(),
  provider_name: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending', 'error', 'testing']).optional(),
  enabled: z.boolean().optional(),
  sort: z.enum(['created_at', 'provider_name', 'status', 'last_sync']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  include_config: z.boolean().default(false), // Security: don't include config by default
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

// Helper function to validate integration configuration
function validateIntegrationConfig(integrationType: string, config: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  switch (integrationType) {
    case 'accounting':
      if (!config.api_key && !config.auth_type) {
        errors.push('API key or auth type is required for accounting integrations');
      }
      break;
    
    case 'payment':
      if (!config.api_key || !config.secret_key) {
        errors.push('API key and secret key are required for payment integrations');
      }
      break;
    
    case 'webhook':
      if (!config.webhook_url) {
        errors.push('Webhook URL is required for webhook integrations');
      }
      break;
    
    case 'crm':
      if (!config.endpoint_url && !config.api_key) {
        errors.push('Endpoint URL and API key are required for CRM integrations');
      }
      break;
  }
  
  // Common validations
  if (config.rate_limit && config.rate_limit < 1) {
    errors.push('Rate limit must be at least 1 request per minute');
  }
  
  if (config.retry_attempts && (config.retry_attempts < 0 || config.retry_attempts > 5)) {
    errors.push('Retry attempts must be between 0 and 5');
  }
  
  return { valid: errors.length === 0, errors };
}

// Helper function to test integration connection
async function testIntegrationConnection(integration: unknown): Promise<{ success: boolean; error?: string; latency?: number }> {
  const startTime = Date.now();
  
  try {
    switch (integration.integration_type) {
      case 'webhook':
        if (!integration.config.webhook_url) {
          return { success: false, error: 'No webhook URL configured' };
        }
        
        // Test webhook endpoint with a ping
        const response = await fetch(integration.config.webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Thorbis-Integration-Test/1.0',
          },
          body: JSON.stringify({
            test: true,
            timestamp: new Date().toISOString(),
            integration_id: integration.id,
          }),
        });
        
        const latency = Date.now() - startTime;
        return { 
          success: response.ok, 
          error: response.ok ? undefined : 'HTTP ${response.status}: ${response.statusText}',
          latency 
        };
      
      case 'accounting':
      case 'payment':
      case 'crm':
        // For API-based integrations, test the connection
        if (!integration.config.endpoint_url) {
          return { success: false, error: 'No endpoint URL configured' };
        }
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': 'Thorbis-Integration-Test/1.0',
        };
        
        if (integration.config.api_key) {
          headers['Authorization'] = 'Bearer ${integration.config.api_key}';
        }
        
        const apiResponse = await fetch(integration.config.endpoint_url, {
          method: 'GET',
          headers,
        });
        
        const apiLatency = Date.now() - startTime;
        return { 
          success: apiResponse.ok, 
          error: apiResponse.ok ? undefined : 'HTTP ${apiResponse.status}: ${apiResponse.statusText}',
          latency: apiLatency
        };
      
      default:
        return { success: true, error: 'Connection test not implemented for this integration type' };
    }
  } catch (error) {
    const latency = Date.now() - startTime;
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      latency 
    };
  }
}

// Helper function to log integration activity
async function logIntegrationActivity(
  integrationId: string,
  activityType: string,
  description: string, metadata: unknown,
  organizationId: string,
  userId?: string
) {
  await supabase
    .from('hs.integration_activity_log')
    .insert({
      integration_id: integrationId,
      activity_type: activityType,
      activity_description: description,
      metadata,
      organization_id: organizationId,
      created_by: userId,
    });
}

// Helper function to sanitize integration config for response
function sanitizeIntegrationConfig(integration: unknown, includeConfig: boolean = false) {
  const sanitized = { ...integration };
  
  if (!includeConfig) {
    delete sanitized.config;
  } else if (sanitized.config) {
    // Remove sensitive fields
    const sensitiveFields = ['api_key', 'secret_key', 'refresh_token', 'password'];
    sensitiveFields.forEach(field => {
      if (sanitized.config[field]) {
        sanitized.config[field] = '***REDACTED***';
      }
    });
  }
  
  return sanitized;
}

// GET /api/v1/hs/integrations - List integrations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = IntegrationQuerySchema.parse(Object.fromEntries(searchParams));

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
      .from('hs.integrations')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (query.integration_type) {
      supabaseQuery = supabaseQuery.eq('integration_type', query.integration_type);
    }
    
    if (query.provider_name) {
      supabaseQuery = supabaseQuery.eq('provider_name', query.provider_name);
    }
    
    if (query.status) {
      supabaseQuery = supabaseQuery.eq('status', query.status);
    }
    
    if (query.enabled !== undefined) {
      supabaseQuery = supabaseQuery.eq('enabled', query.enabled);
    }

    // Apply search
    if (query.search) {
      supabaseQuery = supabaseQuery.or(
        'provider_name.ilike.%${query.search}%,display_name.ilike.%${query.search}%,description.ilike.%${query.search}%'
      );
    }

    // Apply sorting and pagination
    const offset = (query.page - 1) * query.limit;
    supabaseQuery = supabaseQuery
      .order(query.sort, { ascending: query.order === 'asc' })
      .range(offset, offset + query.limit - 1);

    const { data: integrations, error, count } = await supabaseQuery;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch integrations' },
        { status: 500 }
      );
    }

    // Sanitize integrations
    const sanitizedIntegrations = integrations?.map(integration => 
      sanitizeIntegrationConfig(integration, query.include_config)
    ) || [];

    const totalPages = Math.ceil((count || 0) / query.limit);

    // Get integration statistics
    const { data: allIntegrations } = await supabase
      .from('hs.integrations')
      .select('integration_type, status, enabled')
      .eq('organization_id', organizationId);

    const summary = {
      total_integrations: count || 0,
      active_integrations: allIntegrations?.filter(i => i.status === 'active').length || 0,
      enabled_integrations: allIntegrations?.filter(i => i.enabled).length || 0,
      by_type: allIntegrations?.reduce((acc, integration) => {
        acc[integration.integration_type] = (acc[integration.integration_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      by_status: allIntegrations?.reduce((acc, integration) => {
        acc[integration.status] = (acc[integration.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
    };

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('hs.integration_activity_log')
      .select('
        id,
        activity_type,
        activity_description,
        created_at,
        integrations!inner(provider_name, display_name)
      ')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      integrations: sanitizedIntegrations,
      summary,
      recent_activity: recentActivity || [],
      pagination: {
        page: query.page,
        limit: query.limit,
        total: count || 0,
        totalPages,
        hasMore: query.page < totalPages,
      },
    });

  } catch (error) {
    console.error('GET /api/v1/hs/integrations error:', error);
    
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

// POST /api/v1/hs/integrations - Create new integration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const integrationData = IntegrationSchema.parse(body);

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

    // Validate integration configuration
    const configValidation = validateIntegrationConfig(integrationData.integration_type, integrationData.config);
    if (!configValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid integration configuration', details: configValidation.errors },
        { status: 400 }
      );
    }

    // Check for duplicate integrations
    const { data: existingIntegration } = await supabase
      .from('hs.integrations')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('provider_name', integrationData.provider_name)
      .single();

    if (existingIntegration) {
      return NextResponse.json(
        { error: 'Integration with this provider already exists' },
        { status: 409 }
      );
    }

    // Create integration
    const { data: integration, error } = await supabase
      .from('hs.integrations')
      .insert({
        ...integrationData,
        organization_id: organizationId,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create integration' },
        { status: 500 }
      );
    }

    // Test connection if status is active
    let connectionTest = null;
    if (integrationData.status === 'active' && integrationData.enabled) {
      connectionTest = await testIntegrationConnection(integration);
      
      // Update integration status based on connection test
      if (!connectionTest.success) {
        await supabase
          .from('hs.integrations')
          .update({ 
            status: 'error',
            error_message: connectionTest.error,
            last_tested: new Date().toISOString(),
          })
          .eq('id', integration.id);
        
        integration.status = 'error';
        integration.error_message = connectionTest.error;
      } else {
        await supabase
          .from('hs.integrations')
          .update({ 
            last_tested: new Date().toISOString(),
            connection_latency: connectionTest.latency,
          })
          .eq('id', integration.id);
      }
    }

    // Log integration creation
    await logIntegrationActivity(
      integration.id,
      'integration_created',
      'Integration created: ${integration.display_name}',
      {
        integration_type: integration.integration_type,
        provider_name: integration.provider_name,
        connection_test: connectionTest,
      },
      organizationId,
      user.id
    );

    return NextResponse.json(
      { 
        integration: sanitizeIntegrationConfig(integration, false),
        connection_test: connectionTest,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST /api/v1/hs/integrations error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid integration data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}