import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Sync trigger schema
const SyncTriggerSchema = z.object({
  sync_type: z.enum(['full', 'incremental', 'delta', 'test']).default('incremental'),
  direction: z.enum(['import', 'export', 'bidirectional']).optional(),
  force_sync: z.boolean().default(false),
  dry_run: z.boolean().default(false),
  
  // Specific data to sync
  data_types: z.array(z.enum([
    'customers',
    'invoices', 
    'payments',
    'work_orders',
    'inventory',
    'products',
    'technicians',
    'schedules',
    'contacts',
    'projects'
  ])).optional(),
  
  // Sync filters
  filters: z.object({
    date_from: z.string().date().optional(),
    date_to: z.string().date().optional(),
    customer_ids: z.array(z.string().uuid()).optional(),
    status: z.string().optional(),
    modified_since: z.string().datetime().optional(),
  }).optional(),
  
  // Configuration overrides
  config_overrides: z.object({
    batch_size: z.number().min(1).max(1000).optional(),
    timeout_seconds: z.number().min(30).max(3600).optional(),
    retry_attempts: z.number().min(0).max(5).optional(),
  }).optional(),
});

// Sync status schema
const SyncStatusQuerySchema = z.object({
  include_logs: z.boolean().default(false),
  include_errors: z.boolean().default(true),
  log_limit: z.number().min(1).max(100).default(50),
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
    .select('id, status, enabled')
    .eq('id', integrationId)
    .eq('organization_id', organizationId)
    .single();
  
  return integration;
}

// Helper function to create sync log entry
async function createSyncLog(integrationId: string, syncData: unknown, organizationId: string, userId: string) {
  const { data: syncLog, error } = await supabase
    .from('hs.integration_sync_log')
    .insert({
      integration_id: integrationId,
      sync_type: syncData.sync_type,
      sync_direction: syncData.direction,
      data_types: syncData.data_types,
      filters: syncData.filters,
      config_overrides: syncData.config_overrides,
      dry_run: syncData.dry_run,
      sync_status: 'running',
      organization_id: organizationId,
      initiated_by: userId,
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create sync log: ${error.message}');
  }

  return syncLog;
}

// Helper function to update sync log
async function updateSyncLog(syncLogId: string, updates: unknown) {
  await supabase
    .from('hs.integration_sync_log')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', syncLogId);
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

// Helper function to perform integration sync
async function performIntegrationSync(integration: unknown, syncData: unknown, syncLog: unknown) {
  const startTime = Date.now();
  let recordsProcessed = 0;
  let recordsSuccessful = 0;
  let recordsFailed = 0;
  const errors: unknown[] = [];

  try {
    // Validate integration is ready for sync
    if (!integration.enabled) {
      throw new Error('Integration is not enabled');
    }

    if (integration.status !== 'active') {
      throw new Error('Integration status is ${integration.status}, cannot sync');
    }

    // Update sync status to running
    await updateSyncLog(syncLog.id, {
      sync_status: 'running',
      started_at: new Date().toISOString(),
    });

    // Perform sync based on integration type
    switch (integration.integration_type) {
      case 'accounting':
        const accountingResult = await syncAccountingData(integration, syncData);
        recordsProcessed = accountingResult.processed;
        recordsSuccessful = accountingResult.successful;
        recordsFailed = accountingResult.failed;
        errors.push(...accountingResult.errors);
        break;

      case 'payment':
        const paymentResult = await syncPaymentData(integration, syncData);
        recordsProcessed = paymentResult.processed;
        recordsSuccessful = paymentResult.successful;
        recordsFailed = paymentResult.failed;
        errors.push(...paymentResult.errors);
        break;

      case 'crm':
        const crmResult = await syncCRMData(integration, syncData);
        recordsProcessed = crmResult.processed;
        recordsSuccessful = crmResult.successful;
        recordsFailed = crmResult.failed;
        errors.push(...crmResult.errors);
        break;

      case 'inventory':
        const inventoryResult = await syncInventoryData(integration, syncData);
        recordsProcessed = inventoryResult.processed;
        recordsSuccessful = inventoryResult.successful;
        recordsFailed = inventoryResult.failed;
        errors.push(...inventoryResult.errors);
        break;

      case 'webhook':
        // Webhook integrations don't have traditional sync
        if (syncData.sync_type === 'test') {
          const testResult = await testWebhookEndpoint(integration);
          recordsProcessed = 1;
          recordsSuccessful = testResult.success ? 1 : 0;
          recordsFailed = testResult.success ? 0 : 1;
          if (!testResult.success) {
            errors.push({ error: testResult.error });
          }
        } else {
          throw new Error('Webhook integrations do not support data sync operations');
        }
        break;

      default:
        throw new Error('Sync not implemented for integration type: ${integration.integration_type}');
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Update sync log with results
    await updateSyncLog(syncLog.id, {
      sync_status: recordsFailed === 0 ? 'completed' : 'completed_with_errors',
      completed_at: new Date().toISOString(),
      duration_ms: duration,
      records_processed: recordsProcessed,
      records_successful: recordsSuccessful,
      records_failed: recordsFailed,
      error_details: errors.length > 0 ? errors : null,
      last_sync_at: new Date().toISOString(),
    });

    // Update integration last sync time
    await supabase
      .from('hs.integrations')
      .update({
        last_sync_at: new Date().toISOString(),
        sync_status: recordsFailed === 0 ? 'completed' : 'completed_with_errors',
      })
      .eq('id', integration.id);

    return {
      success: true,
      records_processed: recordsProcessed,
      records_successful: recordsSuccessful,
      records_failed: recordsFailed,
      duration_ms: duration,
      errors: errors,
    };

  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Update sync log with error
    await updateSyncLog(syncLog.id, {
      sync_status: 'failed',
      completed_at: new Date().toISOString(),
      duration_ms: duration,
      records_processed: recordsProcessed,
      records_successful: recordsSuccessful,
      records_failed: recordsFailed + 1,
      error_details: [{ error: error.message, timestamp: new Date().toISOString() }],
    });

    throw error;
  }
}

// Helper functions for specific integration types
async function syncAccountingData(integration: unknown, syncData: unknown) {
  // Simulate accounting data sync
  // In a real implementation, this would connect to QuickBooks, Xero, etc.
  
  const processed = 0;
  const successful = 0;
  const failed = 0;
  const errors: unknown[] = [];

  try {
    if (syncData.data_types?.includes('invoices') || !syncData.data_types) {
      // Sync invoices
      const invoiceResult = await syncAccountingInvoices(integration, syncData.filters);
      processed += invoiceResult.processed;
      successful += invoiceResult.successful;
      failed += invoiceResult.failed;
      errors.push(...invoiceResult.errors);
    }

    if (syncData.data_types?.includes('customers') || !syncData.data_types) {
      // Sync customers
      const customerResult = await syncAccountingCustomers(integration, syncData.filters);
      processed += customerResult.processed;
      successful += customerResult.successful;
      failed += customerResult.failed;
      errors.push(...customerResult.errors);
    }

    return { processed, successful, failed, errors };
  } catch (error) {
    return { processed, successful, failed: failed + 1, errors: [...errors, { error: error.message }] };
  }
}

async function syncAccountingInvoices(integration: unknown, filters: unknown) {
  // Mock implementation - would connect to actual accounting API
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
  
  return {
    processed: 25,
    successful: 24,
    failed: 1,
    errors: [{ invoice_id: 'INV-001', error: 'Duplicate invoice number' }],
  };
}

async function syncAccountingCustomers(integration: unknown, filters: unknown) {
  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    processed: 50,
    successful: 50,
    failed: 0,
    errors: [],
  };
}

async function syncPaymentData(integration: unknown, syncData: unknown) {
  // Mock payment integration sync
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  return {
    processed: 15,
    successful: 15,
    failed: 0,
    errors: [],
  };
}

async function syncCRMData(integration: unknown, syncData: unknown) {
  // Mock CRM integration sync
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    processed: 75,
    successful: 73,
    failed: 2,
    errors: [
      { contact_id: 'CRM-001', error: 'Invalid email format' },
      { contact_id: 'CRM-045', error: 'Missing required field: phone' },
    ],
  };
}

async function syncInventoryData(integration: unknown, syncData: unknown) {
  // Mock inventory integration sync
  await new Promise(resolve => setTimeout(resolve, 900));
  
  return {
    processed: 200,
    successful: 198,
    failed: 2,
    errors: [
      { item_id: 'ITEM-001', error: 'Negative stock quantity not allowed' },
      { item_id: 'ITEM-099', error: 'SKU already exists' },
    ],
  };
}

async function testWebhookEndpoint(integration: unknown) {
  try {
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

    return {
      success: response.ok,
      error: response.ok ? null : 'HTTP ${response.status}: ${response.statusText}',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// GET /api/v1/hs/integrations/[id]/sync - Get sync status and logs
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const integrationId = params.id;
    const { searchParams } = new URL(request.url);
    const query = SyncStatusQuerySchema.parse(Object.fromEntries(searchParams));

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
    const integration = await verifyIntegrationAccess(integrationId, organizationId);
    if (!integration) {
      return NextResponse.json(
        { error: 'Integration not found or access denied' },
        { status: 404 }
      );
    }

    // Get sync logs
    const { data: syncLogs, error } = await supabase
      .from('hs.integration_sync_log')
      .select('
        id,
        sync_type,
        sync_direction,
        sync_status,
        records_processed,
        records_successful,
        records_failed,
        duration_ms,
        started_at,
        completed_at,
        error_details,
        data_types,
        filters,
        dry_run,
        created_at,
        initiated_by_user:initiated_by(first_name, last_name)
      ')
      .eq('integration_id', integrationId)
      .order('created_at', { ascending: false })
      .limit(query.log_limit);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sync logs' },
        { status: 500 }
      );
    }

    // Get current sync status
    const currentSync = syncLogs?.find(log => log.sync_status === 'running');
    const lastCompletedSync = syncLogs?.find(log => 
      ['completed', 'completed_with_errors', 'failed'].includes(log.sync_status)
    );

    // Calculate sync statistics
    const totalSyncs = syncLogs?.length || 0;
    const successfulSyncs = syncLogs?.filter(log => log.sync_status === 'completed').length || 0;
    const failedSyncs = syncLogs?.filter(log => log.sync_status === 'failed').length || 0;
    const avgDuration = syncLogs?.length > 0 ? 
      syncLogs.filter(log => log.duration_ms).reduce((sum, log) => sum + (log.duration_ms || 0), 0) / syncLogs.filter(log => log.duration_ms).length : 0;

    const syncStatus = {
      current_sync: currentSync ? {
        id: currentSync.id,
        type: currentSync.sync_type,
        direction: currentSync.sync_direction,
        status: currentSync.sync_status,
        started_at: currentSync.started_at,
        duration_so_far: currentSync.started_at ? 
          Date.now() - new Date(currentSync.started_at).getTime() : 0,
      } : null,
      
      last_sync: lastCompletedSync ? {
        id: lastCompletedSync.id,
        type: lastCompletedSync.sync_type,
        status: lastCompletedSync.sync_status,
        completed_at: lastCompletedSync.completed_at,
        duration_ms: lastCompletedSync.duration_ms,
        records_processed: lastCompletedSync.records_processed,
        records_successful: lastCompletedSync.records_successful,
        records_failed: lastCompletedSync.records_failed,
      } : null,
      
      statistics: {
        total_syncs: totalSyncs,
        successful_syncs: successfulSyncs,
        failed_syncs: failedSyncs,
        success_rate: totalSyncs > 0 ? (successfulSyncs / totalSyncs) * 100 : 0,
        avg_duration_ms: avgDuration,
        total_records_processed: syncLogs?.reduce((sum, log) => sum + (log.records_processed || 0), 0) || 0,
      },
      
      integration_status: {
        enabled: integration.enabled,
        status: integration.status,
        can_sync: integration.enabled && integration.status === 'active' && !currentSync,
      },
    };

    const response: unknown = { sync_status: syncStatus };

    if (query.include_logs) {
      response.sync_logs = syncLogs || [];
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('GET /api/v1/hs/integrations/[id]/sync error:', error);
    
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

// POST /api/v1/hs/integrations/[id]/sync - Trigger integration sync
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const integrationId = params.id;
    const body = await request.json();
    const syncData = SyncTriggerSchema.parse(body);

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

    // Verify integration access and get full integration details
    const { data: integration, error: integrationError } = await supabase
      .from('hs.integrations')
      .select('*')
      .eq('id', integrationId)
      .eq('organization_id', organizationId)
      .single();

    if (integrationError || !integration) {
      return NextResponse.json(
        { error: 'Integration not found or access denied' },
        { status: 404 }
      );
    }

    // Check if integration can be synced
    if (!integration.enabled) {
      return NextResponse.json(
        { error: 'Integration is not enabled' },
        { status: 409 }
      );
    }

    if (integration.status !== 'active') {
      return NextResponse.json(
        { error: 'Integration status is ${integration.status}, cannot sync' },
        { status: 409 }
      );
    }

    // Check for active syncs
    const { data: activeSyncs } = await supabase
      .from('hs.integration_sync_log')
      .select('id')
      .eq('integration_id', integrationId)
      .eq('sync_status', 'running')
      .limit(1);

    if (activeSyncs && activeSyncs.length > 0 && !syncData.force_sync) {
      return NextResponse.json(
        { error: 'Sync already in progress. Use force_sync=true to override.' },
        { status: 409 }
      );
    }

    // Create sync log entry
    const syncLog = await createSyncLog(integrationId, syncData, organizationId, user.id);

    // Log sync initiation
    await logIntegrationActivity(
      integrationId,
      'sync_initiated',
      '${syncData.sync_type} sync initiated${syncData.dry_run ? ' (dry run)' : '}',
      { 
        sync_type: syncData.sync_type,
        direction: syncData.direction,
        data_types: syncData.data_types,
        dry_run: syncData.dry_run,
      },
      organizationId,
      user.id
    );

    // Perform sync in background (in a real implementation, this would be queued)
    try {
      const syncResult = await performIntegrationSync(integration, syncData, syncLog);

      // Log sync completion
      await logIntegrationActivity(
        integrationId,
        'sync_completed',
        'Sync completed: ${syncResult.records_successful}/${syncResult.records_processed} records successful',
        syncResult,
        organizationId,
        user.id
      );

      return NextResponse.json({
        sync_id: syncLog.id,
        status: 'completed',
        result: syncResult,
        message: syncData.dry_run ? 
          'Dry run completed successfully' : 
          'Sync completed: ${syncResult.records_successful} successful, ${syncResult.records_failed} failed',
      }, { status: 201 });

    } catch (syncError) {
      // Log sync failure
      await logIntegrationActivity(
        integrationId,
        'sync_failed',
        'Sync failed: ${syncError.message}',
        { error: syncError.message },
        organizationId,
        user.id
      );

      return NextResponse.json({
        sync_id: syncLog.id,
        status: 'failed',
        error: syncError.message,
        message: 'Sync failed: ${syncError.message}',
      }, { status: 500 });
    }

  } catch (error) {
    console.error('POST /api/v1/hs/integrations/[id]/sync error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid sync request', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}