/**
 * API Authentication Middleware
 * JWT-based authentication for Thorbis Business OS APIs
 */

import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { createErrorResponse, ApiErrorCode } from '@/lib/api-response-utils';

export interface JWTClaims {
  sub: string;                     // User ID
  business_id: string;            // Tenant ID
  role: 'owner' | 'manager' | 'staff' | 'viewer' | 'api_partner';
  industry: 'hs' | 'auto' | 'rest' | 'ret';
  permissions: string[];          // Granular permissions
  exp: number;                    // Token expiration
  iat: number;                    // Issued at
  iss: string;                    // Issuer
  aud: string;                    // Audience
}

export interface AuthContext {
  isAuthenticated: boolean;
  userId: string;
  businessId: string;
  role: JWTClaims['role'];
  industry: JWTClaims['industry'];
  permissions: string[];
  tokenPayload?: JWTClaims;
}

export interface AuthMiddlewareOptions {
  requireAuth?: boolean;
  requiredPermissions?: string[];
  allowedRoles?: JWTClaims['role'][];
  allowedIndustries?: JWTClaims['industry'][];
}

/**
 * Get JWT secret with validation
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
  
  if (secret === 'your-super-secret-jwt-key') {
    throw new Error('JWT_SECRET must not use default value');
  }
  
  return secret;
}

/**
 * Extract JWT token from request
 */
function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Validate JWT token and extract claims
 */
export async function validateJwtToken(token: string): Promise<{
  valid: boolean;
  claims?: JWTClaims;
  error?: string;
}> {
  try {
    const claims = jwt.verify(token, getJwtSecret()) as JWTClaims;
    
    // Validate required claims
    if (!claims.sub || !claims.business_id || !claims.role) {
      return { valid: false, error: 'Missing required claims' };
    }
    
    // Validate role
    const validRoles: JWTClaims['role'][] = ['owner', 'manager', 'staff', 'viewer', 'api_partner'];
    if (!validRoles.includes(claims.role)) {
      return { valid: false, error: 'Invalid role' };
    }
    
    // Validate industry
    const validIndustries: JWTClaims['industry'][] = ['hs', 'auto', 'rest', 'ret'];
    if (claims.industry && !validIndustries.includes(claims.industry)) {
      return { valid: false, error: 'Invalid industry' };
    }
    
    return { valid: true, claims };
  } catch (_error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, error: 'Token expired' };
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return { valid: false, error: 'Invalid token' };
    }
    return { valid: false, error: 'Token validation failed' };
  }
}

/**
 * Create authentication context from request
 */
export async function createAuthContext(request: NextRequest): Promise<AuthContext> {
  const token = extractToken(request);
  
  if (!token) {
    return {
      isAuthenticated: false,
      userId: ',
      businessId: ',
      role: 'viewer',
      industry: 'hs',
      permissions: []
    };
  }
  
  const validation = await validateJwtToken(token);
  
  if (!validation.valid || !validation.claims) {
    return {
      isAuthenticated: false,
      userId: ',
      businessId: ',
      role: 'viewer',
      industry: 'hs',
      permissions: []
    };
  }
  
  const claims = validation.claims;
  
  return {
    isAuthenticated: true,
    userId: claims.sub,
    businessId: claims.business_id,
    role: claims.role,
    industry: claims.industry,
    permissions: claims.permissions || [],
    tokenPayload: claims
  };
}

/**
 * Check if user has required permission
 */
export function hasPermission(permissions: string[], required: string): boolean {
  // Admin/owner access bypass
  if (permissions.includes('*') || permissions.includes('admin:*')) {
    return true;
  }
  
  return permissions.includes(required);
}

/**
 * Check if user has any of the required permissions
 */
export function hasAnyPermission(permissions: string[], required: string[]): boolean {
  return required.some(permission => hasPermission(permissions, permission));
}

/**
 * Check if role meets minimum requirement
 */
export function hasRoleLevel(userRole: JWTClaims['role'], requiredRole: JWTClaims['role']): boolean {
  const roleHierarchy = {
    viewer: 25,
    api_partner: 10,
    staff: 50,
    manager: 75,
    owner: 100
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * API Authentication middleware function
 */
export async function authenticateRequest(
  request: NextRequest,
  options: AuthMiddlewareOptions = {}
): Promise<{
  success: boolean;
  authContext?: AuthContext;
  errorResponse?: any;
}> {
  try {
    const authContext = await createAuthContext(request);
    
    // Check if authentication is required
    if (options.requireAuth && !authContext.isAuthenticated) {
      return {
        success: false,
        errorResponse: createErrorResponse(
          ApiErrorCode.AUTH_ERROR,
          'Authentication required',
          {
            suggestedAction: 'Provide a valid JWT token in the Authorization header',
            documentationUrl: 'https://thorbis.com/docs/api/authentication'
          }
        )
      };
    }
    
    // Skip further checks if not authenticated and auth not required
    if (!authContext.isAuthenticated) {
      return { success: true, authContext };
    }
    
    // Check required permissions
    if (options.requiredPermissions && options.requiredPermissions.length > 0) {
      const hasRequiredPermissions = hasAnyPermission(
        authContext.permissions,
        options.requiredPermissions
      );
      
      if (!hasRequiredPermissions) {
        return {
          success: false,
          errorResponse: createErrorResponse(
            ApiErrorCode.PERMISSION_DENIED,
            'Insufficient permissions',
            {
              details: 'Required permissions: ${options.requiredPermissions.join(', ')}',
              suggestedAction: 'Contact your administrator to request access',
              documentationUrl: 'https://thorbis.com/docs/api/permissions'
            }
          )
        };
      }
    }
    
    // Check allowed roles
    if (options.allowedRoles && options.allowedRoles.length > 0) {
      if (!options.allowedRoles.includes(authContext.role)) {
        return {
          success: false,
          errorResponse: createErrorResponse(
            ApiErrorCode.PERMISSION_DENIED,
            'Role not authorized',
            {
              details: 'Required roles: ${options.allowedRoles.join(', ')}',
              suggestedAction: 'Contact your administrator to request role elevation'
            }
          )
        };
      }
    }
    
    // Check allowed industries
    if (options.allowedIndustries && options.allowedIndustries.length > 0) {
      if (!options.allowedIndustries.includes(authContext.industry)) {
        return {
          success: false,
          errorResponse: createErrorResponse(
            ApiErrorCode.PERMISSION_DENIED,
            'Industry access denied',
            {
              details: 'Required industries: ${options.allowedIndustries.join(', ')}',
              suggestedAction: 'Use the correct industry-specific endpoint'
            }
          )
        };
      }
    }
    
    return { success: true, authContext };
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return {
      success: false,
      errorResponse: createErrorResponse(
        ApiErrorCode.AUTH_ERROR,
        'Authentication service error',
        {
          details: error instanceof Error ? error.message : 'Unknown error',
          suggestedAction: 'Try again or contact support if the problem persists'
        }
      )
    };
  }
}

/**
 * Permission patterns for different industries and resources
 */
export const PermissionPatterns = {
  // Home Services permissions
  HS: {
    WORK_ORDERS_READ: 'hs:work_orders:read',
    WORK_ORDERS_WRITE: 'hs:work_orders:write',
    CUSTOMERS_READ: 'hs:customers:read',
    CUSTOMERS_WRITE: 'hs:customers:write',
    ESTIMATES_READ: 'hs:estimates:read',
    ESTIMATES_WRITE: 'hs:estimates:write',
    INVOICES_READ: 'hs:invoices:read',
    INVOICES_WRITE: 'hs:invoices:write',
    ADMIN_ACCESS: 'hs:admin:access'
  },
  
  // Auto Services permissions
  AUTO: {
    REPAIR_ORDERS_READ: 'auto:repair_orders:read',
    REPAIR_ORDERS_WRITE: 'auto:repair_orders:write',
    VEHICLES_READ: 'auto:vehicles:read',
    VEHICLES_WRITE: 'auto:vehicles:write',
    PARTS_READ: 'auto:parts:read',
    PARTS_WRITE: 'auto:parts:write',
    ADMIN_ACCESS: 'auto:admin:access'
  },
  
  // Restaurant permissions
  REST: {
    ORDERS_READ: 'rest:orders:read',
    ORDERS_WRITE: 'rest:orders:write',
    MENU_READ: 'rest:menu:read',
    MENU_WRITE: 'rest:menu:write',
    RESERVATIONS_READ: 'rest:reservations:read',
    RESERVATIONS_WRITE: 'rest:reservations:write',
    ADMIN_ACCESS: 'rest:admin:access'
  },
  
  // Retail permissions
  RET: {
    PRODUCTS_READ: 'ret:products:read',
    PRODUCTS_WRITE: 'ret:products:write',
    INVENTORY_READ: 'ret:inventory:read',
    INVENTORY_WRITE: 'ret:inventory:write',
    ORDERS_READ: 'ret:orders:read',
    ORDERS_WRITE: 'ret:orders:write',
    ADMIN_ACCESS: 'ret:admin:access'
  }
} as const;