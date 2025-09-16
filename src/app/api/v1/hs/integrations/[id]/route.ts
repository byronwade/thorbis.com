import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Integration update schema
const IntegrationUpdateSchema = z.object({
  display_name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  
  config: z.object({
    api_key: z.string().optional(),
    secret_key: z.string().optional(),
    endpoint_url: z.string().url().optional(),
    webhook_url: z.string().url().optional(),
    auth_type: z.enum(['api_key', 'oauth2', 'basic_auth', 'bearer_token']).optional(),
    refresh_token: z.string().optional(),
    expires_at: z.string().datetime().optional(),
    
    sandbox_mode: z.boolean().optional(),
    rate_limit: z.number().min(1).optional(),
    timeout: z.number().min(1000).optional(),
    retry_attempts: z.number().min(0).max(5).optional(),
    
    sync_enabled: z.boolean().optional(),
    sync_frequency: z.enum(['real_time', 'hourly', 'daily', 'weekly']).optional(),
    
    field_mappings: z.record(z.string()).optional(),
    sync_direction: z.enum(['import', 'export', 'bidirectional']).optional(),
  }).optional(),
  
  status: z.enum(['active', 'inactive', 'pending', 'error', 'testing']).optional(),
  enabled: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
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

// Helper function to verify integration access
async function verifyIntegrationAccess(integrationId: string, organizationId: string) {
  const { data: integration } = await supabase
    .from('hs.integrations')
    .select('id')
    .eq('id', integrationId)
    .eq('organization_id', organizationId)
    .single();
  
  return !!integration;
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

// Helper function to sanitize integration config
function sanitizeIntegrationConfig(integration: unknown, includeConfig: boolean = false) {
  const sanitized = { ...integration };
  
  if (!includeConfig) {
    delete sanitized.config;
  } else if (sanitized.config) {
    const sensitiveFields = ['api_key', 'secret_key', 'refresh_token', 'password'];
    sensitiveFields.forEach(field => {
      if (sanitized.config[field]) {
        sanitized.config[field] = '***REDACTED***';
      }
    });
  }
  
  return sanitized;
}

// GET /api/v1/hs/integrations/[id] - Get specific integration
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const integrationId = params.id;
    const { searchParams } = new URL(request.url);
    const includeConfig = searchParams.get('include_config') === 'true';
    const includeActivity = searchParams.get('include_activity') !== 'false';

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

    // Verify integration access
    if (!(await verifyIntegrationAccess(integrationId, organizationId))) {
      return NextResponse.json(
        { error: 'Integration not found or access denied' },
        { status: 404 }
      );
    }

    // Get integration
    const { data: integration, error } = await supabase
      .from('hs.integrations')
      .select('
        *,
        created_by_user:created_by(first_name, last_name)
      ')
      .eq('id', integrationId)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch integration' },
        { status: 500 }
      );
    }

    // Get sync statistics
    const { data: syncStats } = await supabase
      .from('hs.integration_sync_log')
      .select('id, sync_status, records_processed, created_at')
      .eq('integration_id', integrationId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get activity log if requested
    let activities = [];
    if (includeActivity) {
      const { data: activityLog } = await supabase
        .from('hs.integration_activity_log')
        .select('
          *,
          created_by_user:created_by(first_name, last_name)
        ')
        .eq('integration_id', integrationId)
        .order('created_at', { ascending: false })
        .limit(50);

      activities = activityLog || [];
    }

    // Calculate health metrics
    const recentSyncs = syncStats?.slice(0, 5) || [];
    const successfulSyncs = recentSyncs.filter(sync => sync.sync_status === 'completed');
    const healthScore = recentSyncs.length > 0 ? (successfulSyncs.length / recentSyncs.length) * 100 : 0;

    const integrationDetails = {
      ...sanitizeIntegrationConfig(integration, includeConfig),
      health: {
        score: healthScore,
        recent_syncs: recentSyncs.length,
        successful_syncs: successfulSyncs.length,
        last_sync: syncStats?.[0]?.created_at || null,
        uptime_percentage: healthScore, // Simplified calculation
      },
      sync_statistics: {
        total_syncs: syncStats?.length || 0,
        recent_syncs: syncStats || [],
        total_records_processed: syncStats?.reduce((sum, sync) => sum + (sync.records_processed || 0), 0) || 0,
      },
      activities: includeActivity ? activities : undefined,
    };

    return NextResponse.json({
      integration: integrationDetails,
    });

  } catch (error) {
    console.error('GET /api/v1/hs/integrations/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/hs/integrations/[id] - Update integration
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const integrationId = params.id;
    const body = await request.json();
    const updateData = IntegrationUpdateSchema.parse(body);

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

    // Get current integration
    const { data: currentIntegration } = await supabase
      .from('hs.integrations')
      .select('*')
      .eq('id', integrationId)
      .eq('organization_id', organizationId)
      .single();

    if (!currentIntegration) {
      return NextResponse.json(
        { error: 'Integration not found or access denied' },
        { status: 404 }
      );
    }

    // Merge config if provided
    const finalUpdateData: unknown = { ...updateData };
    if (updateData.config) {
      finalUpdateData.config = {
        ...currentIntegration.config,
        ...updateData.config,
      };
    }

    // Update integration
    const { data: integration, error } = await supabase
      .from('hs.integrations')
      .update({
        ...finalUpdateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', integrationId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update integration' },
        { status: 500 }
      );
    }

    // Test connection if status changed to active or enabled changed
    let connectionTest = null;
    if ((updateData.status === 'active' || updateData.enabled === true) && 
        (currentIntegration.status !== 'active' || !currentIntegration.enabled)) {
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
            error_message: null, // Clear any previous error
          })
          .eq('id', integration.id);
      }
    }

    // Log changes
    const changes = [];
    for (const [key, value] of Object.entries(updateData)) {
      if (key !== 'config' && currentIntegration[key] !== value) {
        changes.push({
          field: key,
          old_value: currentIntegration[key],
          new_value: value,
        });
      }
    }

    if (updateData.config) {
      const configChanges = [];
      for (const [key, value] of Object.entries(updateData.config)) {
        if (currentIntegration.config?.[key] !== value) {
          configChanges.push({
            field: 'config.${key}',
            changed: true, // Don't log actual values for security
          });
        }
      }
      if (configChanges.length > 0) {
        changes.push({ field: 'config', changes: configChanges });
      }
    }

    if (changes.length > 0) {
      await logIntegrationActivity(
        integrationId,
        'integration_updated',
        'Integration configuration updated',
        { 
          changes,
          connection_test: connectionTest,
        },
        organizationId,
        user.id
      );
    }

    return NextResponse.json({ 
      integration: sanitizeIntegrationConfig(integration, false),
      connection_test: connectionTest,
    });

  } catch (error) {
    console.error('PUT /api/v1/hs/integrations/[id] error:', error);
    
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

// DELETE /api/v1/hs/integrations/[id] - Delete integration
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const integrationId = params.id;

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

    // Verify integration access
    if (!(await verifyIntegrationAccess(integrationId, organizationId))) {
      return NextResponse.json(
        { error: 'Integration not found or access denied' },
        { status: 404 }
      );
    }

    // Check if integration has active syncs
    const { data: activeSyncs } = await supabase
      .from('hs.integration_sync_log')
      .select('id')
      .eq('integration_id', integrationId)
      .eq('sync_status', 'running')
      .limit(1);

    if (activeSyncs && activeSyncs.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete integration with active sync operations' },
        { status: 409 }
      );
    }

    // Soft delete integration
    const { data: integration, error } = await supabase
      .from('hs.integrations')
      .update({
        status: 'inactive',
        enabled: false,
        deleted_at: new Date().toISOString(),
        deleted_by: user.id,
      })
      .eq('id', integrationId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to delete integration' },
        { status: 500 }
      );
    }

    // Log deletion
    await logIntegrationActivity(
      integrationId,
      'integration_deleted',
      'Integration was deleted',
      { deleted_by: user.id },
      organizationId,
      user.id
    );

    return NextResponse.json({ 
      message: 'Integration deleted successfully',
      integration: sanitizeIntegrationConfig(integration, false),
    });

  } catch (error) {
    console.error('DELETE /api/v1/hs/integrations/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}