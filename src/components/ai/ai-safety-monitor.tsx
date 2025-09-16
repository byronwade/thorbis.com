'use client'

import { useEffect, useState } from 'react'
import { Shield, AlertTriangle, CheckCircle, Activity, Lock, Eye, Zap } from 'lucide-react'

/**
 * AI Safety Monitor Component
 * 
 * Implements comprehensive AI safety monitoring based on ai-safety documentation:
 * - Real-time safety status monitoring
 * - Malicious request detection and blocking
 * - Cross-tenant access prevention
 * - Financial transaction safety
 * - Audit trail logging
 * - Red team testing results display
 */

interface SafetyMetrics {
  maliciousBlockingRate: number
  crossTenantProtection: number
  financialTransactionSafety: number
  totalRequestsToday: number
  blockedRequestsToday: number
  lastSafetyCheck: string
  redTeamTestsPassed: number
  redTeamTestsTotal: number
}

interface SafetyEvent {
  id: string
  type: 'malicious_request' | 'cross_tenant_attempt' | 'financial_fraud' | 'data_validation_error'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  user_id?: string
  business_id: string
  endpoint: string
  blocked: boolean
  timestamp: string
  details: any
}

interface AISafetyMonitorProps {
  className?: string
  compact?: boolean
}

export function AISafetyMonitor({ className = ', compact = false }: AISafetyMonitorProps) {
  const [safetyMetrics, setSafetyMetrics] = useState<SafetyMetrics>({
    maliciousBlockingRate: 99.8,
    crossTenantProtection: 100,
    financialTransactionSafety: 100,
    totalRequestsToday: 2456,
    blockedRequestsToday: 12,
    lastSafetyCheck: new Date().toISOString(),
    redTeamTestsPassed: 58,
    redTeamTestsTotal: 60
  })

  const [recentEvents, setRecentEvents] = useState<SafetyEvent[]>([])
  const [systemStatus, setSystemStatus] = useState<'safe' | 'monitoring' | 'alert'>('safe')

  useEffect(() => {
    const fetchSafetyData = async () => {
      try {
        const response = await fetch('/api/security/ai-safety/metrics', {
          headers: {
            'Authorization': 'Bearer ${localStorage.getItem('thorbis_auth_token')}'
          }
        })

        if (response.ok) {
          const data = await response.json()
          setSafetyMetrics(data.metrics)
          setRecentEvents(data.recentEvents || [])
          
          // Determine system status based on metrics
          if (data.metrics.maliciousBlockingRate < 99.0 || data.metrics.crossTenantProtection < 100) {
            setSystemStatus('alert')
          } else if (data.metrics.blockedRequestsToday > 20) {
            setSystemStatus('monitoring')
          } else {
            setSystemStatus('safe')
          }
        }
      } catch (error) {
        console.error('Failed to fetch AI safety metrics:', error)
        setSystemStatus('alert')
      }
    }

    // Initial fetch
    fetchSafetyData()

    // Update every 30 seconds for real-time monitoring
    const interval = setInterval(fetchSafetyData, 30000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe':
        return 'text-green-400'
      case 'monitoring':
        return 'text-yellow-400'
      case 'alert':
        return 'text-red-400'
      default:
        return 'text-neutral-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe':
        return CheckCircle
      case 'monitoring':
        return Activity
      case 'alert':
        return AlertTriangle
      default:
        return Shield
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-400 bg-red-900/20 border-red-800'
      case 'high':
        return 'text-orange-400 bg-orange-900/20 border-orange-800'
      case 'medium':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-800'
      case 'low':
        return 'text-blue-400 bg-blue-900/20 border-blue-800'
      default:
        return 'text-neutral-400 bg-neutral-900/20 border-neutral-800`
    }
  }

  if (compact) {
    const StatusIcon = getStatusIcon(systemStatus)
    
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <StatusIcon className={`h-4 w-4 ${getStatusColor(systemStatus)}'} />
        <span className={'text-sm font-medium ${getStatusColor(systemStatus)}'}>
          AI Safety: {systemStatus === 'safe' ? 'Secure' : systemStatus === 'monitoring' ? 'Monitoring' : 'Alert`}
        </span>
        <span className="text-xs text-neutral-500">
          {safetyMetrics.maliciousBlockingRate}% blocking rate
        </span>
      </div>
    )
  }

  return (
    <div className={'bg-neutral-925 border border-neutral-800 rounded-lg p-6 ${className}'}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={'p-2 rounded-lg ${
            systemStatus === 'safe' ? 'bg-green-900/20' :
            systemStatus === 'monitoring' ? 'bg-yellow-900/20' :
            'bg-red-900/20`
              }`}>`
            <Shield className={`h-5 w-5 ${getStatusColor(systemStatus)}'} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">AI Safety Monitor</h3>
            <p className="text-sm text-neutral-400">
              Real-time protection against malicious AI usage
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className={'text-sm font-medium ${getStatusColor(systemStatus)}'}>
            {systemStatus === 'safe' ? 'System Secure' : 
             systemStatus === 'monitoring' ? 'Monitoring Threats' : 'Security Alert`}
          </div>
          <div className="text-xs text-neutral-500">
            Last check: {new Date(safetyMetrics.lastSafetyCheck).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Safety Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-400">Malicious Blocking</span>
            <Lock className="h-4 w-4 text-green-400" />
          </div>
          <div className="text-2xl font-semibold text-white mb-1">
            {safetyMetrics.maliciousBlockingRate.toFixed(1)}%
          </div>
          <div className="text-xs text-neutral-500">
            {safetyMetrics.blockedRequestsToday} blocked today
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-400">Tenant Protection</span>
            <Eye className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-semibold text-white mb-1">
            {safetyMetrics.crossTenantProtection.toFixed(0)}%
          </div>
          <div className="text-xs text-neutral-500">
            Zero cross-tenant breaches
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-400">Financial Safety</span>
            <Zap className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-semibold text-white mb-1">
            {safetyMetrics.financialTransactionSafety.toFixed(0)}%
          </div>
          <div className="text-xs text-neutral-500">
            All transactions protected
          </div>
        </div>
      </div>

      {/* Red Team Testing Results */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-white">Red Team Testing</h4>
          <span className="text-xs text-neutral-500">
            {safetyMetrics.redTeamTestsPassed}/{safetyMetrics.redTeamTestsTotal} tests passed
          </span>
        </div>
        
        <div className="w-full bg-neutral-800 rounded-full h-2 mb-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${(safetyMetrics.redTeamTestsPassed / safetyMetrics.redTeamTestsTotal) * 100}%' }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-neutral-500">
          <span>Attack vectors tested</span>
          <span>{((safetyMetrics.redTeamTestsPassed / safetyMetrics.redTeamTestsTotal) * 100).toFixed(1)}% success</span>
        </div>
      </div>

      {/* Recent Security Events */}
      <div>
        <h4 className="text-sm font-medium text-white mb-3">Recent Security Events</h4>
        
        {recentEvents.length > 0 ? (
          <div className="space-y-2">
            {recentEvents.slice(0, 5).map((event) => (
              <div 
                key={event.id} 
                className={'p-3 rounded-lg border ${getSeverityColor(event.severity)}'}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">
                    {event.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <div className="flex items-center gap-2">
                    {event.blocked ? (
                      <span className="text-xs text-green-400">BLOCKED</span>
                    ) : (
                      <span className="text-xs text-red-400">ALLOWED</span>
                    )}
                    <span className="text-xs text-neutral-500">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-neutral-400 mb-1">{event.description}</p>
                <div className="text-xs text-neutral-500">
                  Endpoint: {event.endpoint}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-neutral-500">
            <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent security events</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-neutral-800">
        <button 
          className="text-xs text-blue-400 hover:text-blue-300"
          onClick={() => window.open('/security/ai-safety/dashboard', '_blank')}
        >
          View Full Dashboard →
        </button>
        
        <div className="flex gap-2">
          <button className="text-xs text-neutral-400 hover:text-white px-2 py-1 rounded border border-neutral-700">
            Run Test
          </button>
          <button className="text-xs text-neutral-400 hover:text-white px-2 py-1 rounded border border-neutral-700">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook for using AI safety status in other components
export function useAISafetyStatus() {
  const [status, setStatus] = useState<'safe' | 'monitoring' | 'alert'>('safe')
  const [metrics, setMetrics] = useState<SafetyMetrics | null>(null)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/security/ai-safety/status')
        if (response.ok) {
          const data = await response.json()
          setStatus(data.status)
          setMetrics(data.metrics)
        }
      } catch (_error) {
        setStatus('alert')
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  return { status, metrics }
}