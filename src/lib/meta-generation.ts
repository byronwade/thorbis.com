'use client'

// Dynamic meta tag generation for Thorbis Business OS
// Industry-specific SEO optimization with comprehensive meta data management

import type { Metadata } from 'next'

// =============================================================================
// Base Types and Interfaces
// =============================================================================

export interface MetaOptions {
  title?: string
  description?: string
  keywords?: string[]
  industry?: 'hs' | 'rest' | 'auto' | 'ret' | 'courses' | 'payroll' | 'investigations'
  businessName?: string
  location?: string
  customMeta?: Record<string, string>
  canonical?: string
  noIndex?: boolean
  openGraph?: {
    title?: string
    description?: string
    image?: string
    type?: string
    locale?: string
  }
  twitter?: {
    title?: string
    description?: string
    image?: string
    card?: 'summary' | 'summary_large_image' | 'app' | 'player'
  }
  additionalMeta?: Record<string, string | string[]>
}

export interface IndustryMetaConfig {
  title: string
  description: string
  keywords: string[]
  serviceKeywords: string[]
  locationKeywords: string[]
  businessTypes: string[]
}

// =============================================================================
// Industry-Specific Meta Configurations
// =============================================================================

export const industryMetaConfigs: Record<string, IndustryMetaConfig> = {
  hs: {
    title: 'Home Services Management | Thorbis Business OS',
    description: 'Comprehensive home services management platform with work orders, scheduling, invoicing, and customer management for HVAC, plumbing, electrical, and repair businesses.',
    keywords: ['home services', 'HVAC', 'plumbing', 'electrical', 'repair business', 'work orders', 'service management'],
    serviceKeywords: ['work orders', 'scheduling', 'dispatch', 'invoicing', 'estimates', 'customer management', 'technician tracking'],
    locationKeywords: ['local service', 'residential services', 'commercial services', 'emergency repair'],
    businessTypes: ['HVAC contractor', 'plumber', 'electrician', 'handyman', 'appliance repair', 'home improvement']
  },
  rest: {
    title: 'Restaurant Management System | Thorbis Business OS',
    description: 'Complete restaurant management platform with POS system, kitchen display, inventory management, staff scheduling, and analytics for restaurants and food service businesses.',
    keywords: ['restaurant POS', 'kitchen management', 'food service', 'restaurant software', 'menu management', 'order management'],
    serviceKeywords: ['point of sale', 'kitchen display', 'inventory tracking', 'staff scheduling', 'menu management', 'order processing'],
    locationKeywords: ['restaurant', 'cafe', 'food truck', 'catering', 'quick service', 'fine dining'],
    businessTypes: ['restaurant', 'cafe', 'bar', 'food truck', 'catering business', 'quick service restaurant']
  },
  auto: {
    title: 'Auto Services Management | Thorbis Business OS',
    description: 'Professional auto services management system with repair orders, parts inventory, customer vehicles, estimates, and service bay scheduling for automotive businesses.',
    keywords: ['auto repair', 'automotive services', 'repair shop software', 'parts management', 'vehicle maintenance', 'service bay'],
    serviceKeywords: ['repair orders', 'parts inventory', 'vehicle history', 'service estimates', 'bay scheduling', 'customer vehicles'],
    locationKeywords: ['auto shop', 'repair facility', 'service center', 'automotive garage'],
    businessTypes: ['auto repair shop', 'automotive service center', 'tire shop', 'oil change', 'auto body shop', 'transmission shop']
  },
  ret: {
    title: 'Retail Management System | Thorbis Business OS',
    description: 'Complete retail management platform with POS system, inventory management, customer loyalty, sales analytics, and multi-location support for retail businesses.',
    keywords: ['retail POS', 'inventory management', 'retail software', 'sales tracking', 'customer loyalty', 'multi-location'],
    serviceKeywords: ['point of sale', 'inventory tracking', 'sales reporting', 'customer management', 'loyalty programs', 'stock management'],
    locationKeywords: ['retail store', 'boutique', 'shop', 'marketplace', 'chain store'],
    businessTypes: ['retail store', 'boutique', 'convenience store', 'specialty shop', 'department store', 'online retailer']
  },
  courses: {
    title: 'Learning Management System | Thorbis Business OS',
    description: 'Comprehensive learning management system with course creation, student progress tracking, assessments, certificates, and business skill development programs.',
    keywords: ['LMS', 'learning management', 'online courses', 'business training', 'skill development', 'certification'],
    serviceKeywords: ['course creation', 'student tracking', 'assessments', 'certificates', 'progress monitoring', 'content management'],
    locationKeywords: ['online learning', 'business education', 'professional development', 'corporate training'],
    businessTypes: ['training company', 'educational institution', 'corporate training', 'skill development', 'certification provider']
  },
  payroll: {
    title: 'Payroll Management System | Thorbis Business OS',
    description: 'Complete payroll management platform with employee records, time tracking, benefits administration, tax compliance, and automated payroll processing.',
    keywords: ['payroll software', 'employee management', 'time tracking', 'benefits administration', 'tax compliance', 'HR management'],
    serviceKeywords: ['payroll processing', 'time tracking', 'benefits management', 'tax filing', 'employee records', 'compliance reporting'],
    locationKeywords: ['business payroll', 'employee management', 'HR services', 'payroll processing'],
    businessTypes: ['payroll service', 'HR company', 'business services', 'accounting firm', 'employee management']
  },
  investigations: {
    title: 'Investigation Management System | Thorbis Business OS', 
    description: 'Professional investigation management platform with case tracking, evidence management, report generation, and secure document handling for investigation agencies.',
    keywords: ['investigation software', 'case management', 'evidence tracking', 'investigation reports', 'private investigator', 'case files'],
    serviceKeywords: ['case tracking', 'evidence management', 'report generation', 'document security', 'timeline creation', 'investigation workflow'],
    locationKeywords: ['investigation agency', 'private investigator', 'detective services', 'security consulting'],
    businessTypes: ['investigation agency', 'private investigator', 'security firm', 'legal investigation', 'corporate security', 'forensic services']
  }
}

// =============================================================================
// Core Meta Generation Functions
// =============================================================================

/**
 * Generate industry-specific meta tags
 */
export function generateIndustryMeta(
  industry: keyof typeof industryMetaConfigs,
  options: MetaOptions = {}
): Metadata {
  const config = industryMetaConfigs[industry]
  if (!config) {
    throw new Error(`Unknown industry: ${industry}`)
  }

  const {
    title = config.title,
    description = config.description,
    businessName,
    location,
    keywords = config.keywords,
    canonical,
    noIndex = false,
    openGraph = {},
    twitter = {},
    additionalMeta = {}
  } = options

  // Enhance title with business name and location
  let enhancedTitle = title
  if (businessName) {
    enhancedTitle = `${businessName} - ${title}`
  }
  if (location) {
    enhancedTitle = `${enhancedTitle} | ${location}`
  }

  // Enhance description with location
  let enhancedDescription = description
  if (location) {
    enhancedDescription = `${description} Serving ${location} and surrounding areas.`
  }

  // Combine keywords
  const allKeywords = [
    ...keywords,
    ...config.serviceKeywords,
    ...(location ? [`${location} ${config.businessTypes[0]}`, `${industry} ${location}'] : []),
    ...(businessName ? ['${businessName}'] : []),
    'business management software',
    'Thorbis Business OS'
  ]

  // Open Graph defaults
  const ogDefaults = {
    title: enhancedTitle,
    description: enhancedDescription,
    image: '/images/og-default.jpg',
    type: 'website',
    locale: 'en_US',
    siteName: 'Thorbis Business OS'
  }

  // Twitter Card defaults
  const twitterDefaults = {
    title: enhancedTitle,
    description: enhancedDescription,
    image: '/images/twitter-card.jpg',
    card: 'summary_large_image' as const
  }

  return {
    title: enhancedTitle,
    description: enhancedDescription,
    keywords: allKeywords.join(', '),
    ...(canonical && { 
      alternates: { 
        canonical 
      } 
    }),
    ...(noIndex && { 
      robots: { 
        index: false, 
        follow: false 
      } 
    }),
    openGraph: {
      ...ogDefaults,
      ...openGraph,
      url: canonical
    },
    twitter: {
      ...twitterDefaults,
      ...twitter,
      creator: '@thorbis',
      site: '@thorbis'
    },
    other: {
      'business-type': config.businessTypes.join(', '),
      'service-area': location || 'Multiple Locations',industry': industry,
      ...additionalMeta
    }
  }
}

/**
 * Generate page-specific meta tags
 */
export function generatePageMeta(options: MetaOptions): Metadata {
  const {
    title = 'Thorbis Business OS - Comprehensive Business Management Platform',
    description = 'AI-powered business operating system with industry-specific solutions for complete business management, automation, and growth.',
    keywords = ['business management', 'AI automation', 'industry solutions', 'business software'],
    canonical,
    noIndex = false,
    openGraph = {},
    twitter = {},
    additionalMeta = {}
  } = options

  const ogDefaults = {
    title,
    description,
    image: '/images/og-default.jpg',
    type: 'website',
    locale: 'en_US',
    siteName: 'Thorbis Business OS'
  }

  const twitterDefaults = {
    title,
    description, 
    image: '/images/twitter-card.jpg',
    card: 'summary_large_image' as const
  }

  return {
    title,
    description,
    keywords: keywords.join(', '),
    ...(canonical && { 
      alternates: { 
        canonical 
      } 
    }),
    ...(noIndex && { 
      robots: { 
        index: false, 
        follow: false 
      } 
    }),
    openGraph: {
      ...ogDefaults,
      ...openGraph,
      url: canonical
    },
    twitter: {
      ...twitterDefaults,
      ...twitter,
      creator: '@thorbis',
      site: '@thorbis`
    },
    other: additionalMeta
  }
}

/**
 * Generate local business meta tags
 */
export function generateLocalBusinessMeta(
  businessName: string,
  location: string,
  industry: keyof typeof industryMetaConfigs,
  services?: string[],
  additionalOptions: MetaOptions = {}
): Metadata {
  const config = industryMetaConfigs[industry]
  
  const title = '${businessName} - ${config.businessTypes[0]} in ${location}'
  const description = 'Professional ${config.businessTypes[0].toLowerCase()} services in ${location}. ${businessName} offers ${services?.join(', ') || config.serviceKeywords.slice(0, 3).join(', ')} and more. Contact us today for reliable service.`

  const locationKeywords = [
    `${businessName}`,
    `${config.businessTypes[0]} ${location}`,
    `${industry} services ${location}`,
    `local ${config.businessTypes[0]}`,
    `${location} ${config.serviceKeywords[0]}',
    ...config.locationKeywords.map(keyword => '${keyword} ${location}')
  ]

  return generateIndustryMeta(industry, {
    title,
    description,
    businessName,
    location,
    keywords: [...config.keywords, ...locationKeywords],
    openGraph: {
      title,
      description,
      type: 'business.business'
    },
    additionalMeta: {
      'business-name': businessName,
      'service-location': location,
      'business-category': config.businessTypes[0],
      ...(services && { 'services-offered': services.join(', ') }),
      ...additionalOptions.additionalMeta
    },
    ...additionalOptions
  })
}

// =============================================================================
// Specialized Meta Generators
// =============================================================================

/**
 * Generate article/blog post meta tags
 */
export function generateArticleMeta(options: {
  title: string
  description: string
  author?: string
  publishedTime?: string
  modifiedTime?: string
  tags?: string[]
  image?: string
  canonical?: string
}): Metadata {
  const {
    title,
    description,
    author,
    publishedTime,
    modifiedTime,
    tags = [],
    image = '/images/article-default.jpg',
    canonical
  } = options

  return {
    title: '${title} | Thorbis Business OS Blog',
    description,
    keywords: [...tags, 'business insights', 'industry trends', 'Thorbis'].join(', '),
    authors: author ? [{ name: author }] : undefined,
    ...(canonical && { 
      alternates: { 
        canonical 
      } 
    }),
    openGraph: {
      title,
      description,
      type: 'article',
      image,
      siteName: 'Thorbis Business OS',
      locale: 'en_US',
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(author && { 
        authors: [author] 
      }),
      ...(tags.length && { 
        tags 
      })
    },
    twitter: {
      title,
      description,
      image,
      card: 'summary_large_image',
      creator: '@thorbis',
      site: '@thorbis'
    }
  }
}

/**
 * Generate product/service page meta tags
 */
export function generateProductMeta(options: {
  name: string
  description: string
  price?: string
  currency?: string
  availability?: string
  brand?: string
  category?: string
  image?: string
  canonical?: string
}): Metadata {
  const {
    name,
    description,
    price,
    currency = 'USD',
    availability = 'in stock',
    brand = 'Thorbis Business OS',
    category,
    image = '/images/product-default.jpg',
    canonical
  } = options

  return {
    title: '${name} | ${brand}',
    description,
    keywords: [name, brand, category, 'business software', 'management platform'].filter(Boolean).join(', '),
    ...(canonical && { 
      alternates: { 
        canonical 
      } 
    }),
    openGraph: {
      title: name,
      description,
      type: 'product',
      image,
      siteName: brand,
      locale: 'en_US'
    },
    twitter: {
      title: name,
      description,
      image,
      card: 'summary_large_image',
      creator: '@thorbis',
      site: '@thorbis'
    },
    other: {
      'product:brand': brand,
      'product:availability': availability,
      'product:condition': 'new',
      ...(price && { 'product:price:amount': price }),
      ...(currency && { 'product:price:currency': currency }),
      ...(category && { 'product:category`: category })
    }
  }
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get industry-specific keywords for better SEO
 */
export function getIndustryKeywords(industry: keyof typeof industryMetaConfigs): string[] {
  const config = industryMetaConfigs[industry]
  return [
    ...config.keywords,
    ...config.serviceKeywords,
    ...config.businessTypes
  ]
}

/**
 * Generate meta tags for search results pages
 */
export function generateSearchMeta(
  query: string,
  industry?: keyof typeof industryMetaConfigs,
  resultsCount?: number
): Metadata {
  const title = industry 
    ? `${query} - ${industryMetaConfigs[industry].title}`
    : 'Search Results for "${query}" | Thorbis Business OS'
    
  const description = resultsCount
    ? 'Found ${resultsCount} results for "${query}". ${industry ? industryMetaConfigs[industry].description : 'Comprehensive business management solutions.'}'
    : 'Search results for "${query}" in Thorbis Business OS.'

  return generatePageMeta({
    title,
    description,
    keywords: [query, ...(industry ? getIndustryKeywords(industry) : ['business search', 'management platform'])],
    noIndex: true // Don't index search result pages
  })
}

/**
 * Generate canonical URL for current page
 */
export function generateCanonicalUrl(pathname: string, baseUrl: string = 'https://thorbis.com'): string {
  // Remove trailing slash and ensure single slash
  const cleanPath = pathname.replace(/\/+/g, '/').replace(/\/$/, ') || '/'
  return '${baseUrl}${cleanPath}'
}