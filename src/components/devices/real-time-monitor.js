"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Progress } from "@components/ui/progress";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import {
  Activity,
  Wifi,
  WifiOff,
  Signal,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  RefreshCw,
  Zap,
  Clock,
  Database,
  Waves,
  Radio,
  Server,
  Smartphone,
  BarChart3,
  Gauge,
  Thermometer,
  Droplets,
  Sun,
  Wind,
  Eye,
  EyeOff
} from "lucide-react";
import { useToast } from "@hooks/use-toast";

/**
 * Real-time Connectivity Monitor
 * Monitors device connectivity, handles WebSocket connections, and displays live data streams
 */
export default function RealTimeMonitor({ devices = [], onDataUpdate }) {
  const { toast } = useToast();
  const [connections, setConnections] = useState({});
  const [connectionStatus, setConnectionStatus] = useState({});
  const [liveData, setLiveData] = useState({});
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [connectionStats, setConnectionStats] = useState({
    totalConnections: 0,
    activeConnections: 0,
    failedConnections: 0,
    totalMessages: 0,
    messagesPerSecond: 0
  });
  const [reconnectionAttempts, setReconnectionAttempts] = useState({});
  const [dataHistory, setDataHistory] = useState({});
  const wsRefs = useRef({});
  const reconnectTimeouts = useRef({});
  const messageStats = useRef({ count: 0, startTime: Date.now() });

  // WebSocket connection manager
  const connectToDevice = useCallback((device) => {
    if (!device.network?.ipAddress) {
      console.log(`No IP address for device ${device.id}`);
      return;
    }

    const wsUrl = `ws://${device.network.ipAddress}:8080`;
    console.log(`Attempting to connect to ${device.name} at ${wsUrl}`);

    try {
      const ws = new WebSocket(wsUrl);
      wsRefs.current[device.id] = ws;

      ws.onopen = () => {
        console.log(`Connected to ${device.name}`);
        toast({
          title: "Device Connected",
          description: `Successfully connected to ${device.name}`,
        });

        setConnections(prev => ({ ...prev, [device.id]: ws }));
        setConnectionStatus(prev => ({
          ...prev,
          [device.id]: {
            status: 'connected',
            lastConnected: new Date(),
            reconnectCount: 0
          }
        }));

        setReconnectionAttempts(prev => {
          const newAttempts = { ...prev };
          delete newAttempts[device.id];
          return newAttempts;
        });

        // Send initial handshake
        ws.send(JSON.stringify({
          type: 'handshake',
          deviceId: device.id,
          timestamp: new Date().toISOString()
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleDeviceMessage(device.id, data);

          // Update message stats
          messageStats.current.count++;
          const now = Date.now();
          const elapsed = (now - messageStats.current.startTime) / 1000;
          if (elapsed > 0) {
            setConnectionStats(prev => ({
              ...prev,
              totalMessages: messageStats.current.count,
              messagesPerSecond: messageStats.current.count / elapsed
            }));
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log(`Disconnected from ${device.name}:`, event.code, event.reason);
        handleDisconnection(device.id, device, event.code);
      };

      ws.onerror = (error) => {
        console.error(`WebSocket error for ${device.name}:`, error);
        setConnectionStatus(prev => ({
          ...prev,
          [device.id]: {
            ...prev[device.id],
            status: 'error',
            lastError: new Date()
          }
        }));
      };

    } catch (error) {
      console.error(`Failed to create WebSocket connection for ${device.name}:`, error);
      handleConnectionError(device.id, device);
    }
  }, []);

  const handleDeviceMessage = (deviceId, data) => {
    // Update live data
    setLiveData(prev => ({
      ...prev,
      [deviceId]: {
        ...prev[deviceId],
        ...data,
        timestamp: new Date()
      }
    }));

    // Store in history for charting
    setDataHistory(prev => ({
      ...prev,
      [deviceId]: [
        ...(prev[deviceId] || []).slice(-50), // Keep last 50 data points
        { timestamp: new Date(), data }
      ]
    }));

    // Notify parent component
    if (onDataUpdate) {
      onDataUpdate(deviceId, data);
    }
  };

  const handleDisconnection = (deviceId, device, code) => {
    setConnections(prev => {
      const newConnections = { ...prev };
      delete newConnections[deviceId];
      return newConnections;
    });

    setConnectionStatus(prev => ({
      ...prev,
      [deviceId]: {
        ...prev[deviceId],
        status: 'disconnected',
        lastDisconnected: new Date(),
        disconnectCode: code
      }
    }));

    // Attempt reconnection
    attemptReconnection(deviceId, device);
  };

  const attemptReconnection = (deviceId, device) => {
    const currentAttempts = reconnectionAttempts[deviceId] || 0;

    if (currentAttempts >= 5) {
      toast({
        title: "Reconnection Failed",
        description: `Failed to reconnect to ${device.name} after 5 attempts`,
        variant: "destructive",
      });
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, currentAttempts), 30000); // Exponential backoff

    setReconnectionAttempts(prev => ({
      ...prev,
      [deviceId]: currentAttempts + 1
    }));

    reconnectTimeouts.current[deviceId] = setTimeout(() => {
      console.log(`Attempting reconnection ${currentAttempts + 1} for ${device.name}`);
      connectToDevice(device);
    }, delay);
  };

  const handleConnectionError = (deviceId, device) => {
    setConnectionStatus(prev => ({
      ...prev,
      [deviceId]: {
        ...prev[deviceId],
        status: 'error',
        lastError: new Date()
      }
    }));

    attemptReconnection(deviceId, device);
  };

  const disconnectFromDevice = (deviceId) => {
    const ws = wsRefs.current[deviceId];
    if (ws) {
      ws.close(1000, 'User disconnected');
    }

    if (reconnectTimeouts.current[deviceId]) {
      clearTimeout(reconnectTimeouts.current[deviceId]);
      delete reconnectTimeouts.current[deviceId];
    }
  };

  const sendCommandToDevice = (deviceId, command, params = {}) => {
    const ws = connections[deviceId];
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'command',
        command,
        params,
        timestamp: new Date().toISOString()
      }));
    } else {
      toast({
        title: "Connection Error",
        description: "No active connection to device",
        variant: "destructive",
      });
    }
  };

  // Initialize connections when devices change
  useEffect(() => {
    const wifiDevices = devices.filter(d => d.connection === 'WiFi' && d.status === 'online');

    // Connect to new devices
    wifiDevices.forEach(device => {
      if (!connections[device.id] && !wsRefs.current[device.id]) {
        connectToDevice(device);
      }
    });

    // Disconnect from removed devices
    Object.keys(connections).forEach(deviceId => {
      const deviceExists = wifiDevices.find(d => d.id === deviceId);
      if (!deviceExists) {
        disconnectFromDevice(deviceId);
      }
    });

    // Update connection stats
    setConnectionStats(prev => ({
      ...prev,
      totalConnections: wifiDevices.length,
      activeConnections: Object.keys(connections).length,
      failedConnections: wifiDevices.length - Object.keys(connections).length
    }));
  }, [devices, connectToDevice, connections]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(wsRefs.current).forEach(ws => {
        if (ws) ws.close();
      });
      Object.values(reconnectTimeouts.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, []);

  const getConnectionStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'connecting':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getConnectionStatusBadge = (status) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-500">Connected</Badge>;
      case 'connecting':
        return <Badge className="bg-blue-500">Connecting</Badge>;
      case 'disconnected':
        return <Badge variant="secondary">Disconnected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    if (!isMonitoring) {
      // Resume monitoring
      devices.forEach(device => {
        if (device.connection === 'WiFi' && !connections[device.id]) {
          connectToDevice(device);
        }
      });
    } else {
      // Pause monitoring
      Object.keys(connections).forEach(deviceId => {
        disconnectFromDevice(deviceId);
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Monitoring Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Real-time Connectivity Monitor</h2>
          <p className="text-muted-foreground">
            Live device connections and data streaming
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
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Waves className="h-3 w-3" />
              <span>{connectionStats.activeConnections} Active</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1">
              <Zap className="h-3 w-3" />
              <span>{connectionStats.messagesPerSecond.toFixed(1)} msg/s</span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Connection Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Connections</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectionStats.totalConnections}</div>
            <p className="text-xs text-muted-foreground">
              Available devices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{connectionStats.activeConnections}</div>
            <p className="text-xs text-muted-foreground">
              Live connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Connections</CardTitle>
            <WifiOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{connectionStats.failedConnections}</div>
            <p className="text-xs text-muted-foreground">
              Connection failures
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Message Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectionStats.messagesPerSecond.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Messages per second
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
          <CardDescription>
            Real-time status of all device connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {devices.filter(d => d.connection === 'WiFi').map((device) => {
              const status = connectionStatus[device.id];
              const attempts = reconnectionAttempts[device.id] || 0;

              return (
                <div key={device.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getConnectionStatusIcon(status?.status)}
                      <div>
                        <h3 className="font-medium">{device.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {device.network?.ipAddress} • {device.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getConnectionStatusBadge(status?.status)}
                      {attempts > 0 && (
                        <Badge variant="outline" className="text-orange-500">
                          Reconnecting ({attempts}/5)
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{status?.status || 'unknown'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Connected</p>
                      <p className="font-medium">
                        {status?.lastConnected ? new Date(status.lastConnected).toLocaleTimeString() : 'Never'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Messages</p>
                      <p className="font-medium">
                        {liveData[device.id] ? Object.keys(liveData[device.id]).length : 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Latency</p>
                      <p className="font-medium">
                        {connections[device.id] ? '< 100ms' : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {connections[device.id] ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => disconnectFromDevice(device.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => connectToDevice(device)}
                      >
                        <Wifi className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendCommandToDevice(device.id, 'ping')}
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Ping
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendCommandToDevice(device.id, 'get_info')}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Get Info
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Live Data Streams */}
      <Card>
        <CardHeader>
          <CardTitle>Live Data Streams</CardTitle>
          <CardDescription>
            Real-time sensor data from connected devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(liveData).map(([deviceId, data]) => {
              const device = devices.find(d => d.id === deviceId);
              if (!device) return null;

              return (
                <div key={deviceId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{device.name}</h3>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <Waves className="h-3 w-3 mr-1" />
                      Live
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Object.entries(data).map(([key, value]) => {
                      if (key === 'timestamp') return null;

                      const getSensorIcon = (sensorKey) => {
                        switch (sensorKey.toLowerCase()) {
                          case 'temperature':
                            return <Thermometer className="h-4 w-4 text-red-500" />;
                          case 'humidity':
                            return <Droplets className="h-4 w-4 text-blue-500" />;
                          case 'pressure':
                            return <Gauge className="h-4 w-4 text-purple-500" />;
                          case 'light':
                            return <Sun className="h-4 w-4 text-yellow-500" />;
                          case 'wind':
                          case 'windspeed':
                            return <Wind className="h-4 w-4 text-green-500" />;
                          default:
                            return <Activity className="h-4 w-4 text-gray-500" />;
                        }
                      };

                      return (
                        <div key={key} className="flex items-center space-x-2">
                          {getSensorIcon(key)}
                          <div>
                            <p className="text-xs text-muted-foreground capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <p className="text-sm font-medium">
                              {typeof value === 'number' ? value.toFixed(1) : String(value)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 text-xs text-muted-foreground">
                    Last updated: {data.timestamp ? new Date(data.timestamp).toLocaleTimeString() : 'Unknown'}
                  </div>
                </div>
              );
            })}

            {Object.keys(liveData).length === 0 && (
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Live Data</h3>
                <p className="text-muted-foreground">
                  Connect to devices to start receiving real-time data streams
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Connection Alerts */}
      {connectionStats.failedConnections > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Connection Issues:</strong> {connectionStats.failedConnections} device(s) are currently disconnected.
            The system will automatically attempt to reconnect.
          </AlertDescription>
        </Alert>
      )}

      {connectionStats.activeConnections > 0 && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <strong>Active Connections:</strong> {connectionStats.activeConnections} device(s) are connected and streaming data.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
