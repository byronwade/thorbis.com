/**
 * LOM Manifest Validation API v1
 * Validate List of Manifests compliance
 */

import { NextRequest, NextResponse } from 'next/server'

type ValidationError = {
  path: string;
  message: string;
  suggestion?: string;
}

type ValidationWarning = {
  path: string;
  message: string;
  suggestion?: string;
}

type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Validate LOM manifest structure and content
 */
function validateLOMManifest(manifest: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check required top-level fields
  const requiredFields = ['lom_version', 'publisher', 'openapi', 'safety', 'tools', 'updated_at'];
  
  for (const field of requiredFields) {
    if (!manifest[field]) {
      errors.push({
        path: field,
        message: `Missing required field: ${field}',
        suggestion: 'Add the ${field} field to your manifest'
      });
    }
  }

  // Validate publisher object
  if (manifest.publisher) {
    if (!manifest.publisher.name) {
      errors.push({
        path: 'publisher.name',
        message: 'Publisher name is required',
        suggestion: 'Add a name field to the publisher object'
      });
    }

    if (!manifest.publisher.website) {
      errors.push({
        path: 'publisher.website',
        message: 'Publisher website is required',
        suggestion: 'Add a website field to the publisher object'
      });
    } else if (!isValidUrl(manifest.publisher.website)) {
      errors.push({
        path: 'publisher.website',
        message: 'Publisher website must be a valid URL',
        suggestion: 'Ensure the website field contains a valid HTTP/HTTPS URL'
      });
    }

    if (!manifest.publisher.description) {
      warnings.push({
        path: 'publisher.description',
        message: 'Publisher description is recommended',
        suggestion: 'Add a description to help AI agents understand your service'
      });
    }

    if (!manifest.publisher.contact?.email) {
      warnings.push({
        path: 'publisher.contact.email',
        message: 'Contact email is recommended',
        suggestion: 'Add contact email for support and communication'
      });
    }
  }

  // Validate OpenAPI configuration
  if (manifest.openapi) {
    if (!manifest.openapi.url) {
      errors.push({
        path: 'openapi.url',
        message: 'OpenAPI URL is required',
        suggestion: 'Add a URL field pointing to your OpenAPI specification'
      });
    } else if (!isValidUrl(manifest.openapi.url)) {
      errors.push({
        path: 'openapi.url',
        message: 'OpenAPI URL must be a valid URL',
        suggestion: 'Ensure the OpenAPI URL is a valid HTTP/HTTPS endpoint'
      });
    }

    if (!manifest.openapi.version) {
      warnings.push({
        path: 'openapi.version',
        message: 'OpenAPI version is recommended',
        suggestion: 'Specify the OpenAPI specification version (e.g., "3.0.0")'
      });
    }
  }

  // Validate safety configuration
  if (manifest.safety) {
    if (typeof manifest.safety.confirm_before_write !== 'boolean') {
      errors.push({
        path: 'safety.confirm_before_write',
        message: 'confirm_before_write must be a boolean',
        suggestion: 'Set confirm_before_write to true or false'
      });
    } else if (manifest.safety.confirm_before_write === false) {
      warnings.push({
        path: 'safety.confirm_before_write',
        message: 'Disabling confirm_before_write may allow unsupervised modifications',
        suggestion: 'Consider enabling confirm_before_write for safer operations'
      });
    }

    if (typeof manifest.safety.audit_logs !== 'boolean') {
      errors.push({
        path: 'safety.audit_logs',
        message: 'audit_logs must be a boolean',
        suggestion: 'Set audit_logs to true or false'
      });
    }

    if (typeof manifest.safety.rate_limiting !== 'boolean') {
      errors.push({
        path: 'safety.rate_limiting',
        message: 'rate_limiting must be a boolean',
        suggestion: 'Set rate_limiting to true or false'
      });
    }
  }

  // Validate tools array
  if (!Array.isArray(manifest.tools)) {
    errors.push({
      path: 'tools',
      message: 'tools must be an array',
      suggestion: 'Provide an array of tool definitions'
    });
  } else if (manifest.tools.length === 0) {
    warnings.push({
      path: 'tools',
      message: 'No tools defined',
      suggestion: 'Consider adding specific API endpoints that AI agents can use'
    });
  }

  // Validate updated_at timestamp
  if (manifest.updated_at && !isValidISODate(manifest.updated_at)) {
    errors.push({
      path: 'updated_at',
      message: 'updated_at must be a valid ISO 8601 timestamp',
      suggestion: 'Use ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ'
    });
  }

  // Validate optional capabilities
  if (manifest.capabilities) {
    if (manifest.capabilities.industries && !Array.isArray(manifest.capabilities.industries)) {
      errors.push({
        path: 'capabilities.industries',
        message: 'industries must be an array',
        suggestion: 'Provide an array of industry strings'
      });
    }

    if (manifest.capabilities.data_domains && !Array.isArray(manifest.capabilities.data_domains)) {
      errors.push({
        path: 'capabilities.data_domains',
        message: 'data_domains must be an array',
        suggestion: 'Provide an array of data domain strings'
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Check if a string is a valid URL
 */
function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_error) {
    return false;
  }
}

/**
 * Check if a string is a valid ISO 8601 date
 */
function isValidISODate(string: string): boolean {
  const date = new Date(string);
  return date instanceof Date && !isNaN(date.getTime()) && date.toISOString() === string;
}

/**
 * POST /api/v1/lom/validate/manifest - Validate LOM manifest
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.manifest) {
      return NextResponse.json({
        success: false,
        error: 'MISSING_MANIFEST',
        message: 'Missing manifest field in request body',
        data: {
          valid: false,
          errors: [{ 
            path: 'root', 
            message: 'Missing manifest field in request body',
            suggestion: 'Include a "manifest" field with your LOM manifest JSON'
          }],
          warnings: []
        },
        timestamp: new Date().toISOString(),
      }, { status: 400 })
    }

    const validationResult = validateLOMManifest(body.manifest)
    
    return NextResponse.json({
      success: true,
      data: {
        valid: validationResult.valid,
        errors: validationResult.errors,
        warnings: validationResult.warnings,
        timestamp: new Date().toISOString()
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
    console.error('Error validating LOM manifest:', error)
    
    return NextResponse.json({
      success: false,
      error: 'VALIDATION_FAILED',
      message: 'Failed to validate LOM manifest',
      data: {
        valid: false,
        errors: [{
          path: 'root',
          message: 'Invalid JSON or server error during validation',
          suggestion: 'Ensure your manifest is valid JSON and try again'
        }],
        warnings: []
      },
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}

/**
 * OPTIONS /api/v1/lom/validate/manifest - CORS preflight
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

export type LOMManifestValidateResponse = {
  success: true;
  data: {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    timestamp: string;
  };
  timestamp: string;
};