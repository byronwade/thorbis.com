/**
 * Professional Subdomain Middleware
 * Handles professional subdomain routing and business profile redirects
 */

import { NextResponse } from "next/server";

/**
 * Extract subdomain from hostname
 */
function getSubdomain(hostname) {
  if (!hostname) return null;
  
  // Remove port if present
  const cleanHostname = hostname.split(':')[0];
  
  // Split by dots and check if it's a subdomain
  const parts = cleanHostname.split('.');
  
  // Skip if it's localhost or IP address
  if (parts.length < 2 || cleanHostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(cleanHostname)) {
    return null;
  }
  
  // If we have more than 2 parts, the first part is likely the subdomain
  if (parts.length > 2) {
    const potentialSubdomain = parts[0];
    
    // Skip common subdomains that aren't business profiles
    const systemSubdomains = ['www', 'api', 'admin', 'dashboard', 'mail', 'ftp', 'blog'];
    if (systemSubdomains.includes(potentialSubdomain.toLowerCase())) {
      return null;
    }
    
    return potentialSubdomain;
  }
  
  return null;
}

/**
 * Check if subdomain corresponds to a valid business profile
 */
async function validateBusinessSubdomain(subdomain) {
  // In a real implementation, this would check the database
  // For now, return a simple validation
  if (!subdomain || subdomain.length < 2) {
    return false;
  }
  
  // Basic validation - alphanumeric and hyphens only
  const validPattern = /^[a-zA-Z0-9-]+$/;
  return validPattern.test(subdomain);
}

/**
 * Create professional subdomain middleware
 */
export async function createProfessionalSubdomainMiddleware(request) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host');
  
  try {
    // Extract subdomain from hostname
    const subdomain = getSubdomain(hostname);
    
    if (!subdomain) {
      // No subdomain detected, continue normally
      return NextResponse.next();
    }
    
    // Validate if this is a valid business subdomain
    const isValidBusiness = await validateBusinessSubdomain(subdomain);
    
    if (!isValidBusiness) {
      // Invalid subdomain, continue normally or redirect to main site
      return NextResponse.next();
    }
    
    // Handle subdomain routing
    if (pathname === '/' || pathname === '') {
      // Root path on subdomain - redirect to business profile (new canonical will be used downstream)
      const businessProfileUrl = new URL(`/biz/${subdomain}`, request.url);
      
      // Preserve query parameters
      businessProfileUrl.search = request.nextUrl.search;
      
      return NextResponse.redirect(businessProfileUrl, 302);
    }
    
    // Handle other paths on subdomain
    if (pathname.startsWith('/biz/') || /^\/[a-z]{2}\/[a-z]{2}\/[a-z0-9-]+\//.test(pathname)) {
      // Already on business path, continue normally
      return NextResponse.next();
    }
    
    // For other paths on subdomain, redirect to main site
    const mainSiteUrl = new URL(pathname, request.url);
    mainSiteUrl.hostname = mainSiteUrl.hostname.replace(`${subdomain}.`, '');
    mainSiteUrl.search = request.nextUrl.search;
    
    return NextResponse.redirect(mainSiteUrl, 302);
    
  } catch (error) {
    console.warn('Professional subdomain middleware error:', error);
    
    // On error, continue normally
    return NextResponse.next();
  }
}

/**
 * Utilities for subdomain handling
 */
export const subdomainUtils = {
  /**
   * Extract business slug from subdomain
   */
  getBusinessSlug: (hostname) => {
    return getSubdomain(hostname);
  },
  
  /**
   * Build subdomain URL for business
   */
  buildSubdomainUrl: (businessSlug, baseUrl = 'localhost:3000') => {
    if (!businessSlug) return null;
    
    // Handle different environments
    if (baseUrl.includes('localhost')) {
      return `http://${businessSlug}.${baseUrl}`;
    } else {
      return `https://${businessSlug}.${baseUrl}`;
    }
  },
  
  /**
   * Check if current request is on a business subdomain
   */
  isBusinessSubdomain: (hostname) => {
    const subdomain = getSubdomain(hostname);
    return subdomain !== null;
  }
};

export default createProfessionalSubdomainMiddleware;
