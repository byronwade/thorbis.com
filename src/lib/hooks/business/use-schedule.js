"use client"

import { useState, useEffect } from "react"

export function useSchedule({
  autoRefresh = false,
  refreshInterval = 60000,
  includeCompleted = true,
  upcomingDays = 7
} = {}) {
  const [schedule, setSchedule] = useState([])
  const [todaysJobs, setTodaysJobs] = useState([])
  const [upcomingJobs, setUpcomingJobs] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isReady, setIsReady] = useState(false)
  const [hasData, setHasData] = useState(false)

  // Mock data for today's stats
  const todaysStats = {
    total: 0,
    completed: 0,
    inProgress: 0,
    scheduled: 0,
    revenue: 0,
    hours: 0
  }

  // Mock data for schedule metrics
  const metrics = {
    totalJobs: 0,
    completedJobs: 0,
    completionRate: 0,
    averageJobDuration: 0,
    totalRevenue: 0,
    averageRevenue: 0
  }

  // Mock data for technicians
  const availableTechnicians = []
  const busyTechnicians = []

  // Mock data for other properties
  const todaysRevenue = 0
  const completionRate = 0
  const nextJob = null

  useEffect(() => {
    // Initialize with mock data to prevent errors
    initializeMockData()

    if (autoRefresh) {
      const interval = setInterval(() => {
        refresh()
      }, refreshInterval)

      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  const initializeMockData = () => {
    setIsLoading(false)
    setIsReady(true)
    setHasData(false) // No real data yet
    setLastUpdated(new Date())
  }

  const refresh = async () => {
    setIsRefreshing(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setLastUpdated(new Date())
    } catch (err) {
      setError(err.message)
    } finally {
      setIsRefreshing(false)
    }
  }

  const updateJobStatus = async (jobId, newStatus) => {
    // Mock implementation
    console.log(`Updating job ${jobId} to status ${newStatus}`)
    return true
  }

  return {
    // Main data
    schedule,
    todaysJobs,
    upcomingJobs,
    technicians,

    // Stats and metrics
    metrics,
    todaysStats,
    availableTechnicians,
    busyTechnicians,
    todaysRevenue,
    completionRate,
    nextJob,

    // State management
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    isReady,
    hasData,

    // Actions
    refresh,
    updateJobStatus,
    setSchedule
  }
}
