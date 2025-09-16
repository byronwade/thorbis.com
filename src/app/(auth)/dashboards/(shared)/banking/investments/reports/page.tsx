import React, { Suspense } from 'react';
import { Metadata } from 'next';
// import InvestmentReportsDashboard from '@/components/investment-reporting/reports-dashboard';

/**
 * Investment Reports Page
 * 
 * This page provides comprehensive reporting capabilities for investment
 * activities, including tax documentation, portfolio performance analysis,
 * and regulatory compliance reporting.
 * 
 * Features:
 * - Tax reports with IRS form generation
 * - Portfolio performance analytics
 * - Capital gains/losses tracking
 * - Dividend and interest income reporting
 * - Wash sale identification
 * - Multi-format report exports (PDF, CSV, Excel)
 * - Automated report scheduling
 * - Historical report management
 * 
 * Report Types:
 * - Annual Tax Reports
 * - Quarterly Performance Reviews
 * - Monthly Holdings Summaries
 * - Transaction History Reports
 * - Compliance and Regulatory Reports
 * 
 * Tax Features:
 * - Form 1099-B generation
 * - Schedule D preparation
 * - Cost basis tracking (FIFO, LIFO, Average, Specific ID)
 * - Tax-loss harvesting opportunities
 * - Estimated tax liability calculations
 */

export const metadata: Metadata = {
  title: 'Investment Reports - Thorbis Banking',
  description: 'Generate comprehensive investment reports including tax documentation, performance analytics, and regulatory compliance reports.',
  keywords: 'investment reports, tax documents, portfolio performance, 1099-B, capital gains, dividends',
  robots: 'noindex, nofollow' // Sensitive financial data
};

interface ReportsPageProps {
  searchParams: Promise<{
    portfolioId?: string;
    reportType?: string;
    year?: string;
    generate?: string;
  }>;
}

export default async function InvestmentReportsPage({ searchParams }: ReportsPageProps) {
  const { portfolioId, reportType, year, generate } = await searchParams;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Investment Reports</h1>
              <p className="mt-2 text-gray-300 max-w-3xl">
                Generate comprehensive reports for tax preparation, performance analysis, and compliance documentation.
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex space-x-4">
              <QuickActionButton
                title="Generate Tax Report"
                description="Annual tax documentation"
                icon="📊"
                href="?generate=tax"
                highlight={true}
              />
              <QuickActionButton
                title="Performance Report"
                description="Portfolio analytics"
                icon="📈"
                href="?generate=performance"
              />
              <QuickActionButton
                title="Holdings Summary"
                description="Current positions"
                icon="💼"
                href="?generate=holdings"
              />
            </div>
          </div>
          
          {/* Report Type Indicators */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ReportTypeCard
              title="Tax Reports"
              description="IRS forms and tax documentation"
              count="3"
              icon="🏛️"
              bgColor="bg-red-900/30"
              borderColor="border-red-700"
              textColor="text-red-400"
            />
            <ReportTypeCard
              title="Performance"
              description="Portfolio analytics and metrics"
              count="12"
              icon="📊"
              bgColor="bg-blue-900/30"
              borderColor="border-blue-700"
              textColor="text-blue-400"
            />
            <ReportTypeCard
              title="Holdings"
              description="Asset allocation and positions"
              count="8"
              icon="💰"
              bgColor="bg-green-900/30"
              borderColor="border-green-700"
              textColor="text-green-400"
            />
            <ReportTypeCard
              title="Compliance"
              description="Regulatory and audit reports"
              count="5"
              icon="🛡️"
              bgColor="bg-purple-900/30"
              borderColor="border-purple-700"
              textColor="text-purple-400"
            />
          </div>
        </div>
      </div>

      {/* Tax Season Notice */}
      <TaxSeasonNotice />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<ReportsLoadingState />}>
          <div className="bg-neutral-800 rounded-lg p-6">
            <div className="text-center text-neutral-300">
              <h2 className="text-xl font-semibold mb-2">Investment Reports Dashboard</h2>
              <p>Dashboard component will be implemented here</p>
            </div>
          </div>
        </Suspense>
      </div>

      {/* Help and Documentation */}
      <div className="bg-gray-800 border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <HelpCard
              title="Tax Reporting Guide"
              description="Learn about tax implications of your investments and how to use our tax reports"
              links={[
                { title: "Understanding Capital Gains", href: "/docs/tax/capital-gains" },
                { title: "Wash Sale Rules", href: "/docs/tax/wash-sales" },
                { title: "Cost Basis Methods", href: "/docs/tax/cost-basis" }
              ]}
              icon="📚"
            />
            
            <HelpCard
              title="Performance Metrics"
              description="Understand the key performance indicators and risk metrics in your reports"
              links={[
                { title: "Time-Weighted Returns", href: "/docs/performance/twr" },
                { title: "Risk-Adjusted Metrics", href: "/docs/performance/risk" },
                { title: "Benchmark Comparison", href: "/docs/performance/benchmarks" }
              ]}
              icon="📖"
            />
            
            <HelpCard
              title="Export and Sharing"
              description="Learn how to export reports and share them with tax professionals"
              links={[
                { title: "PDF Export Options", href: "/docs/reports/pdf" },
                { title: "Excel Integration", href: "/docs/reports/excel" },
                { title: "API Access", href: "/docs/api/reports" }
              ]}
              icon="💡"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Quick Action Button Component
 */
function QuickActionButton({
  title,
  description,
  icon,
  href,
  highlight = false
}: {
  title: string;
  description: string;
  icon: string;
  href: string;
  highlight?: boolean;
}) {
  const baseClasses = "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left";
  const highlightClasses = highlight
    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
    : "bg-gray-700 hover:bg-gray-600 text-gray-300";

  return (
    <a href={href} className={`${baseClasses} ${highlightClasses}`}>
      <div className="text-2xl">{icon}</div>
      <div>
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-xs opacity-75">{description}</div>
      </div>
    </a>
  );
}

/**
 * Report Type Card Component
 */
function ReportTypeCard({
  title,
  description,
  count,
  icon,
  bgColor,
  borderColor,
  textColor
}: {
  title: string;
  description: string;
  count: string;
  icon: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}) {
  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-4'}>
      <div className="flex items-center justify-between">
        <div className="text-2xl">{icon}</div>
        <div className={'text-2xl font-bold ${textColor}'}>{count}</div>
      </div>
      <h3 className="font-semibold text-white mt-2">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

/**
 * Tax Season Notice Component
 */
function TaxSeasonNotice() {
  const now = new Date();
  const isTaxSeason = now.getMonth() >= 0 && now.getMonth() <= 3; // January to April
  
  if (!isTaxSeason) return null;

  return (
    <div className="bg-gradient-to-r from-red-900 to-orange-900 border-b border-red-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">!</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">Tax Season Reminder</h3>
            <p className="text-red-100">
              Generate your annual tax reports now. Tax documents are ready for download, and our tax-loss harvesting tool can help optimize your tax liability.
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
              Generate Tax Report
            </button>
            <button className="border border-red-400 text-red-100 px-4 py-2 rounded-lg font-semibold hover:bg-red-800 transition-colors">
              View Tax Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading state for reports
 */
function ReportsLoadingState() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 bg-gray-700 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-64"></div>
          </div>
          <div className="h-10 w-32 bg-gray-700 rounded"></div>
        </div>
      </div>

      {/* Report grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-gray-700 rounded w-32"></div>
              <div className="h-8 w-8 bg-gray-700 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
            <div className="mt-4 h-8 bg-gray-700 rounded w-24"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Help Card Component
 */
function HelpCard({
  title,
  description,
  links,
  icon
}: {
  title: string;
  description: string;
  links: { title: string; href: string }[];
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
        {links.map((link, index) => (
          <a
            key={index}
            href={link.href}
            className="block text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
          >
            → {link.title}
          </a>
        ))}
      </div>
    </div>
  );
}

// Export page configuration
export const dynamic = 'force-dynamic';
export const revalidate = false;