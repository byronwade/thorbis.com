#!/usr/bin/env tsx

/**
 * Billing Monitor Setup Script
 * Initializes and configures the billing monitoring system
 * Created: 2025-01-31
 */

import { createClient } from '@supabase/supabase-js';
import { 
    BillingMonitor, 
    AlertManager, 
    EmailAlertHandler,
    SlackAlertHandler,
    ConsoleAlertHandler,
    type NotificationConfig 
} from '../packages/billing/src/monitoring';
import { ThorbisStripeWrapper } from '../packages/billing/src/stripe-wrapper';

// Environment configuration
const config = {
    supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    },
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY || '***REMOVED***',
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    },
    notifications: {
        email: {
            apiKey: process.env.EMAIL_API_KEY || '',
            fromEmail: process.env.FROM_EMAIL || 'billing@thorbis.com',
            replyTo: process.env.REPLY_TO_EMAIL || 'support@thorbis.com',
        },
        slack: {
            webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
            channel: process.env.SLACK_CHANNEL || '#billing-alerts',
        },
        webhooks: process.env.CUSTOM_WEBHOOKS ? process.env.CUSTOM_WEBHOOKS.split(',') : [],
    },
    monitoring: {
        enableEmailAlerts: process.env.ENABLE_EMAIL_ALERTS === 'true',
        enableSlackAlerts: process.env.ENABLE_SLACK_ALERTS === 'true',
        enableWebhookAlerts: process.env.ENABLE_WEBHOOK_ALERTS === 'true',
        healthCheckIntervalMs: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000'),
    }
};

class BillingMonitorSetup {
    private monitor?: BillingMonitor;
    private alertManager?: AlertManager;

    async initialize(): Promise<void> {
        console.log('🚀 Initializing Thorbis Billing Monitor...\n');

        // Validate environment
        await this.validateEnvironment();

        // Setup Stripe wrapper
        const stripe = new ThorbisStripeWrapper({
            stripeSecretKey: config.stripe.secretKey,
            supabaseUrl: config.supabase.url,
            supabaseServiceKey: config.supabase.serviceKey,
        });

        // Initialize monitoring
        this.monitor = new BillingMonitor({
            supabaseUrl: config.supabase.url,
            supabaseServiceKey: config.supabase.serviceKey,
            stripeWrapper: stripe,
        });

        // Setup alert manager
        const notificationConfig: NotificationConfig = {};

        if (config.monitoring.enableEmailAlerts && config.notifications.email.apiKey) {
            notificationConfig.email = config.notifications.email;
        }

        if (config.monitoring.enableSlackAlerts && config.notifications.slack.webhookUrl) {
            notificationConfig.slack = config.notifications.slack;
        }

        if (config.monitoring.enableWebhookAlerts && config.notifications.webhooks.length > 0) {
            notificationConfig.webhooks = config.notifications.webhooks;
        }

        this.alertManager = new AlertManager(notificationConfig);

        // Connect alert manager to monitor
        this.monitor.onAlert((alert) => {
            this.alertManager?.handleAlert(alert);
        });

        console.log('✅ Billing monitor initialized successfully\n');
    }

    async startMonitoring(): Promise<void> {
        if (!this.monitor) {
            throw new Error('Monitor not initialized. Call initialize() first.');
        }

        console.log('🔍 Starting billing monitoring...');
        this.monitor.startMonitoring();

        // Test the system
        await this.runHealthCheck();
        await this.testAlertSystem();

        console.log('✅ Billing monitoring system is now active\n');
        console.log('📊 Monitor Status:');
        console.log(`   - Health checks: Every ${config.monitoring.healthCheckIntervalMs / 1000}s`);
        console.log(`   - Email alerts: ${config.monitoring.enableEmailAlerts ? '✅' : '❌'}`);
        console.log(`   - Slack alerts: ${config.monitoring.enableSlackAlerts ? '✅' : '❌'}`);
        console.log(`   - Webhook alerts: ${config.monitoring.enableWebhookAlerts ? '✅' : '❌'}`);
    }

    async stopMonitoring(): Promise<void> {
        if (this.monitor) {
            console.log('🛑 Stopping billing monitoring...');
            this.monitor.stopMonitoring();
            console.log('✅ Monitoring stopped\n');
        }
    }

    async runHealthCheck(): Promise<void> {
        if (!this.monitor) return;

        console.log('🏥 Running health check...');
        const health = await this.monitor.getBillingHealth();
        
        console.log(`   Status: ${health.status.toUpperCase()}`);
        console.log(`   Stripe: ${health.stripeConnectivity ? '✅' : '❌'}`);
        console.log(`   Database: ${health.databaseConnectivity ? '✅' : '❌'}`);
        console.log(`   Webhooks: ${health.webhookStatus ? '✅' : '❌'}`);
        console.log(`   Active alerts: ${health.activeAlerts}`);
        console.log(`   Uptime: ${health.uptime}%\n`);
    }

    async testAlertSystem(): Promise<void> {
        console.log('🧪 Testing alert system...');
        
        // This would create a test alert in a real scenario
        // For now, just verify the alert manager is configured
        if (this.alertManager) {
            console.log('✅ Alert system ready\n');
        } else {
            console.log('⚠️  Alert system not configured\n');
        }
    }

    async generateReport(): Promise<void> {
        if (!this.monitor) return;

        console.log('📋 Generating system report...\n');

        // Get system health
        const health = await this.monitor.getBillingHealth();
        const alerts = await this.monitor.getActiveAlerts();

        // Sample organization for demo
        const sampleOrgId = 'hs-001-uuid-a1b2c3d4e5f6';
        
        try {
            const metrics = await this.monitor.getUsageMetrics(sampleOrgId);
            const report = await this.monitor.generateUsageReport(
                sampleOrgId,
                new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
                new Date()
            );

            console.log('📊 BILLING SYSTEM REPORT');
            console.log('========================\n');
            
            console.log('🏥 System Health:');
            console.log(`   Overall Status: ${health.status.toUpperCase()}`);
            console.log(`   Uptime: ${health.uptime}%`);
            console.log(`   Active Alerts: ${health.activeAlerts}\n`);

            console.log('📈 Sample Organization Metrics:');
            console.log(`   API Usage: ${metrics.apiCalls.count}/${metrics.apiCalls.quota} (${metrics.apiCalls.percentage}%)`);
            console.log(`   Monthly Cost: $${(metrics.costs.total / 100).toFixed(2)}`);
            console.log(`   Usage Trend: ${metrics.trends.usage > 0 ? '+' : ''}${metrics.trends.usage}%`);
            console.log(`   Cost Trend: ${metrics.trends.cost > 0 ? '+' : ''}${metrics.trends.cost}%\n`);

            if (report.recommendations.length > 0) {
                console.log('💡 Recommendations:');
                report.recommendations.forEach((rec, i) => {
                    console.log(`   ${i + 1}. ${rec}`);
                });
                console.log();
            }

            if (alerts.length > 0) {
                console.log('🚨 Active Alerts:');
                alerts.forEach((alert, i) => {
                    console.log(`   ${i + 1}. [${alert.severity.toUpperCase()}] ${alert.title}`);
                    console.log(`      ${alert.message}`);
                });
                console.log();
            }

        } catch (error) {
            console.log('⚠️  Could not fetch detailed metrics (may be normal for fresh setup)\n');
        }

        console.log('📋 Report generation complete\n');
    }

    private async validateEnvironment(): Promise<void> {
        const issues: string[] = [];

        if (!config.supabase.url) {
            issues.push('NEXT_PUBLIC_SUPABASE_URL is not set');
        }

        if (!config.supabase.serviceKey) {
            issues.push('SUPABASE_SERVICE_ROLE_KEY is not set');
        }

        if (!config.stripe.secretKey) {
            issues.push('STRIPE_SECRET_KEY is not set');
        }

        if (config.monitoring.enableEmailAlerts && !config.notifications.email.apiKey) {
            console.log('⚠️  Email alerts enabled but EMAIL_API_KEY not set');
        }

        if (config.monitoring.enableSlackAlerts && !config.notifications.slack.webhookUrl) {
            console.log('⚠️  Slack alerts enabled but SLACK_WEBHOOK_URL not set');
        }

        if (issues.length > 0) {
            console.error('❌ Environment validation failed:');
            issues.forEach(issue => console.error(`   - ${issue}`));
            throw new Error('Environment validation failed');
        }

        console.log('✅ Environment validation passed\n');
    }
}

// CLI handling
async function main() {
    const setup = new BillingMonitorSetup();
    const command = process.argv[2] || 'start';

    try {
        switch (command) {
            case 'start':
                await setup.initialize();
                await setup.startMonitoring();
                
                // Keep the process running
                process.on('SIGINT', async () => {
                    console.log('\n👋 Received SIGINT, stopping monitor...');
                    await setup.stopMonitoring();
                    process.exit(0);
                });

                process.on('SIGTERM', async () => {
                    console.log('\n👋 Received SIGTERM, stopping monitor...');
                    await setup.stopMonitoring();
                    process.exit(0);
                });

                // Keep alive
                setInterval(() => {
                    // Heartbeat every 5 minutes
                }, 300000);
                
                break;

            case 'health':
                await setup.initialize();
                await setup.runHealthCheck();
                break;

            case 'report':
                await setup.initialize();
                await setup.generateReport();
                break;

            case 'test':
                await setup.initialize();
                await setup.testAlertSystem();
                break;

            default:
                console.log('Usage: npm run billing-monitor [command]');
                console.log('Commands:');
                console.log('  start   - Start the billing monitor (default)');
                console.log('  health  - Run a health check');
                console.log('  report  - Generate system report');
                console.log('  test    - Test alert system');
                break;
        }
    } catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

export { BillingMonitorSetup };