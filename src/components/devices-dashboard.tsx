'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Smartphone, 
  Wifi, 
  Thermometer, 
  Camera, 
  Shield, 
  Zap, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  TrendingUp,
  MapPin,
  Battery
} from 'lucide-react'

// Mock device data generator
const generateDeviceData = () => {
  const deviceTypes = [
    { type: 'Smart Thermostat', icon: Thermometer, color: 'text-blue-400', industry: 'All' },
    { type: 'Security Camera', icon: Camera, color: 'text-green-400', industry: 'All' },
    { type: 'Smart Lock', icon: Shield, color: 'text-purple-400', industry: 'All' },
    { type: 'POS Terminal', icon: Smartphone, color: 'text-orange-400', industry: 'Retail/Restaurant' },
    { type: 'WiFi Access Point', icon: Wifi, color: 'text-cyan-400', industry: 'All' },
    { type: 'Smart Sensor', icon: Activity, color: 'text-pink-400', industry: 'All' },
    { type: 'Garage Door Controller', icon: Zap, color: 'text-yellow-400', industry: 'Home Services' },
    { type: 'Vehicle Tracker', icon: MapPin, color: 'text-red-400', industry: 'Auto/Fleet' }
  ]

  const statuses = ['Online', 'Offline', 'Warning', 'Maintenance']
  const locations = ['Building A', 'Building B', 'Mobile Unit', 'Service Van 1', 'Service Van 2', 'Main Office', 'Storage']
  
  return Array.from({ length: 24 }, (_, i) => {
    const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const batteryLevel = Math.floor(Math.random() * 100)
    
    return {
      id: `device-${i + 1}',
      name: '${deviceType.type} ${i + 1}',
      type: deviceType.type,
      icon: deviceType.icon,
      color: deviceType.color,
      industry: deviceType.industry,
      status: status,
      location: locations[Math.floor(Math.random() * locations.length)],
      batteryLevel: batteryLevel,
      lastSeen: new Date(Date.now() - Math.random() * 86400000), // Random time in last 24h
      uptime: Math.floor(Math.random() * 100),
      temperature: deviceType.type.includes('Thermostat') ? Math.floor(Math.random() * 30) + 65 : null,
      signalStrength: Math.floor(Math.random() * 100)
    }
  })
}

export function DevicesDashboard() {
  const [devices, setDevices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDevices(generateDeviceData())
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Online':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'Offline':
        return <XCircle className="h-4 w-4 text-red-400" />
      case 'Warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />
      case 'Maintenance':
        return <Clock className="h-4 w-4 text-blue-400" />
      default:
        return <Clock className="h-4 w-4 text-neutral-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Online':
        return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'Offline':
        return 'text-red-400 bg-red-400/10 border-red-400/20'
      case 'Warning':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'Maintenance':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      default:
        return 'text-neutral-400 bg-neutral-400/10 border-neutral-400/20'
    }
  }

  const filteredDevices = filter === 'all' 
    ? devices 
    : devices.filter(device => device.status.toLowerCase() === filter)

  const deviceStats = {
    total: devices.length,
    online: devices.filter(d => d.status === 'Online').length,
    offline: devices.filter(d => d.status === 'Offline').length,
    warning: devices.filter(d => d.status === 'Warning').length,
    maintenance: devices.filter(d => d.status === 'Maintenance').length
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-neutral-800 rounded mb-4" />
              <div className="h-8 bg-neutral-800 rounded mb-2" />
              <div className="h-3 bg-neutral-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Total Devices</p>
              <p className="text-2xl font-bold text-white">{deviceStats.total}</p>
            </div>
            <div className="h-12 w-12 bg-neutral-800 rounded-lg flex items-center justify-center">
              <Smartphone className="h-6 w-6 text-neutral-400" />
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Online</p>
              <p className="text-2xl font-bold text-green-400">{deviceStats.online}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Offline</p>
              <p className="text-2xl font-bold text-red-400">{deviceStats.offline}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Warning</p>
              <p className="text-2xl font-bold text-yellow-400">{deviceStats.warning}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Maintenance</p>
              <p className="text-2xl font-bold text-blue-400">{deviceStats.maintenance}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link 
          href="/dashboards/devices/inventory"
          className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-lg p-4 transition-colors group"
        >
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-white group-hover:text-blue-400 transition-colors">Device Inventory</p>
              <p className="text-sm text-neutral-400">Manage device catalog</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/dashboards/devices/monitoring"
          className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-lg p-4 transition-colors group"
        >
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="font-medium text-white group-hover:text-green-400 transition-colors">Monitoring & Alerts</p>
              <p className="text-sm text-neutral-400">Real-time device status</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/dashboards/devices/automation"
          className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-lg p-4 transition-colors group"
        >
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="font-medium text-white group-hover:text-purple-400 transition-colors">Automation Rules</p>
              <p className="text-sm text-neutral-400">Configure smart behaviors</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/dashboards/devices/settings"
          className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-lg p-4 transition-colors group"
        >
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <Settings className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="font-medium text-white group-hover:text-orange-400 transition-colors">Device Settings</p>
              <p className="text-sm text-neutral-400">System configuration</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Filter Controls */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setFilter('all')}
          className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all' 
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
              : 'bg-neutral-800 text-neutral-400 hover:text-white border border-transparent'
              }'}
        >
          All Devices
        </button>
        <button
          onClick={() => setFilter('online')}
          className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'online' 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-neutral-800 text-neutral-400 hover:text-white border border-transparent'
              }'}
        >
          Online
        </button>
        <button
          onClick={() => setFilter('offline')}
          className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'offline' 
              ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
              : 'bg-neutral-800 text-neutral-400 hover:text-white border border-transparent'
              }'}
        >
          Offline
        </button>
        <button
          onClick={() => setFilter('warning')}
          className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'warning' 
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
              : 'bg-neutral-800 text-neutral-400 hover:text-white border border-transparent`
              }`}
        >
          Warnings
        </button>
      </div>

      {/* Device Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDevices.map((device) => {
          const Icon = device.icon
          return (
            <div key={device.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-4">
              {/* Device Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                    <Icon className={`h-5 w-5 ${device.color}`} />
                  </div>
                  <div>
                    <p className="font-medium text-white truncate">{device.name}</p>
                    <p className="text-sm text-neutral-400">{device.type}</p>
                  </div>
                </div>
                <div className={'px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(device.status)}'}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(device.status)}
                    <span>{device.status}</span>
                  </div>
                </div>
              </div>

              {/* Device Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400">Location:</span>
                  <span className="text-white">{device.location}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400">Signal:</span>
                  <span className="text-white">{device.signalStrength}%</span>
                </div>
                {device.batteryLevel !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400 flex items-center space-x-1">
                      <Battery className="h-3 w-3" />
                      <span>Battery:</span>
                    </span>
                    <span className={'${
                      device.batteryLevel > 50 ? 'text-green-400' : 
                      device.batteryLevel > 20 ? 'text-yellow-400' : 'text-red-400'
              }'}>'
                      {device.batteryLevel}%
                    </span>
                  </div>
                )}
                {device.temperature && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400">Temperature:</span>
                    <span className="text-white">{device.temperature}°F</span>
                  </div>
                )}
              </div>

              {/* Last Seen */}
              <div className="pt-2 border-t border-neutral-800">
                <p className="text-xs text-neutral-400">
                  Last seen: {device.lastSeen.toLocaleString()}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {filteredDevices.length === 0 && (
        <div className="text-center py-12">
          <Smartphone className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No devices found</h3>
          <p className="text-neutral-400">No devices match the selected filter criteria.</p>
        </div>
      )}
    </div>
  )
}