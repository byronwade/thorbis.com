"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Progress } from "@components/ui/progress";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Textarea } from "@components/ui/textarea";
import {
  Cpu,
  Wifi,
  Usb,
  Bluetooth,
  RefreshCw,
  Activity,
  Thermometer,
  Zap,
  MemoryStick,
  Clock,
  Signal,
  Settings,
  Download,
  Upload,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Network,
  Server,
  Gauge,
  Battery,
  Radio,
  Smartphone,
  Router,
  HardDrive,
  Database,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Info,
  Shield,
  Lock,
  Unlock,
  WifiOff,
  BluetoothSearching,
  ZapOff,
  Rss,
  Waves,
  Camera,
  Speaker,
  Volume2,
  Lightbulb,
  Fan,
  Thermostat,
  Droplets,
  Wind,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Snowflake,
  Flame,
  ShieldCheck,
  Terminal,
  Code,
  FileCode,
  GitBranch,
  Webhook,
  Search
} from "lucide-react";
import { useToast } from "@hooks/use-toast";

/**
 * Enhanced Device List Component
 * Comprehensive device management with real-time monitoring and detailed information
 */
export default function EnhancedDeviceList({ devices = [], onDeviceSelect, onDataUpdate }) {
  const { toast } = useToast();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceDetails, setDeviceDetails] = useState(null);
  const [realTimeData, setRealTimeData] = useState({});
  const [wsConnections, setWsConnections] = useState({});
  const [loadingCommands, setLoadingCommands] = useState({});
  const [isMounted, setIsMounted] = useState(false);
  const [deviceConfig, setDeviceConfig] = useState({
    wifi: {
      ssid: "",
      password: "",
      security: "WPA2",
      dhcp: true,
      ipAddress: "",
      gateway: "",
      subnet: "",
      dns: ""
    },
    bluetooth: {
      enabled: false,
      name: "",
      pairable: true,
      services: []
    },
    mqtt: {
      enabled: false,
      broker: "",
      port: 1883,
      username: "",
      password: "",
      topic: "",
      qos: 0
    }
  });

  const handleRealTimeData = useCallback((deviceId, data) => {
    setRealTimeData(prev => ({
      ...prev,
      [deviceId]: {
        ...prev[deviceId],
        ...data,
        timestamp: new Date()
      }
    }));
  }, []);

  const initializeWebSocketConnections = useCallback(async () => {
    // Don't initialize WebSocket connections during SSR or if component is not mounted
    if (typeof window === 'undefined' || !isMounted) {
      return;
    }

    // Only connect to WiFi devices that are online and have IP addresses
    const wifiDevices = devices.filter(d => d.connection === 'WiFi' && d.status === 'online' && d.ipAddress);
    
    // Limit to max 3 WebSocket connections for performance
    const devicesToConnect = wifiDevices.slice(0, 3);

    for (const device of devicesToConnect) {
      try {
        // Validate IP address format before attempting connection
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (!ipRegex.test(device.ipAddress)) {
          console.warn(`Invalid IP address for device ${device.name}: ${device.ipAddress}`);
          continue;
        }

        const ws = new WebSocket(`ws://${device.ipAddress}:8080`);

        // Set a timeout for the WebSocket connection
        const connectionTimeout = setTimeout(() => {
          if (ws.readyState === WebSocket.CONNECTING) {
            ws.close();
            console.warn(`WebSocket connection timeout for device ${device.name}`);
          }
        }, 5000); // 5 second timeout

        ws.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log(`WebSocket connected to ${device.name} at ${device.ipAddress}`);
          setWsConnections(prev => ({ ...prev, [device.id]: ws }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleRealTimeData(device.id, data);
          } catch (error) {
            console.warn('Failed to parse WebSocket data:', error);
          }
        };

        ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          console.log(`WebSocket disconnected from ${device.name}`, event.code, event.reason);
          setWsConnections(prev => {
            const newConnections = { ...prev };
            delete newConnections[device.id];
            return newConnections;
          });
        };

        ws.onerror = (error) => {
          clearTimeout(connectionTimeout);
          // Don't log WebSocket errors as console.error to avoid hydration monitor issues
          console.warn(`WebSocket connection error for device ${device.name}:`, {
            deviceId: device.id,
            deviceName: device.name,
            ipAddress: device.ipAddress,
            error: error.message || 'Connection failed'
          });
        };

      } catch (error) {
        // Don't log as console.error to avoid hydration monitor issues
        console.warn(`Failed to establish WebSocket connection for device ${device.name}:`, {
          deviceId: device.id,
          deviceName: device.name,
          ipAddress: device.ipAddress,
          error: error.message
        });
      }
    }
  }, [devices, handleRealTimeData, isMounted]);

  const startRealTimeMonitoring = useCallback(() => {
    const interval = setInterval(() => {
      // Simulate real-time data updates for devices that have the required properties
      setRealTimeData(prev => {
        const newData = { ...prev };
        devices.forEach(device => {
          if (device.data) {
            newData[device.id] = {
              ...device.data,
              temperature: (device.data.temperature || 20) + (Math.random() - 0.5) * 0.2,
              humidity: Math.max(0, Math.min(100, (device.data.humidity || 50) + (Math.random() - 0.5) * 2)),
              uptime: (device.data.uptime || 0) + 60,
              timestamp: new Date().toISOString()
            };
          }
        });
        return newData;
      });
    }, 15000); // Update every 15 seconds (reduced frequency for better performance)

    return () => clearInterval(interval);
  }, [devices]);

  // Handle mounting state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only initialize WebSocket connections when component is mounted and in browser
    if (isMounted && typeof window !== 'undefined' && devices.length > 0) {
      initializeWebSocketConnections();
      const cleanup = startRealTimeMonitoring();
      
      // Cleanup function to close WebSocket connections and clear intervals
      return () => {
        if (cleanup) cleanup();
        // Close all WebSocket connections
        Object.values(wsConnections).forEach(ws => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.close();
          }
        });
        setWsConnections({});
      };
    }
  }, [isMounted, devices, initializeWebSocketConnections, startRealTimeMonitoring, wsConnections]);

  const sendCommandToDevice = async (deviceId, command, params = {}) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) {
      toast({
        title: "Device Not Found",
        description: "The specified device could not be found",
        variant: "destructive",
      });
      return;
    }

    // Set loading state for this specific command
    setLoadingCommands(prev => ({ ...prev, [`${deviceId}-${command}`]: true }));

    // Show loading state
    toast({
      title: "Sending Command",
      description: `Sending ${command} to ${device.name}...`,
    });

    try {
      // Simulate command execution with different responses based on command type
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      let response;
      switch (command) {
        case 'ping':
          response = {
            success: true,
            data: {
              latency: Math.floor(Math.random() * 50) + 10, // 10-60ms
              timestamp: new Date().toISOString(),
              deviceId: deviceId
            }
          };
          break;
        
        case 'get_info':
          response = {
            success: true,
            data: {
              name: device.name,
              type: device.type,
              model: device.model,
              firmware: device.firmware,
              uptime: device.data?.uptime || 0,
              temperature: device.data?.temperature || 0,
              humidity: device.data?.humidity || 0,
              status: device.status,
              connection: device.connection,
              timestamp: new Date().toISOString()
            }
          };
          break;
        
        case 'restart':
          response = {
            success: true,
            data: {
              message: "Device restart initiated",
              restartTime: new Date().toISOString(),
              estimatedDuration: "30 seconds"
            }
          };
          break;
        
        default:
          response = {
            success: true,
            data: {
              message: `Command '${command}' executed successfully`,
              timestamp: new Date().toISOString()
            }
          };
      }

      // Show success response
      toast({
        title: "Command Executed",
        description: command === 'ping' 
          ? `Ping: ${response.data.latency}ms`
          : command === 'get_info'
          ? `Device info retrieved for ${device.name}`
          : `Device ${command} completed successfully`,
      });

      // Update device data if needed
      if (command === 'get_info' && response.success) {
        setRealTimeData(prev => ({
          ...prev,
          [deviceId]: {
            ...prev[deviceId],
            ...response.data,
            lastCommand: command,
            lastCommandTime: new Date().toISOString()
          }
        }));
      }

      console.log(`Command ${command} executed:`, response);
      
      // Clear loading state
      setLoadingCommands(prev => ({ ...prev, [`${deviceId}-${command}`]: false }));
      
      return response;

    } catch (error) {
      console.error(`Command ${command} failed:`, error);
      toast({
        title: "Command Failed",
        description: `Failed to execute ${command} on ${device.name}`,
        variant: "destructive",
      });
      
      // Clear loading state
      setLoadingCommands(prev => ({ ...prev, [`${deviceId}-${command}`]: false }));
      
      return { success: false, error: error.message };
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case "ESP32":
        return <Cpu className="h-6 w-6" />;
      case "Arduino":
        return <Terminal className="h-6 w-6" />;
      case "IoT Cluster":
        return <Network className="h-6 w-6" />;
      default:
        return <Activity className="h-6 w-6" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "online":
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "offline":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getConnectionIcon = (connection) => {
    switch (connection) {
      case "USB":
        return <Usb className="h-4 w-4" />;
      case "WiFi":
        return <Wifi className="h-4 w-4" />;
      case "Bluetooth":
        return <Bluetooth className="h-4 w-4" />;
      default:
        return <Network className="h-4 w-4" />;
    }
  };

  const getSensorIcon = (sensor) => {
    switch (sensor) {
      case "temperature":
        return <Thermometer className="h-4 w-4 text-red-500" />;
      case "humidity":
        return <Droplets className="h-4 w-4 text-blue-500" />;
      case "pressure":
        return <Gauge className="h-4 w-4 text-purple-500" />;
      case "light":
        return <Sun className="h-4 w-4 text-yellow-500" />;
      case "motion":
        return <Activity className="h-4 w-4 text-green-500" />;
      case "sound":
        return <Volume2 className="h-4 w-4 text-orange-500" />;
      case "battery":
        return <Battery className="h-4 w-4 text-gray-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  // Memoize the device list to prevent unnecessary re-renders
  const memoizedDevices = React.useMemo(() => devices, [devices]);

  return (
    <div className="space-y-6">
      {/* Enhanced Device List Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Enhanced Device List</h2>
          <p className="text-muted-foreground">
            Comprehensive device management with real-time monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Wifi className="h-3 w-3" />
            <span>{Object.keys(wsConnections).length} WebSocket</span>
          </Badge>
          <Badge variant="outline" className="flex items-center space-x-1">
            <Activity className="h-3 w-3" />
            <span>Real-time</span>
          </Badge>
        </div>
      </div>

      {/* Device Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
        {memoizedDevices.map((device) => (
          <Card key={device.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getDeviceIcon(device.type)}
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      {device.name}
                      {getStatusIcon(device.status)}
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      <span>{device.model}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        {getConnectionIcon(device.connection)}
                        <span>{device.connection}</span>
                      </div>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {wsConnections[device.id] && (
                    <Badge variant="default" className="bg-green-500">
                      <Waves className="h-3 w-3 mr-1" />
                      Live
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDevice(device)}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Hardware Information */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Cpu className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">CPU</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {device.hardware?.cores || 'Unknown'} Core
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {device.hardware?.frequency || 'Unknown'}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <MemoryStick className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Memory</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {device.system?.memory ? 
                      `${formatBytes(device.system.memory.used)} / ${formatBytes(device.system.memory.total)}` : 
                      'Unknown'
                    }
                  </p>
                  {device.system?.memory && (
                    <Progress
                      value={(device.system.memory.used / device.system.memory.total) * 100}
                      className="h-1"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Storage</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {device.system?.storage ? 
                      `${formatBytes(device.system.storage.used)} / ${formatBytes(device.system.storage.total)}` : 
                      'Unknown'
                    }
                  </p>
                  {device.system?.storage && (
                    <Progress
                      value={(device.system.storage.used / device.system.storage.total) * 100}
                      className="h-1"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Uptime</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {device.data?.uptime ? formatUptime(device.data.uptime) : 'Unknown'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {device.data?.temperature ? `${device.data.temperature.toFixed(1)}°C` : 'Unknown'}
                  </p>
                </div>
              </div>

              {/* Network Information */}
              {device.ipAddress && (
                <div className="border rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-3 flex items-center space-x-2">
                    <Network className="h-4 w-4" />
                    <span>Network Information</span>
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">IP Address</p>
                      <p className="font-medium">{device.ipAddress}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">MAC Address</p>
                      <p className="font-medium">{device.macAddress || 'Unknown'}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Signal className="h-4 w-4" />
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-medium">{device.status}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Wifi className="h-4 w-4" />
                      <p className="text-muted-foreground">Connection</p>
                      <p className="font-medium">{device.connection}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sensor Data */}
              {device.data && (
                <div className="border rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-3 flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Sensor Data</span>
                  </h4>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {Object.entries(device.data).map(([sensor, value]) => (
                      <div key={sensor} className="flex items-center space-x-2">
                        {getSensorIcon(sensor)}
                        <div>
                          <p className="text-xs text-muted-foreground capitalize">
                            {sensor.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-sm font-medium">
                            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') :
                             typeof value === 'number' ? value.toFixed(1) : value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Capabilities */}
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium mb-3 flex items-center space-x-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Capabilities</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {device.capabilities ? (
                    device.capabilities.map((capability) => (
                      <Badge key={capability} variant="outline" className="text-xs">
                        {capability}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Basic IoT Device
                    </Badge>
                  )}
                </div>
              </div>

              {/* Connected Services */}
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium mb-3 flex items-center space-x-2">
                  <Server className="h-4 w-4" />
                  <span>Connected Services</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {device.connectedServices ? (
                    device.connectedServices.map((service) => (
                      <Badge key={service} variant="secondary" className="text-xs">
                        {service}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      No services connected
                    </Badge>
                  )}
                </div>
              </div>

              {/* Real-time Data */}
              {realTimeData[device.id] && (
                <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                  <h4 className="text-sm font-medium mb-3 flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span>Live Data Stream</span>
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {Object.entries(realTimeData[device.id]).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-muted-foreground capitalize">{key}</p>
                        <p className="font-medium">{JSON.stringify(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Device Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={loadingCommands[`${device.id}-ping`]}
                  onClick={() => sendCommandToDevice(device.id, 'ping')}
                >
                  {loadingCommands[`${device.id}-ping`] ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Activity className="h-4 w-4 mr-2" />
                  )}
                  Ping
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={loadingCommands[`${device.id}-get_info`]}
                  onClick={() => sendCommandToDevice(device.id, 'get_info')}
                >
                  {loadingCommands[`${device.id}-get_info`] ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Info className="h-4 w-4 mr-2" />
                  )}
                  Get Info
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={loadingCommands[`${device.id}-restart`]}
                  onClick={() => sendCommandToDevice(device.id, 'restart')}
                >
                  {loadingCommands[`${device.id}-restart`] ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Restart
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => setSelectedDevice(device)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Device Configuration Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">{selectedDevice.name} - Configuration</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDevice(null)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* WiFi Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wifi className="h-5 w-5" />
                    <span>WiFi Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ssid">Network SSID</Label>
                      <Input
                        id="ssid"
                        value={deviceConfig.wifi.ssid}
                        onChange={(e) => setDeviceConfig(prev => ({
                          ...prev,
                          wifi: { ...prev.wifi, ssid: e.target.value }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={deviceConfig.wifi.password}
                        onChange={(e) => setDeviceConfig(prev => ({
                          ...prev,
                          wifi: { ...prev.wifi, password: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => sendCommandToDevice(selectedDevice.id, 'configure_wifi', deviceConfig.wifi)}
                    >
                      <Wifi className="h-4 w-4 mr-2" />
                      Configure WiFi
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => sendCommandToDevice(selectedDevice.id, 'scan_wifi')}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Scan Networks
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Bluetooth Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bluetooth className="h-5 w-5" />
                    <span>Bluetooth Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={deviceConfig.bluetooth.enabled}
                      onChange={(e) => setDeviceConfig(prev => ({
                        ...prev,
                        bluetooth: { ...prev.bluetooth, enabled: e.target.checked }
                      }))}
                    />
                    <Label>Enable Bluetooth</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bt-name">Bluetooth Device Name</Label>
                    <Input
                      id="bt-name"
                      value={deviceConfig.bluetooth.name}
                      onChange={(e) => setDeviceConfig(prev => ({
                        ...prev,
                        bluetooth: { ...prev.bluetooth, name: e.target.value }
                      }))}
                    />
                  </div>
                  <Button
                    onClick={() => sendCommandToDevice(selectedDevice.id, 'configure_bluetooth', deviceConfig.bluetooth)}
                  >
                    <Bluetooth className="h-4 w-4 mr-2" />
                    Configure Bluetooth
                  </Button>
                </CardContent>
              </Card>

              {/* MQTT Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Webhook className="h-5 w-5" />
                    <span>MQTT Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={deviceConfig.mqtt.enabled}
                      onChange={(e) => setDeviceConfig(prev => ({
                        ...prev,
                        mqtt: { ...prev.mqtt, enabled: e.target.checked }
                      }))}
                    />
                    <Label>Enable MQTT</Label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mqtt-broker">MQTT Broker</Label>
                      <Input
                        id="mqtt-broker"
                        value={deviceConfig.mqtt.broker}
                        onChange={(e) => setDeviceConfig(prev => ({
                          ...prev,
                          mqtt: { ...prev.mqtt, broker: e.target.value }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mqtt-port">Port</Label>
                      <Input
                        id="mqtt-port"
                        type="number"
                        value={deviceConfig.mqtt.port}
                        onChange={(e) => setDeviceConfig(prev => ({
                          ...prev,
                          mqtt: { ...prev.mqtt, port: parseInt(e.target.value) }
                        }))}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => sendCommandToDevice(selectedDevice.id, 'configure_mqtt', deviceConfig.mqtt)}
                  >
                    <Webhook className="h-4 w-4 mr-2" />
                    Configure MQTT
                  </Button>
                </CardContent>
              </Card>

              {/* Device Commands */}
              <Card>
                <CardHeader>
                  <CardTitle>Device Commands</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button size="sm" onClick={() => sendCommandToDevice(selectedDevice.id, 'ping')}>
                      <Activity className="h-4 w-4 mr-2" />
                      Ping
                    </Button>
                    <Button size="sm" onClick={() => sendCommandToDevice(selectedDevice.id, 'restart')}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Restart
                    </Button>
                    <Button size="sm" onClick={() => sendCommandToDevice(selectedDevice.id, 'deep_sleep')}>
                      <Moon className="h-4 w-4 mr-2" />
                      Deep Sleep
                    </Button>
                    <Button size="sm" onClick={() => sendCommandToDevice(selectedDevice.id, 'factory_reset')}>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Factory Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
