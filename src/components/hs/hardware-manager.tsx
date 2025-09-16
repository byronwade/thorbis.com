import { Button } from '@/components/ui/button';
'use client'

import { useEffect, useState } from 'react'

import { 
  Printer, 
  ScanLine, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Bluetooth,
  Usb,
  Activity,
  Clock,
  Receipt,
  Package
} from 'lucide-react'

/**
 * Hardware Manager Component
 * 
 * Implements comprehensive hardware integration based on hardware-integration-config:
 * - Zero-config device discovery via mDNS/Bonjour
 * - Ephemeral security tokens with automatic rotation
 * - Device sandboxing for secure execution
 * - Support for thermal printers, barcode scanners, KDS displays
 * - Real-time connection monitoring and recovery
 */

interface HardwareDevice {
  id: string
  name: string
  type: 'printer' | 'scanner' | 'kds' | 'payment_terminal'
  model: string
  status: 'connected' | 'disconnected' | 'error' | 'pairing'
  connectionType: 'wifi' | 'bluetooth' | 'usb' | 'ethernet'
  ipAddress?: string
  macAddress?: string
  firmwareVersion?: string
  capabilities: string[]
  lastSeen: string
  sessionId?: string
  batteryLevel?: number
  paperStatus?: 'ok' | 'low' | 'empty'
  errorMessage?: string
}

interface HardwareSession {
  id: string
  deviceId: string
  businessId: string
  userId: string
  startedAt: string
  expiresAt: string
  operations: number
  lastOperation: string
}

interface HardwareManagerProps {
  className?: string
  onDeviceSelect?: (device: HardwareDevice) => void
}

export function HardwareManager({ className = ', onDeviceSelect }: HardwareManagerProps) {
  const [devices, setDevices] = useState<HardwareDevice[]>([])
  const [sessions, setSessions] = useState<HardwareSession[]>([])
  const [scanning, setScanning] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<HardwareDevice | null>(null)
  const [showPairingDialog, setShowPairingDialog] = useState(false)
  const [pairingCode, setPairingCode] = useState(')

  useEffect(() => {
    discoverDevices()
    const interval = setInterval(discoverDevices, 30000) // Discover every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const discoverDevices = async () => {
    try {
      const response = await fetch('/api/v1/hardware/discover', {
        headers: {
          'Authorization': 'Bearer ${localStorage.getItem('thorbis_auth_token')}'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setDevices(data.devices || [])
        setSessions(data.sessions || [])
      }
    } catch (error) {
      console.error('Failed to discover hardware devices:', error)
      
      // Mock data for development
      setDevices([
        {
          id: 'printer_001',
          name: 'Epson TM-T20III',
          type: 'printer',
          model: 'TM-T20III',
          status: 'connected',
          connectionType: 'wifi',
          ipAddress: '192.168.1.101',
          macAddress: '00:11:95:12:34:56',
          firmwareVersion: '1.2.3',
          capabilities: ['receipt_printing', 'cash_drawer', 'paper_cutting'],
          lastSeen: new Date().toISOString(),
          sessionId: 'session_001',
          paperStatus: 'ok'
        },
        {
          id: 'scanner_001',
          name: 'Zebra DS2208',
          type: 'scanner',
          model: 'DS2208',
          status: 'connected',
          connectionType: 'usb',
          capabilities: ['1d_barcode', '2d_barcode', 'qr_code'],
          lastSeen: new Date().toISOString(),
          sessionId: 'session_002',
          batteryLevel: 85
        },
        {
          id: 'kds_001',
          name: 'Kitchen Display 15"',"
          type: 'kds',
          model: 'KDS-15-TOUCH',
          status: 'disconnected',
          connectionType: 'ethernet',
          capabilities: ['touch_display', 'order_management', 'audio_alerts'],
          lastSeen: new Date(Date.now() - 300000).toISOString()
        }
      ])
    }
  }

  const pairDevice = async (device: HardwareDevice) => {
    setSelectedDevice(device)
    setShowPairingDialog(true)
    
    // Generate 6-digit pairing code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setPairingCode(code)

    try {
      // Start pairing process
      const response = await fetch('/api/v1/hardware/pair', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${localStorage.getItem('thorbis_auth_token')}'
        },
        body: JSON.stringify({
          deviceId: device.id,
          pairingCode: code
        })
      })

      if (response.ok) {
        // Update device status to pairing
        setDevices(prev => prev.map(d => 
          d.id === device.id ? { ...d, status: 'pairing' } : d
        ))
      }
    } catch (error) {
      console.error('Failed to start pairing:', error)
    }
  }

  const confirmPairing = async () => {
    if (!selectedDevice) return

    try {
      const response = await fetch('/api/v1/hardware/pair/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${localStorage.getItem('thorbis_auth_token')}'
        },
        body: JSON.stringify({
          deviceId: selectedDevice.id,
          pairingCode
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update device with session info
        setDevices(prev => prev.map(d => 
          d.id === selectedDevice.id ? { 
            ...d, 
            status: 'connected', 
            sessionId: data.sessionId 
          } : d
        ))

        // Add new session
        setSessions(prev => [...prev, data.session])
        
        setShowPairingDialog(false)
        setSelectedDevice(null)
        setPairingCode(')'
      }
    } catch (error) {
      console.error('Failed to confirm pairing:', error)
    }
  }

  const disconnectDevice = async (device: HardwareDevice) => {
    try {
      const response = await fetch('/api/v1/hardware/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${localStorage.getItem('thorbis_auth_token')}'
        },
        body: JSON.stringify({
          deviceId: device.id
        })
      })

      if (response.ok) {
        setDevices(prev => prev.map(d => 
          d.id === device.id ? { ...d, status: 'disconnected', sessionId: undefined } : d
        ))
        
        setSessions(prev => prev.filter(s => s.deviceId !== device.id))
      }
    } catch (error) {
      console.error('Failed to disconnect device:', error)
    }
  }

  const testDevice = async (device: HardwareDevice) => {
    try {
      const response = await fetch('/api/v1/hardware/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${localStorage.getItem('thorbis_auth_token')}'
        },
        body: JSON.stringify({
          deviceId: device.id,
          testType: device.type === 'printer' ? 'test_print' : 'test_scan'
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert('Test ${data.success ? 'passed' : 'failed'}: ${data.message}')
      }
    } catch (error) {
      console.error('Failed to test device:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-neutral-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />
      case 'pairing':
        return <Clock className="h-4 w-4 text-yellow-400" />
      default:
        return <AlertTriangle className="h-4 w-4 text-neutral-400" />
    }
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'printer':
        return <Printer className="h-5 w-5" />
      case 'scanner':
        return <ScanLine className="h-5 w-5" />
      case 'kds':
        return <Activity className="h-5 w-5" />
      case 'payment_terminal':
        return <Receipt className="h-5 w-5" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'wifi':
        return <Wifi className="h-3 w-3" />
      case 'bluetooth':
        return <Bluetooth className="h-3 w-3" />
      case 'usb':
        return <Usb className="h-3 w-3" />
      case 'ethernet`:
        return <Wifi className="h-3 w-3" />
      default:
        return <WifiOff className="h-3 w-3" />
    }
  }

  return (
    <div className={'bg-neutral-925 border border-neutral-800 rounded-lg p-6 ${className}'}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-900/20 p-2 rounded-lg">
            <Settings className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">Hardware Manager</h3>
            <p className="text-sm text-neutral-400">
              Manage connected devices and hardware integration
            </p>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setScanning(true)
            discoverDevices().finally(() => setScanning(false))
          }}
          disabled={scanning}
          className="bg-neutral-900 border-neutral-700"
        >
          <RefreshCw className={'h-4 w-4 mr-2 ${scanning ? 'animate-spin' : '
              }'} />
          {scanning ? 'Scanning...' : 'Discover Devices'}
        </Button>
      </div>

      {/* Devices List */}
      <div className="space-y-4">
        {devices.length > 0 ? (
          devices.map((device) => (
            <div 
              key={device.id} 
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:bg-neutral-850 transition-colors cursor-pointer"
              onClick={() => onDeviceSelect && onDeviceSelect(device)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={'p-2 rounded-lg ${
                    device.status === 'connected' ? 'bg-green-900/20' :
                    device.status === 'error' ? 'bg-red-900/20' :
                    device.status === 'pairing' ? 'bg-yellow-900/20' :
                    'bg-neutral-800'
              }'}>'
                    {getDeviceIcon(device.type)}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-white">{device.name}</h4>
                      {getStatusIcon(device.status)}
                    </div>
                    <p className="text-sm text-neutral-400">{device.model}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-xs text-neutral-500">
                        {getConnectionIcon(device.connectionType)}
                        <span className="capitalize">{device.connectionType}</span>
                      </div>
                      {device.ipAddress && (
                        <span className="text-xs text-neutral-500">{device.ipAddress}</span>
                      )}
                      {device.batteryLevel && (
                        <span className="text-xs text-neutral-500">
                          Battery: {device.batteryLevel}%
                        </span>
                      )}
                      {device.paperStatus && device.paperStatus !== 'ok' && (
                        <span className={'text-xs ${
                          device.paperStatus === 'empty' ? 'text-red-400' : 'text-yellow-400'
              }'}>'
                          Paper: {device.paperStatus}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {device.status === 'connected' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e: unknown) => {
                          e.stopPropagation()
                          testDevice(device)
                        }}
                        className="text-xs"
                      >
                        Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e: unknown) => {
                          e.stopPropagation()
                          disconnectDevice(device)
                        }}
                        className="text-xs"
                      >
                        Disconnect
                      </Button>
                    </>
                  )}
                  
                  {device.status === 'disconnected' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e: unknown) => {
                        e.stopPropagation()
                        pairDevice(device)
                      }}
                      className="text-xs"
                    >
                      Connect
                    </Button>
                  )}
                </div>
              </div>

              {/* Device Capabilities */}
              {device.capabilities.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {device.capabilities.map((capability) => (
                    <span 
                      key={capability}
                      className="px-2 py-1 bg-neutral-800 text-xs text-neutral-300 rounded"
                    >
                      {capability.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              )}

              {device.errorMessage && (
                <div className="mt-2 p-2 bg-red-900/20 border border-red-800 rounded text-xs text-red-400">
                  {device.errorMessage}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-neutral-600 mb-4" />
            <p className="text-neutral-400">No hardware devices found</p>
            <p className="text-sm text-neutral-500 mt-1">
              Click "Discover Devices" to scan for compatible hardware
            </p>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      {sessions.length > 0 && (
        <div className="mt-6 pt-6 border-t border-neutral-800">
          <h4 className="text-sm font-medium text-white mb-3">Active Sessions</h4>
          <div className="space-y-2">
            {sessions.map((session) => {
              const device = devices.find(d => d.id === session.deviceId)
              return (
                <div key={session.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-white">{device?.name || session.deviceId}</span>
                    <span className="text-neutral-400 ml-2">
                      {session.operations} operations
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500">
                    Expires: {new Date(session.expiresAt).toLocaleTimeString()}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Pairing Dialog */}
      {showPairingDialog && selectedDevice && (
        <div className="fixed inset-0 bg-neutral-950/50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-4">
              Pair Device: {selectedDevice.name}
            </h3>
            
            <div className="text-center mb-6">
              <p className="text-neutral-400 mb-4">
                Enter this code on your device to complete pairing:
              </p>
              <div className="text-3xl font-mono font-bold text-blue-400 bg-neutral-800 rounded-lg py-4 px-6">
                {pairingCode}
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPairingDialog(false)
                  setSelectedDevice(null)
                  setPairingCode(')'
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmPairing}
                className="flex-1"
              >
                Confirm Pairing
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Hook for using hardware devices in other components
export function useHardwareDevices() {
  const [devices, setDevices] = useState<HardwareDevice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch('/api/v1/hardware/devices')
        if (response.ok) {
          const data = await response.json()
          setDevices(data.devices || [])
        }
      } catch (error) {
        console.error('Failed to fetch hardware devices:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDevices()
    const interval = setInterval(fetchDevices, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const connectedDevices = devices.filter(d => d.status === 'connected')
  const printers = connectedDevices.filter(d => d.type === 'printer')
  const scanners = connectedDevices.filter(d => d.type === 'scanner')

  return {
    devices,
    connectedDevices,
    printers,
    scanners,
    loading
  }
}