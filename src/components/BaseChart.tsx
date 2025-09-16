'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { createChart, IChartApi, DeepPartial, ChartOptions, ColorType } from 'lightweight-charts'
import { BaseChartComponentProps } from '@/types/charts'

export function BaseChart({
  data,
  config,
  className = ',
  loading = false,
  error = null,
  onChartReady
}: BaseChartComponentProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Chart options for dark theme (Thorbis design)
  const getChartOptions = useCallback((): DeepPartial<ChartOptions> => ({
    layout: {
      background: { type: ColorType.Solid, color: 'transparent' },
      textColor: '#A1A1A1', // neutral-400
      fontSize: 12,
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    grid: {
      vertLines: { color: '#1F1F1F', style: 1, visible: true }, // neutral-800
      horzLines: { color: '#1F1F1F', style: 1, visible: true }
    },
    crosshair: {
      mode: config.showCrosshair ? 1 : 0,
      vertLine: {
        width: 1,
        color: '#1C8BFF40', // blue-500 with opacity
        style: 1
      },
      horzLine: {
        width: 1,
        color: '#1C8BFF40',
        style: 1
      }
    },
    timeScale: {
      borderVisible: false,
      timeVisible: true,
      secondsVisible: false,
      tickMarkFormatter: (time: number) => {
        const date = new Date(time * 1000)
        if (config.timeframe === 'day') {
          return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
          })
        } else if (config.timeframe === 'week') {
          return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })
        } else {
          return date.toLocaleDateString('en-US', { 
            month: 'short', 
            year: '2-digit' 
          })
        }
      }
    },
    rightPriceScale: {
      borderVisible: false,
      scaleMargins: {
        top: 0.1,
        bottom: 0.1
      }
    },
    handleScroll: {
      mouseWheel: config.enableZoom || false,
      pressedMouseMove: true,
      horzTouchDrag: true,
      vertTouchDrag: true
    },
    handleScale: {
      axisPressedMouseMove: config.enableZoom || false,
      mouseWheel: config.enableZoom || false,
      pinch: config.enableZoom || false
    }
  }), [config])

  // Initialize chart
  const initChart = useCallback(() => {
    if (!chartContainerRef.current || chartRef.current) return

    try {
      const chart = createChart(chartContainerRef.current, {
        ...getChartOptions(),
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight
      })

      chartRef.current = chart
      setIsInitialized(true)

      if (onChartReady) {
        onChartReady(chart)
      }

      // Handle resize
      const handleResize = () => {
        if (chartRef.current && chartContainerRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight
          })
        }
      }

      const resizeObserver = new ResizeObserver(handleResize)
      resizeObserver.observe(chartContainerRef.current)

      return () => {
        resizeObserver.disconnect()
      }
    } catch (error) {
      console.error('Failed to initialize chart:', error)
    }
  }, [getChartOptions, onChartReady])

  // Cleanup chart
  const cleanupChart = useCallback(() => {
    if (chartRef.current) {
      try {
        chartRef.current.remove()
      } catch (error) {
        console.error('Error cleaning up chart:', error)
      } finally {
        chartRef.current = null
        setIsInitialized(false)
      }
    }
  }, [])

  // Initialize chart on mount
  useEffect(() => {
    if (chartContainerRef.current && !loading && !error) {
      const cleanup = initChart()
      return cleanup
    }
  }, [initChart, loading, error])

  // Update chart options when config changes
  useEffect(() => {
    if (chartRef.current && isInitialized) {
      try {
        chartRef.current.applyOptions(getChartOptions())
      } catch (error) {
        console.error('Error updating chart options:', error)
      }
    }
  }, [getChartOptions, isInitialized])

  // Cleanup on unmount
  useEffect(() => {
    return cleanupChart
  }, [cleanupChart])

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-925 rounded-lg border border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-sm text-neutral-400">Loading chart...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`relative ${className}'}>
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-925 rounded-lg border border-neutral-800">
          <div className="text-center">
            <div className="text-red-400 text-sm mb-2">Failed to load chart</div>
            <div className="text-xs text-neutral-500">{error}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={'bg-neutral-925 rounded-lg border border-neutral-800 ${className}'}>
      <div
        ref={chartContainerRef}
        className="w-full h-full rounded-lg"
        style={{ minHeight: '200px' }}
      />
    </div>
  )
}