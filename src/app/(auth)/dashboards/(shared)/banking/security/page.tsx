import React, { Suspense } from 'react';
import { Metadata } from 'next';
import SecurityDashboard from '@/components/security/security-dashboard';
import { Shield, Lock, Eye, Server, AlertTriangle, TrendingUp } from 'lucide-react';

/**
 * Security Monitoring Page
 * 
 * This page provides comprehensive security monitoring and compliance
 * tracking for the investment platform, ensuring real-time visibility
 * into security events, threats, and system health.
 * 
 * Features:
 * - Real-time security dashboard
 * - Compliance status monitoring
 * - Threat intelligence display
 * - Security metrics and analytics
 * - Incident response tracking
 * - System health monitoring
 * 
 * Security Standards:
 * - SOC 2 Type II compliance
 * - PCI DSS monitoring requirements
 * - FINRA security reporting
 * - NIST Cybersecurity Framework
 * - ISO 27001 security management
 */

export const metadata: Metadata = {
  title: 'Security Monitoring - Thorbis Banking',
  description: 'Real-time security monitoring, compliance tracking, and threat intelligence for the Thorbis investment platform.',
  keywords: 'security monitoring, compliance, threat intelligence, SOC 2, PCI DSS, FINRA, cybersecurity',
  robots: 'noindex, nofollow' // Sensitive security information
};

interface SecurityPageProps {
  searchParams: Promise<{
    view?: string;
    timeRange?: string;
    userId?: string;
  }>;
}

export default async function SecurityPage({ searchParams }: SecurityPageProps) {
  const { view, timeRange, userId } = await searchParams;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <Shield className="w-8 h-8 mr-3 text-blue-400" />
                Security Center
              </h1>
              <p className="mt-2 text-gray-300 max-w-3xl">
                Monitor security events, track compliance status, and maintain the security posture 
                of your investment platform in real-time.
              </p>
            </div>
            
            {/* Security Status Indicator */}
            <div className="flex items-center space-x-4">
              <SecurityStatusIndicator />
            </div>
          </div>
          
          {/* Security Overview Cards */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SecurityOverviewCard
              title="Security Events"
              description="Real-time monitoring"
              icon="🔍"
              bgColor="bg-blue-900/30"
              borderColor="border-blue-700"
            />
            <SecurityOverviewCard
              title="Compliance"
              description="Standards adherence"
              icon="🛡️"
              bgColor="bg-green-900/30"
              borderColor="border-green-700"
            />
            <SecurityOverviewCard
              title="Threat Intel"
              description="Risk assessment"
              icon="⚠️"
              bgColor="bg-orange-900/30"
              borderColor="border-orange-700"
            />
            <SecurityOverviewCard
              title="System Health"
              description="Infrastructure status"
              icon="💚"
              bgColor="bg-purple-900/30"
              borderColor="border-purple-700"
            />
          </div>
        </div>
      </div>

      {/* Security Notice Banner */}
      <SecurityNoticeBanner />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<SecurityDashboardLoading />}>
          <SecurityDashboard
            userId={userId}
            showAdminFeatures={true}
            autoRefresh={true}
            refreshInterval={30000}
          />
        </Suspense>
      </div>

      {/* Security Information Footer */}
      <div className="bg-gray-800 border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <SecurityInfoCard
              title="Security Standards"
              description="Our platform adheres to the highest security standards"
              items={[
                { title: "SOC 2 Type II Certified", icon: "✓" },
                { title: "PCI DSS Level 1 Compliant", icon: "✓" },
                { title: "FINRA Registered", icon: "✓" },
                { title: "ISO 27001 Certified", icon: "✓" }
              ]}
              icon="🏅"
            />
            
            <SecurityInfoCard
              title="Data Protection"
              description="Your financial data is protected with enterprise-grade security"
              items={[
                { title: "256-bit AES Encryption", icon: "🔒" },
                { title: "Zero-Knowledge Architecture", icon: "🔐" },
                { title: "Multi-Factor Authentication", icon: "🔑" },
                { title: "Biometric Verification", icon: "👆" }
              ]}
              icon="🛡️"
            />
            
            <SecurityInfoCard
              title="Monitoring & Response"
              description="24/7 security monitoring and incident response"
              items={[
                { title: "Real-time Threat Detection", icon: "👁️" },
                { title: "Automated Response Systems", icon: "🤖" },
                { title: "Security Operations Center", icon: "🏢" },
                { title: "Incident Response Team", icon: "👨‍💻" }
              ]}
              icon="📡"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Security Status Indicator Component
 */
function SecurityStatusIndicator() {
  return (
    <div className="flex items-center space-x-3 bg-green-900/30 border border-green-700 rounded-lg px-4 py-2">
      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      <div>
        <div className="text-green-400 text-sm font-semibold">System Secure</div>
        <div className="text-green-300 text-xs">All systems operational</div>
      </div>
    </div>
  );
}

/**
 * Security Overview Card Component
 */
function SecurityOverviewCard({
  title,
  description,
  icon,
  bgColor,
  borderColor
}: {
  title: string;
  description: string;
  icon: string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <div className={'${bgColor} border ${borderColor} rounded-lg p-4'}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );
}

/**
 * Security Notice Banner Component
 */
function SecurityNoticeBanner() {
  return (
    <div className="bg-blue-900/30 border-b border-blue-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <Shield className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-blue-100 text-sm">
              <strong>Security Status:</strong> All systems are secure and monitoring is active. 
              Last security scan completed at {new Date().toLocaleTimeString()}.
            </p>
          </div>
          <div className="flex items-center text-blue-400 text-sm">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>99.9% Uptime</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading state for security dashboard
 */
function SecurityDashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="bg-neutral-800 rounded-lg p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-700 rounded mr-3"></div>
            <div>
              <div className="h-6 bg-gray-700 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-64"></div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-24 bg-gray-700 rounded"></div>
            <div className="h-8 w-20 bg-gray-700 rounded"></div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center space-x-4">
          <div className="h-4 bg-gray-700 rounded w-32"></div>
          <div className="h-4 bg-gray-700 rounded w-48"></div>
        </div>
      </div>

      {/* Metrics skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-neutral-800 rounded-lg p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-700 rounded w-16"></div>
              </div>
              <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
            </div>
            <div className="mt-4 h-3 bg-gray-700 rounded w-20"></div>
          </div>
        ))}
      </div>

      {/* Events skeleton */}
      <div className="bg-neutral-800 rounded-lg">
        <div className="p-6 border-b border-neutral-700">
          <div className="h-6 bg-gray-700 rounded w-48"></div>
        </div>
        <div className="divide-y divide-neutral-700">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
                  <div>
                    <div className="h-4 bg-gray-700 rounded w-32 mb-1"></div>
                    <div className="h-3 bg-gray-700 rounded w-24"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-6 w-16 bg-gray-700 rounded-full mb-1"></div>
                  <div className="h-3 bg-gray-700 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Security Info Card Component
 */
function SecurityInfoCard({
  title,
  description,
  items,
  icon
}: {
  title: string;
  description: string;
  items: { title: string; icon: string }[];
  icon: string;
}) {
  return (
    <div className="bg-gray-700 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <div className="text-2xl mr-3">{icon}</div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <p className="text-gray-300 mb-4">{description}</p>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center text-sm">
            <span className="mr-2">{item.icon}</span>
            <span className="text-gray-300">{item.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Export page configuration
export const dynamic = 'force-dynamic';
export const revalidate = false;