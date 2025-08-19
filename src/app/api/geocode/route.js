/**
 * Google Geocoding API Route
 * Proxies requests to Google Geocoding API for address verification and geocoding
 */

import { NextResponse } from 'next/server';
import logger from '@lib/utils/logger';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }

    const address = searchParams.get('address');
    const latlng = searchParams.get('latlng');
    
    if (!address && !latlng) {
      return NextResponse.json(
        { error: 'Address or latlng parameter required' },
        { status: 400 }
      );
    }

        // Build Google Geocoding API URL
    const googleParams = new URLSearchParams({
      key: apiKey,
      latlng: latlng || '',
      address: address || ''
    });

    const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?${googleParams}`;
    
    // Make request to Google Geocoding API
    const response = await fetch(googleUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Geocoding API error: ${response.status} - ${errorText}`);
    }

    const responseText = await response.text();
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(`Failed to parse Google API response: ${parseError.message}`);
    }

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Geocoding API returned status: ${data.status}`);
    }

    // Transform Google response to our format
    const result = data.results?.[0];
    if (!result) {
      return NextResponse.json({
        error: 'No results found',
        status: data.status
      });
    }

    const transformedResult = {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      formatted_address: result.formatted_address,
      place_id: result.place_id,
      types: result.types,
      location_type: result.geometry.location_type,
      address_components: result.address_components
    };

          return NextResponse.json(transformedResult);

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to geocode address',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
