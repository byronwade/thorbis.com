import React from 'react';
import { Metadata } from 'next';
import SwaggerUI, { APIDocsHeader } from '@/components/api-docs/swagger-ui';

/**
 * API Documentation Page
 * 
 * This page provides comprehensive interactive documentation for the
 * Investment Platform APIs using Swagger UI. It includes:
 * 
 * Features:
 * - Interactive API exploration with Swagger UI
 * - Complete endpoint documentation with examples
 * - Authentication setup and testing
 * - Request/response schema validation
 * - Try-it-out functionality for all endpoints
 * - Downloadable OpenAPI specification
 * - Code generation examples
 * - Rate limiting and error handling documentation
 * 
 * API Coverage:
 * - Portfolio Management APIs
 * - Trading Execution APIs (Stocks/Crypto)
 * - Real-time Market Data Streaming
 * - Automated Portfolio Rebalancing
 * - Risk Assessment and Analytics
 * - Account Management and Settings
 */

export const metadata: Metadata = {
  title: 'API Documentation - Thorbis Investment Platform',
  description: 'Comprehensive API documentation for the Thorbis Investment Platform. Interactive Swagger UI with examples, authentication, and testing capabilities.',
  keywords: 'API, documentation, investment, trading, portfolio, swagger, openapi',
  authors: [{ name: 'Thorbis Development Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Investment Platform API Documentation',
    description: 'Complete API reference for investment management, trading, and portfolio analytics',
    type: 'website',
    siteName: 'Thorbis Investment Platform',
    images: [
      {
        url: '/api-docs-preview.png',
        width: 1200,
        height: 630,
        alt: 'Thorbis Investment Platform API Documentation'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Investment Platform API Documentation',
    description: 'Complete API reference for investment management and trading'
  }
};

export default function APIDocumentationPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">API Documentation</h1>
              <p className="mt-2 text-gray-300 max-w-3xl">
                Complete reference for the Thorbis Investment Platform API. Explore endpoints, 
                test requests, and integrate with your applications.
              </p>
            </div>
            <div className="flex space-x-4">
              <DownloadSpecButton />
              <QuickStartButton />
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="API Endpoints" 
              value="25+" 
              icon="🔗"
              description="RESTful endpoints"
            />
            <StatCard 
              title="Data Types" 
              value="50+" 
              icon="📊"
              description="Schema definitions"
            />
            <StatCard 
              title="Rate Limit" 
              value="1000/hr" 
              icon="⚡"
              description="Requests per hour"
            />
            <StatCard 
              title="Uptime" 
              value="99.9%" 
              icon="✅"
              description="Service availability"
            />
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex space-x-8">
            <NavLink href="#authentication" title="Authentication" />
            <NavLink href="#portfolio" title="Portfolio" />
            <NavLink href="#trading" title="Trading" />
            <NavLink href="#market-data" title="Market Data" />
            <NavLink href="#rebalancing" title="Rebalancing" />
            <NavLink href="#analytics" title="Analytics" />
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Getting Started Section */}
        <div className="mb-8">
          <GettingStartedSection />
        </div>

        {/* Interactive API Documentation */}
        <div className="bg-gray-800 rounded-lg shadow-xl">
          <APIDocsHeader />
          <div className="p-6">
            <SwaggerUI 
              theme="dark"
              showHeader={false}
              showSchemas={true}
              tryItOutEnabled={true}
              defaultExpanded={false}
              className="api-documentation"
            />
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ResourceCard
            title="SDK Libraries"
            description="Official client libraries for popular programming languages"
            links={[
              { title: "JavaScript/TypeScript", href: "/docs/sdk/javascript" },
              { title: "Python", href: "/docs/sdk/python" },
              { title: "Go", href: "/docs/sdk/go" },
              { title: "Java", href: "/docs/sdk/java" }
            ]}
            icon="📚"
          />
          
          <ResourceCard
            title="Code Examples"
            description="Sample code and integration examples for common use cases"
            links={[
              { title: "Portfolio Management", href: "/docs/examples/portfolio" },
              { title: "Trading Automation", href: "/docs/examples/trading" },
              { title: "Real-time Data", href: "/docs/examples/realtime" },
              { title: "Webhooks", href: "/docs/examples/webhooks" }
            ]}
            icon="💻"
          />
          
          <ResourceCard
            title="Support & Community"
            description="Get help and connect with other developers"
            links={[
              { title: "Developer Support", href: "/support" },
              { title: "Community Forum", href: "/community" },
              { title: "Status Page", href: "/status" },
              { title: "Changelog", href: "/changelog" }
            ]}
            icon="🤝"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Stat Card Component
 */
function StatCard({ 
  title, 
  value, 
  icon, 
  description 
}: { 
  title: string; 
  value: string; 
  icon: string; 
  description: string; 
}) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );
}

/**
 * Navigation Link Component
 */
function NavLink({ href, title }: { href: string; title: string }) {
  return (
    <a
      href={href}
      className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors duration-200"
    >
      {title}
    </a>
  );
}

/**
 * Getting Started Section
 */
function GettingStartedSection() {
  return (
    <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">1. Authentication</h3>
          <p className="text-blue-100 mb-3">
            Obtain your API key and authenticate your requests using JWT Bearer tokens.
          </p>
          <div className="bg-neutral-950/20 rounded p-3 font-mono text-sm">
            <code>Authorization: Bearer YOUR_JWT_TOKEN</code>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">2. Make Your First Request</h3>
          <p className="text-blue-100 mb-3">
            Try fetching your portfolio information with a simple GET request.
          </p>
          <div className="bg-neutral-950/20 rounded p-3 font-mono text-sm">
            <code>GET /api/investments/portfolio</code>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex space-x-4">
        <button className="bg-white text-blue-900 px-4 py-2 rounded font-semibold hover:bg-gray-100 transition-colors">
          Get API Key
        </button>
        <button className="border border-white text-white px-4 py-2 rounded font-semibold hover:bg-white hover:text-blue-900 transition-colors">
          View Tutorial
        </button>
      </div>
    </div>
  );
}

/**
 * Resource Card Component
 */
function ResourceCard({
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
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
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

/**
 * Download Spec Button
 */
function DownloadSpecButton() {
  const handleDownload = () => {
    // Generate and download OpenAPI spec
    import('@/lib/api-documentation').then(({ generateOpenAPISpec }) => {
      const spec = generateOpenAPISpec();
      const blob = new Blob([JSON.stringify(spec, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'thorbis-investment-api-spec.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  return (
    <button
      onClick={handleDownload}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2"
    >
      <span>📥</span>
      <span>Download OpenAPI</span>
    </button>
  );
}

/**
 * Quick Start Button
 */
function QuickStartButton() {
  return (
    <a
      href="/docs/quickstart"
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2"
    >
      <span>🚀</span>
      <span>Quick Start</span>
    </a>
  );
}