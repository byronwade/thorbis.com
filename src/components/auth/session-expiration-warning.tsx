'use client'

import { useState, useEffect } from 'react'
import { 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  LogOut,
  X 
} from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useAuth } from '../../contexts/auth-context'

export function SessionExpirationWarning() {
  const { session, refreshSession, logout, isSessionExpiring } = useAuth()
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (!session) return

    const updateTimeRemaining = () => {
      const expiresAt = new Date(session.expires_at)
      const now = new Date()
      const timeDiff = expiresAt.getTime() - now.getTime()
      const minutesRemaining = Math.floor(timeDiff / (1000 * 60))

      setTimeRemaining(minutesRemaining)
      
      // Show warning when 15 minutes or less remaining
      if (minutesRemaining <= 15 && minutesRemaining > 0) {
        setIsVisible(true)
      } else if (minutesRemaining <= 0) {
        // Session expired, logout
        logout()
      } else {
        setIsVisible(false)
      }
    }

    // Update immediately
    updateTimeRemaining()

    // Update every 30 seconds
    const interval = setInterval(updateTimeRemaining, 30000)
    return () => clearInterval(interval)
  }, [session, logout])

  const handleRefreshSession = async () => {
    setIsRefreshing(true)
    try {
      const success = await refreshSession()
      if (success) {
        setIsVisible(false)
      }
    } catch (error) {
      console.error('Failed to refresh session:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
  }

  const handleLogout = () => {
    logout()
  }

  if (!isVisible || !session) {
    return null
  }

  const urgencyLevel = timeRemaining <= 5 ? 'critical' : timeRemaining <= 10 ? 'high' : 'medium'

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card className={`border-l-4 ${
        urgencyLevel === 'critical' ? 'border-red-500 bg-red-500/10' :
        urgencyLevel === 'high' ? 'border-orange-500 bg-orange-500/10' :
        'border-yellow-500 bg-yellow-500/10'
      } backdrop-blur-sm`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className={'h-5 w-5 ${
                urgencyLevel === 'critical' ? 'text-red-400' :
                urgencyLevel === 'high' ? 'text-orange-400' :
                'text-yellow-400'
              }'} />
              <h3 className="font-medium text-white">Session Expiring</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300">
                Your session will expire in
              </span>
              <Badge variant="secondary" className={
                urgencyLevel === 'critical' ? 'bg-red-500/20 text-red-400' :
                urgencyLevel === 'high' ? 'bg-orange-500/20 text-orange-400' :
                'bg-yellow-500/20 text-yellow-400'
              }>
                {timeRemaining} minute{timeRemaining !== 1 ? 's' : '}
              </Badge>
            </div>

            <p className="text-xs text-gray-400">
              {urgencyLevel === 'critical' 
                ? 'Immediate action required to maintain access'
                : 'Click "Extend Session" to continue working'
              }
            </p>

            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={handleRefreshSession}
                disabled={isRefreshing}
                className="flex-1"
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                    Extending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Extend Session
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex-1"
              >
                <LogOut className="h-3 w-3 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {urgencyLevel === 'critical' && (
            <div className="mt-3 p-2 bg-red-500/20 border border-red-500/30 rounded text-center">
              <p className="text-xs text-red-300 font-medium">
                ⚠️ Auto-logout in {timeRemaining} minute{timeRemaining !== 1 ? 's' : '}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}