'use client'

import React, { useEffect, useRef } from 'react'
import { IChartApi, ISeriesApi, LineSeriesPartialOptions } from 'lightweight-charts'
import { BaseChart } from './BaseChart'
import { MetricsChartProps, MetricsDataPoint } from '@/types/charts'

export function MetricsChart({
  data,
  config,
  metrics = ['Metric 1'],
  compareMode = false,
  className = ',
  loading = false,
  error = null
}: MetricsChartProps) {
  const lineSeriesRefs = useRef<ISeriesApi<"Line">[]>([])

  const getMetricColor = (index: number) => {
    const colors = [
      '#1C8BFF', // blue-500
      '#10B981', // green-500  
      '#F59E0B', // yellow-500
      '#EF4444', // red-500
      '#8B5CF6', // purple-500
      '#EC4899', // pink-500
      '#06B6D4', // cyan-500
      '#84CC16'  // lime-500
    ]
    return colors[index % colors.length]
  }

  const handleChartReady = (chart: IChartApi) => {
    try {
      // Clear any existing series
      lineSeriesRefs.current = []

      if (compareMode && metrics.length > 1) {
        // Create multiple line series for comparison
        metrics.forEach((metricName, index) => {
          const lineOptions: LineSeriesPartialOptions = {
            color: getMetricColor(index),
            lineWidth: 2,
            priceFormat: {
              type: 'price',
              precision: 1,
              minMove: 0.1
            },
            crosshairMarkerVisible: true,
            crosshairMarkerRadius: 4,
            crosshairMarkerBorderColor: getMetricColor(index),
            crosshairMarkerBackgroundColor: '#0F0F0F'
          }

          const lineSeries = chart.addLineSeries(lineOptions)
          lineSeriesRefs.current.push(lineSeries)
          
          // Set data for this metric (in a real implementation, 
          // you'd have separate data arrays for each metric)
          if (data && data.length > 0) {
            lineSeries.setData(data)
          }
        })
      } else {
        // Single line series
        const lineOptions: LineSeriesPartialOptions = {
          color: getMetricColor(0),
          lineWidth: 2,
          priceFormat: {
            type: 'price',
            precision: 1,
            minMove: 0.1
          },
          crosshairMarkerVisible: true,
          crosshairMarkerRadius: 4,
          crosshairMarkerBorderColor: getMetricColor(0),
          crosshairMarkerBackgroundColor: '#0F0F0F'
        }

        const lineSeries = chart.addLineSeries(lineOptions)
        lineSeriesRefs.current = [lineSeries]
        
        if (data && data.length > 0) {
          lineSeries.setData(data)
        }
      }

      // Fit content with some padding
      if (data && data.length > 0) {
        chart.timeScale().fitContent()
      }
    } catch (error) {
      console.error('Error setting up metrics chart:', error)
    }
  }

  // Update data when it changes
  useEffect(() => {
    if (lineSeriesRefs.current.length > 0 && data && data.length > 0) {
      try {
        if (compareMode && lineSeriesRefs.current.length > 1) {
          // In a real implementation, you'd have separate data for each metric
          // For now, we'll use the same data with slight variations
          lineSeriesRefs.current.forEach((series, index) => {
            const adjustedData = data.map(point => ({
              time: point.time,
              value: point.value * (1 + (index * 0.1)) // Slight variation for demo
            }))
            series.setData(adjustedData)
          })
        } else {
          // Single series
          lineSeriesRefs.current[0].setData(data)
        }
      } catch (error) {
        console.error('Error updating metrics chart data:', error)
      }
    }
  }, [data, compareMode, metrics])

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

// Utility function to generate sample metrics data
export function generateMetricsData(
  days: number, 
  metricNames: string[], 
  baseValue: number = 75
): MetricsDataPoint[] {
  const data: MetricsDataPoint[] = []
  const now = new Date()
  
  for (const i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    // Add improvement trend over time
    const improvementFactor = 1 + (days - i) * 0.002
    const randomFactor = 1 + (Math.random() - 0.5) * 0.1
    const value = Math.max(0, Math.min(baseValue * improvementFactor * randomFactor, 100))
    
    data.push({
      time: Math.floor(date.getTime() / 1000),
      value: Math.round(value * 10) / 10 // Round to 1 decimal
    })
  }
  
  return data
}