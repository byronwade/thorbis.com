/**
 * Google Places Autocomplete API Route
 * Proxies requests to Google Places API for location autocomplete
 */

import { NextResponse } from 'next/server';
import { logger } from '@lib/utils/logger';

export async function GET(request) {
  const startTime = performance.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }

    // Build Google Places API URL
    const googleParams = new URLSearchParams({
      input: searchParams.get('input') || '',
      key: apiKey,
      types: searchParams.get('types') || 'geocode',
      components: searchParams.get('components') || 'country:US',
      sessiontoken: searchParams.get('sessiontoken') || Date.now().toString(),
      ...Object.fromEntries(searchParams)
    });

    const googleUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${googleParams}`;
    
    // Make request to Google Places API
    const response = await fetch(googleUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API returned status: ${data.status}`);
    }

    const duration = performance.now() - startTime;
    logger.performance(`Places autocomplete completed in ${duration.toFixed(2)}ms`);

    return NextResponse.json({
      predictions: data.predictions || [],
      status: data.status
    });

  } catch (error) {
    logger.error('Places autocomplete error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch location suggestions',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
