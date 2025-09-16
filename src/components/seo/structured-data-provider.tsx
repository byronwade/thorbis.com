'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { 
  StructuredData,
  createIndustryStructuredData,
  createPageStructuredData,
  createBreadcrumbSchema,
  createSchemaGraph,
  type IndustryBusinessData,
  type StructuredDataOptions
} from '@/lib/structured-data'

// =============================================================================
// Context and Provider Types
// =============================================================================

interface StructuredDataContextType {
  addStructuredData: (id: string, data: unknown) => void
  removeStructuredData: (id: string) => void
  updateBreadcrumbs: (breadcrumbs: Array<{ name: string; url: string }>) => void
  setBusinessData: (data: IndustryBusinessData) => void
  getStructuredData: () => Record<string, unknown>
}

const StructuredDataContext = createContext<StructuredDataContextType | null>(null)

// =============================================================================
// Custom Hook
// =============================================================================

export function useStructuredData() {
  const context = useContext(StructuredDataContext)
  if (!context) {
    throw new Error('useStructuredData must be used within StructuredDataProvider')
  }
  return context
}

// =============================================================================
// Provider Component
// =============================================================================

interface StructuredDataProviderProps {
  children: React.ReactNode
  defaultBusinessData?: IndustryBusinessData
}

export function StructuredDataProvider({ children, defaultBusinessData }: StructuredDataProviderProps) {
  const pathname = usePathname()
  const [structuredDataMap, setStructuredDataMap] = useState<Record<string, unknown>>({})
  const [businessData, setBusinessDataState] = useState<IndustryBusinessData | null>(defaultBusinessData || null)
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ name: string; url: string }>>([])

  // Detect current industry from pathname
  const currentIndustry = React.useMemo(() => {
    if (pathname.startsWith('/dashboards/home-services')) return 'hs'
    if (pathname.startsWith('/dashboards/restaurant')) return 'rest'  
    if (pathname.startsWith('/dashboards/auto-services')) return 'auto'
    if (pathname.startsWith('/dashboards/retail')) return 'ret'
    if (pathname.startsWith('/dashboards/courses')) return 'courses'
    if (pathname.startsWith('/dashboards/payroll')) return 'payroll'
    if (pathname.startsWith('/dashboards/investigations')) return 'investigations'
    return null
  }, [pathname])

  // Auto-generate breadcrumbs from pathname
  useEffect(() => {
    const segments = pathname.split('/').filter(Boolean)
    const autoBreadcrumbs: Array<{ name: string; url: string }> = [
      { name: 'Home', url: '/' }
    ]

    const currentPath = `
    segments.forEach((segment, index) => {
      currentPath += '/${segment}'
      
      // Convert segment to readable name
      let name = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      // Industry-specific naming
      if (segment === 'hs') name = 'Home Services'
      else if (segment === 'rest') name = 'Restaurant'
      else if (segment === 'auto') name = 'Auto Services'
      else if (segment === 'ret') name = 'Retail'
      else if (segment === 'courses') name = 'Courses'
      else if (segment === 'payroll') name = 'Payroll'
      else if (segment === 'investigations') name = 'Investigations'
      else if (segment === 'dashboards') name = 'Dashboards'

      autoBreadcrumbs.push({ name, url: currentPath })
    })

    setBreadcrumbs(autoBreadcrumbs)
  }, [pathname])

  // Initialize base structured data
  useEffect(() => {
    const baseData: Record<string, unknown> = {}

    // Add industry-specific structured data
    if (currentIndustry) {
      baseData.industry = createIndustryStructuredData(currentIndustry as any, businessData || undefined)
    }

    // Add breadcrumb structured data
    if (breadcrumbs.length > 1) {
      baseData.breadcrumbs = createBreadcrumbSchema(breadcrumbs)
    }

    setStructuredDataMap(prev => ({ ...baseData, ...prev }))
  }, [currentIndustry, businessData, breadcrumbs])

  // Context value
  const contextValue: StructuredDataContextType = {
    addStructuredData: (id: string, data: unknown) => {
      setStructuredDataMap(prev => ({ ...prev, [id]: data }))
    },
    
    removeStructuredData: (id: string) => {
      setStructuredDataMap(prev => {
        const updated = { ...prev }
        delete updated[id]
        return updated
      })
    },
    
    updateBreadcrumbs: (newBreadcrumbs: Array<{ name: string; url: string }>) => {
      setBreadcrumbs(newBreadcrumbs)
    },
    
    setBusinessData: (data: IndustryBusinessData) => {
      setBusinessDataState(data)
    },
    
    getStructuredData: () => structuredDataMap
  }

  return (
    <StructuredDataContext.Provider value={contextValue}>
      {children}
      
      {/* Render all structured data */}
      {Object.entries(structuredDataMap).map(([id, data]) => (
        <StructuredData key={id} id={id} data={data} />
      ))}
    </StructuredDataContext.Provider>
  )
}

// =============================================================================
// Individual Structured Data Components
// =============================================================================

interface BusinessStructuredDataProps {
  businessData: IndustryBusinessData
  industry: 'hs' | 'rest' | 'auto' | 'ret`
}

export function BusinessStructuredData({ businessData, industry }: BusinessStructuredDataProps) {
  const { addStructuredData, removeStructuredData } = useStructuredData()

  useEffect(() => {
    const data = createIndustryStructuredData(industry, businessData)
    addStructuredData(`business-${industry}', data)

    return () => removeStructuredData('business-${industry}')
  }, [businessData, industry, addStructuredData, removeStructuredData])

  return null
}

interface PageStructuredDataProps {
  type: StructuredDataOptions['type']
  data: unknown
  id?: string
}

export function PageStructuredData({ type, data, id = 'page-data' }: PageStructuredDataProps) {
  const { addStructuredData, removeStructuredData } = useStructuredData()

  useEffect(() => {
    const structuredData = createPageStructuredData({ type, data })
    addStructuredData(id, structuredData)

    return () => removeStructuredData(id)
  }, [type, data, id, addStructuredData, removeStructuredData])

  return null
}

interface FAQStructuredDataProps {
  faqs: Array<{ question: string; answer: string }>
  id?: string
}

export function FAQStructuredData({ faqs, id = 'faq-data' }: FAQStructuredDataProps) {
  return (
    <PageStructuredData
      type="faq"
      data={{ faqs }}
      id={id}
    />
  )
}

interface CourseStructuredDataProps {
  courseData: {
    name: string
    description: string
    provider: string
    hasCourseInstance?: Array<{
      courseMode: string
      startDate: string
      endDate?: string
      instructor?: string
    }>
  }
  id?: string
}

export function CourseStructuredData({ courseData, id = 'course-data' }: CourseStructuredDataProps) {
  return (
    <PageStructuredData
      type="course"
      data={courseData}
      id={id}
    />
  )
}

// =============================================================================
// Industry-Specific Structured Data Components  
// =============================================================================

export function HomeServicesStructuredData({ businessData }: { businessData: IndustryBusinessData }) {
  return <BusinessStructuredData businessData={businessData} industry="hs" />
}

export function RestaurantStructuredData({ businessData }: { businessData: IndustryBusinessData }) {
  return <BusinessStructuredData businessData={businessData} industry="rest" />
}

export function AutoServicesStructuredData({ businessData }: { businessData: IndustryBusinessData }) {
  return <BusinessStructuredData businessData={businessData} industry="auto" />
}

export function RetailStructuredData({ businessData }: { businessData: IndustryBusinessData }) {
  return <BusinessStructuredData businessData={businessData} industry="ret" />
}

// =============================================================================
// Breadcrumb Components
// =============================================================================

interface BreadcrumbStructuredDataProps {
  breadcrumbs?: Array<{ name: string; url: string }>
  id?: string
}

export function BreadcrumbStructuredData({ breadcrumbs, id = 'breadcrumb-data' }: BreadcrumbStructuredDataProps) {
  const { updateBreadcrumbs } = useStructuredData()

  useEffect(() => {
    if (breadcrumbs) {
      updateBreadcrumbs(breadcrumbs)
    }
  }, [breadcrumbs, updateBreadcrumbs])

  return null
}

// =============================================================================
// Utility Components
// =============================================================================

interface ConditionalStructuredDataProps {
  condition: boolean
  children: React.ReactNode
}

export function ConditionalStructuredData({ condition, children }: ConditionalStructuredDataProps) {
  if (!condition) return null
  return <>{children}</>
}

interface DynamicStructuredDataProps {
  data: unknown
  id: string
}

export function DynamicStructuredData({ data, id }: DynamicStructuredDataProps) {
  const { addStructuredData, removeStructuredData } = useStructuredData()

  useEffect(() => {
    if (data) {
      addStructuredData(id, data)
    }

    return () => removeStructuredData(id)
  }, [data, id, addStructuredData, removeStructuredData])

  return null
}