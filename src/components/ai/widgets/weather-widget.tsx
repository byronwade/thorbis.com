'use client';

import React from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Eye, Droplets, Thermometer } from 'lucide-react';

interface WeatherData {
  location: string;
  temperature: number;
  unit: 'C' | 'F';
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  feelsLike: number;
  weeklyForecast?: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
  }>;
}

interface WeatherWidgetProps {
  weather: WeatherData | null;
  loading?: boolean;
}

const getWeatherIcon = (condition: string) => {
  const normalizedCondition = condition.toLowerCase();
  
  if (normalizedCondition.includes('sun') || normalizedCondition.includes('clear')) {
    return <Sun className="w-12 h-12 text-yellow-400" />;
  }
  if (normalizedCondition.includes('rain') || normalizedCondition.includes('drizzle')) {
    return <CloudRain className="w-12 h-12 text-blue-400" />;
  }
  if (normalizedCondition.includes('snow') || normalizedCondition.includes('blizzard')) {
    return <CloudSnow className="w-12 h-12 text-blue-200" />;
  }
  if (normalizedCondition.includes('wind')) {
    return <Wind className="w-12 h-12 text-gray-400" />;
  }
  // Default to cloudy
  return <Cloud className="w-12 h-12 text-gray-400" />;
};

const getGradientBackground = (condition: string) => {
  const normalizedCondition = condition.toLowerCase();
  
  if (normalizedCondition.includes('sun') || normalizedCondition.includes('clear')) {
    return 'bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400';
  }
  if (normalizedCondition.includes('rain') || normalizedCondition.includes('drizzle')) {
    return 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600';
  }
  if (normalizedCondition.includes('snow') || normalizedCondition.includes('blizzard')) {
    return 'bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300';
  }
  if (normalizedCondition.includes('wind')) {
    return 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600';
  }
  // Default to cloudy
  return 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600';
};

export function WeatherWidget({ weather, loading = false }: WeatherWidgetProps) {
  if (loading || !weather) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 rounded-2xl p-6 text-white shadow-lg animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="h-4 bg-white/20 rounded w-24 mb-2"></div>
              <div className="h-6 bg-white/20 rounded w-32"></div>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full"></div>
          </div>
          <div className="flex items-center justify-between mb-6">
            <div className="h-12 bg-white/20 rounded w-20"></div>
            <div className="text-right">
              <div className="h-3 bg-white/20 rounded w-16 mb-1"></div>
              <div className="h-3 bg-white/20 rounded w-20"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className={'${getGradientBackground(weather.condition)} rounded-2xl p-6 text-white shadow-lg backdrop-blur-sm border border-white/10'}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white/90">{weather.location}</h3>
            <p className="text-sm text-white/70 capitalize">{weather.description}</p>
          </div>
          {getWeatherIcon(weather.condition)}
        </div>

        {/* Main Temperature */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-4xl font-bold">
            {weather.temperature}°{weather.unit}
          </div>
          <div className="text-right text-sm text-white/80">
            <div className="flex items-center gap-1 mb-1">
              <Thermometer className="w-3 h-3" />
              <span>Feels like {weather.feelsLike}°{weather.unit}</span>
            </div>
            <div className="capitalize">{weather.condition}</div>
          </div>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Droplets className="w-4 h-4 text-white/70" />
            </div>
            <div className="text-xs text-white/70">Humidity</div>
            <div className="text-sm font-medium">{weather.humidity}%</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Wind className="w-4 h-4 text-white/70" />
            </div>
            <div className="text-xs text-white/70">Wind</div>
            <div className="text-sm font-medium">{weather.windSpeed} mph</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Eye className="w-4 h-4 text-white/70" />
            </div>
            <div className="text-xs text-white/70">Visibility</div>
            <div className="text-sm font-medium">{weather.visibility} mi</div>
          </div>
        </div>

        {/* Weekly Forecast */}
        {weather.weeklyForecast && weather.weeklyForecast.length > 0 && (
          <div className="border-t border-white/20 pt-4">
            <div className="text-xs text-white/70 mb-3 font-medium">7-Day Forecast</div>
            <div className="flex justify-between gap-2">
              {weather.weeklyForecast.slice(0, 5).map((day, index) => (
                <div key={index} className="text-center flex-1">
                  <div className="text-xs text-white/70 mb-1">{day.day}</div>
                  <div className="text-xs font-medium">
                    {day.high}°/{day.low}°
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WeatherWidget;
