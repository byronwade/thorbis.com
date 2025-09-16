/**
 * Accounting Integration Management API
 * Manages integrations with QuickBooks, Xero, and other accounting systems
 * 
 * Security: Organization-level access, OAuth2 token management
 * Features: Multi-provider support, automated sync, data mapping
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Request validation schemas
const IntegrationSetupSchema = z.object({
  organization_id: z.string().uuid(),
  provider: z.enum(['quickbooks', 'xero', 'sage', 'netsuite', 'wave']),
  configuration: z.object({
    oauth_settings: z.object({
      client_id: z.string().min(1),
      client_secret: z.string().min(1),
      redirect_uri: z.string().url(),
      scopes: z.array(z.string()).optional()
    }),
    sync_settings: z.object({
      auto_sync_enabled: z.boolean().default(true),
      sync_frequency: z.enum(['real_time', 'hourly', 'daily', 'weekly']).default('daily'),
      sync_direction: z.enum(['bidirectional', 'push_only', 'pull_only']).default('bidirectional'),
      data_types: z.array(z.enum([
        'customers', 
        'vendors', 
        'invoices', 
        'payments', 
        'expenses', 
        'chart_of_accounts',
        'tax_rates',
        'items_services'
      ])).default(['customers', 'invoices', 'payments'])
    }),
    mapping_settings: z.object({
      account_mappings: z.record(z.string()).optional(),
      tax_code_mappings: z.record(z.string()).optional(),
      custom_field_mappings: z.record(z.string()).optional()
    }).optional()
  })
});

const SyncTriggerSchema = z.object({
  organization_id: z.string().uuid(),
  provider: z.enum(['quickbooks', 'xero', 'sage', 'netsuite', 'wave']),
  sync_type: z.enum(['full', 'incremental', 'specific']).default('incremental'),
  data_types: z.array(z.string()).optional(),
  force_sync: z.boolean().default(false)
});

// GET /api/v1/integrations/accounting - List all accounting integrations
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organization_id parameter is required' },
        { status: 400 }
      );
    }

    // Fetch all accounting integrations for organization
    const { data: integrations, error } = await supabase
      .from('accounting_integrations')
      .select('
        id,
        organization_id,
        provider,
        status,
        configuration,
        last_sync_at,
        last_sync_status,
        sync_statistics,
        created_at,
        updated_at,
        organization:organizations(
          id,
          name,
          industry
        )
      ')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch accounting integrations' },
        { status: 500 }
      );
    }

    // Transform integrations for client consumption
    const transformedIntegrations = integrations?.map(integration => ({
      ...integration,
      display_info: {
        provider_name: getProviderDisplayName(integration.provider),
        status_display: formatStatusDisplay(integration.status),
        last_sync_display: integration.last_sync_at ? 
          formatRelativeTime(integration.last_sync_at) : 'Never synced',
        sync_health: calculateSyncHealth(integration),
        connection_status: getConnectionStatus(integration)
      },
      sync_summary: {
        total_records_synced: integration.sync_statistics?.total_records || 0,
        successful_syncs: integration.sync_statistics?.successful_syncs || 0,
        failed_syncs: integration.sync_statistics?.failed_syncs || 0,
        last_error: integration.sync_statistics?.last_error || null
      },
      // Remove sensitive configuration from response
      configuration: {
        sync_settings: integration.configuration?.sync_settings,
        mapping_settings: integration.configuration?.mapping_settings,
        // OAuth credentials are not returned for security
      }
    })) || [];

    return NextResponse.json({
      data: transformedIntegrations,
      meta: {
        total: transformedIntegrations.length,
        organization_id: organizationId,
        supported_providers: ['quickbooks', 'xero', 'sage', 'netsuite', 'wave']
      }
    });

  } catch (error) {
    console.error('Accounting integrations API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve accounting integrations' },
      { status: 500 }
    );
  }
}

// POST /api/v1/integrations/accounting - Create new accounting integration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = IntegrationSetupSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid integration configuration', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const supabase = createRouteHandlerClient({ cookies });

    // Check if integration already exists for this organization and provider
    const { data: existingIntegration } = await supabase
      .from('accounting_integrations')
      .select('id')
      .eq('organization_id', data.organization_id)
      .eq('provider', data.provider)
      .single();

    if (existingIntegration) {
      return NextResponse.json(
        { error: 'Integration with ${data.provider} already exists for this organization' },
        { status: 409 }
      );
    }

    // Verify organization exists and is active
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, status')
      .eq('id', data.organization_id)
      .single();

    if (orgError || !organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    if (organization.status !== 'active') {
      return NextResponse.json(
        { error: 'Cannot create integration for inactive organization' },
        { status: 400 }
      );
    }

    // Create the integration record
    const { data: integration, error: insertError } = await supabase
      .from('accounting_integrations')
      .insert({
        organization_id: data.organization_id,
        provider: data.provider,
        status: 'configuring',
        configuration: data.configuration,
        sync_statistics: {
          total_records: 0,
          successful_syncs: 0,
          failed_syncs: 0,
          last_sync_duration_ms: null,
          created_at: new Date().toISOString()
        }
      })
      .select('
        id,
        organization_id,
        provider,
        status,
        configuration,
        created_at,
        organization:organizations(id, name)
      ')
      .single();

    if (insertError) {
      console.error('Database error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create accounting integration' },
        { status: 500 }
      );
    }

    // Initialize OAuth flow for the provider
    const oauthUrl = await initializeOAuthFlow(integration.id, data.provider, data.configuration.oauth_settings);

    return NextResponse.json({
      data: {
        ...integration,
        oauth_authorization_url: oauthUrl,
        display_info: {
          provider_name: getProviderDisplayName(data.provider),
          status_display: 'Ready for OAuth Setup',
          setup_instructions: getSetupInstructions(data.provider)
        }
      },
      message: 'Accounting integration created successfully. Complete OAuth setup to activate.'
    }, { status: 201 });

  } catch (error) {
    console.error('Create integration API error:', error);
    return NextResponse.json(
      { error: 'Failed to create accounting integration' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/integrations/accounting/sync - Trigger manual sync
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = SyncTriggerSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid sync request', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { organization_id, provider, sync_type, data_types, force_sync } = validationResult.data;
    const supabase = createRouteHandlerClient({ cookies });

    // Get integration details
    const { data: integration, error: integrationError } = await supabase
      .from('accounting_integrations')
      .select('id, status, configuration, last_sync_at')
      .eq('organization_id', organization_id)
      .eq('provider', provider)
      .single();

    if (integrationError || !integration) {
      return NextResponse.json(
        { error: 'Accounting integration not found' },
        { status: 404 }
      );
    }

    if (integration.status !== 'connected' && !force_sync) {
      return NextResponse.json(
        { error: 'Integration must be connected to perform sync' },
        { status: 400 }
      );
    }

    // Check if sync is already in progress
    if (integration.status === 'syncing' && !force_sync) {
      return NextResponse.json(
        { error: 'Sync already in progress for this integration' },
        { status: 409 }
      );
    }

    // Update integration status to syncing
    await supabase
      .from('accounting_integrations')
      .update({ 
        status: 'syncing',
        updated_at: new Date().toISOString()
      })
      .eq('id', integration.id);

    // Queue the sync job (in a real implementation, this would use a job queue)
    const syncJob = await queueSyncJob({
      integration_id: integration.id,
      organization_id,
      provider,
      sync_type,
      data_types: data_types || integration.configuration.sync_settings.data_types,
      force_sync
    });

    return NextResponse.json({
      data: {
        sync_job_id: syncJob.id,
        integration_id: integration.id,
        status: 'sync_queued',
        sync_type,
        data_types: data_types || integration.configuration.sync_settings.data_types,
        estimated_completion: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes estimate
      },
      message: 'Sync job queued successfully'
    });

  } catch (error) {
    console.error('Sync trigger API error:', error);
    return NextResponse.json(
      { error: 'Failed to trigger sync' },
      { status: 500 }
    );
  }
}

// Helper Functions
function getProviderDisplayName(provider: string): string {
  const names: { [key: string]: string } = {
    quickbooks: 'QuickBooks Online',
    xero: 'Xero',
    sage: 'Sage Business Cloud',
    netsuite: 'NetSuite',
    wave: 'Wave Accounting'
  };
  return names[provider] || provider;
}

function formatStatusDisplay(status: string): string {
  const displays: { [key: string]: string } = {
    configuring: 'Setup Required',
    authorizing: 'Authorizing Connection',
    connected: 'Connected',
    syncing: 'Syncing Data',
    error: 'Connection Error',
    disconnected: 'Disconnected'
  };
  return displays[status] || status;
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now`;
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago';
  if (diffDays < 7) return '${diffDays} days ago';
  return past.toLocaleDateString();
}

function calculateSyncHealth(integration: unknown): 'healthy' | 'warning' | 'error' {
  const stats = integration.sync_statistics;
  if (!stats || stats.successful_syncs === 0) return 'warning';
  
  const errorRate = stats.failed_syncs / (stats.successful_syncs + stats.failed_syncs);
  if (errorRate > 0.2) return 'error';
  if (errorRate > 0.05) return 'warning';
  return 'healthy';
}

function getConnectionStatus(integration: unknown): 'connected' | 'disconnected' | 'expired' {
  if (integration.status === 'connected') {
    // Check if OAuth token might be expired (simplified check)
    const lastSync = new Date(integration.last_sync_at || integration.updated_at);
    const daysSinceLastSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastSync > 30) return 'expired';
    return 'connected';
  }
  return 'disconnected';
}

async function initializeOAuthFlow(integrationId: string, provider: string, oauthSettings: unknown): Promise<string> {
  // Mock OAuth URL generation - in real implementation, this would create actual OAuth URLs
  const baseUrls: { [key: string]: string } = {
    quickbooks: 'https://appcenter.intuit.com/connect/oauth2',
    xero: 'https://login.xero.com/identity/connect/authorize',
    sage: 'https://www.sageone.com/oauth2/auth/central',
    netsuite: 'https://system.netsuite.com/app/login/oauth2/authorize.nl',
    wave: 'https://api.waveapps.com/oauth2/authorize'
  };

  const params = new URLSearchParams({
    client_id: oauthSettings.client_id,
    redirect_uri: oauthSettings.redirect_uri,
    response_type: 'code',
    state: integrationId,
    scope: oauthSettings.scopes?.join(' ') || 'accounting.transactions accounting.contacts'
  });

  return '${baseUrls[provider]}?${params.toString()}';
}

function getSetupInstructions(provider: string): string {
  const instructions: { [key: string]: string } = {
    quickbooks: 'Click the OAuth link to connect your QuickBooks Online account. You\'ll need administrator access.',
    xero: 'Authorize Thorbis to access your Xero organization. Standard user permissions are sufficient.',
    sage: 'Connect your Sage Business Cloud account with read/write permissions for transactions.',
    netsuite: 'You\'ll need a NetSuite administrator to authorize the integration.',
    wave: 'Connect your Wave account to enable automatic transaction sync.'
  };
  return instructions[provider] || 'Follow the OAuth flow to connect your accounting system.`;
}

async function queueSyncJob(jobData: unknown) {
  // Mock job queuing - in real implementation, this would use Redis/Bull/SQS etc.
  const jobId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
  
  // Log the sync job creation
  console.log('Queued sync job ${jobId}:', jobData);
  
  // In production, this would return actual job information
  return {
    id: jobId,
    status: 'queued',
    created_at: new Date().toISOString(),
    ...jobData
  };
}