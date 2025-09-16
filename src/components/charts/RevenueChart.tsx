'use client'

import React, { useEffect, useRef } from 'react'
import { IChartApi, ISeriesApi, AreaSeriesPartialOptions } from 'lightweight-charts'
import { BaseChart } from './BaseChart'
import { RevenueChartProps, ChartDataPoint } from '@/types/charts'

export function RevenueChart({
  data,
  config,
  showTargetLine = false,
  targetValue = 0,
  className = ',
  loading = false,
  error = null
}: RevenueChartProps) {
  const areaSeriesRef = useRef<ISeriesApi<"Area"> | null>(null)
  const targetLineRef = useRef<ISeriesApi<"Line"> | null>(null)

  const handleChartReady = (chart: IChartApi) => {
    try {
      // Create area series for revenue
      const areaSeriesOptions: AreaSeriesPartialOptions = {
        topColor: '#1C8BFF40', // blue-500 with opacity
        bottomColor: '#1C8BFF10', // blue-500 with less opacity
        lineColor: '#1C8BFF', // blue-500
        lineWidth: 2,
        priceFormat: {
          type: 'price',
          precision: 0,
          minMove: 1
        },
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: '#1C8BFF',
        crosshairMarkerBackgroundColor: '#0F0F0F'
      }

      const areaSeries = chart.addAreaSeries(areaSeriesOptions)
      areaSeriesRef.current = areaSeries

      // Add target line if requested
      if (showTargetLine && targetValue > 0) {
        const targetSeries = chart.addLineSeries({
          color: '#F59E0B', // yellow-500
          lineWidth: 1,
          lineStyle: 2, // Dashed line
          priceFormat: {
            type: 'price',
            precision: 0,
            minMove: 1
          },
          crosshairMarkerVisible: false
        })
        targetLineRef.current = targetSeries

        // Create target line data
        if (data.length > 0) {
          const targetLineData = data.map(point => ({
            time: point.time,
            value: targetValue
          }))
          targetSeries.setData(targetLineData)
        }
      }

      // Set area series data
      if (data && data.length > 0) {
        areaSeries.setData(data)

        // Fit content with some padding
        chart.timeScale().fitContent()
      }
    } catch (error) {
      console.error('Error setting up revenue chart:', error)
    }
  }

  // Update data when it changes
  useEffect(() => {
    if (areaSeriesRef.current && data && data.length > 0) {
      try {
        areaSeriesRef.current.setData(data)
      } catch (error) {
        console.error('Error updating revenue chart data:', error)
      }
    }

    // Update target line
    if (targetLineRef.current && showTargetLine && targetValue > 0 && data.length > 0) {
      try {
        const targetLineData = data.map(point => ({
          time: point.time,
          value: targetValue
        }))
        targetLineRef.current.setData(targetLineData)
      } catch (error) {
        console.error('Error updating target line:', error)
      }
    }
  }, [data, showTargetLine, targetValue])

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

// Utility function to generate sample revenue data
export function generateRevenueData(days: number): ChartDataPoint[] {
  const data: ChartDataPoint[] = []
  const now = new Date()
  const baseRevenue = 5000
  
  for (const i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    // Add some realistic variance with trends
    const weekdayFactor = date.getDay() === 0 || date.getDay() === 6 ? 0.7 : 1.0
    const trendFactor = 1 + ((days - i) * 0.005) // Slight upward trend
    const randomFactor = 0.8 + Math.random() * 0.4 // ±20% variance
    
    const revenue = Math.round(baseRevenue * weekdayFactor * trendFactor * randomFactor)
    
    data.push({
      time: Math.floor(date.getTime() / 1000),
      value: revenue,
      color: i === 0 ? '#1C8BFF' : undefined // Highlight today
    })
  }
  
  return data
}