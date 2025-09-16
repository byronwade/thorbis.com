'use client'

import { useState, useEffect } from 'react'
import { 
  Activity, 
  AlertTriangle, 
  Bell, 
  BellOff,
  CheckCircle,
  XCircle,
  Zap,
  TrendingUp,
  TrendingDown,
  Wifi,
  Battery,
  Thermometer,
  Shield,
  Clock,
  Settings,
  Eye,
  Filter
} from 'lucide-react'

// Generate mock monitoring data
const generateMonitoringData = () => {
  const deviceTypes = ['Thermostat', 'Camera', 'Lock', 'Sensor', 'Router', 'Terminal']
  const alertTypes = ['Temperature High', 'Low Battery', 'Connection Lost', 'Security Breach', 'Maintenance Due', 'Firmware Update']
  const severities = ['Critical', 'High', 'Medium', 'Low']

  // Generate real-time alerts
  const alerts = Array.from({ length: 15 }, (_, i) => ({
    id: `alert-${i + 1}`,
    deviceName: `${deviceTypes[Math.floor(Math.random() * deviceTypes.length)]} ${i + 1}`,
    type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
    severity: severities[Math.floor(Math.random() * severities.length)],
    message: `Alert triggered on device due to ${alertTypes[Math.floor(Math.random() * alertTypes.length)].toLowerCase()}`,
    timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Random time in last 24h
    acknowledged: Math.random() > 0.7,
    resolved: Math.random() > 0.8
  }))

  // Generate performance metrics
  const performanceData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    uptime: Math.random() * 100,
    responseTime: Math.random() * 500,
    throughput: Math.random() * 100,
    errorRate: Math.random() * 10
  }))

  // Generate device health data
  const deviceHealth = Array.from({ length: 8 }, (_, i) => ({
    id: `device-${i + 1}',
    name: '${deviceTypes[Math.floor(Math.random() * deviceTypes.length)]} ${i + 1}',
    status: Math.random() > 0.2 ? 'Healthy' : Math.random() > 0.5 ? 'Warning' : 'Critical',
    uptime: Math.random() * 100,
    lastCheck: new Date(Date.now() - Math.random() * 60 * 60 * 1000), // Random time in last hour
    metrics: {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      network: Math.random() * 100,
      temperature: Math.random() * 40 + 20 // 20-60°C
    }
  }))

  return { alerts, performanceData, deviceHealth }
}

export function DeviceMonitoring() {
  const [data, setData] = useState<unknown>({ alerts: [], performanceData: [], deviceHealth: [] })
  const [loading, setLoading] = useState(true)
  const [alertFilter, setAlertFilter] = useState('all')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')

  useEffect(() => {
    const loadData = () => {
      setData(generateMonitoringData())
      setLoading(false)
    }

    loadData()

    // Auto-refresh every 30 seconds if enabled
    const interval = autoRefresh ? setInterval(loadData, 30000) : null

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'text-red-400 bg-red-400/10 border-red-400/20'
      case 'High':
        return 'text-orange-400 bg-orange-400/10 border-orange-400/20'
      case 'Medium':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'Low':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      default:
        return 'text-neutral-400 bg-neutral-400/10 border-neutral-400/20'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy':
        return 'text-green-400'
      case 'Warning':
        return 'text-yellow-400'
      case 'Critical':
        return 'text-red-400'
      default:
        return 'text-neutral-400'
    }
  }

  const filteredAlerts = data.alerts.filter((alert: unknown) => {
    if (alertFilter === 'all') return true
    if (alertFilter === 'unresolved') return !alert.resolved
    if (alertFilter === 'critical') return alert.severity === 'Critical'
    return alert.severity.toLowerCase() === alertFilter
  })

  const criticalAlerts = data.alerts.filter((alert: unknown) => alert.severity === 'Critical' && !alert.resolved).length
  const unacknowledgedAlerts = data.alerts.filter((alert: unknown) => !alert.acknowledged).length

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="h-6 bg-neutral-800 rounded mb-4 animate-pulse" />
          <div className="h-48 bg-neutral-800 rounded animate-pulse" />
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="h-6 bg-neutral-800 rounded mb-4 animate-pulse" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 bg-neutral-800 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Monitoring Controls */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-xl font-bold text-white">Device Monitoring</h2>
            <p className="text-neutral-400 mt-1">Real-time device status and performance metrics</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={'p-2 rounded-lg transition-colors ${
                  autoRefresh 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }'}'
              >
                {autoRefresh ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              </button>
              <span className="text-sm text-neutral-400">
                Auto-refresh: {autoRefresh ? 'On' : 'Off'}
              </span>
            </div>

            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Critical Alerts</p>
              <p className="text-2xl font-bold text-red-400">{criticalAlerts}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
        </div>
        
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Unacknowledged</p>
              <p className="text-2xl font-bold text-yellow-400">{unacknowledgedAlerts}</p>
            </div>
            <Bell className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Healthy Devices</p>
              <p className="text-2xl font-bold text-green-400">
                {data.deviceHealth.filter((d: unknown) => d.status === 'Healthy`).length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Avg Uptime</p>
              <p className="text-2xl font-bold text-blue-400">
                {(data.deviceHealth.reduce((sum: number, d: unknown) => sum + d.uptime, 0) / data.deviceHealth.length).toFixed(1)}%
              </p>
            </div>
            <Activity className="h-8 w-8 text-blue-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Alerts */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
          <div className="p-6 border-b border-neutral-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Recent Alerts</h3>
              <div className="flex items-center space-x-2">
                <select
                  value={alertFilter}
                  onChange={(e) => setAlertFilter(e.target.value)}
                  className="px-3 py-1 bg-neutral-800 border border-neutral-700 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">All Alerts</option>
                  <option value="unresolved">Unresolved</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <Filter className="h-4 w-4 text-neutral-400" />
              </div>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {filteredAlerts.map((alert: unknown) => (
              <div key={alert.id} className="p-4 border-b border-neutral-800 last:border-b-0 hover:bg-neutral-800/50">
                <div className="flex items-start justify-between space-x-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}'}>
                        {alert.severity}
                      </span>
                      <span className="text-sm text-white font-medium">{alert.deviceName}</span>
                      {alert.resolved && (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      )}
                    </div>
                    <p className="text-sm text-neutral-300">{alert.message}</p>
                    <p className="text-xs text-neutral-400 mt-1">
                      {alert.timestamp.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!alert.acknowledged && (
                      <button className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white">
                        <Bell className="h-4 w-4" />
                      </button>
                    )}
                    <button className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white">
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredAlerts.length === 0 && (
              <div className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-white font-medium">No alerts match your filter</p>
                <p className="text-neutral-400 text-sm">All systems are running smoothly</p>
              </div>
            )}
          </div>
        </div>

        {/* Device Health Status */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
          <div className="p-6 border-b border-neutral-800">
            <h3 className="text-lg font-medium text-white">Device Health</h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {data.deviceHealth.map((device: unknown) => (
              <div key={device.id} className="p-4 border-b border-neutral-800 last:border-b-0">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-white">{device.name}</p>
                    <p className="text-xs text-neutral-400">
                      Last checked: {device.lastCheck.toLocaleTimeString()}
                    </p>
                  </div>
                  <div className={'flex items-center space-x-1 ${getStatusColor(device.status)}'}>
                    {device.status === 'Healthy' && <CheckCircle className="h-4 w-4" />}
                    {device.status === 'Warning' && <AlertTriangle className="h-4 w-4" />}
                    {device.status === 'Critical' && <XCircle className="h-4 w-4" />}
                    <span className="text-sm font-medium">{device.status}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-neutral-400">CPU Usage</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-neutral-800 rounded-full h-2">
                        <div 
                          className={'h-2 rounded-full ${device.metrics.cpu > 80 ? 'bg-red-400' : device.metrics.cpu > 60 ? 'bg-yellow-400' : 'bg-green-400'
              }`}`
                          style={{ width: '${device.metrics.cpu}%' }}
                        />
                      </div>
                      <span className="text-white">{Math.round(device.metrics.cpu)}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-neutral-400">Memory</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-neutral-800 rounded-full h-2">
                        <div 
                          className={'h-2 rounded-full ${device.metrics.memory > 80 ? 'bg-red-400' : device.metrics.memory > 60 ? 'bg-yellow-400' : 'bg-blue-400'
              }`}'
                          style={{ width: '${device.metrics.memory}%' }}
                        />
                      </div>
                      <span className="text-white">{Math.round(device.metrics.memory)}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-neutral-400">Network</p>
                    <div className="flex items-center space-x-2">
                      <Wifi className="h-3 w-3 text-cyan-400" />
                      <span className="text-white">{Math.round(device.metrics.network)}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-neutral-400">Temperature</p>
                    <div className="flex items-center space-x-2">
                      <Thermometer className="h-3 w-3 text-orange-400" />
                      <span className="text-white">{Math.round(device.metrics.temperature)}°C</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Performance Trends</h3>
        <div className="h-48 bg-neutral-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="h-8 w-8 text-neutral-600 mx-auto mb-2" />
            <p className="text-neutral-400">Performance chart visualization</p>
            <p className="text-sm text-neutral-500">Chart component integration pending</p>
          </div>
        </div>
      </div>
    </div>
  )
}