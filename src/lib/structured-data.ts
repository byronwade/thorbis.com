'use client'

// Schema.org structured data utilities for Thorbis Business OS
// Provides comprehensive structured data for business entities, services, and industry-specific content

import { Business, Organization, Service, Product, LocalBusiness, WebSite, BreadcrumbList, SoftwareApplication } from 'schema-dts'

// =============================================================================
// Core Schema.org Types and Interfaces
// =============================================================================

export interface StructuredDataOptions {
  type: 'website' | 'organization' | 'local-business' | 'service' | 'software' | 'article' | 'breadcrumb' | 'faq' | 'course' | 'restaurant' | 'auto-repair'
  data: Record<string, unknown>
  context?: string
}

export interface IndustryBusinessData {
  name: string
  description: string
  industry: string
  telephone?: string
  email?: string
  address?: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
  geo?: {
    latitude: number
    longitude: number
  }
  openingHours?: string[]
  priceRange?: string
  paymentAccepted?: string[]
  currenciesAccepted?: string[]
  aggregateRating?: {
    ratingValue: number
    reviewCount: number
    bestRating?: number
    worstRating?: number
  }
  services?: Array<{
    name: string
    description: string
    price?: string
    category?: string
  }>
}

// =============================================================================
// Core Organization and Website Schema
// =============================================================================

export function createOrganizationSchema(): Organization {
  return {
    "@type": "Organization",
    "@id": "https://thorbis.com/#organization",
    name: "Thorbis Business OS",
    url: "https://thorbis.com",
    logo: "https://thorbis.com/images/ThorbisLogo.webp",
    description: "AI-powered comprehensive business operating system with industry-specific solutions for home services, restaurants, auto services, retail, education, and investigations",
    foundingDate: "2024",
    keywords: ["business management", "AI automation", "home services", "restaurant POS", "auto repair", "retail management", "blockchain", "business intelligence"],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: "support@thorbis.com",
        availableLanguage: "English"
      },
      {
        "@type": "ContactPoint", 
        contactType: "sales",
        email: "sales@thorbis.com",
        availableLanguage: "English"
      }
    ],
    sameAs: [
      "https://twitter.com/thorbis",
      "https://linkedin.com/company/thorbis",
      "https://github.com/thorbis"
    ],
    parentOrganization: {
      "@type": "Organization",
      name: "Thorbis Technologies",
      url: "https://thorbis.com"
    }
  }
}

export function createWebSiteSchema(): WebSite {
  return {
    "@type": "WebSite",
    "@id": "https://thorbis.com/#website",
    url: "https://thorbis.com",
    name: "Thorbis Business OS",
    description: "Comprehensive AI-powered business operating system for modern enterprises",
    publisher: {
      "@id": "https://thorbis.com/#organization"
    },
    potentialAction: [
      {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://thorbis.com/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    ],
    mainEntity: {
      "@id": "https://thorbis.com/#organization"
    }
  }
}

// =============================================================================
// Software Application Schema
// =============================================================================

export function createSoftwareApplicationSchema(): SoftwareApplication {
  return {
    "@type": "SoftwareApplication", 
    "@id": "https://thorbis.com/#software",
    name: "Thorbis Business OS",
    description: "AI-powered comprehensive business operating system with industry-specific modules for complete business management",
    url: "https://thorbis.com",
    applicationCategory: "BusinessApplication",
    operatingSystem: ["Web Browser", "PWA", "iOS", "Android"],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      description: "Free tier with premium features available"
    },
    featureList: [
      "Home Services Management",
      "Restaurant POS System", 
      "Auto Services Management",
      "Retail Inventory Management",
      "Learning Management System",
      "Payroll Processing",
      "Investigation Management",
      "AI-Powered Analytics",
      "Blockchain Verification",
      "Offline Capabilities"
    ],
    screenshot: [
      "https://thorbis.com/images/screenshots/dashboard-desktop.png",
      "https://thorbis.com/images/screenshots/home-services-mobile.png",
      "https://thorbis.com/images/screenshots/restaurant-pos.png"
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "127",
      bestRating: "5",
      worstRating: "1"
    },
    author: {
      "@id": "https://thorbis.com/#organization"
    },
    creator: {
      "@id": "https://thorbis.com/#organization"
    }
  }
}

// =============================================================================
// Industry-Specific Local Business Schemas
// =============================================================================

export function createHomeServicesBusinessSchema(data: IndustryBusinessData): LocalBusiness {
  return {
    "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
    "@id": 'https://thorbis.com/hs/${encodeURIComponent(data.name.toLowerCase().replace(/\s+/g, '-'))}',
    name: data.name,
    description: data.description,
    url: "https://thorbis.com/hs",
    telephone: data.telephone,
    email: data.email,
    address: data.address ? {
      "@type": "PostalAddress",
      ...data.address
    } : undefined,
    geo: data.geo ? {
      "@type": "GeoCoordinates", 
      latitude: data.geo.latitude,
      longitude: data.geo.longitude
    } : undefined,
    openingHoursSpecification: data.openingHours?.map(hours => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: hours.split(' ')[0],
      opens: hours.split(' ')[1],
      closes: hours.split(' ')[2]
    })),
    priceRange: data.priceRange || "$$",
    paymentAccepted: data.paymentAccepted || ["Cash", "Credit Card", "Check"],
    currenciesAccepted: data.currenciesAccepted || ["USD"],
    aggregateRating: data.aggregateRating ? {
      "@type": "AggregateRating",
      ...data.aggregateRating
    } : undefined,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Home Services",
      itemListElement: data.services?.map(service => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.name,
          description: service.description,
          category: service.category || "Home Repair"
        },
        price: service.price,
        priceCurrency: "USD"
      })) || []
    },
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: data.geo,
      geoRadius: "50 mi"
    }
  }
}

export function createRestaurantBusinessSchema(data: IndustryBusinessData): LocalBusiness {
  return {
    "@type": ["LocalBusiness", "Restaurant"],
    "@id": 'https://thorbis.com/rest/${encodeURIComponent(data.name.toLowerCase().replace(/\s+/g, '-'))}',
    name: data.name,
    description: data.description,
    url: "https://thorbis.com/rest",
    telephone: data.telephone,
    email: data.email,
    address: data.address ? {
      "@type": "PostalAddress",
      ...data.address
    } : undefined,
    geo: data.geo ? {
      "@type": "GeoCoordinates",
      latitude: data.geo.latitude,
      longitude: data.geo.longitude
    } : undefined,
    openingHoursSpecification: data.openingHours?.map(hours => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: hours.split(' ')[0],
      opens: hours.split(' ')[1],
      closes: hours.split(' ')[2]
    })),
    priceRange: data.priceRange || "$$",
    paymentAccepted: data.paymentAccepted || ["Cash", "Credit Card", "Mobile Payment"],
    currenciesAccepted: data.currenciesAccepted || ["USD"],
    aggregateRating: data.aggregateRating ? {
      "@type": "AggregateRating",
      ...data.aggregateRating
    } : undefined,
    servesCuisine: data.services?.map(service => service.category).filter(Boolean) || [],
    hasMenu: {
      "@type": "Menu",
      name: "Restaurant Menu",
      hasMenuSection: data.services?.map(service => ({
        "@type": "MenuSection",
        name: service.category || "Main Menu",
        hasMenuItem: {
          "@type": "MenuItem",
          name: service.name,
          description: service.description,
          offers: {
            "@type": "Offer",
            price: service.price,
            priceCurrency: "USD"
          }
        }
      })) || []
    },
    acceptsReservations: true
  }
}

export function createAutoServicesBusinessSchema(data: IndustryBusinessData): LocalBusiness {
  return {
    "@type": ["LocalBusiness", "AutomotiveBusiness", "AutoRepair"],
    "@id": 'https://thorbis.com/auto/${encodeURIComponent(data.name.toLowerCase().replace(/\s+/g, '-'))}',
    name: data.name,
    description: data.description,
    url: "https://thorbis.com/auto",
    telephone: data.telephone,
    email: data.email,
    address: data.address ? {
      "@type": "PostalAddress",
      ...data.address
    } : undefined,
    geo: data.geo ? {
      "@type": "GeoCoordinates",
      latitude: data.geo.latitude,
      longitude: data.geo.longitude
    } : undefined,
    openingHoursSpecification: data.openingHours?.map(hours => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: hours.split(' ')[0],
      opens: hours.split(' ')[1],
      closes: hours.split(' ')[2]
    })),
    priceRange: data.priceRange || "$$$",
    paymentAccepted: data.paymentAccepted || ["Cash", "Credit Card", "Check", "Financing"],
    currenciesAccepted: data.currenciesAccepted || ["USD"],
    aggregateRating: data.aggregateRating ? {
      "@type": "AggregateRating",
      ...data.aggregateRating
    } : undefined,
    hasOfferCatalog: {
      "@type": "OfferCatalog", 
      name: "Auto Services",
      itemListElement: data.services?.map(service => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.name,
          description: service.description,
          category: service.category || "Auto Repair",
          provider: {
            "@type": "AutoRepair",
            name: data.name
          }
        },
        price: service.price,
        priceCurrency: "USD"
      })) || []
    },
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: data.geo,
      geoRadius: "25 mi"
    }
  }
}

export function createRetailBusinessSchema(data: IndustryBusinessData): LocalBusiness {
  return {
    "@type": ["LocalBusiness", "Store"],
    "@id": 'https://thorbis.com/ret/${encodeURIComponent(data.name.toLowerCase().replace(/\s+/g, '-'))}',
    name: data.name,
    description: data.description,
    url: "https://thorbis.com/ret",
    telephone: data.telephone,
    email: data.email,
    address: data.address ? {
      "@type": "PostalAddress",
      ...data.address
    } : undefined,
    geo: data.geo ? {
      "@type": "GeoCoordinates",
      latitude: data.geo.latitude,
      longitude: data.geo.longitude
    } : undefined,
    openingHoursSpecification: data.openingHours?.map(hours => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: hours.split(' ')[0],
      opens: hours.split(' ')[1],
      closes: hours.split(' ')[2]
    })),
    priceRange: data.priceRange || "$$",
    paymentAccepted: data.paymentAccepted || ["Cash", "Credit Card", "Mobile Payment", "Gift Card"],
    currenciesAccepted: data.currenciesAccepted || ["USD"],
    aggregateRating: data.aggregateRating ? {
      "@type": "AggregateRating",
      ...data.aggregateRating
    } : undefined,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Products & Services",
      itemListElement: data.services?.map(service => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: service.name,
          description: service.description,
          category: service.category || "General Merchandise"
        },
        price: service.price,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock"
      })) || []
    }
  }
}

// =============================================================================
// Breadcrumb Schema
// =============================================================================

export function createBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>): BreadcrumbList {
  return {
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }))
  }
}

// =============================================================================
// FAQ Schema
// =============================================================================

export function createFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  }
}

// =============================================================================
// Course Schema
// =============================================================================

export function createCourseSchema(courseData: {
  name: string
  description: string
  provider: string
  hasCourseInstance?: Array<{
    courseMode: string
    startDate: string
    endDate?: string
    instructor?: string
  }>
}) {
  return {
    "@type": "Course",
    name: courseData.name,
    description: courseData.description,
    provider: {
      "@type": "Organization",
      name: courseData.provider,
      sameAs: "https://thorbis.com"
    },
    hasCourseInstance: courseData.hasCourseInstance?.map(instance => ({
      "@type": "CourseInstance",
      courseMode: instance.courseMode,
      startDate: instance.startDate,
      endDate: instance.endDate,
      instructor: instance.instructor ? {
        "@type": "Person",
        name: instance.instructor
      } : undefined
    })) || []
  }
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Generate structured data JSON-LD script tag
 */
export function generateStructuredDataScript(data: unknown): string {
  const structuredData = {
    "@context": "https://schema.org",
    ...data
  }

  return '<script type="application/ld+json">
${JSON.stringify(structuredData, null, 2)}
</script>'
}

/**
 * Combine multiple schema objects into a graph
 */
export function createSchemaGraph(...schemas: unknown[]): unknown {
  return {
    "@context": "https://schema.org",
    "@graph": schemas
  }
}

/**
 * Create industry-specific structured data based on route
 */
export function createIndustryStructuredData(
  industry: 'hs' | 'rest' | 'auto' | 'ret' | 'courses' | 'payroll' | 'investigations',
  businessData?: IndustryBusinessData
): unknown {
  const baseSchema = [
    createOrganizationSchema(),
    createWebSiteSchema(),
    createSoftwareApplicationSchema()
  ]

  if (!businessData) {
    return createSchemaGraph(...baseSchema)
  }

  let industrySchema: any

  switch (industry) {
    case 'hs':
      industrySchema = createHomeServicesBusinessSchema(businessData)
      break
    case 'rest':
      industrySchema = createRestaurantBusinessSchema(businessData)
      break
    case 'auto':
      industrySchema = createAutoServicesBusinessSchema(businessData)
      break
    case 'ret':
      industrySchema = createRetailBusinessSchema(businessData)
      break
    default:
      return createSchemaGraph(...baseSchema)
  }

  return createSchemaGraph(...baseSchema, industrySchema)
}

/**
 * Create page-specific structured data
 */
export function createPageStructuredData(options: StructuredDataOptions): unknown {
  const { type, data, context } = options

  switch (type) {
    case 'breadcrumb':
      return createBreadcrumbSchema(data.breadcrumbs)
    case 'faq':
      return createFAQSchema(data.faqs)
    case 'course':
      return createCourseSchema(data)
    case 'local-business':
      return createIndustryStructuredData(data.industry, data)
    default:
      return createSchemaGraph(
        createOrganizationSchema(),
        createWebSiteSchema(),
        createSoftwareApplicationSchema()
      )
  }
}

// =============================================================================
// React Component for Structured Data
// =============================================================================

export interface StructuredDataProps {
  data: unknown
  id?: string
}

export function StructuredData({ data, id }: StructuredDataProps) {
  const jsonLd = JSON.stringify(data, null, 2)

  return (
    <script
      id={id || "structured-data"}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  )
}

// =============================================================================
// Validation Utilities
// =============================================================================

/**
 * Validate structured data against Schema.org requirements
 */
export function validateStructuredData(data: unknown): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Required @context
  if (!data['@context']) {
    errors.push('Missing @context property')
  } else if (data['@context'] !== 'https://schema.org') {
    warnings.push('Consider using https://schema.org as @context')
  }

  // Required @type
  if (!data['@type']) {
    errors.push('Missing @type property')
  }

  // Organization validation
  if (data['@type'] === 'Organization') {
    if (!data.name) errors.push('Organization missing name')
    if (!data.url) errors.push('Organization missing url')
  }

  // LocalBusiness validation
  if (data['@type']?.includes?.('LocalBusiness')) {
    if (!data.address) warnings.push('LocalBusiness should include address')
    if (!data.telephone) warnings.push('LocalBusiness should include telephone')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Test structured data with Google's Structured Data Testing Tool
 */
export function getStructuredDataTestUrl(url: string): string {
  return 'https://search.google.com/test/rich-results?url=${encodeURIComponent(url)}'
}