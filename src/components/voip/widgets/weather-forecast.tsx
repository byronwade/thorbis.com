"use client"

import { useState, useEffect } from "react"
import { Cloud, CloudRain, Sun, CloudSnow, Wind, Thermometer, Droplets } from "lucide-react"

interface WeatherDay {
  date: string
  day: string
  high: number
  low: number
  condition: string
  icon: string
  precipitation: number
  humidity: number
  windSpeed: number
}

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  snowy: CloudSnow,
  windy: Wind,
}

export default function WeatherForecast() {
  const [forecast, setForecast] = useState<WeatherDay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call with mock data
    const mockForecast: WeatherDay[] = [
      {
        date: new Date().toISOString().split("T")[0],
        day: "Today",
        high: 72,
        low: 58,
        condition: "Partly Cloudy",
        icon: "cloudy",
        precipitation: 10,
        humidity: 65,
        windSpeed: 8,
      },
      {
        date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        day: "Tomorrow",
        high: 75,
        low: 61,
        condition: "Sunny",
        icon: "sunny",
        precipitation: 0,
        humidity: 55,
        windSpeed: 6,
      },
      {
        date: new Date(Date.now() + 172800000).toISOString().split("T")[0],
        day: "Wed",
        high: 68,
        low: 55,
        condition: "Light Rain",
        icon: "rainy",
        precipitation: 80,
        humidity: 85,
        windSpeed: 12,
      },
      {
        date: new Date(Date.now() + 259200000).toISOString().split("T")[0],
        day: "Thu",
        high: 70,
        low: 57,
        condition: "Cloudy",
        icon: "cloudy",
        precipitation: 20,
        humidity: 70,
        windSpeed: 9,
      },
      {
        date: new Date(Date.now() + 345600000).toISOString().split("T")[0],
        day: "Fri",
        high: 73,
        low: 59,
        condition: "Sunny",
        icon: "sunny",
        precipitation: 5,
        humidity: 60,
        windSpeed: 7,
      },
      {
        date: new Date(Date.now() + 432000000).toISOString().split("T")[0],
        day: "Sat",
        high: 76,
        low: 62,
        condition: "Partly Cloudy",
        icon: "cloudy",
        precipitation: 15,
        humidity: 58,
        windSpeed: 8,
      },
      {
        date: new Date(Date.now() + 518400000).toISOString().split("T")[0],
        day: "Sun",
        high: 74,
        low: 60,
        condition: "Sunny",
        icon: "sunny",
        precipitation: 0,
        humidity: 52,
        windSpeed: 5,
      },
    ]

    setTimeout(() => {
      setForecast(mockForecast)
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-100">Weather Forecast</h3>
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent" />
        </div>
        <div className="space-y-3">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-neutral-700 rounded-full" />
                  <div className="space-y-1">
                    <div className="w-16 h-4 bg-neutral-700 rounded" />
                    <div className="w-20 h-3 bg-neutral-700 rounded" />
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="w-12 h-4 bg-neutral-700 rounded" />
                  <div className="w-8 h-3 bg-neutral-700 rounded ml-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-100">7-Day Forecast</h3>
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Thermometer className="h-3 w-3" />
          <span>°F</span>
        </div>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {forecast.map((day, index) => {
          const IconComponent = weatherIcons[day.icon as keyof typeof weatherIcons] || Cloud

          return (
            <div
              key={day.date}
              className={`group flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:bg-neutral-800/50 ${
                index === 0 ? "bg-blue-950/20 border border-blue-800/30" : "bg-neutral-800/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full ${
                    day.icon === "sunny"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : day.icon === "rainy"
                        ? "bg-blue-500/20 text-blue-400"
                        : day.icon === "snowy"
                          ? "bg-gray-500/20 text-gray-300"
                          : "bg-neutral-500/20 text-neutral-300"
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium text-neutral-100 text-sm">{day.day}</div>
                  <div className="text-xs text-neutral-400">{day.condition}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-neutral-100">{day.high}°</span>
                  <span className="text-neutral-400">{day.low}°</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
                  <div className="flex items-center gap-1">
                    <Droplets className="h-3 w-3" />
                    <span>{day.precipitation}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wind className="h-3 w-3" />
                    <span>{day.windSpeed}mph</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-neutral-700">
        <div className="text-xs text-neutral-500 text-center">Last updated: {new Date().toLocaleTimeString()}</div>
      </div>
    </div>
  )
}
