"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Progress } from "@components/ui/progress";
import {
  AlertTriangle,
  Activity,
  Wifi,
  Cpu,
  Network,
  Shield,
  Settings,
  Zap,
  BarChart3,
  Database,
  TrendingUp,
  RefreshCw,
  Play,
  Pause,
  Download,
  CheckCircle,
  XCircle,
  Signal
} from "lucide-react";
import { useToast } from "@hooks/use-toast";

// Import all device management components
import EnhancedDeviceList from "@components/dashboard/business/devices/enhanced-device-list";
import DeviceScanner from "@components/dashboard/business/devices/device-scanner";
import FirmwareManager from "@components/dashboard/business/devices/firmware-manager";
import NetworkConfig from "@components/dashboard/business/devices/network-config";
import RealTimeMonitor from "@components/dashboard/business/devices/real-time-monitor";
import DeviceConfigPanel from "@components/dashboard/business/devices/device-config-panel";

/**
 * Device Management Dashboard
 * Comprehensive device management for IoT devices, ESP32, Arduino, and network equipment
 */
export default function DeviceManagementPage() {
  const { toast } = useToast();
  const [devices, setDevices] = useState([
    // Add some mock devices for testing
    {
      id: 'mock-arduino-1',
      name: 'Arduino Uno',
      type: 'Arduino',
      model: 'Uno R3',
      connection: 'USB',
      status: 'connected',
      firmware: '1.8.19',
      ipAddress: null,
      macAddress: null,
      lastSeen: new Date().toISOString(),
      data: {
        temperature: 24.5,
        humidity: 45.2,
        uptime: 3600
      }
    },
    {
      id: 'mock-esp32-1',
      name: 'ESP32 DevKit',
      type: 'ESP32',
      model: 'ESP32-WROOM-32',
      connection: 'WiFi',
      status: 'online',
      firmware: '2.0.0',
      ipAddress: '192.168.1.100',
      macAddress: 'AA:BB:CC:DD:EE:FF',
      lastSeen: new Date().toISOString(),
      data: {
        temperature: 26.8,
        humidity: 52.1,
        uptime: 7200
      }
    }
  ]);
  const [connections, setConnections] = useState({});
  const [realTimeData, setRealTimeData] = useState({});
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [systemStats, setSystemStats] = useState({
    totalDevices: 0,
    onlineDevices: 0,
    activeConnections: 0,
    totalDataPoints: 0,
    uptime: 0,
    lastUpdate: null
  });
  const [autoDetectEnabled, setAutoDetectEnabled] = useState(true);

  useEffect(() => {
    // Initialize with empty device list - will be populated by scanning
    setDevices([]);
    updateSystemStats();
  }, []);

  const updateSystemStats = useCallback(() => {
    const onlineDevices = devices.filter(d => d.status === 'online' || d.status === 'connected').length;
    const activeConnections = Object.keys(connections).length;
    const totalDataPoints = Object.values(realTimeData).reduce((sum, device) =>
      sum + (device ? Object.keys(device).length : 0), 0
    );

    // Calculate average uptime if devices exist - use device.data.uptime instead of device.system.uptime
    const deviceUptimes = devices.map(d => d.data?.uptime || 0).filter(uptime => uptime > 0);
    const averageUptime = deviceUptimes.length > 0 ? deviceUptimes.reduce((sum, uptime) => sum + uptime, 0) / deviceUptimes.length : 0;

    setSystemStats(prev => {
      // Only update if values have changed to prevent unnecessary re-renders
      if (prev.totalDevices === devices.length && 
          prev.onlineDevices === onlineDevices && 
          prev.uptime === averageUptime) {
        return prev;
      }
      
      return {
        ...prev,
        totalDevices: devices.length,
        onlineDevices,
        activeConnections,
        totalDataPoints,
        uptime: averageUptime,
        lastUpdate: new Date().toISOString()
      };
    });
  }, [devices, connections, realTimeData]);

  const handleDataUpdate = (deviceId, data) => {
    setRealTimeData(prev => ({
      ...prev,
      [deviceId]: {
        ...prev[deviceId],
        ...data,
        timestamp: new Date()
      }
    }));
    updateSystemStats();
  };

  const handleConfigUpdate = (deviceId, config) => {
    console.log(`Configuration updated for ${deviceId}:`, config);
    toast({
      title: "Configuration Updated",
      description: `Device ${deviceId} configuration applied successfully`,
    });
    setShowConfigPanel(false);
  };

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    toast({
      title: isMonitoring ? "Monitoring Paused" : "Monitoring Started",
      description: isMonitoring
        ? "Real-time monitoring has been paused"
        : "Real-time monitoring has been started",
    });
  };



  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Advanced Device Management</h1>
          <p className="text-muted-foreground">
            Comprehensive IoT device management with real-time monitoring and configuration
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant={isMonitoring ? "destructive" : "default"}
            onClick={toggleMonitoring}
          >
            {isMonitoring ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause Monitoring
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Monitoring
              </>
            )}
          </Button>
          <Badge variant="outline" className="flex items-center space-x-1">
            <Activity className="h-3 w-3" />
            <span>{systemStats.onlineDevices}/{systemStats.totalDevices} Online</span>
          </Badge>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalDevices}</div>
            <p className="text-xs text-muted-foreground">
              {systemStats.onlineDevices} online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{systemStats.activeConnections}</div>
            <p className="text-xs text-muted-foreground">
              WebSocket connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Points</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{systemStats.totalDataPoints}</div>
            <p className="text-xs text-muted-foreground">
              Live data streams
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WiFi Devices</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {devices.filter(d => d.connection === 'WiFi').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Connected to network
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(systemStats.uptime / 3600)}h
            </div>
            <p className="text-xs text-muted-foreground">
              Average device uptime
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Update</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemStats.lastUpdate ? new Date(systemStats.lastUpdate).toLocaleTimeString() : 'Never'}
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time data
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Auto Device Detection (Hidden) */}
      {autoDetectEnabled && (
        <div className="hidden">
          <DeviceScanner
            autoDetect={true}
            autoDetectInterval={60000} // 60 seconds for background scanning (reduced frequency)
            enableSerialScan={true}
            enableBluetoothScan={true}
            enableNetworkScan={false} // Disable network scanning for performance
            onDevicesFound={(foundDevices) => {
              setDevices(prev => {
                // Merge found devices with existing devices
                const existingIds = prev.map(d => d.id);
                const newDevices = foundDevices.filter(d => !existingIds.includes(d.id));
                if (newDevices.length > 0) {
                  // Only show toast if we're not currently viewing the scanner section
                  if (activeSection !== 'scanner') {
                    toast({
                      title: "New Device Detected",
                      description: `${newDevices.length} device${newDevices.length === 1 ? '' : 's'} automatically added`,
                    });
                  }
                }
                return [...prev, ...newDevices];
              });
              updateSystemStats();
            }}
          />
        </div>
      )}

      {/* Main Device Management Interface */}
      <div className="space-y-6">
        {/* Subheader Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'devices', label: 'Device List', icon: Cpu },
              { id: 'scanner', label: 'Device Scanner', icon: Settings },
              { id: 'firmware', label: 'Firmware', icon: Download },
              { id: 'network', label: 'Network', icon: Wifi },
              { id: 'monitor', label: 'Monitor', icon: TrendingUp },
              { id: 'config', label: 'Configuration', icon: Settings }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center space-x-2 px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeSection === item.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="space-y-4">
            <EnhancedDeviceList
              devices={devices}
              onDeviceSelect={(device) => {
                setSelectedDevice(device);
                setShowConfigPanel(true);
              }}
              onDataUpdate={handleDataUpdate}
            />
          </div>
        )}

        {/* Device List Section */}
        {activeSection === 'devices' && (
          <div className="space-y-4">
            {devices.length > 0 ? (
              <div className="grid gap-4">
                {devices.map((device) => (
                  <Card key={device.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <Cpu className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            {device.name || `Device ${device.id}`}
                            {device.status === 'online' || device.status === 'connected' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </CardTitle>
                          <CardDescription>
                            {device.model || device.type} • {device.connection} • {device.status}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={device.status === 'connected' || device.status === 'online' ? 'default' : 'secondary'}>
                          {device.status}
                        </Badge>
                        {device.firmware?.updateAvailable && (
                          <Badge variant="destructive">Update Available</Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedDevice(device);
                            setShowConfigPanel(true);
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* Device Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {device.hardware && (
                        <div>
                          <p className="text-xs text-muted-foreground">Hardware</p>
                          <p className="text-sm font-medium">{device.hardware.chipModel || 'Unknown'}</p>
                        </div>
                      )}

                      {device.network?.ipAddress && (
                        <div>
                          <p className="text-xs text-muted-foreground">IP Address</p>
                          <p className="text-sm font-medium">{device.network.ipAddress}</p>
                        </div>
                      )}

                      {device.firmware?.version && (
                        <div>
                          <p className="text-xs text-muted-foreground">Firmware</p>
                          <p className="text-sm font-medium">{device.firmware.version}</p>
                        </div>
                      )}

                      {device.system?.uptime && (
                        <div>
                          <p className="text-xs text-muted-foreground">Uptime</p>
                          <p className="text-sm font-medium">
                            {Math.floor(device.system.uptime / 3600)}h {Math.floor((device.system.uptime % 3600) / 60)}m
                          </p>
                        </div>
                      )}
                    </div>

                    {/* System Metrics */}
                    {device.system && (
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        {device.system.cpu && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">CPU</p>
                            <div className="flex items-center space-x-2">
                              <Progress value={device.system.cpu.usage || 0} className="flex-1 h-2" />
                              <span className="text-xs font-medium">{(device.system.cpu.usage || 0).toFixed(1)}%</span>
                            </div>
                          </div>
                        )}

                        {device.system.memory && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Memory</p>
                            <div className="flex items-center space-x-2">
                              <Progress
                                value={((device.system.memory.used || 0) / (device.system.memory.total || 1)) * 100}
                                className="flex-1 h-2"
                              />
                              <span className="text-xs font-medium">
                                {Math.round((device.system.memory.used || 0) / 1024)}KB
                              </span>
                            </div>
                          </div>
                        )}

                        {device.system.storage && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Storage</p>
                            <div className="flex items-center space-x-2">
                              <Progress
                                value={((device.system.storage.used || 0) / (device.system.storage.total || 1)) * 100}
                                className="flex-1 h-2"
                              />
                              <span className="text-xs font-medium">
                                {Math.round((device.system.storage.used || 0) / 1024 / 1024)}MB
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Network Status */}
                    {device.network && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Wifi className="h-4 w-4" />
                            <span className="text-sm font-medium">Network Status</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {device.network.rssi && (
                              <>
                                <Signal className="h-4 w-4" />
                                <span className="text-sm">{device.network.rssi}dBm</span>
                              </>
                            )}
                            {connections[device.id] && (
                              <Badge className="bg-green-500">Live</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Live Data Stream */}
                    {realTimeData[device.id] && (
                      <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">Live Data Stream</span>
                          </div>
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            {Object.keys(realTimeData[device.id]).length} streams
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          {Object.entries(realTimeData[device.id]).slice(0, 8).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-muted-foreground">{key}:</span>
                              <span className="font-medium">
                                {typeof value === 'number' ? value.toFixed(1) : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Device Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline">
                        <Activity className="h-4 w-4 mr-2" />
                        Ping
                      </Button>
                      <Button size="sm" variant="outline">
                        <Database className="h-4 w-4 mr-2" />
                        Get Info
                      </Button>
                      <Button size="sm" variant="outline">
                        <Zap className="h-4 w-4 mr-2" />
                        Restart
                      </Button>
                      {device.firmware?.updateAvailable && (
                        <Button size="sm" variant="default">
                          <Download className="h-4 w-4 mr-2" />
                          Update
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Cpu className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Devices Found</h3>
              <p className="text-muted-foreground mb-6">
                Connect IoT devices to your computer and use the Device Scanner to discover them
              </p>
              <Button onClick={() => setActiveSection('scanner')}>
                <Settings className="h-4 w-4 mr-2" />
                Go to Device Scanner
              </Button>
            </div>
          )}
          </div>
        )}

        {/* Device Scanner Section */}
        {activeSection === 'scanner' && (
          <div className="space-y-4">
            <DeviceScanner
              autoDetect={true}
              autoDetectInterval={30000} // 30 seconds (reduced frequency)
              enableSerialScan={true}
              enableBluetoothScan={true}
              enableNetworkScan={false} // Disable network scanning for performance
              onDevicesFound={(foundDevices) => {
                setDevices(prev => {
                  // Merge found devices with existing devices
                  const existingIds = prev.map(d => d.id);
                  const newDevices = foundDevices.filter(d => !existingIds.includes(d.id));
                  return [...prev, ...newDevices];
                });
                updateSystemStats();
              }}
            />
          </div>
        )}

        {/* Firmware Updates Section */}
        {activeSection === 'firmware' && (
          <div className="space-y-4">
            <FirmwareManager
              devices={devices}
              onFirmwareUpdate={(deviceId, updatedDevice) => {
                setDevices(prev => prev.map(d => d.id === deviceId ? updatedDevice : d));
                updateSystemStats();
              }}
            />
          </div>
        )}

        {/* Network Configuration Section */}
        {activeSection === 'network' && (
          <div className="space-y-4">
            <NetworkConfig
              devices={devices}
              onNetworkConfigUpdate={(deviceId, updatedDevice) => {
                setDevices(prev => prev.map(d => d.id === deviceId ? updatedDevice : d));
                updateSystemStats();
              }}
            />
          </div>
        )}

        {/* Real-time Monitor Section */}
        {activeSection === 'monitor' && (
          <div className="space-y-4">
            <RealTimeMonitor
              devices={devices}
              onDataUpdate={handleDataUpdate}
            />
          </div>
        )}

        {/* Device Configuration Section */}
        {activeSection === 'config' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Device Configuration</CardTitle>
                <CardDescription>
                  Configure device settings, sensors, actuators, and system parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDevice ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">{selectedDevice.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedDevice.model} • {selectedDevice.type}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedDevice(null)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Close
                      </Button>
                    </div>
                    <DeviceConfigPanel
                      device={selectedDevice}
                      onConfigUpdate={handleConfigUpdate}
                      onClose={() => setSelectedDevice(null)}
                    />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No Device Selected</h3>
                    <p className="text-muted-foreground">
                      Select a device from the Device List to configure its settings
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Browser Compatibility Alert */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Browser Compatibility:</strong> Device scanning requires HTTPS and modern browser support.
          Web Serial API is available in Chrome/Edge 89+, Web Bluetooth in Chrome/Edge 56+.
          Real-time monitoring requires WebSocket support and stable network connections.
        </AlertDescription>
      </Alert>

      {/* System Status Alert */}
      {isMonitoring ? (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <strong>System Status:</strong> Real-time monitoring is active. {systemStats.activeConnections} connections established.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <Pause className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <strong>System Status:</strong> Real-time monitoring is paused. Device connections are inactive.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
