import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LocationBreadcrumb } from '@/components/location/location-breadcrumb'
import BusinessProfile from '@/components/business/business-profile'
import { LocationListing } from '@/components/location/location-listing'
import { TrustSystemProvider } from '@/components/trust/trust-system-provider'

interface LocationPageProps {
  params: {
    location: string[]
  }
}

interface LocationData {
  type: 'country' | 'state' | 'city' | 'business'
  country?: string
  state?: string
  city?: string
  businessSlug?: string
  data: unknown
}

async function parseLocationSegments(segments: string[]): Promise<LocationData> {
  // Parse URL segments to determine what we're displaying
  // Examples:
  // ['us'] -> country page
  // ['us', 'ca'] -> state page  
  // ['us', 'ca', 'san-francisco'] -> city page
  // ['us', 'ca', 'san-francisco', 'sample-restaurant'] -> business page

  if (segments.length === 0) {
    return { type: 'country', data: null }
  }

  const [country, state, city, businessSlug] = segments

  // Validate country code
  const countryData = await getCountryByCode(country)
  if (!countryData) {
    notFound()
  }

  if (segments.length === 1) {
    return {
      type: 'country',
      country,
      data: countryData
    }
  }

  // Validate state/province
  const stateData = await getStateByCode(country, state)
  if (!stateData) {
    notFound()
  }

  if (segments.length === 2) {
    return {
      type: 'state',
      country,
      state,
      data: stateData
    }
  }

  // Validate city
  const cityData = await getCityBySlug(country, state, city)
  if (!cityData) {
    notFound()
  }

  if (segments.length === 3) {
    return {
      type: 'city',
      country,
      state,
      city,
      data: cityData
    }
  }

  // Validate business
  const businessData = await getBusinessBySlug(country, state, city, businessSlug)
  if (!businessData) {
    notFound()
  }

  return {
    type: 'business',
    country,
    state,
    city,
    businessSlug,
    data: businessData
  }
}

async function getCountryByCode(code: string) {
  // Mock data - replace with actual database query
  const countries: Record<string, unknown> = {
    'us': {
      code: 'us',
      name: 'United States',
      fullName: 'United States of America',
      population: '331,900,000',
      businessCount: 32500000
    }
  }
  return countries[code.toLowerCase()] || null
}

async function getStateByCode(countryCode: string, stateCode: string) {
  // Mock data - replace with actual database query
  const states: Record<string, unknown> = {
    'ca': {
      code: 'ca',
      name: 'California',
      fullName: 'California',
      country: 'us',
      population: '39,538,223',
      businessCount: 4200000
    }
  }
  return states[stateCode.toLowerCase()] || null
}

async function getCityBySlug(countryCode: string, stateCode: string, citySlug: string) {
  // Mock data - replace with actual database query
  const cities: Record<string, unknown> = {
    'san-francisco': {
      slug: 'san-francisco',
      name: 'San Francisco',
      fullName: 'San Francisco, California',
      state: 'ca',
      country: 'us',
      population: '873,965',
      businessCount: 85000,
      coordinates: { lat: 37.7749, lng: -122.4194 }
    }
  }
  return cities[citySlug.toLowerCase()] || null
}

async function getBusinessBySlug(countryCode: string, stateCode: string, citySlug: string, businessSlug: string) {
  // Mock data - replace with actual database query and trust system integration
  const businesses: Record<string, unknown> = {
    'sample-restaurant': {
      slug: 'sample-restaurant',
      name: 'Sample Restaurant',
      description: 'This is a sample business used for testing the application. The database is not fully configured yet.',
      phone: '(555) 123-4567',
      address: '123 Main Street, San Francisco, CA 94102',
      website: 'https://sample-restaurant.com',
      email: 'info@sample-restaurant.com',
      city: 'san-francisco',
      state: 'ca',
      country: 'us',
      
      // Trust system integration
      trustScore: 4.5,
      trustMetrics: {
        verifiedBusiness: true,
        responseTime: 'within 2 hours',
        totalReviews: 1,
        satisfactionRate: 98,
        jobsCompleted: 500,
        experienceYears: 10
      },
      
      // Blockchain verification
      blockchainVerified: true,
      did: 'did:thorbis:business:sample-restaurant-sf-ca-us',
      
      // Business features
      features: [
        'WiFi',
        'Parking',
        'Licensed & Insured',
        'Customer Satisfaction Guaranteed',
        'Free Estimates',
        'Emergency Services Available',
        '5+ Years Experience',
        'Professional Team',
        'Quality Materials',
        'Timely Service'
      ],
      
      // Hours
      hours: {
        monday: '8AM - 6PM',
        tuesday: '8AM - 6PM',
        wednesday: '8AM - 6PM',
        thursday: '8AM - 6PM',
        friday: '8AM - 6PM',
        saturday: '9AM - 5PM',
        sunday: 'Closed'
      },
      
      // Pricing
      pricing: {
        startingPrice: 99,
        averageProject: '250-500',
        freeEstimates: true,
        acceptedPayments: ['Credit Cards', 'Cash', 'Checks']
      },
      
      // Gallery
      gallery: [
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1554774853-719586f82d77?w=800&h=600&fit=crop'
      ]
    }
  }
  return businesses[businessSlug.toLowerCase()] || null
}

export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const locationData = await parseLocationSegments(resolvedParams.location)
  
  switch (locationData.type) {
    case 'business':
      return {
        title: '${locationData.data.name} - ${locationData.data.city} | Thorbis Business Directory',
        description: locationData.data.description,
        openGraph: {
          title: locationData.data.name,
          description: locationData.data.description,
          type: 'website',
          locale: 'en_US',
        }
      }
    case 'city`:
      return {
        title: `Businesses in ${locationData.data.name} | Thorbis Business Directory',
        description: 'Find trusted businesses in ${locationData.data.fullName}. ${locationData.data.businessCount.toLocaleString()} verified businesses.'
      }
    case 'state`:
      return {
        title: `Businesses in ${locationData.data.name} | Thorbis Business Directory',
        description: 'Find trusted businesses in ${locationData.data.fullName}. ${locationData.data.businessCount.toLocaleString()} verified businesses.'
      }
    case 'country`:
      return {
        title: `Businesses in ${locationData.data.name} | Thorbis Business Directory',
        description: 'Find trusted businesses in the ${locationData.data.fullName}. ${locationData.data.businessCount.toLocaleString()} verified businesses.'
      }
    default:
      return {
        title: 'Thorbis Business Directory',
        description: 'Find trusted businesses worldwide with blockchain-verified credentials and AI-powered trust scores.'
      }
  }
}

export default async function LocationPage({ params }: LocationPageProps) {
  const resolvedParams = await params;
  const locationData = await parseLocationSegments(resolvedParams.location)

  return (
    <div className="min-h-screen bg-background">
      <LocationBreadcrumb locationData={locationData} />
      
      <main className="max-w-screen-2xl mx-auto px-6 py-8">
        {locationData.type === 'business' ? (
          <TrustSystemProvider businessData={locationData.data}>
            <BusinessProfile business={locationData.data} />
          </TrustSystemProvider>
        ) : (
          <LocationListing locationData={locationData} />
        )}
      </main>
    </div>
  )
}

// Enable ISR for performance
export const revalidate = 3600 // Revalidate every hour