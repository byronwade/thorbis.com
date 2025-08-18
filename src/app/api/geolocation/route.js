import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const payload = await request.json();
    
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }
    
    // Construct Google Geolocation API request
    const googleParams = new URLSearchParams({
      key: apiKey
    });

    const googleUrl = `https://www.googleapis.com/geolocation/v1/geolocate?${googleParams}`;
    
    const response = await fetch(googleUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Geolocation API error: ${response.status} - ${errorText}`);
    }

    const responseText = await response.text();
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(`Failed to parse Google API response: ${parseError.message}`);
    }
    
    return NextResponse.json(data);

  } catch (error) {
    logger.error('Geolocation API error:', error);
    return NextResponse.json(
      { error: 'Geolocation failed' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  // Fallback to Vercel's geolocation for simple requests
  try {
    const { geolocation } = await import('@vercel/functions');
    const details = geolocation(request);
    return NextResponse.json(details);
  } catch (error) {
    logger.error('Vercel geolocation error:', error);
    return NextResponse.json(
      { error: 'Geolocation not available' },
      { status: 500 }
    );
  }
}
