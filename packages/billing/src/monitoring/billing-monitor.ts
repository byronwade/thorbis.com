/**
 * Billing Monitoring and Alerting System
 * Real-time monitoring of billing operations, usage tracking, and alert generation
 * Created: 2025-01-31
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ThorbisStripeWrapper } from '../stripe-wrapper';
import Stripe from 'stripe';

export interface BillingAlert {
  id: string;
  type: 'usage_threshold' | 'payment_failed' | 'subscription_expired' | 'overage_detected' | 'system_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  organizationId: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  createdAt: Date;
  resolvedAt?: Date;
  actionRequired?: boolean;
}

export interface UsageMetrics {
  organizationId: string;
  period: 'current' | 'previous' | 'ytd';
  apiCalls: { count: number; quota: number; percentage: number; overage: number; };
  dataExports: { count: number; quota: number; percentage: number; };
  aiRequests: { count: number; quota: number; percentage: number; };
  costs: { subscription: number; overage: number; total: number; };
  trends: { usage: number; cost: number; }; // percentage change
}

export interface BillingHealth {
  status: 'healthy' | 'warning' | 'critical' | 'error';
  stripeConnectivity: boolean;
  databaseConnectivity: boolean;
  webhookStatus: boolean;
  activeAlerts: number;
  lastChecked: Date;
  uptime: number; // percentage
}

export class BillingMonitor {
  private supabase: SupabaseClient;
  private stripe: ThorbisStripeWrapper;
  private monitoringInterval?: NodeJS.Timeout;
  private webhookHealthInterval?: NodeJS.Timeout;
  private alertHandlers: ((alert: BillingAlert) => void)[] = [];
  
  // Thresholds for alerting
  private readonly USAGE_WARNING_THRESHOLD = 0.8; // 80%
  private readonly USAGE_CRITICAL_THRESHOLD = 0.95; // 95%
  private readonly COST_SPIKE_THRESHOLD = 1.5; // 150% increase
  private readonly HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
  private readonly WEBHOOK_TIMEOUT_THRESHOLD = 300000; // 5 minutes

  constructor(config: {
    supabaseUrl: string;
    supabaseServiceKey: string;
    stripeWrapper: ThorbisStripeWrapper;
  }) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
    this.stripe = config.stripeWrapper;
  }

  /**
   * Start monitoring billing operations
   */
  public startMonitoring(): void {
    console.log('Starting billing monitoring system...');

    // Health checks every 30 seconds
    this.monitoringInterval = setInterval(() => {
      this.performHealthChecks();
      this.checkUsageThresholds();
      this.detectAnomalies();
    }, this.HEALTH_CHECK_INTERVAL);

    // Webhook health monitoring every minute
    this.webhookHealthInterval = setInterval(() => {
      this.checkWebhookHealth();
    }, 60000);

    console.log('Billing monitoring system started successfully');
  }

  /**
   * Stop monitoring
   */
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    
    if (this.webhookHealthInterval) {
      clearInterval(this.webhookHealthInterval);
      this.webhookHealthInterval = undefined;
    }

    console.log('Billing monitoring system stopped');
  }

  /**
   * Add alert handler
   */
  public onAlert(handler: (alert: BillingAlert) => void): void {
    this.alertHandlers.push(handler);
  }

  /**
   * Get current billing health status
   */
  public async getBillingHealth(): Promise<BillingHealth> {
    const alerts = await this.getActiveAlerts();
    const stripeHealth = await this.checkStripeConnectivity();
    const dbHealth = await this.checkDatabaseConnectivity();
    const webhookHealth = await this.isWebhookHealthy();

    let status: BillingHealth['status'] = 'healthy';
    
    if (!stripeHealth || !dbHealth || !webhookHealth) {
      status = 'critical';
    } else if (alerts.filter(a => a.severity === 'high' || a.severity === 'critical').length > 0) {
      status = 'warning';
    }

    return {
      status,
      stripeConnectivity: stripeHealth,
      databaseConnectivity: dbHealth,
      webhookStatus: webhookHealth,
      activeAlerts: alerts.length,
      lastChecked: new Date(),
      uptime: await this.calculateUptime(),
    };
  }

  /**
   * Get usage metrics for an organization
   */
  public async getUsageMetrics(organizationId: string): Promise<UsageMetrics> {
    const currentPeriodStart = new Date();
    currentPeriodStart.setDate(1); // First day of current month
    
    const previousPeriodStart = new Date(currentPeriodStart);
    previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);
    
    const [currentUsage, previousUsage, subscription] = await Promise.all([
      this.getUsageForPeriod(organizationId, currentPeriodStart, new Date()),
      this.getUsageForPeriod(organizationId, previousPeriodStart, currentPeriodStart),
      this.getSubscriptionDetails(organizationId),
    ]);

    const calculateTrend = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      organizationId,
      period: 'current',
      apiCalls: {
        count: currentUsage.apiCalls,
        quota: subscription.quotas.apiCalls,
        percentage: Math.round((currentUsage.apiCalls / subscription.quotas.apiCalls) * 100),
        overage: Math.max(0, currentUsage.apiCalls - subscription.quotas.apiCalls),
      },
      dataExports: {
        count: currentUsage.dataExports,
        quota: subscription.quotas.dataExports,
        percentage: Math.round((currentUsage.dataExports / subscription.quotas.dataExports) * 100),
      },
      aiRequests: {
        count: currentUsage.aiRequests,
        quota: subscription.quotas.aiRequests,
        percentage: Math.round((currentUsage.aiRequests / subscription.quotas.aiRequests) * 100),
      },
      costs: {
        subscription: subscription.basePrice,
        overage: currentUsage.overageCosts,
        total: subscription.basePrice + currentUsage.overageCosts,
      },
      trends: {
        usage: calculateTrend(currentUsage.apiCalls, previousUsage.apiCalls),
        cost: calculateTrend(
          subscription.basePrice + currentUsage.overageCosts,
          subscription.basePrice + previousUsage.overageCosts
        ),
      },
    };
  }

  /**
   * Get active alerts
   */
  public async getActiveAlerts(organizationId?: string): Promise<BillingAlert[]> {
    let query = this.supabase
      .from('billing_alerts')
      .select('*')
      .is('resolved_at', null)
      .order('created_at', { ascending: false });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map(alert => ({
      id: alert.id,
      type: alert.type,
      severity: alert.severity,
      organizationId: alert.organization_id,
      title: alert.title,
      message: alert.message,
      data: alert.data,
      createdAt: new Date(alert.created_at),
      resolvedAt: alert.resolved_at ? new Date(alert.resolved_at) : undefined,
      actionRequired: alert.action_required,
    }));
  }

  /**
   * Resolve an alert
   */
  public async resolveAlert(alertId: string, resolution?: string): Promise<void> {
    const { error } = await this.supabase
      .from('billing_alerts')
      .update({ 
        resolved_at: new Date().toISOString(),
        resolution 
      })
      .eq('id', alertId);

    if (error) throw error;
  }

  /**
   * Generate usage report for an organization
   */
  public async generateUsageReport(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    summary: UsageMetrics;
    dailyBreakdown: Array<{ date: string; usage: any; cost: number; }>;
    recommendations: string[];
  }> {
    const [summary, dailyData] = await Promise.all([
      this.getUsageMetrics(organizationId),
      this.getDailyUsageBreakdown(organizationId, startDate, endDate),
    ]);

    const recommendations = this.generateRecommendations(summary);

    return {
      summary,
      dailyBreakdown: dailyData,
      recommendations,
    };
  }

  /**
   * Private Methods
   */

  private async performHealthChecks(): Promise<void> {
    try {
      const health = await this.getBillingHealth();
      
      if (health.status === 'critical') {
        await this.createAlert({
          type: 'system_error',
          severity: 'critical',
          organizationId: 'system',
          title: 'Billing System Critical Error',
          message: `Billing system health check failed. Stripe: ${health.stripeConnectivity}, DB: ${health.databaseConnectivity}, Webhooks: ${health.webhookStatus}`,
          actionRequired: true,
        });
      }
    } catch (error) {
      console.error('Health check failed:', error);
    }
  }

  private async checkUsageThresholds(): Promise<void> {
    const { data: subscriptions } = await this.supabase
      .from('stripe_subscriptions')
      .select('organization_id')
      .eq('status', 'active');

    if (!subscriptions) return;

    for (const sub of subscriptions) {
      try {
        const metrics = await this.getUsageMetrics(sub.organization_id);
        
        // Check API usage thresholds
        if (metrics.apiCalls.percentage >= this.USAGE_CRITICAL_THRESHOLD * 100) {
          await this.createAlert({
            type: 'usage_threshold',
            severity: 'critical',
            organizationId: sub.organization_id,
            title: 'Critical API Usage Alert',
            message: `API usage at ${metrics.apiCalls.percentage}% of quota. Overage charges will apply.`,
            data: { usage: metrics.apiCalls },
            actionRequired: true,
          });
        } else if (metrics.apiCalls.percentage >= this.USAGE_WARNING_THRESHOLD * 100) {
          await this.createAlert({
            type: 'usage_threshold',
            severity: 'medium',
            organizationId: sub.organization_id,
            title: 'API Usage Warning',
            message: `API usage at ${metrics.apiCalls.percentage}% of quota. Consider upgrading your plan.`,
            data: { usage: metrics.apiCalls },
            actionRequired: false,
          });
        }

        // Check for overages
        if (metrics.apiCalls.overage > 0) {
          await this.createAlert({
            type: 'overage_detected',
            severity: 'high',
            organizationId: sub.organization_id,
            title: 'API Overage Detected',
            message: `${metrics.apiCalls.overage} API calls over quota. Additional charges apply.`,
            data: { overage: metrics.apiCalls.overage },
            actionRequired: true,
          });
        }
      } catch (error) {
        console.error(`Error checking usage for org ${sub.organization_id}:`, error);
      }
    }
  }

  private async detectAnomalies(): Promise<void> {
    // Detect unusual spending patterns
    const { data: recentUsage } = await this.supabase
      .from('api_usage_logs')
      .select('organization_id, meter_category, created_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .order('created_at', { ascending: false });

    if (!recentUsage) return;

    // Group by organization and detect spikes
    const orgUsage = new Map<string, number>();
    recentUsage.forEach(usage => {
      const current = orgUsage.get(usage.organization_id) || 0;
      orgUsage.set(usage.organization_id, current + 1);
    });

    for (const [orgId, count] of orgUsage) {
      if (count > 1000) { // More than 1000 API calls in 24 hours - potential abuse
        await this.createAlert({
          type: 'usage_threshold',
          severity: 'high',
          organizationId: orgId,
          title: 'Unusual Usage Pattern Detected',
          message: `Detected ${count} API calls in the last 24 hours. This is above normal patterns.`,
          data: { count, period: '24h' },
          actionRequired: true,
        });
      }
    }
  }

  private async checkWebhookHealth(): Promise<void> {
    const { data: webhooks } = await this.supabase
      .from('stripe_webhook_events')
      .select('*')
      .gte('created_at', new Date(Date.now() - this.WEBHOOK_TIMEOUT_THRESHOLD).toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (!webhooks || webhooks.length === 0) {
      await this.createAlert({
        type: 'system_error',
        severity: 'medium',
        organizationId: 'system',
        title: 'Webhook Processing Delay',
        message: 'No webhook events processed in the last 5 minutes. This may indicate connectivity issues.',
        actionRequired: false,
      });
    }
  }

  private async checkStripeConnectivity(): Promise<boolean> {
    try {
      await this.stripe.testConnection();
      return true;
    } catch {
      return false;
    }
  }

  private async checkDatabaseConnectivity(): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('organizations')
        .select('id')
        .limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  private async isWebhookHealthy(): Promise<boolean> {
    const { data: recentWebhooks } = await this.supabase
      .from('stripe_webhook_events')
      .select('*')
      .gte('created_at', new Date(Date.now() - this.WEBHOOK_TIMEOUT_THRESHOLD).toISOString())
      .limit(1);

    return !!(recentWebhooks && recentWebhooks.length > 0);
  }

  private async calculateUptime(): Promise<number> {
    // Simple uptime calculation based on system errors
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const { data: systemErrors } = await this.supabase
      .from('billing_alerts')
      .select('*')
      .eq('type', 'system_error')
      .gte('created_at', oneDayAgo.toISOString());

    if (!systemErrors) return 100;

    // Each system error represents approximately 5 minutes of downtime
    const downtimeMinutes = systemErrors.length * 5;
    const totalMinutes = 24 * 60; // 24 hours
    const uptime = Math.max(0, ((totalMinutes - downtimeMinutes) / totalMinutes) * 100);
    
    return Math.round(uptime * 100) / 100;
  }

  private async createAlert(alertData: Omit<BillingAlert, 'id' | 'createdAt'>): Promise<void> {
    // Check for duplicate alerts in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const { data: existingAlerts } = await this.supabase
      .from('billing_alerts')
      .select('*')
      .eq('organization_id', alertData.organizationId)
      .eq('type', alertData.type)
      .gte('created_at', oneHourAgo.toISOString())
      .is('resolved_at', null);

    if (existingAlerts && existingAlerts.length > 0) {
      return; // Don't create duplicate alerts
    }

    const alert: BillingAlert = {
      ...alertData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    // Store in database
    const { error } = await this.supabase
      .from('billing_alerts')
      .insert({
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        organization_id: alert.organizationId,
        title: alert.title,
        message: alert.message,
        data: alert.data,
        action_required: alert.actionRequired,
      });

    if (error) {
      console.error('Failed to create alert:', error);
      return;
    }

    // Trigger alert handlers
    this.alertHandlers.forEach(handler => {
      try {
        handler(alert);
      } catch (error) {
        console.error('Alert handler failed:', error);
      }
    });
  }

  private async getUsageForPeriod(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    apiCalls: number;
    dataExports: number;
    aiRequests: number;
    overageCosts: number;
  }> {
    const { data: usage } = await this.supabase
      .from('api_usage_logs')
      .select('meter_category, billable_amount')
      .eq('organization_id', organizationId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (!usage) return { apiCalls: 0, dataExports: 0, aiRequests: 0, overageCosts: 0 };

    const result = { apiCalls: 0, dataExports: 0, aiRequests: 0, overageCosts: 0 };
    
    usage.forEach(log => {
      switch (log.meter_category) {
        case 'api_calls':
          result.apiCalls++;
          break;
        case 'data_exports':
          result.dataExports++;
          break;
        case 'ai_requests':
          result.aiRequests++;
          break;
      }
      result.overageCosts += log.billable_amount || 0;
    });

    return result;
  }

  private async getSubscriptionDetails(organizationId: string): Promise<{
    basePrice: number;
    quotas: { apiCalls: number; dataExports: number; aiRequests: number; };
  }> {
    const { data: subscription } = await this.supabase
      .from('stripe_subscriptions')
      .select(`
        *,
        stripe_plans(*)
      `)
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .single();

    if (!subscription) {
      return {
        basePrice: 0,
        quotas: { apiCalls: 0, dataExports: 0, aiRequests: 0 }
      };
    }

    return {
      basePrice: subscription.stripe_plans.amount,
      quotas: {
        apiCalls: subscription.stripe_plans.metadata?.api_quota || 1000,
        dataExports: subscription.stripe_plans.metadata?.export_quota || 50,
        aiRequests: subscription.stripe_plans.metadata?.ai_quota || 100,
      }
    };
  }

  private async getDailyUsageBreakdown(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ date: string; usage: any; cost: number; }>> {
    const { data: dailyData } = await this.supabase
      .rpc('get_daily_usage_breakdown', {
        org_id: organizationId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });

    return dailyData || [];
  }

  private generateRecommendations(metrics: UsageMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.apiCalls.percentage > 80) {
      recommendations.push('Consider upgrading your plan to avoid overage charges');
    }

    if (metrics.trends.usage > 50) {
      recommendations.push('Usage has increased significantly. Monitor consumption closely');
    }

    if (metrics.costs.overage > 0) {
      recommendations.push('You have overage charges. Upgrade to a higher tier plan');
    }

    if (metrics.trends.cost > 100) {
      recommendations.push('Costs have more than doubled. Review usage patterns');
    }

    return recommendations;
  }
}

export default BillingMonitor;