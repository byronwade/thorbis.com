'use client';

import React, { useEffect, useRef } from 'react';
import { generateOpenAPISpec } from '@/lib/api-documentation';

/**
 * Swagger UI Component for Investment Platform API Documentation
 * 
 * This component renders an interactive Swagger UI interface for exploring
 * and testing the Investment Platform APIs. It provides:
 * 
 * Features:
 * - Interactive API documentation with Swagger UI
 * - Try-it-out functionality for testing endpoints
 * - Authentication support for secure endpoints
 * - Request/response examples and schemas
 * - Automatic OpenAPI spec generation
 * - Responsive design for all screen sizes
 * - Dark theme support
 * 
 * Usage:
 * <SwaggerUI />
 * 
 * Dependencies:
 * - swagger-ui-react: Interactive API documentation
 * - swagger-ui-react/swagger-ui-bundle.css: Styling
 */

interface SwaggerUIProps {
  className?: string;
  theme?: 'light' | 'dark';
  showHeader?: boolean;
  showSchemas?: boolean;
  tryItOutEnabled?: boolean;
  defaultExpanded?: boolean;
}

export default function SwaggerUI({
  className = ',
  theme = 'dark',
  showHeader = true,
  showSchemas = true,
  tryItOutEnabled = true,
  defaultExpanded = false
}: SwaggerUIProps) {
  const swaggerRef = useRef<HTMLDivElement>(null);
  const swaggerUIInstance = useRef<unknown>(null);

  useEffect(() => {
    // Dynamic import to avoid SSR issues
    const loadSwaggerUI = async () => {
      try {
        // Import Swagger UI dynamically
        const SwaggerUI = await import('swagger-ui');
        
        if (swaggerRef.current && !swaggerUIInstance.current) {
          const spec = generateOpenAPISpec();
          
          swaggerUIInstance.current = SwaggerUI({
            dom_id: swaggerRef.current,
            spec: spec,
            
            // UI Configuration
            docExpansion: defaultExpanded ? 'full' : 'list',
            deepLinking: true,
            showExtensions: true,
            showCommonExtensions: true,
            defaultModelsExpandDepth: showSchemas ? 2 : -1,
            defaultModelExpandDepth: 2,
            displayRequestDuration: true,
            
            // Features
            tryItOutEnabled: tryItOutEnabled,
            supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
            validatorUrl: null,
            
            // Authentication
            persistAuthorization: true,
            preauthorizeApiKey: (authDefinitionKey: string, apiKeyValue: string) => {
              console.log('Pre-authorizing API key:', authDefinitionKey);
            },
            
            // Custom CSS
            customCSS: generateCustomCSS(theme),
            
            // Request interceptor for adding custom headers
            requestInterceptor: (request: unknown) => {
              // Add custom headers for development
              if (process.env.NODE_ENV === 'development') {
                request.headers['X-API-Version'] = '1.0.0';
                request.headers['X-Client'] = 'swagger-ui';
              }
              
              console.log('API Request:', request.method, request.url);
              return request;
            },
            
            // Response interceptor for handling custom responses
            responseInterceptor: (response: unknown) => {
              console.log('API Response:', response.status, response.url);
              
              // Handle rate limiting headers
              if (response.headers['x-rate-limit-remaining']) {
                console.log('Rate limit remaining:', response.headers['x-rate-limit-remaining']);
              }
              
              return response;
            },
            
            // Error handling
            onComplete: () => {
              console.log('Swagger UI loaded successfully');
              
              // Auto-authorize for development
              if (process.env.NODE_ENV === 'development') {
                const devToken = process.env.NEXT_PUBLIC_DEV_API_TOKEN;
                if (devToken) {
                  setTimeout(() => {
                    const authBtn = document.querySelector('.authorize') as HTMLButtonElement;
                    if (authBtn) {
                      authBtn.click();
                      
                      setTimeout(() => {
                        const tokenInput = document.querySelector('input[name="BearerAuth"]') as HTMLInputElement;
                        if (tokenInput) {
                          tokenInput.value = devToken;
                          const authorizeBtn = document.querySelector('.auth-btn-wrapper .authorize') as HTMLButtonElement;
                          if (authorizeBtn) {
                            authorizeBtn.click();
                          }
                        }
                      }, 100);
                    }
                  }, 1000);
                }
              }
            },
            
            // Plugin configuration
            plugins: [
              SwaggerUI.plugins.DownloadUrl,
              SwaggerUI.plugins.DeepLink,
              SwaggerUI.plugins.OnComplete
            ],
            
            // Layout configuration
            layout: 'BaseLayout',
            
            // Custom operations sorting
            operationsSorter: (a: unknown, b: unknown) => {
              const order = ['get', 'post', 'put', 'patch', 'delete'];
              const aMethod = a.get('method');
              const bMethod = b.get('method');
              
              if (aMethod !== bMethod) {
                return order.indexOf(aMethod) - order.indexOf(bMethod);
              }
              
              return a.get('path').localeCompare(b.get('path'));
            },
            
            // Custom tag sorting
            tagsSorter: 'alpha'
          });
        }
      } catch (error) {
        console.error('Failed to load Swagger UI:', error);
        
        // Fallback: Display error message
        if (swaggerRef.current) {
          swaggerRef.current.innerHTML = '
            <div class="swagger-ui-error">
              <h3>Failed to load API documentation</h3>
              <p>Please check your internet connection and try again.</p>
              <pre>${error instanceof Error ? error.message : 'Unknown error`}</pre>
            </div>
          ';
        }
      }
    };

    loadSwaggerUI();

    // Cleanup
    return () => {
      if (swaggerUIInstance.current) {
        swaggerUIInstance.current = null;
      }
    };
  }, [theme, showSchemas, tryItOutEnabled, defaultExpanded]);

  return (
    <div className={'swagger-ui-container ${className}'}>
      {showHeader && (
        <div className="api-docs-header mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Investment Platform API</h1>
              <p className="text-gray-300 mt-1">
                Comprehensive RESTful API for investment management, trading, and portfolio analytics
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-900/50 text-green-300 px-3 py-1 rounded-full text-sm">
                v1.0.0
              </div>
              <div className="bg-blue-900/50 text-blue-300 px-3 py-1 rounded-full text-sm">
                OpenAPI 3.0
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Base URL</h3>
              <code className="text-blue-300 text-sm">https://api.thorbis.com/v1</code>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Authentication</h3>
              <code className="text-green-300 text-sm">Bearer JWT Token</code>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Rate Limit</h3>
              <code className="text-yellow-300 text-sm">1000 req/hour</code>
            </div>
          </div>
        </div>
      )}
      
      <div 
        ref={swaggerRef} 
        className="swagger-ui-wrapper"
        style={{ minHeight: '600px' }}
      />
    </div>
  );
}

/**
 * Generate custom CSS for Swagger UI theming
 */
function generateCustomCSS(theme: 'light' | 'dark'): string {
  if (theme === 'dark') {
    return ''
      /* Dark theme for Swagger UI */
      .swagger-ui {
        color: #e4e4e7;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }
      
      .swagger-ui .topbar {
        background-color: #1f2937;
        border-bottom: 1px solid #374151;
      }
      
      .swagger-ui .topbar .download-url-wrapper {
        background-color: #374151;
      }
      
      .swagger-ui .info {
        background-color: #111827;
        border: 1px solid #374151;
        border-radius: 0.5rem;
        padding: 1.5rem;
        margin-bottom: 1rem;
      }
      
      .swagger-ui .info .title {
        color: #f9fafb;
      }
      
      .swagger-ui .info .description {
        color: #d1d5db;
      }
      
      .swagger-ui .scheme-container {
        background-color: #1f2937;
        border: 1px solid #374151;
        border-radius: 0.5rem;
        padding: 1rem;
      }
      
      .swagger-ui .opblock.opblock-get {
        background-color: rgba(16, 185, 129, 0.1);
        border-color: #10b981;
      }
      
      .swagger-ui .opblock.opblock-post {
        background-color: rgba(59, 130, 246, 0.1);
        border-color: #3b82f6;
      }
      
      .swagger-ui .opblock.opblock-put {
        background-color: rgba(245, 158, 11, 0.1);
        border-color: #f59e0b;
      }
      
      .swagger-ui .opblock.opblock-delete {
        background-color: rgba(239, 68, 68, 0.1);
        border-color: #ef4444;
      }
      
      .swagger-ui .opblock-summary {
        color: #f9fafb;
      }
      
      .swagger-ui .opblock-description-wrapper {
        color: #d1d5db;
      }
      
      .swagger-ui .opblock-section-header {
        background-color: #1f2937;
        color: #f9fafb;
      }
      
      .swagger-ui .parameters-col_description {
        color: #d1d5db;
      }
      
      .swagger-ui .parameter__name {
        color: #f9fafb;
      }
      
      .swagger-ui .parameter__type {
        color: #10b981;
      }
      
      .swagger-ui .response-col_status {
        color: #f9fafb;
      }
      
      .swagger-ui .response-col_description {
        color: #d1d5db;
      }
      
      .swagger-ui .btn {
        background-color: #3b82f6;
        color: white;
        border-radius: 0.375rem;
      }
      
      .swagger-ui .btn:hover {
        background-color: #2563eb;
      }
      
      .swagger-ui .authorize .btn-done {
        background-color: #10b981;
      }
      
      .swagger-ui .authorize .btn-done:hover {
        background-color: #059669;
      }
      
      .swagger-ui .highlight-code {
        background-color: #1f2937;
        color: #e5e7eb;
      }
      
      .swagger-ui .model-box {
        background-color: #1f2937;
        border: 1px solid #374151;
        border-radius: 0.375rem;
      }
      
      .swagger-ui .model .property-row {
        border-bottom: 1px solid #374151;
      }
      
      .swagger-ui .model .property-row .property {
        color: #f9fafb;
      }
      
      .swagger-ui .model .property-row .type {
        color: #10b981;
      }
      
      .swagger-ui-error {
        background-color: #1f2937;
        border: 1px solid #ef4444;
        border-radius: 0.5rem;
        padding: 2rem;
        text-align: center;
        color: #f9fafb;
      }
      
      .swagger-ui-error h3 {
        color: #ef4444;
        margin-bottom: 1rem;
      }
      
      .swagger-ui-error pre {
        background-color: #111827;
        color: #fca5a5;
        padding: 1rem;
        border-radius: 0.375rem;
        text-align: left;
        margin-top: 1rem;
        font-size: 0.875rem;
      }
      
      /* Custom scrollbar for dark theme */
      .swagger-ui ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      
      .swagger-ui ::-webkit-scrollbar-track {
        background: #1f2937;
      }
      
      .swagger-ui ::-webkit-scrollbar-thumb {
        background: #4b5563;
        border-radius: 4px;
      }
      
      .swagger-ui ::-webkit-scrollbar-thumb:hover {
        background: #6b7280;
      }
    ';
  }
  
  return '; // Light theme uses default Swagger UI styles
}

/**
 * API Documentation Header Component
 */
export function APIDocsHeader() {
  return (
    <div className="bg-gradient-to-r from-blue-900 to-purple-900 text-white p-6 rounded-t-lg">
      <h1 className="text-3xl font-bold mb-2">Investment Platform API Documentation</h1>
      <p className="text-blue-100 mb-4">
        Comprehensive RESTful API for investment management, trading execution, and portfolio analytics
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-neutral-950/20 rounded p-3">
          <div className="text-sm text-blue-200">Version</div>
          <div className="font-mono font-bold">v1.0.0</div>
        </div>
        <div className="bg-neutral-950/20 rounded p-3">
          <div className="text-sm text-blue-200">Specification</div>
          <div className="font-mono font-bold">OpenAPI 3.0</div>
        </div>
        <div className="bg-neutral-950/20 rounded p-3">
          <div className="text-sm text-blue-200">Endpoints</div>
          <div className="font-mono font-bold">25+</div>
        </div>
        <div className="bg-neutral-950/20 rounded p-3">
          <div className="text-sm text-blue-200">Authentication</div>
          <div className="font-mono font-bold">JWT Bearer</div>
        </div>
      </div>
    </div>
  );
}