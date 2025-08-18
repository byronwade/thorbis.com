import { NextResponse } from 'next/server';
import { supabase } from '@lib/supabase/client';
import { logger } from '@lib/utils/logger';

export async function GET(request) {
  const startTime = performance.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit')) || 10;
    
    if (!query.trim()) {
      return NextResponse.json({ businesses: [] });
    }

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

    if (error) {
      logger.error('Business search error:', error);
      return NextResponse.json(
        { error: 'Failed to search businesses' },
        { status: 500 }
      );
    }

    // Transform the data for the frontend
    const transformedBusinesses = businesses?.map(business => ({
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
    })) || [];

    const duration = performance.now() - startTime;
    logger.performance(`Business search completed in ${duration.toFixed(2)}ms`);

    return NextResponse.json({
      businesses: transformedBusinesses,
      query,
      total: transformedBusinesses.length
    });

  } catch (error) {
    logger.error('Business search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
