"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Skeleton } from '@components/ui/skeleton';
import { Alert, AlertDescription } from '@components/ui/alert';
import { 
  Cloud, 
  CloudRain, 
  Sun, 
  CloudSnow, 
  Wind, 
  Thermometer, 
  Umbrella, 
  AlertTriangle,
  RefreshCw,
  MapPin,
  Calendar,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

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

interface WeatherWidgetProps {
  location?: string;
  showBusinessImpact?: boolean;
  className?: string;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ 
  location = 'auto', 
  showBusinessImpact = true,
  className = '' 
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, this would call your backend API
      // which would then call the Google Weather API
      const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load weather data');
      // Fallback to mock data for development
      setWeatherData(getMockWeatherData());
    } finally {
      setLoading(false);
    }
  };

  const refreshWeather = async () => {
    setRefreshing(true);
    await fetchWeatherData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchWeatherData();
  }, [location]);

  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) return CloudRain;
    if (conditionLower.includes('snow')) return CloudSnow;
    if (conditionLower.includes('cloud')) return Cloud;
    if (conditionLower.includes('wind')) return Wind;
    return Sun;
  };

  const getWeatherColor = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    
    // Subtle weather-appropriate colors that work with the black/white theme
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return 'text-blue-400 dark:text-blue-300'; // Soft blue for rain
    }
    if (conditionLower.includes('snow')) {
      return 'text-slate-300 dark:text-slate-400'; // Light gray for snow
    }
    if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
      return 'text-slate-500 dark:text-slate-400'; // Medium gray for clouds
    }
    if (conditionLower.includes('wind') || conditionLower.includes('breeze')) {
      return 'text-slate-400 dark:text-slate-500'; // Light gray for wind
    }
    if (conditionLower.includes('sun') || conditionLower.includes('clear') || conditionLower.includes('fair')) {
      return 'text-amber-500 dark:text-amber-400'; // Warm amber for sun
    }
    if (conditionLower.includes('storm') || conditionLower.includes('thunder')) {
      return 'text-slate-600 dark:text-slate-300'; // Darker gray for storms
    }
    if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
      return 'text-slate-400 dark:text-slate-500'; // Muted gray for fog
    }
    
    // Default fallback
    return 'text-foreground';
  };

  const getBusinessImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-destructive/10 text-destructive dark:bg-destructive dark:text-destructive/80';
      case 'medium': return 'bg-warning/10 text-warning dark:bg-warning dark:text-warning/80';
      case 'low': return 'bg-success/10 text-success dark:bg-success dark:text-success/80';
      default: return 'bg-muted text-foreground dark:bg-card dark:text-muted-foreground';
    }
  };

  const getBusinessImpactInsights = (day: any) => {
    const insights = [];
    
    if (day.precipitation > 50) {
      insights.push('Heavy rain may delay outdoor work');
    } else if (day.precipitation > 20) {
      insights.push('Light rain - consider indoor projects');
    }
    
    if (day.windSpeed > 15) {
      insights.push('High winds may affect equipment');
    }
    
    if (day.high > 90) {
      insights.push('Extreme heat - schedule early/late');
    } else if (day.low < 32) {
      insights.push('Freezing temps - protect equipment');
    }
    
    return insights;
  };

  const getBusinessImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return AlertTriangle;
      case 'medium': return TrendingUp;
      case 'low': return TrendingDown;
      default: return TrendingDown;
    }
  };

  const getBusinessImpactText = (impact: string) => {
    switch (impact) {
      case 'high': return 'High Impact';
      case 'medium': return 'Moderate Impact';
      case 'low': return 'Low Impact';
      default: return 'Unknown Impact';
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Weather Forecast
          </CardTitle>
          <CardDescription>7-day forecast for business planning</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <Skeleton className="h-3 w-8 mx-auto" />
                <Skeleton className="h-8 w-8 mx-auto rounded-full" />
                <Skeleton className="h-3 w-6 mx-auto" />
                <Skeleton className="h-3 w-8 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !weatherData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Weather Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Unable to load weather data. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!weatherData) return null;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Weather Forecast
            </CardTitle>
            <CardDescription className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {weatherData.location}
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={refreshWeather}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Weather */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-card rounded-lg">
          <div className="flex items-center gap-3">
            {React.createElement(getWeatherIcon(weatherData.current.condition), { 
              className: `h-8 w-8 ${getWeatherColor(weatherData.current.condition)}` 
            })}
            <div>
              <p className="font-semibold">{weatherData.current.condition}</p>
              <p className="text-sm text-muted-foreground">
                Feels like {weatherData.current.feelsLike}°F
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{weatherData.current.temp}°F</p>
            <p className="text-sm text-muted-foreground">
              {weatherData.current.humidity}% humidity
            </p>
          </div>
        </div>

        {/* 7-Day Forecast */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            7-Day Forecast
          </h4>
          <div className="grid grid-cols-7 gap-2">
            {weatherData.forecast.map((day, index) => (
              <div key={index} className="text-center space-y-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-card transition-colors">
                <p className="text-xs font-medium text-muted-foreground">
                  {day.day}
                </p>
                {React.createElement(getWeatherIcon(day.condition), { 
                  className: `h-6 w-6 mx-auto ${getWeatherColor(day.condition)}` 
                })}
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{day.high}°</p>
                  <p className="text-xs text-muted-foreground">{day.low}°</p>
                </div>
                {showBusinessImpact && (
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getBusinessImpactColor(day.businessImpact)}`}
                  >
                    {React.createElement(getBusinessImpactIcon(day.businessImpact), { 
                      className: "h-3 w-3 mr-1" 
                    })}
                    {getBusinessImpactText(day.businessImpact)}
                  </Badge>
                )}
                {day.precipitation > 0 && (
                  <div className="flex items-center justify-center gap-1 text-xs text-blue-400 dark:text-blue-300">
                    <Umbrella className="h-3 w-3" />
                    {day.precipitation}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Business Impact Summary */}
        {showBusinessImpact && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-primary rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Business Impact Summary
            </h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• High impact days: {weatherData.forecast.filter(d => d.businessImpact === 'high').length}</p>
              <p>• Moderate impact days: {weatherData.forecast.filter(d => d.businessImpact === 'medium').length}</p>
              <p>• Low impact days: {weatherData.forecast.filter(d => d.businessImpact === 'low').length}</p>
            </div>
            
            {/* Business Recommendations */}
            <div className="mt-3 pt-3 border-t border-primary/30 dark:border-primary">
              <h5 className="font-medium text-sm mb-2">Recommendations:</h5>
              <div className="text-xs space-y-1">
                {weatherData.forecast.some(d => d.precipitation > 50) && (
                  <p>• Schedule indoor projects for rainy days</p>
                )}
                {weatherData.forecast.some(d => d.high > 90) && (
                  <p>• Plan outdoor work for early morning</p>
                )}
                {weatherData.forecast.some(d => d.windSpeed > 15) && (
                  <p>• Secure equipment and materials</p>
                )}
                {weatherData.forecast.every(d => d.businessImpact === 'low') && (
                  <p>• Good weather for outdoor projects</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Mock data for development
const getMockWeatherData = (): WeatherData => ({
  location: 'Atlanta, GA',
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

export default WeatherWidget;
