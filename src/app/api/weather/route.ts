import { NextRequest, NextResponse } from 'next/server';

interface WeatherData {
  location: string;
  current: {
    temp: number;
    condition: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    feelsLike: number;
  };
  forecast: Array<{
    date: string;
    day: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
    precipitation: number;
    windSpeed: number;
    businessImpact: 'low' | 'medium' | 'high';
  }>;
}

// Mock weather data for development
const getMockWeatherData = (location: string = 'Atlanta, GA'): WeatherData => ({
  location,
  current: {
    temp: 72,
    condition: 'Partly Cloudy',
    icon: 'cloud',
    humidity: 65,
    windSpeed: 8,
    feelsLike: 74
  },
  forecast: [
    {
      date: '2024-01-15',
      day: 'Mon',
      high: 75,
      low: 58,
      condition: 'Sunny',
      icon: 'sun',
      precipitation: 0,
      windSpeed: 5,
      businessImpact: 'low'
    },
    {
      date: '2024-01-16',
      day: 'Tue',
      high: 78,
      low: 62,
      condition: 'Partly Cloudy',
      icon: 'cloud',
      precipitation: 10,
      windSpeed: 7,
      businessImpact: 'low'
    },
    {
      date: '2024-01-17',
      day: 'Wed',
      high: 68,
      low: 55,
      condition: 'Rain',
      icon: 'rain',
      precipitation: 80,
      windSpeed: 12,
      businessImpact: 'high'
    },
    {
      date: '2024-01-18',
      day: 'Thu',
      high: 65,
      low: 48,
      condition: 'Cloudy',
      icon: 'cloud',
      precipitation: 30,
      windSpeed: 10,
      businessImpact: 'medium'
    },
    {
      date: '2024-01-19',
      day: 'Fri',
      high: 70,
      low: 52,
      condition: 'Partly Cloudy',
      icon: 'cloud',
      precipitation: 15,
      windSpeed: 8,
      businessImpact: 'low'
    },
    {
      date: '2024-01-20',
      day: 'Sat',
      high: 73,
      low: 55,
      condition: 'Sunny',
      icon: 'sun',
      precipitation: 0,
      windSpeed: 6,
      businessImpact: 'low'
    },
    {
      date: '2024-01-21',
      day: 'Sun',
      high: 76,
      low: 58,
      condition: 'Sunny',
      icon: 'sun',
      precipitation: 0,
      windSpeed: 5,
      businessImpact: 'low'
    }
  ]
});

// Google Weather API integration
const fetchGoogleWeatherData = async (location: string): Promise<WeatherData> => {
  const apiKey = process.env.GOOGLE_WEATHER_API_KEY;
  
  if (!apiKey) {
    console.warn('Google Weather API key not found, using mock data');
    return getMockWeatherData(location);
  }

  try {
    // Google Weather API endpoint
    const response = await fetch(
      `https://weather.googleapis.com/v1/forecast?location=${encodeURIComponent(location)}&key=${apiKey}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Weather API request failed: ${response.status}`);
    }

    const data = await response.json();
    return transformGoogleWeatherData(data, location);
  } catch (error) {
    console.error('Google Weather API error:', error);
    // Fallback to mock data on API failure
    return getMockWeatherData(location);
  }
};

// Transform Google Weather API response to our format
const transformGoogleWeatherData = (googleData: any, location: string): WeatherData => {
  try {
    // Extract current weather
    const current = googleData.current || {};
    const currentTemp = current.temperature || 72;
    const currentCondition = current.condition || 'Partly Cloudy';
    
    // Extract forecast data
    const forecast = (googleData.forecast || []).slice(0, 7).map((day: any, index: number) => {
      const high = day.high || 75;
      const low = day.low || 58;
      const condition = day.condition || 'Sunny';
      const precipitation = day.precipitation || 0;
      const windSpeed = day.windSpeed || 5;
      
      // Calculate business impact based on weather conditions
      const businessImpact = calculateBusinessImpact({
        precipitation,
        windSpeed,
        high,
        low
      });

      return {
        date: new Date(Date.now() + index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        day: new Date(Date.now() + index * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        high,
        low,
        condition,
        icon: getWeatherIcon(condition),
        precipitation,
        windSpeed,
        businessImpact
      };
    });

    return {
      location,
      current: {
        temp: currentTemp,
        condition: currentCondition,
        icon: getWeatherIcon(currentCondition),
        humidity: current.humidity || 65,
        windSpeed: current.windSpeed || 8,
        feelsLike: current.feelsLike || currentTemp
      },
      forecast
    };
  } catch (error) {
    console.error('Error transforming weather data:', error);
    return getMockWeatherData(location);
  }
};

// Calculate business impact based on weather conditions
const calculateBusinessImpact = (day: any): 'low' | 'medium' | 'high' => {
  let impactScore = 0;
  
  // Precipitation impact
  if (day.precipitation > 50) impactScore += 3;
  else if (day.precipitation > 20) impactScore += 1;
  
  // Wind impact
  if (day.windSpeed > 15) impactScore += 2;
  else if (day.windSpeed > 10) impactScore += 1;
  
  // Temperature impact
  if (day.high > 90 || day.low < 32) impactScore += 2;
  
  // Determine impact level
  if (impactScore >= 3) return 'high';
  if (impactScore >= 1) return 'medium';
  return 'low';
};

// Get weather icon based on condition
const getWeatherIcon = (condition: string): string => {
  const conditionLower = condition.toLowerCase();
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) return 'rain';
  if (conditionLower.includes('snow')) return 'snow';
  if (conditionLower.includes('cloud')) return 'cloud';
  if (conditionLower.includes('wind')) return 'wind';
  return 'sun';
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location') || 'auto';

    // TODO: Add rate limiting and caching
    // TODO: Add proper error handling for API failures
    // TODO: Add location validation and geocoding

    const weatherData = await fetchGoogleWeatherData(location);

    return NextResponse.json(weatherData, {
      headers: {
        'Cache-Control': 'public, max-age=900', // Cache for 15 minutes
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Weather API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch weather data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
