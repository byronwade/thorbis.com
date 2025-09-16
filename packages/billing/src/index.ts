/**
 * Thorbis Billing Package
 * Comprehensive billing and subscription management for Thorbis Business OS
 */

export { ApiUsageTracker, withUsageTracking, extractionHelpers, usageConfigs } from './api-usage-tracker';
export { StripeWebhookHandler } from './stripe-webhook-handler';
export { ThorbisStripeWrapper, createThorbisStripe } from './stripe-wrapper';

// Export monitoring system
export { 
    BillingMonitor, 
    AlertManager,
    EmailAlertHandler,
    SlackAlertHandler,
    WebhookAlertHandler,
    ConsoleAlertHandler,
    type BillingAlert,
    type UsageMetrics,
    type BillingHealth,
    type AlertHandler,
    type NotificationConfig,
    type EmailConfig,
    type SlackConfig
} from './monitoring';

export type { 
  ApiUsageConfig, 
  UsageLogEntry 
} from './api-usage-tracker';

export type { 
  WebhookHandlerConfig 
} from './stripe-webhook-handler';

export type {
  StripeWrapperConfig,
  CreateCustomerParams,
  CreateSubscriptionParams,
  UsageReportParams,
  BillingStatus
} from './stripe-wrapper';

// Re-export common Stripe types
export type {
  Stripe
} from 'stripe';

// Billing constants
export const BILLING_CONSTANTS = {
  // Base subscription price in cents
  BASE_PRICE_CENTS: 5000, // $50/month
  
  // API usage costs in cents
  API_CALL_COST_CENTS: 1, // $0.01 per API call
  DATA_EXPORT_COST_CENTS: 10, // $0.10 per data export
  AI_REQUEST_COST_CENTS: 5, // $0.05 per AI request
  
  // Default quotas
  BASIC_API_QUOTA: 1000,
  PRO_API_QUOTA: 5000,
  ENTERPRISE_API_QUOTA: 20000,
  
  // Billing cycles
  MONTHLY_CYCLE: 'monthly',
  YEARLY_CYCLE: 'yearly',
  
  // Subscription statuses
  SUBSCRIPTION_STATUSES: {
    ACTIVE: 'active',
    TRIALING: 'trialing',
    CANCELED: 'canceled',
    PAST_DUE: 'past_due',
    UNPAID: 'unpaid',
  } as const,
} as const;

// Utility functions
export const billingUtils = {
  /**
   * Format cents to dollars
   */
  centsToDollars: (cents: number): string => {
    return (cents / 100).toFixed(2);
  },

  /**
   * Format dollars to cents
   */
  dollarsToCents: (dollars: number): number => {
    return Math.round(dollars * 100);
  },

  /**
   * Calculate monthly cost based on API usage
   */
  calculateMonthlyCost: (
    basePriceCents: number,
    apiUsage: number,
    quota: number,
    overageRateCents: number = BILLING_CONSTANTS.API_CALL_COST_CENTS
  ): number => {
    const overage = Math.max(0, apiUsage - quota);
    return basePriceCents + (overage * overageRateCents);
  },

  /**
   * Check if usage is within quota
   */
  isWithinQuota: (usage: number, quota: number): boolean => {
    return usage <= quota;
  },

  /**
   * Calculate usage percentage
   */
  getUsagePercentage: (usage: number, quota: number): number => {
    return Math.min(100, Math.round((usage / quota) * 100));
  },

  /**
   * Get next billing date
   */
  getNextBillingDate: (currentPeriodEnd: Date): Date => {
    return new Date(currentPeriodEnd);
  },

  /**
   * Format subscription plan name
   */
  formatPlanName: (tier: string, interval: string): string => {
    const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);
    const intervalName = interval === 'yearly' ? 'Annual' : 'Monthly';
    return `${tierName} ${intervalName}`;
  },
};