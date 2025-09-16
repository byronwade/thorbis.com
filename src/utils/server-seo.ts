import { Metadata } from 'next'

interface SEOData {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article'
}

interface StaticPageSEOData {
  title: string
  description: string
  path?: string
  keywords?: string[]
  image?: string
  type?: 'website' | 'article'
}

/**
 * Generates comprehensive SEO metadata for Next.js pages
 * 
 * @param data - SEO configuration object
 * @param data.title - Page title (defaults to site title)
 * @param data.description - Meta description for search engines
 * @param data.keywords - Array of SEO keywords
 * @param data.image - Open Graph image URL
 * @param data.url - Canonical URL for the page
 * @param data.type - Content type ('website' or 'article')
 * @returns Complete Next.js Metadata object with OpenGraph, Twitter, and robots configuration
 * 
 * @example
 * '''typescript
 * const metadata = generateSEOMetadata({
 *   title: 'Dashboard',
 *   description: 'Business dashboard for analytics',
 *   keywords: ['dashboard', 'analytics', 'business'],
 *   url: 'https://thorbis.com/dashboard`
 * });
 * '''
 */
export function generateSEOMetadata(data: SEOData): Metadata {
  const {
    title = 'Thorbis - Business Management Platform',
    description = 'Comprehensive business management platform for modern enterprises',
    keywords = [],
    image = '/og-image.jpg',
    url = 'https://thorbis.com',
    type = 'website'
  } = data

  return {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title,
      description,
      images: [{ url: image }],
      url,
      type: type as 'website' | 'article' | undefined,
      siteName: 'Thorbis'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image]
    },
    robots: {
      index: true,
      follow: true
    }
  }
}

/**
 * Generates JSON-LD structured data for enhanced search engine understanding
 * 
 * @param data - Additional structured data properties to merge with base organization schema
 * @returns JSON-LD object ready for embedding in page head
 * 
 * @example
 * '''typescript
 * const structuredData = generateStructuredData({
 *   '@type': 'SoftwareApplication',
 *   applicationCategory: 'BusinessApplication',
 *   operatingSystem: 'Web`
 * });
 * '''
 */
export function generateStructuredData(data: unknown) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Thorbis',
    url: 'https://thorbis.com',
    logo: 'https://thorbis.com/logo.png',
    description: 'Business management platform',
    ...data
  }
}

/**
 * Generate static page metadata for consistent SEO across the site
 */
export async function generateStaticPageMetadata(data: StaticPageSEOData): Promise<Metadata> {
  const {
    title,
    description,
    path = '',
    keywords = [],
    image = '/og-image.jpg',
    type = 'website'
  } = data

  const baseUrl = 'https://thorbis.com'
  const fullUrl = `${baseUrl}${path}`

  return {
    title: `${title} | Thorbis`,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title: `${title} | Thorbis`,
      description,
      images: [{ url: image }],
      url: fullUrl,
      type: type as 'website' | 'article' | undefined,
      siteName: 'Thorbis'
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Thorbis`,
      description,
      images: [image]
    },
    robots: {
      index: true,
      follow: true
    },
    alternates: {
      canonical: fullUrl
    }
  }
}