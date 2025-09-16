'use client'

import React from 'react'
import Head from 'next/head'
import { usePathname } from 'next/navigation'
import { 
  generateIndustryMeta, 
  generatePageMeta, 
  generateCanonicalUrl, 
  generateLocalBusinessMeta,
  type MetaOptions 
} from '@/lib/meta-generation'
import { 
  useStructuredData, 
  PageStructuredData, 
  BusinessStructuredData,
  BreadcrumbStructuredData,
  type IndustryBusinessData
} from './structured-data-provider'

// =============================================================================
// SEO Head Component
// =============================================================================

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string[]
  canonical?: string
  noIndex?: boolean
  industry?: 'hs' | 'rest' | 'auto' | 'ret' | 'courses' | 'payroll' | 'investigations'
  businessData?: IndustryBusinessData
  openGraph?: {
    title?: string
    description?: string
    image?: string
    type?: string
  }
  twitter?: {
    title?: string
    description?: string
    image?: string
    card?: 'summary' | 'summary_large_image'
  }
  breadcrumbs?: Array<{ name: string; url: string }>
  structuredData?: unknown[]
  additionalMeta?: Record<string, string>
}

export function SEOHead({
  title,
  description,
  keywords,
  canonical,
  noIndex = false,
  industry,
  businessData,
  openGraph = {},
  twitter = {},
  breadcrumbs,
  structuredData = [],
  additionalMeta = {}
}: SEOHeadProps) {
  const pathname = usePathname()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thorbis.com'
  
  // Generate canonical URL if not provided
  const canonicalUrl = canonical || generateCanonicalUrl(pathname, baseUrl)

  // Generate appropriate meta tags based on context
  const metaOptions: MetaOptions = {
    title,
    description,
    keywords,
    canonical: canonicalUrl,
    noIndex,
    openGraph: {
      image: `${baseUrl}/images/og-default.jpg',
      ...openGraph
    },
    twitter: {
      image: '${baseUrl}/images/twitter-card.jpg',
      card: 'summary_large_image',
      ...twitter
    },
    additionalMeta
  }

  // Generate industry-specific meta if industry is provided
  const metadata = industry 
    ? generateIndustryMeta(industry, metaOptions)
    : generatePageMeta(metaOptions)

  return (
    <>
      {/* Meta Tags */}
      <Head>
        <title>{metadata.title as string}</title>
        <meta name="description" content={metadata.description as string} />
        <meta name="keywords" content={metadata.keywords as string} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Robots */}
        {noIndex && <meta name="robots" content="noindex,nofollow" />}
        
        {/* Open Graph */}
        <meta property="og:title" content={(metadata.openGraph as any)?.title} />
        <meta property="og:description" content={(metadata.openGraph as any)?.description} />
        <meta property="og:image" content={(metadata.openGraph as any)?.image} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content={(metadata.openGraph as any)?.type || 'website'} />
        <meta property="og:site_name" content="Thorbis Business OS" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content={(metadata.twitter as any)?.card || 'summary_large_image'} />
        <meta name="twitter:title" content={(metadata.twitter as any)?.title} />
        <meta name="twitter:description" content={(metadata.twitter as any)?.description} />
        <meta name="twitter:image" content={(metadata.twitter as any)?.image} />
        <meta name="twitter:creator" content="@thorbis" />
        <meta name="twitter:site" content="@thorbis" />
        
        {/* Additional Meta Tags */}
        {Object.entries(metadata.other || {}).map(([key, value]) => (
          <meta key={key} name={key} content={value as string} />
        ))}
        
        {/* Viewport and Mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#1C8BFF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* DNS Prefetch and Preconnect */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </Head>

      {/* Structured Data Components */}
      {breadcrumbs && (
        <BreadcrumbStructuredData breadcrumbs={breadcrumbs} />
      )}

      {businessData && industry && (
        <BusinessStructuredData businessData={businessData} industry={industry} />
      )}

      {structuredData.map((data, index) => (
        <PageStructuredData
          key={'structured-data-${index}'}
          type={data.type || 'website'}
          data={data}
          id={'page-structured-data-${index}'}
        />
      ))}
    </>
  )
}

// =============================================================================
// Specialized SEO Components
// =============================================================================

interface IndustrySEOProps extends Omit<SEOHeadProps, 'industry'> {
  industry: 'hs' | 'rest' | 'auto' | 'ret' | 'courses' | 'payroll' | 'investigations'
  businessData?: IndustryBusinessData
}

export function IndustrySEO({ industry, businessData, ...props }: IndustrySEOProps) {
  return (
    <SEOHead 
      industry={industry} 
      businessData={businessData}
      {...props} 
    />
  )
}

interface LocalBusinessSEOProps extends SEOHeadProps {
  businessName: string
  location: string
  industry: 'hs' | 'rest' | 'auto' | 'ret'
  services?: string[]
}

export function LocalBusinessSEO({
  businessName,
  location,
  industry,
  services,
  ...props
}: LocalBusinessSEOProps) {
  const businessData: IndustryBusinessData = {
    name: businessName,
    description: 'Professional ${industry} services in ${location}',
    industry,
    services: services?.map(service => ({ name: service, description: service }))
  }

  return (
    <SEOHead
      industry={industry}
      businessData={businessData}
      {...props}
    />
  )
}

interface ArticleSEOProps extends Omit<SEOHeadProps, 'openGraph'> {
  author?: string
  publishedTime?: string
  modifiedTime?: string
  tags?: string[]
  image?: string
  category?: string
}

export function ArticleSEO({
  author,
  publishedTime,
  modifiedTime,
  tags,
  image,
  category,
  ...props
}: ArticleSEOProps) {
  const openGraph = {
    type: 'article',
    image: image || '${process.env.NEXT_PUBLIC_APP_URL}/images/article-default.jpg',
    ...(publishedTime && { publishedTime }),
    ...(modifiedTime && { modifiedTime }),
    ...(author && { authors: [author] }),
    ...props.openGraph
  }

  const structuredData = [
    {
      type: 'article',
      data: {
        headline: props.title,
        description: props.description,
        author: author ? {
          '@type': 'Person',
          name: author
        } : undefined,
        datePublished: publishedTime,
        dateModified: modifiedTime || publishedTime,
        image: image,
        keywords: tags,
        articleSection: category,
        publisher: {
          '@type': 'Organization',
          name: 'Thorbis Business OS',
          logo: '${process.env.NEXT_PUBLIC_APP_URL}/images/ThorbisLogo.webp'
        }
      }
    },
    ...(props.structuredData || [])
  ]

  return (
    <SEOHead
      openGraph={openGraph}
      structuredData={structuredData}
      keywords={[...(props.keywords || []), ...(tags || [])]}
      {...props}
    />
  )
}

// =============================================================================
// Hook for Dynamic SEO
// =============================================================================

export function useDynamicSEO() {
  const pathname = usePathname()
  const { updateBreadcrumbs, setBusinessData } = useStructuredData()

  const updateSEO = React.useCallback((seoData: Partial<SEOHeadProps>) => {
    if (seoData.breadcrumbs) {
      updateBreadcrumbs(seoData.breadcrumbs)
    }
    if (seoData.businessData) {
      setBusinessData(seoData.businessData)
    }
  }, [updateBreadcrumbs, setBusinessData])

  React.useEffect(() => {
    // Auto-generate breadcrumbs based on pathname if not provided
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs = [{ name: 'Home', url: '/` }]
    
    const currentPath = `
    segments.forEach(segment => {
      currentPath += '/${segment}'
      const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
      breadcrumbs.push({ name, url: currentPath })
    })

    updateBreadcrumbs(breadcrumbs)
  }, [pathname, updateBreadcrumbs])

  return { updateSEO }
}