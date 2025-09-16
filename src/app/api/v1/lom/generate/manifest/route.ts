/**
 * LOM Manifest Generation API v1
 * Generate List of Manifests compliant manifests
 */

import { NextRequest, NextResponse } from 'next/server'

type LOMManifest = {
  lom_version: string;
  publisher: {
    name: string;
    website: string;
    description?: string;
    contact?: {
      email?: string;
      support_url?: string;
    };
  };
  openapi: {
    url: string;
    version: string;
  };
  safety: {
    confirm_before_write: boolean;
    audit_logs: boolean;
    rate_limiting: boolean;
  };
  capabilities?: {
    industries?: string[];
    data_domains?: string[];
    supported_operations?: string[];
  };
  auth?: {
    type: string;
    api_key_header?: string;
    authorization_url?: string;
    token_url?: string;
    description?: string;
  };
  tools: unknown[];
  updated_at: string;
}

/**
 * POST /api/v1/lom/generate/manifest - Generate LOM manifest
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['name', 'website', 'openapi_url']
    const missing = requiredFields.filter(field => !body[field])
    
    if (missing.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Missing required fields: ${missing.join(', ')}',
        data: {
          required: requiredFields,
          provided: Object.keys(body)
        },
        timestamp: new Date().toISOString(),
      }, { status: 400 })
    }

    // Generate basic LOM manifest
    const manifest: LOMManifest = {
      lom_version: '1.0',
      publisher: {
        name: body.name,
        website: body.website,
        ...(body.description && { description: body.description }),
        ...(body.contact_email && { 
          contact: { 
            email: body.contact_email,
            ...(body.support_url && { support_url: body.support_url })
          } 
        })
      },
      openapi: {
        url: body.openapi_url,
        version: body.openapi_version || '3.0.0'
      },
      safety: {
        confirm_before_write: body.confirm_before_write ?? true,
        audit_logs: body.audit_logs ?? true,
        rate_limiting: body.rate_limiting ?? true
      },
      tools: body.tools || [],
      updated_at: new Date().toISOString()
    }

    // Add optional fields if provided
    if (body.industries || body.data_domains || body.supported_operations) {
      manifest.capabilities = {
        ...(body.industries && { industries: body.industries }),
        ...(body.data_domains && { data_domains: body.data_domains }),
        ...(body.supported_operations && { supported_operations: body.supported_operations })
      }
    }

    if (body.auth_type) {
      manifest.auth = {
        type: body.auth_type,
        ...(body.auth_type === 'api_key' && body.api_key_header && { api_key_header: body.api_key_header }),
        ...(body.auth_type === 'oauth2' && body.authorization_url && { authorization_url: body.authorization_url }),
        ...(body.auth_type === 'oauth2' && body.token_url && { token_url: body.token_url }),
        ...(body.auth_description && { description: body.auth_description })
      }
    }

    // Generate suggestions and warnings
    const suggestions = []
    const warnings = []
    
    if (!body.contact_email) {
      suggestions.push('Consider adding contact email for better support communication')
    }
    
    if (!body.description) {
      suggestions.push('Adding a description helps AI agents understand your service better')
    }
    
    if (!body.industries) {
      suggestions.push('Specify industries to improve AI agent matching and discovery')
    }
    
    if (!body.tools || body.tools.length === 0) {
      warnings.push('No tools specified - consider adding specific API endpoints that AI agents can use')
    }
    
    if (body.confirm_before_write === false) {
      warnings.push('Setting confirm_before_write to false may allow unsupervised modifications')
    }

    return NextResponse.json({
      success: true,
      data: {
        manifest,
        suggestions,
        warnings,
        generated_at: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })

  } catch (error) {
    console.error('Error generating LOM manifest:', error)
    
    return NextResponse.json({
      success: false,
      error: 'MANIFEST_GENERATION_FAILED',
      message: 'Failed to generate LOM manifest',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}

/**
 * OPTIONS /api/v1/lom/generate/manifest - CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}

export type LOMManifestGenerateResponse = {
  success: true;
  data: {
    manifest: LOMManifest;
    suggestions: string[];
    warnings: string[];
    generated_at: string;
  };
  timestamp: string;
};