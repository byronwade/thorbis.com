'use client'

import React from 'react'
import { WelcomeHeaderProps } from '@/types/charts'
import { Button } from '@/components/ui/button'
import { 
  Wifi, 
  WifiOff, 
  Printer, 
  Monitor, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Zap,
  Plus
} from 'lucide-react'

export function WelcomeHeader({ 
  user, 
  systemStatus, 
  onNewWorkOrder 
}: WelcomeHeaderProps) {
  
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0]
  }

  const getStatusIcon = (connected: boolean) => {
    return connected ? (
      <CheckCircle className="w-3 h-3 text-green-400" />
    ) : (
      <AlertTriangle className="w-3 h-3 text-red-400" />
    )
  }

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.round((current / limit) * 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-400'
    if (percentage >= 75) return 'text-yellow-400'
    return 'text-green-400'
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-medium text-white mb-2">
            {getGreeting()}, {user ? getFirstName(user.name) : 'User'}
          </h1>
          <div className="flex items-center gap-4 text-sm text-neutral-400">
            <span>
              {user ? '${user.company} • ${user.role}' : 'Home Services Dashboard'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>

        {/* Quick Action Button */}
        {onNewWorkOrder && (
          <Button 
            onClick={onNewWorkOrder}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Work Order
          </Button>
        )}
      </div>

      {/* System Status Bar */}
      {systemStatus && (
        <div className="bg-neutral-925 border border-neutral-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            {/* Connection Status */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                {systemStatus.isOnline ? (
                  <Wifi className="w-4 h-4 text-green-400" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-400" />
                )}
                <span className="text-sm text-neutral-300">
                  {systemStatus.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              {/* Hardware Status */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-neutral-400" />
                  {getStatusIcon(systemStatus.hardwareConnected.printer)}
                </div>
                <div className="flex items-center gap-1.5">
                  <Monitor className="w-4 h-4 text-neutral-400" />
                  {getStatusIcon(systemStatus.hardwareConnected.scanner)}
                </div>
              </div>

              {/* AI Safety Status */}
              <div className="flex items-center gap-2">
                <div className={'w-2 h-2 rounded-full ${
                  systemStatus.aiSafetyStatus === 'safe' ? 'bg-green-400' :
                  systemStatus.aiSafetyStatus === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                }'} />
                <span className="text-sm text-neutral-300">
                  AI {systemStatus.aiSafetyStatus}
                </span>
              </div>
            </div>

            {/* Usage Limits */}
            <div className="flex items-center gap-6">
              {/* API Calls */}
              <div className="text-xs">
                <div className="flex items-center gap-1 mb-1">
                  <Zap className="w-3 h-3 text-neutral-500" />
                  <span className="text-neutral-400">API</span>
                </div>
                <div className={getUsageColor(getUsagePercentage(
                  systemStatus.usageLimits.apiCalls.current,
                  systemStatus.usageLimits.apiCalls.limit
                ))}>
                  {systemStatus.usageLimits.apiCalls.current}/{systemStatus.usageLimits.apiCalls.limit}
                </div>
              </div>

              {/* Work Orders */}
              <div className="text-xs">
                <div className="flex items-center gap-1 mb-1">
                  <CheckCircle className="w-3 h-3 text-neutral-500" />
                  <span className="text-neutral-400">WOs</span>
                </div>
                <div className={getUsageColor(getUsagePercentage(
                  systemStatus.usageLimits.workOrders.current,
                  systemStatus.usageLimits.workOrders.limit
                ))}>
                  {systemStatus.usageLimits.workOrders.current}/{systemStatus.usageLimits.workOrders.limit}
                </div>
              </div>

              {/* Storage */}
              <div className="text-xs">
                <div className="flex items-center gap-1 mb-1">
                  <Monitor className="w-3 h-3 text-neutral-500" />
                  <span className="text-neutral-400">Storage</span>
                </div>
                <div className={getUsageColor(getUsagePercentage(
                  systemStatus.usageLimits.storage.current,
                  systemStatus.usageLimits.storage.limit
                ))}>
                  {systemStatus.usageLimits.storage.current}GB/{systemStatus.usageLimits.storage.limit}GB
                </div>
              </div>
            </div>
          </div>

          {/* Last Sync */}
          <div className="mt-3 pt-3 border-t border-neutral-800">
            <div className="text-xs text-neutral-500">
              Last sync: {new Date(systemStatus.lastSync).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}