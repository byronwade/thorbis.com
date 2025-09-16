/**
 * QuickBooks Integration API
 * Specialized endpoints for QuickBooks Online integration
 * 
 * Features: OAuth flow, data sync, chart of accounts mapping, webhook handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

// QuickBooks-specific validation schemas
const QuickBooksAuthCallbackSchema = z.object({
  code: z.string().min(1),
  state: z.string().uuid(), // integration_id
  realmId: z.string().min(1) // QuickBooks Company ID
});

const QuickBooksDataSyncSchema = z.object({
  integration_id: z.string().uuid(),
  entity_types: z.array(z.enum([
    'Customer', 'Vendor', 'Item', 'Invoice', 'Payment', 
    'Expense', 'Account', 'TaxCode', 'CompanyInfo'
  ])).default(['Customer', 'Invoice', 'Payment']),
  sync_direction: z.enum(['push', 'pull', 'bidirectional']).default('bidirectional'),
  date_range: z.object({
    from: z.string().optional(),
    to: z.string().optional()
  }).optional()
});

// POST /api/v1/integrations/accounting/quickbooks/oauth-callback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = QuickBooksAuthCallbackSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid OAuth callback data', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { code, state: integrationId, realmId } = validationResult.data;
    const supabase = createRouteHandlerClient({ cookies });

    // Get integration record
    const { data: integration, error: integrationError } = await supabase
      .from('accounting_integrations')
      .select('*')
      .eq('id', integrationId)
      .eq('provider', 'quickbooks')
      .single();

    if (integrationError || !integration) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      );
    }

    // Exchange authorization code for access token
    const tokenResponse = await exchangeCodeForTokens(
      code,
      integration.configuration.oauth_settings
    );

    if (!tokenResponse.success) {
      return NextResponse.json(
        { error: 'Failed to obtain access token', details: tokenResponse.error },
        { status: 400 }
      );
    }

    // Get QuickBooks company information
    const companyInfo = await getQuickBooksCompanyInfo(
      tokenResponse.access_token,
      realmId
    );

    // Update integration with connection details
    const { error: updateError } = await supabase
      .from('accounting_integrations')
      .update({
        status: 'connected',
        configuration: {
          ...integration.configuration,
          connection_details: {
            company_id: realmId,
            company_name: companyInfo.company_name,
            access_token: tokenResponse.access_token,
            refresh_token: tokenResponse.refresh_token,
            token_expires_at: tokenResponse.expires_at,
            connected_at: new Date().toISOString()
          }
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', integrationId);

    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to save connection details' },
        { status: 500 }
      );
    }

    // Trigger initial data sync
    await triggerInitialSync(integrationId, realmId, tokenResponse.access_token);

    return NextResponse.json({
      data: {
        integration_id: integrationId,
        status: 'connected',
        company_info: companyInfo,
        sync_status: 'initial_sync_queued'
      },
      message: 'QuickBooks integration connected successfully'
    });

  } catch (error) {
    console.error('QuickBooks OAuth callback error:', error);
    return NextResponse.json(
      { error: 'Failed to complete OAuth flow' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/integrations/accounting/quickbooks/sync
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = QuickBooksDataSyncSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid sync request', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { integration_id, entity_types, sync_direction, date_range } = validationResult.data;
    const supabase = createRouteHandlerClient({ cookies });

    // Get integration with connection details
    const { data: integration, error: integrationError } = await supabase
      .from('accounting_integrations')
      .select('*')
      .eq('id', integration_id)
      .eq('provider', 'quickbooks')
      .single();

    if (integrationError || !integration) {
      return NextResponse.json(
        { error: 'QuickBooks integration not found' },
        { status: 404 }
      );
    }

    if (integration.status !== 'connected') {
      return NextResponse.json(
        { error: 'Integration is not connected' },
        { status: 400 }
      );
    }

    const connectionDetails = integration.configuration.connection_details;
    
    // Check if access token needs refresh
    const tokenValid = await checkAndRefreshToken(integration_id, connectionDetails);
    if (!tokenValid) {
      return NextResponse.json(
        { error: 'Unable to refresh access token. Re-authorization required.' },
        { status: 401 }
      );
    }

    // Perform sync based on entity types and direction
    const syncResults = await performQuickBooksSync({
      integration_id,
      company_id: connectionDetails.company_id,
      access_token: connectionDetails.access_token,
      entity_types,
      sync_direction,
      date_range,
      organization_id: integration.organization_id
    });

    // Update sync statistics
    await updateSyncStatistics(integration_id, syncResults);

    return NextResponse.json({
      data: {
        integration_id,
        sync_results: syncResults,
        completion_time: new Date().toISOString()
      },
      message: 'QuickBooks sync completed successfully'
    });

  } catch (error) {
    console.error('QuickBooks sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync QuickBooks data' },
      { status: 500 }
    );
  }
}

// GET /api/v1/integrations/accounting/quickbooks/entities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get('integration_id');
    const entityType = searchParams.get('entity_type'); // Customer, Invoice, etc.
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!integrationId) {
      return NextResponse.json(
        { error: 'integration_id parameter is required' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Get integration details
    const { data: integration, error: integrationError } = await supabase
      .from('accounting_integrations')
      .select('configuration')
      .eq('id', integrationId)
      .eq('provider', 'quickbooks')
      .single();

    if (integrationError || !integration) {
      return NextResponse.json(
        { error: 'QuickBooks integration not found' },
        { status: 404 }
      );
    }

    const connectionDetails = integration.configuration.connection_details;

    // Fetch entities from QuickBooks API
    const entities = await fetchQuickBooksEntities(
      connectionDetails.access_token,
      connectionDetails.company_id,
      entityType || 'Customer',
      limit
    );

    return NextResponse.json({
      data: entities,
      meta: {
        integration_id: integrationId,
        entity_type: entityType || 'Customer',
        total_count: entities.length,
        company_id: connectionDetails.company_id
      }
    });

  } catch (error) {
    console.error('QuickBooks entities fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch QuickBooks entities' },
      { status: 500 }
    );
  }
}

// Helper Functions
async function exchangeCodeForTokens(code: string, oauthSettings: unknown) {
  try {
    // Mock token exchange - in real implementation, this would call QuickBooks OAuth endpoint
    const mockTokenResponse = {
      access_token: 'qb_access_token_' + Math.random().toString(36).substr(2, 16),
      refresh_token: 'qb_refresh_token_' + Math.random().toString(36).substr(2, 16),
      token_type: 'Bearer',
      expires_in: 3600,
      expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
    };

    return {
      success: true,
      ...mockTokenResponse
    };
  } catch (_error) {
    return {
      success: false,
      error: 'Token exchange failed'
    };
  }
}

async function getQuickBooksCompanyInfo(accessToken: string, companyId: string) {
  // Mock company info - in real implementation, this would call QuickBooks API
  return {
    company_name: 'Demo QuickBooks Company',
    company_id: companyId,
    country: 'US',
    currency: 'USD',
    fiscal_year_start: 'January',
    subscription_status: 'Active'
  };
}

async function checkAndRefreshToken(integrationId: string, connectionDetails: unknown): Promise<boolean> {
  const expiresAt = new Date(connectionDetails.token_expires_at);
  const now = new Date();
  const bufferMinutes = 10; // Refresh 10 minutes before expiry

  if (now.getTime() + (bufferMinutes * 60 * 1000) < expiresAt.getTime()) {
    return true; // Token still valid
  }

  try {
    // Mock token refresh - in real implementation, use refresh_token to get new access_token
    const newTokens = {
      access_token: 'qb_new_access_token_' + Math.random().toString(36).substr(2, 16),
      refresh_token: connectionDetails.refresh_token,
      expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
    };

    const supabase = createRouteHandlerClient({ cookies });
    await supabase
      .from('accounting_integrations')
      .update({
        configuration: {
          ...connectionDetails,
          access_token: newTokens.access_token,
          token_expires_at: newTokens.expires_at
        }
      })
      .eq('id', integrationId);

    return true;
  } catch (error) {
    console.error('Token refresh error:', error);
    return false;
  }
}

async function performQuickBooksSync(syncParams: unknown) {
  const { entity_types, sync_direction } = syncParams;
  const results = {
    total_processed: 0,
    successful: 0,
    failed: 0,
    errors: [] as string[],
    entity_results: Record<string, unknown> as { [key: string]: any }
  };

  for (const entityType of entity_types) {
    try {
      const entityResult = await syncEntityType(entityType, syncParams);
      results.entity_results[entityType] = entityResult;
      results.total_processed += entityResult.processed;
      results.successful += entityResult.successful;
      results.failed += entityResult.failed;
    } catch (_error) {
      const errorMsg = `Failed to sync ${entityType}: ${error}`;
      results.errors.push(errorMsg);
      results.failed++;
    }
  }

  return results;
}

async function syncEntityType(entityType: string, syncParams: unknown) {
  // Mock sync implementation - in real implementation, this would:
  // 1. Fetch data from QuickBooks API
  // 2. Transform data to Thorbis format
  // 3. Insert/update records in Supabase
  // 4. Handle conflicts and errors
  
  const mockResult = {
    entity_type: entityType,
    processed: Math.floor(Math.random() * 50) + 10,
    successful: 0,
    failed: 0,
    created: 0,
    updated: 0,
    skipped: 0
  };
  
  mockResult.successful = Math.floor(mockResult.processed * 0.95);
  mockResult.failed = mockResult.processed - mockResult.successful;
  mockResult.created = Math.floor(mockResult.successful * 0.3);
  mockResult.updated = Math.floor(mockResult.successful * 0.6);
  mockResult.skipped = mockResult.successful - mockResult.created - mockResult.updated;
  
  return mockResult;
}

async function fetchQuickBooksEntities(accessToken: string, companyId: string, entityType: string, limit: number) {
  // Mock entity fetch - in real implementation, this would call QuickBooks API
  const entities = [];
  for (const i = 1; i <= Math.min(limit, 25); i++) {
    entities.push({
      id: `qb_${entityType.toLowerCase()}_${i}',
      name: '${entityType} ${i}',
      type: entityType,
      status: 'Active',
      created_date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      modified_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  return entities;
}

async function updateSyncStatistics(integrationId: string, syncResults: unknown) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Get current statistics
  const { data: integration } = await supabase
    .from('accounting_integrations')
    .select('sync_statistics')
    .eq('id', integrationId)
    .single();

  const currentStats = integration?.sync_statistics || {
    total_records: 0,
    successful_syncs: 0,
    failed_syncs: 0
  };

  const updatedStats = {
    ...currentStats,
    total_records: currentStats.total_records + syncResults.total_processed,
    successful_syncs: currentStats.successful_syncs + (syncResults.failed === 0 ? 1 : 0),
    failed_syncs: currentStats.failed_syncs + (syncResults.failed > 0 ? 1 : 0),
    last_sync_at: new Date().toISOString(),
    last_sync_results: syncResults
  };

  await supabase
    .from('accounting_integrations')
    .update({
      sync_statistics: updatedStats,
      last_sync_at: new Date().toISOString(),
      last_sync_status: syncResults.failed === 0 ? 'success' : 'partial_failure',
      status: 'connected'
    })
    .eq('id', integrationId);
}

async function triggerInitialSync(integrationId: string, companyId: string, accessToken: string) {
  // Queue initial sync job - in real implementation, this would use a job queue
  console.log('Queuing initial sync for QuickBooks integration ${integrationId}');
  
  // Mock initial sync trigger
  setTimeout(async () => {
    const syncResults = await performQuickBooksSync({
      integration_id: integrationId,
      company_id: companyId,
      access_token: accessToken,
      entity_types: ['Customer', 'Invoice', 'Payment', 'Account'],
      sync_direction: 'pull'
    });
    
    await updateSyncStatistics(integrationId, syncResults);
  }, 5000); // Start sync in 5 seconds
}