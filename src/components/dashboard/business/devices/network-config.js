"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Progress } from "@components/ui/progress";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { 
  Wifi, 
  WifiOff, 
  Settings, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Activity,
  Zap,
  Shield,
  Eye,
  EyeOff,
  RefreshCw,
  Network,
  Signal,
  Lock,
  Unlock
} from "lucide-react";
import { useToast } from "@hooks/use-toast";

/**
 * Network Configuration Component
 * Configure WiFi settings for IoT devices and manage network connections
 */
export default function NetworkConfig({ devices = [], onNetworkConfigUpdate }) {
  const { toast } = useToast();
  const [configuring, setConfiguring] = useState(false);
  const [configProgress, setConfigProgress] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [availableNetworks, setAvailableNetworks] = useState([]);
  const [scanningNetworks, setScanningNetworks] = useState(false);

  // Network configuration state
  const [networkConfig, setNetworkConfig] = useState({
    ssid: "",
    password: "",
    security: "WPA2",
    ipAddress: "",
    gateway: "",
    dns: "",
    dhcp: true
  });

  useEffect(() => {
    // Initialize with empty networks - will be populated by scanning
    setAvailableNetworks([]);
  }, []);

  const scanForNetworks = async () => {
    setScanningNetworks(true);
    
    try {
      toast({
        title: "Scanning Networks",
        description: "Searching for available WiFi networks...",
      });

      // Simulate network scan
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Scan Complete",
        description: `Found ${availableNetworks.length} networks`,
      });
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Unable to scan for networks",
        variant: "destructive",
      });
    } finally {
      setScanningNetworks(false);
    }
  };

  const configureDeviceNetwork = async (device, config) => {
    setConfiguring(true);
    setConfigProgress(0);
    setSelectedDevice(device);

    try {
      // Step 1: Connect to device (20%)
      toast({
        title: "Connecting to Device",
        description: `Establishing connection to ${device.name}...`,
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConfigProgress(20);

      // Step 2: Send network configuration (40%)
      toast({
        title: "Sending Configuration",
        description: "Transmitting network settings to device...",
      });
      await new Promise(resolve => setTimeout(resolve, 2000));
      setConfigProgress(40);

      // Step 3: Apply configuration (60%)
      toast({
        title: "Applying Settings",
        description: "Device is applying network configuration...",
      });
      await new Promise(resolve => setTimeout(resolve, 3000));
      setConfigProgress(60);

      // Step 4: Test connection (80%)
      toast({
        title: "Testing Connection",
        description: "Verifying network connectivity...",
      });
      await new Promise(resolve => setTimeout(resolve, 2000));
      setConfigProgress(80);

      // Step 5: Complete (100%)
      setConfigProgress(100);

      // Update device network status in parent component
      if (onNetworkConfigUpdate) {
        onNetworkConfigUpdate(device.id, {
          ...device,
          network: {
            ...device.network,
            ssid: config.ssid,
            ipAddress: config.dhcp ? "192.168.1.100" : config.ipAddress,
            connected: true
          },
          status: "online",
          connection: "WiFi"
        });
      }

      toast({
        title: "Configuration Complete",
        description: `Successfully configured ${device.name} for network ${config.ssid}`,
      });

    } catch (error) {
      toast({
        title: "Configuration Failed",
        description: "Network configuration failed. Please check settings.",
        variant: "destructive",
      });
    } finally {
      setConfiguring(false);
      setConfigProgress(0);
      setSelectedDevice(null);
    }
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case "ESP32":
        return <Activity className="h-5 w-5" />;
      case "IoT Sensor":
        return <Signal className="h-5 w-5" />;
      case "IoT Camera":
        return <Activity className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "connected":
      case "online":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "offline":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSecurityIcon = (security) => {
    switch (security) {
      case "WPA3":
        return <Lock className="h-4 w-4 text-green-500" />;
      case "WPA2":
        return <Lock className="h-4 w-4 text-blue-500" />;
      case "WEP":
        return <Lock className="h-4 w-4 text-yellow-500" />;
      case "Open":
        return <Unlock className="h-4 w-4 text-red-500" />;
      default:
        return <Lock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSignalStrength = (signal) => {
    if (signal >= -50) return "Excellent";
    if (signal >= -60) return "Good";
    if (signal >= -70) return "Fair";
    return "Poor";
  };

  const getSignalColor = (signal) => {
    if (signal >= -50) return "text-green-500";
    if (signal >= -60) return "text-blue-500";
    if (signal >= -70) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Network Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices.length}</div>
            <p className="text-xs text-muted-foreground">
              {devices.filter(d => d.status === 'connected' || d.status === 'online').length} online
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
            <CardTitle className="text-sm font-medium">Available Networks</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableNetworks.length}</div>
            <p className="text-xs text-muted-foreground">
              WiFi networks found
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Security</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {availableNetworks.filter(n => n.security !== 'Open').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Secure networks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Available Networks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Available Networks</CardTitle>
              <CardDescription>
                WiFi networks available for device configuration
              </CardDescription>
            </div>
            <Button onClick={scanForNetworks} disabled={scanningNetworks}>
              <RefreshCw className={`h-4 w-4 mr-2 ${scanningNetworks ? 'animate-spin' : ''}`} />
              {scanningNetworks ? 'Scanning...' : 'Scan Networks'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableNetworks.map((network, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getSecurityIcon(network.security)}
                    <div>
                      <h3 className="font-medium">{network.ssid}</h3>
                      <p className="text-sm text-muted-foreground">
                        {network.security} • Channel {network.channel} • {network.frequency}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getSignalColor(network.signal)}>
                      {getSignalStrength(network.signal)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {network.signal} dBm
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setNetworkConfig(prev => ({ ...prev, ssid: network.ssid, security: network.security }));
                    }}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Use This Network
                  </Button>
                  <Button size="sm" variant="outline">
                    <Signal className="h-4 w-4 mr-2" />
                    Signal Test
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Network Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Network Configuration</CardTitle>
          <CardDescription>
            Configure WiFi settings for IoT devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ssid">Network SSID</Label>
                <Input
                  id="ssid"
                  placeholder="Enter WiFi network name"
                  value={networkConfig.ssid}
                  onChange={(e) => setNetworkConfig(prev => ({ ...prev, ssid: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter WiFi password"
                    value={networkConfig.password}
                    onChange={(e) => setNetworkConfig(prev => ({ ...prev, password: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="security">Security Type</Label>
                <Select 
                  value={networkConfig.security} 
                  onValueChange={(value) => setNetworkConfig(prev => ({ ...prev, security: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select security type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WPA3">WPA3 (Most Secure)</SelectItem>
                    <SelectItem value="WPA2">WPA2 (Recommended)</SelectItem>
                    <SelectItem value="WEP">WEP (Legacy)</SelectItem>
                    <SelectItem value="Open">Open (No Security)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dhcp">IP Configuration</Label>
                <Select 
                  value={networkConfig.dhcp ? "dhcp" : "static"} 
                  onValueChange={(value) => setNetworkConfig(prev => ({ ...prev, dhcp: value === "dhcp" }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select IP configuration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dhcp">DHCP (Automatic)</SelectItem>
                    <SelectItem value="static">Static IP (Manual)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {!networkConfig.dhcp && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ipAddress">IP Address</Label>
                  <Input
                    id="ipAddress"
                    placeholder="192.168.1.100"
                    value={networkConfig.ipAddress}
                    onChange={(e) => setNetworkConfig(prev => ({ ...prev, ipAddress: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gateway">Gateway</Label>
                  <Input
                    id="gateway"
                    placeholder="192.168.1.1"
                    value={networkConfig.gateway}
                    onChange={(e) => setNetworkConfig(prev => ({ ...prev, gateway: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dns">DNS Server</Label>
                  <Input
                    id="dns"
                    placeholder="8.8.8.8"
                    value={networkConfig.dns}
                    onChange={(e) => setNetworkConfig(prev => ({ ...prev, dns: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Device Network Management */}
      <Card>
        <CardHeader>
          <CardTitle>Device Network Management</CardTitle>
          <CardDescription>
            Configure network settings for your IoT devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {devices.map((device) => (
              <div key={device.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getDeviceIcon(device.type)}
                    <div>
                      <h3 className="font-medium">{device.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {device.type} • {device.connection}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(device.status)}
                    <Badge variant={device.status === 'connected' || device.status === 'online' ? 'default' : 'secondary'}>
                      {device.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Current Network</p>
                    <p className="text-sm font-medium">{device.currentNetwork || 'Not Connected'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">IP Address</p>
                    <p className="text-sm font-medium">{device.ipAddress || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">MAC Address</p>
                    <p className="text-sm font-medium">{device.macAddress}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Connection</p>
                    <div className="flex items-center space-x-1">
                      {device.connection === 'WiFi' ? <Wifi className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                      <span className="text-sm font-medium">{device.connection}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => configureDeviceNetwork(device, networkConfig)}
                    disabled={configuring || !networkConfig.ssid}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Wifi className="h-4 w-4 mr-2" />
                    {configuring && selectedDevice?.id === device.id ? 'Configuring...' : 'Configure Network'}
                  </Button>
                  <Button size="sm" variant="outline">
                    <Signal className="h-4 w-4 mr-2" />
                    Test Connection
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Advanced
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Progress */}
      {configuring && selectedDevice && (
        <Card>
          <CardHeader>
            <CardTitle>Network Configuration Progress</CardTitle>
            <CardDescription>
              Configuring {selectedDevice.name} for network {networkConfig.ssid}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{configProgress}%</span>
              </div>
              <Progress value={configProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Recommendations */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Recommendations:</strong> Use WPA3 or WPA2 security for your IoT devices. 
          Avoid open networks and weak passwords. Consider creating a separate IoT network to isolate 
          your smart devices from your main network.
        </AlertDescription>
      </Alert>
    </div>
  );
}
