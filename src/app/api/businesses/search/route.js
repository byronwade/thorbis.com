import { NextResponse } from 'next/server';
import { supabase } from '@lib/supabase/client';
import logger from '@lib/utils/logger';

// Fallback business data for when Supabase is unavailable
const fallbackBusinesses = [
  {
    id: '1',
    name: 'Joe\'s Pizza',
    address: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zip_code: '94102',
    rating: 4.5,
    review_count: 128,
    verified: true,
    featured: true,
    description: 'Authentic Italian pizza and pasta'
  },
  {
    id: '2',
    name: 'Tech Solutions Inc',
    address: '456 Market St',
    city: 'San Francisco',
    state: 'CA',
    zip_code: '94105',
    rating: 4.8,
    review_count: 89,
    verified: true,
    featured: true,
    description: 'Professional IT consulting services'
  },
  {
    id: '3',
    name: 'Green Gardens Landscaping',
    address: '789 Oak Ave',
    city: 'Oakland',
    state: 'CA',
    zip_code: '94601',
    rating: 4.2,
    review_count: 67,
    verified: true,
    featured: false,
    description: 'Professional landscaping and garden design'
  },
  {
    id: '4',
    name: 'Blue Moon Coffee',
    address: '321 Castro St',
    city: 'San Francisco',
    state: 'CA',
    zip_code: '94114',
    rating: 4.6,
    review_count: 203,
    verified: true,
    featured: true,
    description: 'Artisan coffee and pastries'
  },
  {
    id: '5',
    name: 'Sunset Auto Repair',
    address: '654 Sunset Blvd',
    city: 'San Francisco',
    state: 'CA',
    zip_code: '94122',
    rating: 4.3,
    review_count: 156,
    verified: true,
    featured: false,
    description: 'Reliable auto repair and maintenance'
  }
];

export async function GET(request) {
  const startTime = performance.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit')) || 10;
    
    if (!query.trim()) {
      return NextResponse.json({ businesses: [] });
    }

    // Try to use Supabase first
    if (supabase) {
      try {
        // Build the search query with full-text search
        let supabaseQuery = supabase
          .from('businesses')
          .select(`
            id,
            name,
            address,
            city,
            state,
            zip_code,
            rating,
            review_count,
            verified,
            featured,
            description
          `)
          .eq('status', 'published')
          .eq('verified', true)
          .or(`name.ilike.%${query}%,city.ilike.%${query}%,state.ilike.%${query}%`)
          .order('featured', { ascending: false })
          .order('rating', { ascending: false, nullsLast: true })
          .limit(limit);

        const { data: businesses, error } = await supabaseQuery;

        if (!error && businesses) {
          // Transform the data for the frontend
          const transformedBusinesses = businesses.map(business => ({
            id: business.id,
            name: business.name,
            address: business.address,
            city: business.city,
            state: business.state,
            zipCode: business.zip_code,
            rating: business.rating,
            reviewCount: business.review_count,
            verified: business.verified,
            featured: business.featured,
            description: business.description,
            formattedAddress: `${business.address}, ${business.city}, ${business.state} ${business.zip_code}`,
            type: 'business'
          }));

          const duration = performance.now() - startTime;
          logger.performance(`Business search completed in ${duration.toFixed(2)}ms`);

          return NextResponse.json({
            businesses: transformedBusinesses,
            query,
            total: transformedBusinesses.length,
            source: 'supabase'
          });
        }
      } catch (supabaseError) {
        logger.error('Supabase query error:', supabaseError);
      }
    }

    // Fallback to mock data
    logger.warn('Using fallback business data');
    const searchTerm = query.toLowerCase();
    const filteredBusinesses = fallbackBusinesses
      .filter(business => 
        business.name.toLowerCase().includes(searchTerm) ||
        business.city.toLowerCase().includes(searchTerm) ||
        business.state.toLowerCase().includes(searchTerm) ||
        business.description.toLowerCase().includes(searchTerm)
      )
      .slice(0, limit)
      .map(business => ({
        id: business.id,
        name: business.name,
        address: business.address,
        city: business.city,
        state: business.state,
        zipCode: business.zip_code,
        rating: business.rating,
        reviewCount: business.review_count,
        verified: business.verified,
        featured: business.featured,
        description: business.description,
        formattedAddress: `${business.address}, ${business.city}, ${business.state} ${business.zip_code}`,
        type: 'business'
      }));

    const duration = performance.now() - startTime;
    logger.performance(`Fallback business search completed in ${duration.toFixed(2)}ms`);

    return NextResponse.json({
      businesses: filteredBusinesses,
      query,
      total: filteredBusinesses.length,
      source: 'fallback'
    });

  } catch (error) {
    logger.error('Business search API error:', error);
    
    // Return empty results instead of 500 error
    return NextResponse.json({
      businesses: [],
      query: '',
      total: 0,
      source: 'error',
      error: 'Search temporarily unavailable'
    });
  }
}
