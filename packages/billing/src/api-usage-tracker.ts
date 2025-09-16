/**
 * API Usage Tracking Middleware
 * Tracks API calls and manages billing meters for Thorbis Business OS
 */

import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

export interface ApiUsageConfig {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  enableTracking?: boolean;
  debugMode?: boolean;
}

export interface UsageLogEntry {
  organizationId: string;
  apiKeyId?: string;
  userId?: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTimeMs: number;
  requestSizeBytes?: number;
  responseSizeBytes?: number;
  ipAddress?: string;
  userAgent?: string;
  billable?: boolean;
  meterCategory?: string;
  metadata?: Record<string, any>;
}

export class ApiUsageTracker {
  private supabase;
  private config: Required<ApiUsageConfig>;

  constructor(config: ApiUsageConfig) {
    this.config = {
      enableTracking: true,
      debugMode: false,
      ...config,
    };

    this.supabase = createClient(
      this.config.supabaseUrl,
      this.config.supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  /**
   * Track API usage for billing purposes
   */
  async trackUsage(entry: UsageLogEntry): Promise<void> {
    if (!this.config.enableTracking) {
      if (this.config.debugMode) {
        console.log('[ApiUsageTracker] Tracking disabled, skipping:', entry.endpoint);
      }
      return;
    }

    try {
      // Log the API usage
      await this.logApiUsage(entry);

      // Update usage meters if billable
      if (entry.billable !== false) {
        await this.updateUsageMeter(
          entry.organizationId,
          entry.meterCategory || 'api_calls'
        );
      }

      if (this.config.debugMode) {
        console.log('[ApiUsageTracker] Successfully tracked usage for:', entry.endpoint);
      }
    } catch (error) {
      console.error('[ApiUsageTracker] Failed to track usage:', error);
      // Don't throw - we don't want billing tracking to break API responses
    }
  }

  /**
   * Log detailed API usage
   */
  private async logApiUsage(entry: UsageLogEntry): Promise<void> {
    const { error } = await this.supabase
      .from('api_usage_logs')
      .insert({
        organization_id: entry.organizationId,
        api_key_id: entry.apiKeyId,
        user_id: entry.userId,
        endpoint: entry.endpoint,
        method: entry.method,
        status_code: entry.statusCode,
        response_time_ms: entry.responseTimeMs,
        request_size_bytes: entry.requestSizeBytes,
        response_size_bytes: entry.responseSizeBytes,
        ip_address: entry.ipAddress,
        user_agent: entry.userAgent,
        billable: entry.billable !== false,
        meter_category: entry.meterCategory || 'api_calls',
        cost_cents: 1, // Default cost per API call
        metadata: entry.metadata || {},
      });

    if (error) {
      console.error('[ApiUsageTracker] Failed to log API usage:', error);
      throw error;
    }
  }

  /**
   * Update usage meter for billing
   */
  private async updateUsageMeter(
    organizationId: string,
    meterName: string,
    increment: number = 1
  ): Promise<void> {
    const { error } = await this.supabase.rpc('increment_api_usage', {
      p_organization_id: organizationId,
      p_meter_name: meterName,
      p_increment: increment,
    });

    if (error) {
      console.error('[ApiUsageTracker] Failed to update usage meter:', error);
      throw error;
    }
  }

  /**
   * Get current billing status for organization
   */
  async getBillingStatus(organizationId: string) {
    const { data, error } = await this.supabase.rpc('get_billing_status', {
      p_organization_id: organizationId,
    });

    if (error) {
      console.error('[ApiUsageTracker] Failed to get billing status:', error);
      throw error;
    }

    return data?.[0] || null;
  }

  /**
   * Check if organization has exceeded API quota
   */
  async checkQuotaExceeded(organizationId: string): Promise<boolean> {
    try {
      const status = await this.getBillingStatus(organizationId);
      return status ? status.monthly_api_usage > status.api_quota : false;
    } catch (error) {
      console.error('[ApiUsageTracker] Failed to check quota:', error);
      // Default to allowing requests on error
      return false;
    }
  }

  /**
   * Get API usage analytics for organization
   */
  async getUsageAnalytics(
    organizationId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const query = this.supabase
      .from('api_usage_logs')
      .select(`
        endpoint,
        method,
        status_code,
        response_time_ms,
        meter_category,
        timestamp,
        metadata
      `)
      .eq('organization_id', organizationId)
      .eq('billable', true)
      .order('timestamp', { ascending: false });

    if (startDate) {
      query.gte('timestamp', startDate.toISOString());
    }
    if (endDate) {
      query.lte('timestamp', endDate.toISOString());
    }

    const { data, error } = await query.limit(1000);

    if (error) {
      console.error('[ApiUsageTracker] Failed to get usage analytics:', error);
      throw error;
    }

    return data;
  }
}

/**
 * Next.js API route middleware for tracking usage
 */
export function withUsageTracking(
  tracker: ApiUsageTracker,
  options: {
    extractOrgId: (req: NextRequest) => string | null;
    extractUserId?: (req: NextRequest) => string | null;
    extractApiKeyId?: (req: NextRequest) => string | null;
    billable?: boolean;
    meterCategory?: string;
  }
) {
  return function middleware(
    handler: (req: NextRequest, context?: any) => Promise<Response>
  ) {
    return async function trackedHandler(
      req: NextRequest,
      context?: any
    ): Promise<Response> {
      const startTime = Date.now();
      const organizationId = options.extractOrgId(req);

      if (!organizationId) {
        // No organization ID found, skip tracking
        return handler(req, context);
      }

      let response: Response;
      let statusCode: number;
      let responseSize: number = 0;

      try {
        response = await handler(req, context);
        statusCode = response.status;

        // Calculate response size if possible
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
          responseSize = parseInt(contentLength, 10);
        }
      } catch (error) {
        statusCode = 500;
        throw error;
      } finally {
        const endTime = Date.now();
        const responseTimeMs = endTime - startTime;

        // Track usage asynchronously
        setImmediate(async () => {
          try {
            await tracker.trackUsage({
              organizationId,
              userId: options.extractUserId?.(req),
              apiKeyId: options.extractApiKeyId?.(req),
              endpoint: req.nextUrl.pathname,
              method: req.method,
              statusCode,
              responseTimeMs,
              requestSizeBytes: req.headers.get('content-length')
                ? parseInt(req.headers.get('content-length')!, 10)
                : undefined,
              responseSizeBytes: responseSize || undefined,
              ipAddress: req.ip || req.headers.get('x-forwarded-for') || undefined,
              userAgent: req.headers.get('user-agent') || undefined,
              billable: options.billable,
              meterCategory: options.meterCategory,
              metadata: {
                url: req.nextUrl.href,
                referer: req.headers.get('referer'),
              },
            });
          } catch (trackingError) {
            console.error('[withUsageTracking] Tracking failed:', trackingError);
          }
        });
      }

      return response;
    };
  };
}

/**
 * Extract organization ID from various request sources
 */
export const extractionHelpers = {
  /**
   * Extract org ID from bearer token (API key)
   */
  fromApiKey: (req: NextRequest): string | null => {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    // In a real implementation, you'd decode the API key to get org ID
    // This is a simplified example
    const apiKey = authHeader.substring(7);
    // TODO: Implement API key decoding logic
    return null;
  },

  /**
   * Extract org ID from URL path parameter
   */
  fromPath: (paramName: string = 'orgId') => (req: NextRequest): string | null => {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const paramIndex = pathParts.findIndex(part => part === paramName);
    return paramIndex !== -1 && pathParts[paramIndex + 1] 
      ? pathParts[paramIndex + 1] 
      : null;
  },

  /**
   * Extract org ID from query parameter
   */
  fromQuery: (paramName: string = 'org_id') => (req: NextRequest): string | null => {
    return req.nextUrl.searchParams.get(paramName);
  },

  /**
   * Extract org ID from custom header
   */
  fromHeader: (headerName: string = 'x-org-id') => (req: NextRequest): string | null => {
    return req.headers.get(headerName);
  },
};

/**
 * Predefined usage tracking configurations
 */
export const usageConfigs = {
  // Standard API endpoint tracking
  standardApi: {
    billable: true,
    meterCategory: 'api_calls',
  },

  // Data export tracking (higher cost)
  dataExport: {
    billable: true,
    meterCategory: 'data_exports',
  },

  // AI/ML endpoint tracking
  aiRequests: {
    billable: true,
    meterCategory: 'ai_requests',
  },

  // Webhook endpoints (usually not billable)
  webhook: {
    billable: false,
    meterCategory: 'webhooks',
  },

  // Health checks and monitoring (not billable)
  monitoring: {
    billable: false,
    meterCategory: 'monitoring',
  },
};