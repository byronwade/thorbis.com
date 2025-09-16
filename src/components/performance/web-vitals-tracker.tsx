'use client'

import { useEffect } from 'react'
import { webVitalsTracking } from '@/lib/web-vitals-tracking'

interface WebVitalsTrackerProps {
  userId?: string
  enableDebugLogging?: boolean
}

export default function WebVitalsTracker({ userId, enableDebugLogging }: WebVitalsTrackerProps = {}) {
  useEffect(() => {
    // Set user ID if provided
    if (userId) {
      webVitalsTracking.setUserId(userId)
    }

    // Update configuration
    if (enableDebugLogging !== undefined) {
      webVitalsTracking.updateConfig({ 
        enableDebugLogging: enableDebugLogging || process.env.NODE_ENV === 'development' 
      })
    }

    // Retry any failed reports when component mounts
    webVitalsTracking.retryFailedReports()

    // Set up online event listener to retry failed reports
    const handleOnline = () => {
      webVitalsTracking.retryFailedReports()
    }

    window.addEventListener('online', handleOnline)

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
    }
  }, [userId, enableDebugLogging])

  // Don't render anything - this is just for tracking
  return null
}

// Export Web Vitals utilities
export { webVitalsTracking }