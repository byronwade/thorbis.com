'use client'

import Link from 'next/link'
import { ChevronRight, Home, MapPin, Building, Store } from 'lucide-react'

interface LocationData {
  type: 'country' | 'state' | 'city' | 'business'
  country?: string
  state?: string
  city?: string
  businessSlug?: string
  data: unknown
}

interface LocationBreadcrumbProps {
  locationData: LocationData
}

export function LocationBreadcrumb({ locationData }: LocationBreadcrumbProps) {
  const breadcrumbs = generateBreadcrumbs(locationData)
  
  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <nav 
      className="bg-background border-b border-border"
      aria-label="Breadcrumb navigation"
    >
      <div className="max-w-screen-2xl mx-auto px-6 py-4">
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((breadcrumb, index) => {
            const isLast = index === breadcrumbs.length - 1
            const Icon = breadcrumb.icon
            
            return (
              <li key={breadcrumb.href || index} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground mx-2" />
                )}
                
                {isLast ? (
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Icon className="w-4 h-4" />
                    <span>{breadcrumb.label}</span>
                    {breadcrumb.badge && (
                      <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary border border-primary/30 rounded">
                        {breadcrumb.badge}
                      </span>
                    )}
                  </div>
                ) : (
                  <Link
                    href={breadcrumb.href!}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{breadcrumb.label}</span>
                    {breadcrumb.badge && (
                      <span className="px-2 py-0.5 text-xs bg-muted text-muted-foreground border border-border rounded">
                        {breadcrumb.badge}
                      </span>
                    )}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
        
        {/* Additional Context Info */}
        {locationData.type === 'business' && (
          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{locationData.data.address}</span>
            </div>
            {locationData.data.trustScore && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-success rounded-full" />
                <span>{locationData.data.trustScore.toFixed(1)} Trust Score</span>
              </div>
            )}
            {locationData.data.blockchainVerified && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>Blockchain Verified</span>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

function generateBreadcrumbs(locationData: LocationData) {
  const breadcrumbs: Array<{
    label: string
    href?: string
    icon: typeof Home
    badge?: string
  }> = []

  // Home/Root
  breadcrumbs.push({
    label: 'Directory',
    href: '/',
    icon: Home
  })

  // Country
  if (locationData.country) {
    const countryName = getCountryName(locationData.country)
    breadcrumbs.push({
      label: countryName,
      href: '/${locationData.country}',
      icon: MapPin,
      badge: locationData.type === 'country' ? 
        formatBusinessCount(locationData.data?.businessCount) : undefined
    })
  }

  // State/Province  
  if (locationData.state && locationData.country) {
    const stateName = getStateName(locationData.state)
    breadcrumbs.push({
      label: stateName,
      href: '/${locationData.country}/${locationData.state}',
      icon: MapPin,
      badge: locationData.type === 'state' ? 
        formatBusinessCount(locationData.data?.businessCount) : undefined
    })
  }

  // City
  if (locationData.city && locationData.state && locationData.country) {
    const cityName = getCityName(locationData.city)
    breadcrumbs.push({
      label: cityName,
      href: '/${locationData.country}/${locationData.state}/${locationData.city}',
      icon: Building,
      badge: locationData.type === 'city' ? 
        formatBusinessCount(locationData.data?.businessCount) : undefined
    })
  }

  // Business
  if (locationData.businessSlug && locationData.city && locationData.state && locationData.country) {
    breadcrumbs.push({
      label: locationData.data?.name || formatBusinessName(locationData.businessSlug),
      icon: Store,
      badge: locationData.data?.blockchainVerified ? 'Verified' : undefined
    })
  }

  return breadcrumbs
}

function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    'us': 'United States',
    'ca': 'Canada',
    'uk': 'United Kingdom',
    'au': 'Australia',
    'de': 'Germany',
    'fr': 'France',
    'es': 'Spain',
    'it': 'Italy',
    'jp': 'Japan',
    'kr': 'South Korea'
  }
  return countries[code.toLowerCase()] || code.toUpperCase()
}

function getStateName(code: string): string {
  const states: Record<string, string> = {
    // US States
    'al': 'Alabama', 'ak': 'Alaska', 'az': 'Arizona', 'ar': 'Arkansas',
    'ca': 'California', 'co': 'Colorado', 'ct': 'Connecticut', 'de': 'Delaware',
    'fl': 'Florida', 'ga': 'Georgia', 'hi': 'Hawaii', 'id': 'Idaho',
    'il': 'Illinois', 'in': 'Indiana', 'ia': 'Iowa', 'ks': 'Kansas',
    'ky': 'Kentucky', 'la': 'Louisiana', 'me': 'Maine', 'md': 'Maryland',
    'ma': 'Massachusetts', 'mi': 'Michigan', 'mn': 'Minnesota', 'ms': 'Mississippi',
    'mo': 'Missouri', 'mt': 'Montana', 'ne': 'Nebraska', 'nv': 'Nevada',
    'nh': 'New Hampshire', 'nj': 'New Jersey', 'nm': 'New Mexico', 'ny': 'New York',
    'nc': 'North Carolina', 'nd': 'North Dakota', 'oh': 'Ohio', 'ok': 'Oklahoma',
    'or': 'Oregon', 'pa': 'Pennsylvania', 'ri': 'Rhode Island', 'sc': 'South Carolina',
    'sd': 'South Dakota', 'tn': 'Tennessee', 'tx': 'Texas', 'ut': 'Utah',
    'vt': 'Vermont', 'va': 'Virginia', 'wa': 'Washington', 'wv': 'West Virginia',
    'wi': 'Wisconsin', 'wy': 'Wyoming'
  }
  return states[code.toLowerCase()] || code.toUpperCase()
}

function getCityName(slug: string): string {
  // Convert slug to proper city name
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatBusinessName(slug: string): string {
  // Convert slug to proper business name
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatBusinessCount(count?: number): string {
  if (!count) return ''
  
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M+`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K+'
  } else {
    return '${count}+'
  }
}