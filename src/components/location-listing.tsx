'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Building, Users, TrendingUp, Filter, Search, Star, Shield } from 'lucide-react'

interface LocationData {
  type: 'country' | 'state' | 'city' | 'business'
  country?: string
  state?: string
  city?: string
  businessSlug?: string
  data: unknown
}

interface LocationListingProps {
  locationData: LocationData
}

interface BusinessListing {
  slug: string
  name: string
  description: string
  category: string
  trustScore: number
  verified: boolean
  responseTime: string
  completedJobs: number
  location: string
  image?: string
}

interface SubLocation {
  slug: string
  name: string
  businessCount: number
  population?: string
  featured: boolean
}

export function LocationListing({ locationData }: LocationListingProps) {
  const [searchQuery, setSearchQuery] = useState(')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'distance'>('relevance')

  // Generate content based on location type
  const renderLocationHeader = () => {
    const { data } = locationData
    
    return (
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          {getLocationTitle()}
        </h1>
        <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
          {getLocationDescription()}
        </p>
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-primary" />
            <span className="text-foreground font-medium">
              {data?.businessCount?.toLocaleString() || '0'} Businesses
            </span>
          </div>
          {data?.population && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-foreground font-medium">
                {data.population} Population
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-success" />
            <span className="text-success font-medium">
              Blockchain Verified
            </span>
          </div>
        </div>
      </div>
    )
  }

  const renderSubLocations = () => {
    const subLocations = getSubLocations()
    
    if (subLocations.length === 0) {
      return null
    }

    return (
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <MapPin className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            {getSubLocationTitle()}
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {subLocations.map((location) => (
            <Link
              key={location.slug}
              href={buildLocationHref(location.slug)}
              className="group p-6 bg-background border border-border rounded-xl hover:border-primary/50 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {location.name}
                </h3>
                {location.featured && (
                  <div className="px-2 py-0.5 bg-warning/10 text-warning text-xs font-medium border border-warning/30 rounded">
                    Popular
                  </div>
                )}
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Businesses</span>
                  <span className="font-medium text-foreground">
                    {location.businessCount.toLocaleString()}
                  </span>
                </div>
                {location.population && (
                  <div className="flex items-center justify-between">
                    <span>Population</span>
                    <span className="font-medium text-foreground">
                      {location.population}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex items-center text-primary text-sm font-medium">
                <span>View businesses</span>
                <TrendingUp className="w-4 h-4 ml-2" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    )
  }

  const renderBusinessListings = () => {
    const businesses = getBusinessListings()
    
    if (businesses.length === 0) {
      return (
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium text-foreground mb-2">
            No businesses found
          </h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or check back later.
          </p>
        </div>
      )
    }

    return (
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Building className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">
              Featured Businesses
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:border-primary focus:outline-none"
            >
              <option value="relevance">Most Relevant</option>
              <option value="rating">Highest Rated</option>
              <option value="distance">Nearest</option>
            </select>
            
            <button className="p-2 text-muted-foreground hover:text-primary border border-border rounded-lg hover:border-primary transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {businesses.map((business) => (
            <Link
              key={business.slug}
              href={buildBusinessHref(business.slug)}
              className="group block p-6 bg-background border border-border rounded-xl hover:border-primary/50 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-6">
                {/* Business Image */}
                <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                  {business.image ? (
                    <img 
                      src={business.image} 
                      alt={business.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Business Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {business.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {business.category} • {business.location}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-warning fill-warning" />
                        <span className="font-medium text-foreground">
                          {business.trustScore.toFixed(1)}
                        </span>
                      </div>
                      {business.verified && (
                        <div className="flex items-center gap-1 text-success">
                          <Shield className="w-4 h-4" />
                          <span className="font-medium">Verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {business.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Responds {business.responseTime}</span>
                    <span>•</span>
                    <span>{business.completedJobs}+ completed jobs</span>
                    <span>•</span>
                    <span className="text-success font-medium">
                      Free estimates
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="px-6 py-2 text-sm font-medium text-primary hover:text-primary/80 hover:bg-primary/10 border border-primary/20 rounded-lg transition-all">
            Load More Businesses
          </button>
        </div>
      </section>
    )
  }

  // Helper functions
  const getLocationTitle = () => {
    const { data, type } = locationData
    switch (type) {
      case 'country':
        return 'Businesses in ${data?.name || 'Country'}'
      case 'state':
        return 'Businesses in ${data?.name || 'State'}'
      case 'city':
        return 'Businesses in ${data?.name || 'City'}'
      default:
        return 'Business Directory'
    }
  }

  const getLocationDescription = () => {
    const { data, type } = locationData
    switch (type) {
      case 'country':
        return 'Find trusted, verified businesses across ${data?.fullName || 'the country'}. All listings are blockchain-verified with AI-powered trust scores.'
      case 'state':
        return 'Discover reliable local businesses in ${data?.fullName || 'the state'}. Every business is verified and rated by real customers.'
      case 'city':
        return 'Connect with top-rated local businesses in ${data?.fullName || 'the city'}. Verified credentials, transparent pricing, guaranteed satisfaction.'
      default:
        return 'Find trusted businesses worldwide with blockchain-verified credentials.'
    }
  }

  const getSubLocationTitle = () => {
    switch (locationData.type) {
      case 'country':
        return 'States & Provinces'
      case 'state':
        return 'Cities & Towns'
      case 'city':
        return 'Neighborhoods'
      default:
        return 'Locations'
    }
  }

  const getSubLocations = (): SubLocation[] => {
    // Mock data - replace with actual API calls
    switch (locationData.type) {
      case 'country':
        return [
          { slug: 'ca', name: 'California', businessCount: 4200000, population: '39.5M', featured: true },
          { slug: 'tx', name: 'Texas', businessCount: 3100000, population: '30.0M', featured: true },
          { slug: 'fl', name: 'Florida', businessCount: 2800000, population: '22.6M', featured: true },
          { slug: 'ny', name: 'New York', businessCount: 2500000, population: '19.3M', featured: false }
        ]
      case 'state':
        return [
          { slug: 'los-angeles', name: 'Los Angeles', businessCount: 850000, population: '3.9M', featured: true },
          { slug: 'san-francisco', name: 'San Francisco', businessCount: 185000, population: '874K', featured: true },
          { slug: 'san-diego', name: 'San Diego', businessCount: 320000, population: '1.4M', featured: true },
          { slug: 'sacramento', name: 'Sacramento', businessCount: 120000, population: '525K', featured: false }
        ]
      default:
        return []
    }
  }

  const getBusinessListings = (): BusinessListing[] => {
    // Mock data - replace with actual API calls
    return [
      {
        slug: 'sample-restaurant',
        name: 'Sample Restaurant',
        description: 'Premium dining experience with farm-to-table cuisine and exceptional service. Specializing in contemporary American dishes with seasonal ingredients.',
        category: 'Restaurant',
        trustScore: 4.8,
        verified: true,
        responseTime: 'within 2 hours',
        completedJobs: 1250,
        location: 'Downtown San Francisco',
        image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop'
      }
    ]
  }

  const buildLocationHref = (slug: string) => {
    const { country, state, city } = locationData
    const segments = [country, state, city, slug].filter(Boolean)
    return '/${segments.join('/')}'
  }

  const buildBusinessHref = (slug: string) => {
    const { country, state, city } = locationData
    const segments = [country, state, city, slug].filter(Boolean)
    return '/${segments.join('/')}'
  }

  return (
    <div className="space-y-8">
      {renderLocationHeader()}
      
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search businesses, services, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-base bg-background border border-border rounded-xl focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {renderSubLocations()}
      {renderBusinessListings()}
    </div>
  )
}