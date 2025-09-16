'use client'

import React, { useEffect, useRef } from 'react'
import { IChartApi, ISeriesApi, HistogramSeriesPartialOptions } from 'lightweight-charts'
import { BaseChart } from './BaseChart'
import { VolumeChartProps, VolumeDataPoint } from '@/types/charts'

export function VolumeChart({
  data,
  config,
  colorScheme = 'default',
  className = ',
  loading = false,
  error = null
}: VolumeChartProps) {
  const histogramSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null)

  const getVolumeColor = (colorType: 'up' | 'down' | 'neutral') => {
    switch (colorScheme) {
      case 'performance':
        return {
          up: '#10B981', // green-500
          down: '#EF4444', // red-500  
          neutral: '#6B7280' // gray-500
        }[colorType]
      case 'custom':
        return {
          up: '#1C8BFF', // blue-500
          down: '#F59E0B', // yellow-500
          neutral: '#8B5CF6' // purple-500
        }[colorType]
      default:
        return {
          up: '#22C55E', // green-500
          down: '#EF4444', // red-500
          neutral: '#64748B' // slate-500
        }[colorType]
    }
  }

  const handleChartReady = (chart: IChartApi) => {
    try {
      // Create histogram series for volume
      const histogramOptions: HistogramSeriesPartialOptions = {
        priceFormat: {
          type: 'volume',
          precision: 0,
          minMove: 1
        },
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: '#1C8BFF',
        crosshairMarkerBackgroundColor: '#0F0F0F'
      }

      const histogramSeries = chart.addHistogramSeries(histogramOptions)
      histogramSeriesRef.current = histogramSeries

      // Set data with colors
      if (data && data.length > 0) {
        const formattedData = data.map(point => ({
          time: point.time,
          value: point.value,
          color: getVolumeColor(point.color)
        }))
        
        histogramSeries.setData(formattedData)

        // Fit content with some padding
        chart.timeScale().fitContent()
      }
    } catch (error) {
      console.error('Error setting up volume chart:', error)
    }
  }

  // Update data when it changes
  useEffect(() => {
    if (histogramSeriesRef.current && data && data.length > 0) {
      try {
        const formattedData = data.map(point => ({
          time: point.time,
          value: point.value,
          color: getVolumeColor(point.color)
        }))
        
        histogramSeriesRef.current.setData(formattedData)
      } catch (error) {
        console.error('Error updating volume chart data:', error)
      }
    }
  }, [data, colorScheme])

  return (
    <BaseChart
      data={data}
      config={config}
      className={className}
      loading={loading}
      error={error}
      onChartReady={handleChartReady}
    />
  )
}

// Utility function to generate sample volume data
export function generateVolumeData(days: number): VolumeDataPoint[] {
  const data: VolumeDataPoint[] = []
  const now = new Date()
  const baseVolume = 22 // Base daily work orders
  
  for (const i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    // Weekend factor
    const dayOfWeek = date.getDay()
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.65 : 1.0
    
    // Add seasonality and randomness
    const seasonality = Math.sin((days - i) * 0.15) * 0.2
    const growth = (days - i) * 0.003
    const randomness = (Math.random() - 0.5) * 0.3
    
    const multiplier = weekendFactor * (1 + seasonality + growth + randomness)
    const volume = Math.max(Math.round(baseVolume * multiplier), 8)
    
    // Determine color trend
    let color: 'up' | 'down' | 'neutral' = 'neutral'
    if (i < days && data.length > 0) {
      const prevVolume = data[data.length - 1].value
      if (volume > prevVolume * 1.08) color = 'up'
      else if (volume < prevVolume * 0.92) color = 'down'
    }
    
    data.push({
      time: Math.floor(date.getTime() / 1000),
      value: volume,
      color
    })
  }
  
  return data
}