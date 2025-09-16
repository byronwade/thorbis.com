import { NextRequest, NextResponse } from 'next/server'

/**
 * Public API endpoint for home services businesses
 * No authentication required - public truth layer
 */
export async function GET(request: NextRequest) {
  try {
    // This would connect to your database
    // For now, returning mock data
    const businesses = [
      {
        id: '1',
        slug: 'premium-hvac-phoenix',
        name: 'Premium HVAC Phoenix',
        description: 'Professional HVAC services in the Phoenix metro area',
        services: ['AC Repair', 'Heating Installation', 'Maintenance Plans'],
        serviceArea: ['Phoenix', 'Scottsdale', 'Mesa', 'Tempe'],
        rating: 4.8,
        reviewCount: 324,
        verified: true,
        contactInfo: {
          phone: '(602) 555-0100',
          email: 'service@premiumhvac.com',
          website: 'https://premiumhvac.com'
        },
        businessHours: {
          monday: '7:00 AM - 7:00 PM',
          tuesday: '7:00 AM - 7:00 PM',
          wednesday: '7:00 AM - 7:00 PM',
          thursday: '7:00 AM - 7:00 PM',
          friday: '7:00 AM - 7:00 PM',
          saturday: '8:00 AM - 5:00 PM',
          sunday: 'Emergency Service Only'
        },
        certifications: ['Licensed', 'Bonded', 'Insured', 'EPA Certified'],
        createdAt: new Date('2023-01-15').toISOString(),
        updatedAt: new Date('2024-01-10').toISOString()
      }
    ]

    // Add cache headers for public API
    return NextResponse.json(businesses, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'Access-Control-Allow-Origin': '*',
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '99',
        'X-RateLimit-Reset': new Date(Date.now() + 3600000).toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching businesses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch businesses' },
      { status: 500 }
    )
  }
}