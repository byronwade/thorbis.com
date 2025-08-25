"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import IconLoadingButton from '@/components/ui/icon-loading-button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Cloud, 
  CloudRain, 
  Sun, 
  CloudSnow, 
  Wind,
  Loader2,
  MapPin,
  Eye,
  RefreshCw,
  Thermometer,
  Droplets,
  Gauge
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
  forecast?: Array<{
    day: string;
    temp: number;
    condition: string;
    icon: string;
  }>;
}

interface WeatherIconProps {
  location?: string;
  className?: string;
}

const WeatherIcon: React.FC<WeatherIconProps> = ({ 
  location = 'auto',
  className = ''
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load weather data');
      // Fallback to mock data for development
      setWeatherData({
        location: 'Current Location',
        current: {
          temp: 72,
          condition: 'Partly Cloudy',
          icon: 'cloud',
          humidity: 65,
          windSpeed: 8,
          feelsLike: 75
        },
        forecast: [
          { day: 'Today', temp: 72, condition: 'Partly Cloudy', icon: 'cloud' },
          { day: 'Tomorrow', temp: 68, condition: 'Sunny', icon: 'sun' },
          { day: 'Wednesday', temp: 75, condition: 'Cloudy', icon: 'cloud' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
    
    // Refresh weather data every 15 minutes
    const interval = setInterval(fetchWeatherData, 15 * 60 * 1000);
    return () => clearInterval(interval);
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

  if (loading) {
    return (
      <IconLoadingButton
        loading={true}
        icon={<Cloud className="w-3.5 h-3.5 text-foreground" />}
        className={className}
        title="Loading weather..."
      />
    );
  }

  if (error || !weatherData) {
    return (
      <IconLoadingButton
        icon={<Cloud className="w-3.5 h-3.5 text-foreground" />}
        className={className}
        title="Weather unavailable"
        onClick={fetchWeatherData}
      />
    );
  }

  const WeatherIconComponent = getWeatherIcon(weatherData.current.condition);
  const iconColor = getWeatherColor(weatherData.current.condition);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconLoadingButton
          icon={<WeatherIconComponent className={`w-3.5 h-3.5 ${iconColor}`} />}
          className={className}
          title="Today's Weather"
        >
          <span className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 text-[8px] font-bold text-foreground bg-background rounded-full px-1 leading-none">
            {Math.round(weatherData.current.temp)}°
          </span>
        </IconLoadingButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-2 z-[10001]">
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <WeatherIconComponent className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{weatherData.location}</p>
              <p className="text-xs text-muted-foreground">{weatherData.current.condition}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Current Weather Details */}
        <DropdownMenuGroup>
          <DropdownMenuItem className="p-2">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <Thermometer className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Temperature</span>
              </div>
              <span className="text-sm font-medium">{weatherData.current.temp}°F</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem className="p-2">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Feels Like</span>
              </div>
              <span className="text-sm font-medium">{weatherData.current.feelsLike}°F</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem className="p-2">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <Droplets className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Humidity</span>
              </div>
              <span className="text-sm font-medium">{weatherData.current.humidity}%</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem className="p-2">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <Gauge className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Wind Speed</span>
              </div>
              <span className="text-sm font-medium">{weatherData.current.windSpeed} mph</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        {weatherData.forecast && weatherData.forecast.length > 0 && (
          <>
            <DropdownMenuSeparator />
            
            {/* Forecast */}
            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
              3-Day Forecast
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {weatherData.forecast.map((day, index) => {
                const DayIcon = getWeatherIcon(day.condition);
                const dayIconColor = getWeatherColor(day.condition);
                return (
                  <DropdownMenuItem key={index} className="p-2">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-2">
                        <DayIcon className={`h-4 w-4 ${dayIconColor}`} />
                        <span className="text-sm">{day.day}</span>
                      </div>
                      <span className="text-sm font-medium">{day.temp}°F</span>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          </>
        )}
        
        <DropdownMenuSeparator />
        
        {/* Actions */}
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={fetchWeatherData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            <span>Refresh Weather</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <MapPin className="mr-2 h-4 w-4" />
            <span>Change Location</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WeatherIcon;
