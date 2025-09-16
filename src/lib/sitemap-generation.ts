'use server'

// Dynamic sitemap generation for Thorbis Business OS
// Generates comprehensive sitemaps with industry-specific routes and priorities

import { MetadataRoute } from 'next'

// =============================================================================
// Types and Interfaces
// =============================================================================

export interface SitemapEntry {
  url: string
  lastModified?: string | Date
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

export interface IndustrySitemapOptions {
  industry: string
  routes: string[]
  baseUrl?: string
  lastModified?: Date
  changeFrequency?: SitemapEntry['changeFrequency']
  priority?: number
}

// =============================================================================
// Static Routes Configuration
// =============================================================================

const staticRoutes: Omit<SitemapEntry, 'url'>[] = [
  // Core pages
  { priority: 1.0, changeFrequency: 'daily' }, // Homepage
  { priority: 0.9, changeFrequency: 'weekly' }, // About
  { priority: 0.8, changeFrequency: 'weekly' }, // Pricing
  { priority: 0.7, changeFrequency: 'monthly' }, // Contact
  { priority: 0.6, changeFrequency: 'monthly' }, // Terms
  { priority: 0.5, changeFrequency: 'monthly' }, // Privacy
]

const dashboardRoutes = [
  ', // Main dashboard
  'settings',
  'profile',
  'billing',
  'integrations',
  'analytics'
]

// =============================================================================
// Industry-Specific Route Configurations
// =============================================================================

export const industryRoutes = {
  hs: [
    ', // Dashboard
    'work-orders',
    'work-orders/create',
    'customers', 
    'customers/create',
    'technicians',
    'technicians/create',
    'schedule',
    'invoices',
    'invoices/create',
    'estimates',
    'estimates/create',
    'inventory',
    'reports',
    'settings'
  ],
  rest: [
    ',
    'pos',
    'kitchen',
    'orders',
    'menu',
    'menu/create',
    'inventory',
    'inventory/create', 
    'staff',
    'staff/create',
    'reservations',
    'customers',
    'reports',
    'settings'
  ],
  auto: [
    ',
    'repair-orders',
    'repair-orders/create',
    'customers',
    'customers/create',
    'vehicles',
    'vehicles/create',
    'estimates',
    'estimates/create',
    'parts',
    'parts/create',
    'technicians',
    'service-bays',
    'reports',
    'settings'
  ],
  ret: [
    ',
    'pos',
    'products',
    'products/create',
    'inventory',
    'inventory/create',
    'customers',
    'customers/create',
    'orders',
    'returns',
    'suppliers',
    'reports',
    'staff',
    'settings'
  ],
  courses: [
    ',
    'courses',
    'courses/create',
    'students',
    'students/create', 
    'instructors',
    'instructors/create',
    'assignments',
    'grades',
    'certificates',
    'analytics',
    'settings'
  ],
  payroll: [
    ',
    'employees',
    'employees/create',
    'payroll',
    'payroll/run',
    'time-tracking',
    'benefits',
    'taxes',
    'reports',
    'compliance',
    'settings'
  ],
  investigations: [
    ',
    'cases',
    'cases/create',
    'evidence',
    'evidence/upload',
    'reports',
    'reports/create',
    'timeline',
    'clients',
    'analytics',
    'settings'
  ]
}

// =============================================================================
// Core Sitemap Generation Functions
// =============================================================================

/**
 * Generate base sitemap for static routes
 */
export function generateStaticSitemap(baseUrl: string = 'https://thorbis.com'): SitemapEntry[] {
  const routes = [
    ',
    'about',
    'pricing', 
    'contact',
    'terms',
    'privacy',
    'blog',
    'docs',
    'support',
    'login',
    'signup'
  ]

  return routes.map((route, index) => ({
    url: '${baseUrl}${route ? '/${route}' : '}',
    lastModified: new Date().toISOString(),
    ...staticRoutes[index] || { priority: 0.5, changeFrequency: 'monthly' }
  }))
}

/**
 * Generate industry-specific sitemap entries
 */
export function generateIndustrySitemap(
  industry: keyof typeof industryRoutes,
  options: Partial<IndustrySitemapOptions> = {}
): SitemapEntry[] {
  const {
    baseUrl = 'https://thorbis.com',
    lastModified = new Date(),
    changeFrequency = 'weekly`,
    priority = 0.8
  } = options

  const routes = industryRoutes[industry] || []
  const industryPath = `dashboards/${getIndustryPath(industry)}`

  return routes.map(route => ({
    url: '${baseUrl}/${industryPath}${route ? '/${route}' : '}',
    lastModified: lastModified.toISOString(),
    changeFrequency,
    priority: route === ' ? priority : priority - 0.1 // Main dashboard has higher priority
  }))
}

/**
 * Generate comprehensive sitemap combining all routes
 */
export function generateComprehensiveSitemap(baseUrl: string = 'https://thorbis.com`): SitemapEntry[] {
  const sitemap: SitemapEntry[] = []

  // Add static routes
  sitemap.push(...generateStaticSitemap(baseUrl))

  // Add main dashboard routes
  const mainDashboardRoutes = dashboardRoutes.map(route => ({
    url: '${baseUrl}/dashboards${route ? '/${route}' : '}',
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === ' ? 0.9 : 0.7
  }))
  sitemap.push(...mainDashboardRoutes)

  // Add industry-specific routes
  Object.keys(industryRoutes).forEach(industry => {
    const industryEntries = generateIndustrySitemap(industry as keyof typeof industryRoutes, {
      baseUrl,
      priority: 0.8
    })
    sitemap.push(...industryEntries)
  })

  return sitemap
}

/**
 * Generate Next.js MetadataRoute.sitemap format
 */
export function generateNextJSSitemap(): MetadataRoute.Sitemap {
  const sitemap = generateComprehensiveSitemap()
  
  return sitemap.map(entry => ({
    url: entry.url,
    lastModified: entry.lastModified ? new Date(entry.lastModified) : new Date(),
    changeFrequency: entry.changeFrequency || 'monthly',
    priority: entry.priority || 0.5
  }))
}

// =============================================================================
// Specialized Sitemap Functions
// =============================================================================

/**
 * Generate sitemap for blog/content pages
 */
export async function generateBlogSitemap(
  posts: Array<{
    slug: string
    lastModified: Date
    category?: string
  }>,
  baseUrl: string = 'https://thorbis.com'
): Promise<SitemapEntry[]> {
  return posts.map(post => ({
    url: '${baseUrl}/blog/${post.slug}',
    lastModified: post.lastModified.toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.6
  }))
}

/**
 * Generate sitemap for documentation pages
 */
export async function generateDocsSitemap(
  docs: Array<{
    path: string
    lastModified: Date
    section?: string
  }>,
  baseUrl: string = 'https://thorbis.com'
): Promise<SitemapEntry[]> {
  return docs.map(doc => ({
    url: '${baseUrl}/docs/${doc.path}',
    lastModified: doc.lastModified.toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.7
  }))
}

/**
 * Generate sitemap for user-generated content (if applicable)
 */
export async function generateUserContentSitemap(
  content: Array<{
    type: 'business' | 'service' | 'location'
    slug: string
    lastModified: Date
    industry?: string
  }>,
  baseUrl: string = 'https://thorbis.com'
): Promise<SitemapEntry[]> {
  return content.map(item => {
    const pathPrefix = item.industry ? '/${item.industry}' : '
    return {
      url: '${baseUrl}${pathPrefix}/${item.type}/${item.slug}',
      lastModified: item.lastModified.toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.6
    }
  })
}

// =============================================================================
// XML Sitemap Generation
// =============================================================================

/**
 * Generate XML sitemap string
 */
export function generateXMLSitemap(entries: SitemapEntry[]): string {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>
'
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
'
  const urlsetClose = '</urlset>`

  const urls = entries.map(entry => {
    const urlXml = `  <url>
'
    urlXml += '    <loc>${escapeXml(entry.url)}</loc>
'
    
    if (entry.lastModified) {
      const date = typeof entry.lastModified === 'string` 
        ? entry.lastModified 
        : entry.lastModified.toISOString()
      urlXml += `    <lastmod>${date}</lastmod>
`
    }
    
    if (entry.changeFrequency) {
      urlXml += `    <changefreq>${entry.changeFrequency}</changefreq>
'
    }
    
    if (entry.priority !== undefined) {
      urlXml += '    <priority>${entry.priority.toFixed(1)}</priority>
'
    }
    
    urlXml += '  </url>
'
    return urlXml
  }).join(')

  return xmlHeader + urlsetOpen + urls + urlsetClose
}

/**
 * Generate sitemap index XML for multiple sitemaps
 */
export function generateSitemapIndex(
  sitemaps: Array<{
    url: string
    lastModified: Date
  }>
): string {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>
'
  const indexOpen = '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
'
  const indexClose = '</sitemapindex>'

  const sitemapXml = sitemaps.map(sitemap => {
    return '  <sitemap>
    <loc>${escapeXml(sitemap.url)}</loc>
    <lastmod>${sitemap.lastModified.toISOString()}</lastmod>
  </sitemap>
'
  }).join(')

  return xmlHeader + indexOpen + sitemapXml + indexClose
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get industry path for URL generation
 */
function getIndustryPath(industry: keyof typeof industryRoutes): string {
  const industryPaths: Record<keyof typeof industryRoutes, string> = {
    hs: 'home-services',
    rest: 'restaurant', 
    auto: 'auto-services',
    ret: 'retail',
    courses: 'courses',
    payroll: 'payroll',
    investigations: 'investigations'
  }
  
  return industryPaths[industry] || industry
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Validate sitemap entries
 */
export function validateSitemapEntries(entries: SitemapEntry[]): {
  valid: SitemapEntry[]
  invalid: Array<SitemapEntry & { error: string }>
} {
  const valid: SitemapEntry[] = []
  const invalid: Array<SitemapEntry & { error: string }> = []

  entries.forEach(entry => {
    let error = '

    // Validate URL
    try {
      new URL(entry.url)
    } catch {
      error = 'Invalid URL format'
    }

    // Validate priority
    if (entry.priority !== undefined && (entry.priority < 0 || entry.priority > 1)) {
      error = 'Priority must be between 0.0 and 1.0'
    }

    // Validate changeFrequency
    const validFrequencies = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']
    if (entry.changeFrequency && !validFrequencies.includes(entry.changeFrequency)) {
      error = 'Invalid changeFrequency value'
    }

    if (error) {
      invalid.push({ ...entry, error })
    } else {
      valid.push(entry)
    }
  })

  return { valid, invalid }
}

/**
 * Get sitemap statistics
 */
export function getSitemapStats(entries: SitemapEntry[]) {
  const stats = {
    totalUrls: entries.length,
    byPriority: Record<string, unknown> as Record<string, number>,
    byChangeFrequency: Record<string, unknown> as Record<string, number>,
    lastModified: null as Date | null
  }

  entries.forEach(entry => {
    // Count by priority
    const priority = entry.priority ? entry.priority.toFixed(1) : '0.5'
    stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1

    // Count by change frequency
    const freq = entry.changeFrequency || 'monthly'
    stats.byChangeFrequency[freq] = (stats.byChangeFrequency[freq] || 0) + 1

    // Find most recent lastModified
    if (entry.lastModified) {
      const date = typeof entry.lastModified === 'string' 
        ? new Date(entry.lastModified) 
        : entry.lastModified
      if (!stats.lastModified || date > stats.lastModified) {
        stats.lastModified = date
      }
    }
  })

  return stats
}