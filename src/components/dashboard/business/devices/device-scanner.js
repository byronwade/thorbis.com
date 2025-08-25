"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Progress } from "@components/ui/progress";
import { Alert, AlertDescription } from "@components/ui/alert";
import { 
  Cpu, 
  Wifi, 
  Usb, 
  Bluetooth, 
  RefreshCw, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Activity,
  Terminal,
  Zap,
  Shield,
  FileCode,
  TestTube
} from "lucide-react";
import { useToast } from "@hooks/use-toast";

/**
 * Advanced Device Scanner Component
 * Uses Web Serial API, Web Bluetooth API, and network discovery to find IoT devices
 */
export default function DeviceScanner({
  onDevicesFound,
  autoDetect = false,
  autoDetectInterval = 10000,
  enableSerialScan = true,
  enableBluetoothScan = true,
  enableNetworkScan = false
}) {
  const { toast } = useToast();
  const [devices, setDevices] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [browserSupport, setBrowserSupport] = useState({
    serial: false,
    bluetooth: false,
    usb: false
  });
  const [autoDetectionEnabled, setAutoDetectionEnabled] = useState(autoDetect);
  const [lastAutoScan, setLastAutoScan] = useState(null);

  useEffect(() => {
    // Check browser API support
    checkBrowserSupport();

    // Start auto-detection if enabled
    if (autoDetect) {
      startAutoDetection();
    }

    return () => {
      if (autoDetectionEnabled) {
        stopAutoDetection();
      }
    };
  }, [autoDetect, autoDetectInterval]);

  const startAutoDetection = () => {
    setAutoDetectionEnabled(true);
    // Perform initial scan
    performSilentScan();

    // Set up periodic scanning
    const interval = setInterval(() => {
      performSilentScan();
    }, autoDetectInterval);

    // Store interval for cleanup
    window.deviceAutoScanInterval = interval;
  };

  const stopAutoDetection = () => {
    setAutoDetectionEnabled(false);
    if (window.deviceAutoScanInterval) {
      clearInterval(window.deviceAutoScanInterval);
      window.deviceAutoScanInterval = null;
    }
  };

  const performSilentScan = async () => {
    if (scanning) return; // Don't interrupt ongoing scan

    try {
      setScanning(true);
      setScanProgress(0);

      const allDevices = [];

      // Step 1: Scan for serial devices (silent)
      if (enableSerialScan && browserSupport.serial) {
        try {
          const serialDevices = await scanForSerialDevicesSilent();
          allDevices.push(...serialDevices);
        } catch (error) {
          // Silent fail for auto-detection
          console.log('Auto serial scan:', error.message);
        }
      }

      // Step 2: Scan for Bluetooth devices (silent)
      if (enableBluetoothScan && browserSupport.bluetooth) {
        try {
          const bluetoothDevices = await scanForBluetoothDevicesSilent();
          allDevices.push(...bluetoothDevices);
        } catch (error) {
          // Silent fail for auto-detection
          console.log('Auto Bluetooth scan:', error.message);
        }
      }

      // Step 3: Scan network devices (optional for auto-detection)
      if (enableNetworkScan) {
        try {
          const networkDevices = await scanNetworkDevices();
          allDevices.push(...networkDevices);
        } catch (error) {
          // Silent fail for auto-detection
          console.log('Auto network scan:', error.message);
        }
      }

      // Update devices list if any found
      if (allDevices.length > 0) {
        setDevices(allDevices);
        setLastAutoScan(new Date());

        // Pass found devices to parent component
        if (onDevicesFound && Array.isArray(allDevices)) {
          try {
            onDevicesFound(allDevices);
          } catch (error) {
            console.error('Error passing devices to parent:', error);
          }
        }
      }

    } catch (error) {
      console.log('Auto device scan failed:', error.message);
    } finally {
      setScanning(false);
      setScanProgress(0);
    }
  };

  const checkBrowserSupport = () => {
    const support = {
      serial: 'serial' in navigator,
      bluetooth: 'bluetooth' in navigator,
      usb: 'usb' in navigator
    };
    setBrowserSupport(support);
  };

  const scanForSerialDevicesSilent = async () => {
    if (!browserSupport.serial || !navigator.serial) {
      return [];
    }

    try {
      // For auto-detection, we'll try to use getPorts() to check existing ports
      // This doesn't require user interaction
      const ports = await navigator.serial.getPorts();
      console.log('Found existing serial ports:', ports.length);

      const devices = [];
      for (const port of ports) {
        try {
          // Check if port is already open
          if (port.readable && port.writable) {
            console.log('Port already open, creating device entry');
            devices.push({
              id: `serial-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: 'Connected Serial Device',
              type: 'Serial Device',
              connection: 'USB',
              status: 'connected',
              firmware: 'Unknown',
              port: port,
              model: 'Serial Device'
            });
            continue;
          }

          // Try to open the port briefly to identify the device
          await port.open({ baudRate: 115200 });
          console.log('Successfully opened port');

          // Create a simple device entry for now
          devices.push({
            id: `serial-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: 'Serial Device',
            type: 'Serial Device',
            connection: 'USB',
            status: 'connected',
            firmware: 'Unknown',
            port: port,
            model: 'Serial Device'
          });

          // Close the port after identification
          await port.close();
        } catch (error) {
          console.log('Port check failed:', error.message);
        }
      }

      console.log('Silent scan found devices:', devices.length);
      return devices;
    } catch (error) {
      console.log('Silent serial scan error:', error.message);
      return [];
    }
  };

  const scanForSerialDevices = async () => {
    if (!browserSupport.serial) {
      toast({
        title: "Browser Not Supported",
        description: "Web Serial API is not supported in this browser. Please use Chrome, Edge, or Opera.",
        variant: "destructive"
      });
      return [];
    }

    if (!navigator.serial) {
      toast({
        title: "Serial API Unavailable",
        description: "Web Serial API is not available. Please check your browser settings.",
        variant: "destructive"
      });
      return [];
    }

    try {
      // Request serial port access with user-friendly error handling
      let port;
      try {
        port = await navigator.serial.requestPort();
        console.log('User selected port:', port);
      } catch (userCancelError) {
        // User canceled the port selection dialog - this is expected behavior
        console.log('Serial port selection canceled by user');
        toast({
          title: "Port Selection Canceled",
          description: "No serial port was selected. Please try again.",
        });
        return [];
      }

      try {
        await port.open({ baudRate: 115200 });
        console.log('Successfully opened port');

        // Create device entry
        const device = {
          id: `serial-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: 'Serial Device',
          type: 'Serial Device',
          connection: 'USB',
          status: 'connected',
          firmware: 'Unknown',
          port: port,
          model: 'Serial Device'
        };

        toast({
          title: "Device Connected",
          description: "Serial device successfully connected and added to your device list.",
        });

        return [device];
      } catch (openError) {
        console.error('Failed to open port:', openError);
        toast({
          title: "Connection Failed",
          description: "Failed to connect to the selected serial port. Please check if the device is properly connected.",
          variant: "destructive"
        });
        return [];
      }
    } catch (error) {
      console.error('Serial scan error:', error);
      toast({
        title: "Scan Error",
        description: "An error occurred while scanning for serial devices. Please try again.",
        variant: "destructive"
      });
      return [];
    }
  };

  const scanForBluetoothDevicesSilent = async () => {
    // For auto-detection, we'll try to connect to known devices without user interaction
    // This is limited since Web Bluetooth requires user permission for device selection
    // We'll only work with devices that have been previously paired
    if (!browserSupport.bluetooth || !navigator.bluetooth) {
      return [];
    }

    try {
      // Try to get devices that are already connected or paired
      // Note: Web Bluetooth doesn't provide a way to enumerate all paired devices
      // This is mainly for future expansion when more APIs become available
      return [];
    } catch (error) {
      console.log('Silent Bluetooth scan:', error.message);
      return [];
    }
  };

  const scanForBluetoothDevices = async () => {
    if (!browserSupport.bluetooth) {
      console.warn('Bluetooth API not supported in this browser');
      return [];
    }

    if (!navigator.bluetooth) {
      console.warn('navigator.bluetooth is not available');
      return [];
    }

    try {
      let device;
      try {
        device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['battery_service', 'device_information']
        });
      } catch (userCancelError) {
        // User canceled the device selection dialog - this is expected behavior
        console.log('Bluetooth device selection canceled by user');
        return [];
      }

      const server = await device.gatt.connect();
      const services = await server.getPrimaryServices();

      return [{
        id: `bluetooth-${device.id}`,
        name: device.name || 'Bluetooth Device',
        type: 'Bluetooth',
        connection: 'Bluetooth',
        status: 'connected',
        firmware: 'Unknown',
        device: device,
        server: server,
        services: services
      }];
    } catch (error) {
      // Handle different types of errors appropriately
      if (error.name === 'NotFoundError' || error.message.includes('No Services found')) {
        console.log('No Bluetooth device selected or available');
      } else {
        console.error('Bluetooth scan error:', error);
      }
      return [];
    }
  };

  const scanNetworkDevices = async () => {
    // Scan local network for IoT devices (optimized for auto-detection)
    const networkDevices = [];

    // For auto-detection, only scan a few common IPs to reduce network noise
    const commonIPs = [
      '192.168.1.1',   // Router/gateway
      '192.168.1.100', // Common IoT device IP
      '192.168.1.101', // Common IoT device IP
      '192.168.1.102'  // Common IoT device IP
    ];

    for (const ip of commonIPs) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000); // 1 second timeout

        const response = await fetch(`http://${ip}/device-info`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'IoT-Device-Scanner/1.0'
          }
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const deviceInfo = await response.json();
          networkDevices.push({
            id: `network-${ip}`,
            name: deviceInfo.name || `Device ${ip}`,
            type: deviceInfo.type || 'IoT Device',
            connection: 'WiFi',
            status: 'online',
            firmware: deviceInfo.firmware || 'Unknown',
            ipAddress: ip,
            macAddress: deviceInfo.mac || 'Unknown'
          });
        }
      } catch (error) {
        // Device not found or not responding - this is expected during network scanning
        // Don't log these errors as they create noise during auto-detection
      }
    }

    return networkDevices;
  };

  const scanForDevices = async () => {
    setScanning(true);
    setScanProgress(0);
    setDevices([]);

    const allDevices = [];

    try {
      // Step 1: Scan for serial devices (20%)
      toast({
        title: "Scanning Serial Devices",
        description: "Checking for USB-connected devices...",
      });
      
      const serialDevices = await scanForSerialDevices();
      allDevices.push(...serialDevices);
      setScanProgress(20);

      // Step 2: Scan for Bluetooth devices (40%)
      toast({
        title: "Scanning Bluetooth Devices",
        description: "Looking for Bluetooth IoT devices...",
      });
      
      const bluetoothDevices = await scanForBluetoothDevices();
      allDevices.push(...bluetoothDevices);
      setScanProgress(40);

      // Step 3: Scan network devices (80%)
      toast({
        title: "Scanning Network Devices",
        description: "Searching local network for IoT devices...",
      });
      
      const networkDevices = await scanNetworkDevices();
      allDevices.push(...networkDevices);
      setScanProgress(80);

      // Step 4: Finalize scan (100%)
      setScanProgress(100);

      setDevices(allDevices);

      // Pass found devices to parent component
      if (onDevicesFound && Array.isArray(allDevices)) {
        try {
          onDevicesFound(allDevices);
        } catch (error) {
          console.error('Error passing devices to parent:', error);
        }
      }

      // Provide appropriate feedback based on scan results
      if (allDevices.length > 0) {
        toast({
          title: "Scan Complete",
          description: `Found ${allDevices.length} device${allDevices.length === 1 ? '' : 's'}`,
        });
      } else {
        toast({
          title: "Scan Complete",
          description: "No devices found. Connect a device and try again.",
          variant: "default"
        });
      }

    } catch (error) {
      console.error('Device scan error:', error);
      toast({
        title: "Scan Failed",
        description: "Unable to complete device scan. Please check permissions.",
        variant: "destructive",
      });
    } finally {
      setScanning(false);
      setScanProgress(0);
    }
  };

  const parseSerialResponse = (response) => {
    // Parse common device identification responses
    const lines = response.split('\n');
    
    for (const line of lines) {
      // ESP32 identification
      if (line.includes('ESP32')) {
        return {
          name: 'ESP32 Development Board',
          type: 'ESP32',
          firmware: extractVersion(line)
        };
      }
      
      // Arduino identification
      if (line.includes('Arduino') || line.includes('AVR')) {
        return {
          name: 'Arduino Board',
          type: 'Arduino',
          firmware: extractVersion(line)
        };
      }
      
      // Generic device info
      if (line.includes('DEVICE:')) {
        const parts = line.split(':');
        return {
          name: parts[1]?.trim() || 'Serial Device',
          type: 'Unknown',
          firmware: 'Unknown'
        };
      }
    }
    
    return null;
  };

  const extractVersion = (text) => {
    const versionMatch = text.match(/v?(\d+\.\d+\.\d+)/);
    return versionMatch ? versionMatch[1] : 'Unknown';
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case "ESP32":
        return <Cpu className="h-5 w-5" />;
      case "Arduino":
        return <Terminal className="h-5 w-5" />;
      case "Bluetooth":
        return <Bluetooth className="h-5 w-5" />;
      case "IoT Device":
        return <Activity className="h-5 w-5" />;
      default:
        return <Cpu className="h-5 w-5" />;
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

  const getConnectionIcon = (connection) => {
    switch (connection) {
      case "USB":
        return <Usb className="h-4 w-4" />;
      case "WiFi":
        return <Wifi className="h-4 w-4" />;
      case "Bluetooth":
        return <Bluetooth className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Device Scanner</span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (autoDetectionEnabled) {
                  stopAutoDetection();
                } else {
                  startAutoDetection();
                }
              }}
            >
              {autoDetectionEnabled ? '🔄 Auto On' : '🔄 Auto Off'}
            </Button>
          </div>
          <CardDescription>
            Scan for connected IoT devices, development boards, and network equipment
            {autoDetectionEnabled && (
              <span className="block mt-1 text-xs text-green-600 dark:text-green-400">
                🔄 Auto-detection enabled (scanning every {Math.round(autoDetectInterval / 1000)}s)
                {lastAutoScan && (
                  <span className="ml-2">
                    • Last scan: {lastAutoScan.toLocaleTimeString()}
                  </span>
                )}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Browser Support Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Usb className="h-4 w-4" />
              <span className="text-sm">Serial API:</span>
              <Badge variant={browserSupport.serial ? "default" : "secondary"}>
                {browserSupport.serial ? "Supported" : "Not Available"}
              </Badge>
              {browserSupport.serial && (
                <span className="text-xs text-muted-foreground">(Arduino, ESP32)</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Bluetooth className="h-4 w-4" />
              <span className="text-sm">Bluetooth API:</span>
              <Badge variant={browserSupport.bluetooth ? "default" : "secondary"}>
                {browserSupport.bluetooth ? "Supported" : "Not Available"}
              </Badge>
              {browserSupport.bluetooth && (
                <span className="text-xs text-muted-foreground">(BLE sensors)</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Wifi className="h-4 w-4" />
              <span className="text-sm">Network Scan:</span>
              <Badge variant="default">Available</Badge>
            </div>
          </div>

          {/* Scan Progress */}
          {scanning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Scanning devices...</span>
                <span>{scanProgress}%</span>
              </div>
              <Progress value={scanProgress} className="w-full" />
            </div>
          )}

          {/* Scan Buttons */}
          <div className="space-y-2">
            <Button 
              onClick={scanForDevices} 
              disabled={scanning}
              className="w-full"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${scanning ? 'animate-spin' : ''}`} />
              {scanning ? 'Scanning...' : 'Scan for Devices'}
            </Button>
            
            <Button 
              onClick={async () => {
                console.log('Manual test scan triggered');
                const foundDevices = await performSilentScan();
                console.log('Manual scan found devices:', foundDevices);
                if (foundDevices.length > 0) {
                  toast({
                    title: "Test Devices Found",
                    description: `Found ${foundDevices.length} device(s) during test scan`,
                  });
                } else {
                  toast({
                    title: "No Devices Found",
                    description: "No devices were detected during the test scan. Try connecting a USB device.",
                  });
                }
              }}
              variant="outline"
              disabled={scanning}
              className="w-full"
            >
              <TestTube className="h-4 w-4 mr-2" />
              Test Auto-Detection
            </Button>
          </div>

          {/* Device List */}
          {devices.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Found Devices ({devices.length})</h3>
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
                      <p className="text-xs text-muted-foreground">Firmware</p>
                      <p className="text-sm font-medium">{device.firmware}</p>
                    </div>
                    {device.ipAddress && (
                      <div>
                        <p className="text-xs text-muted-foreground">IP Address</p>
                        <p className="text-sm font-medium">{device.ipAddress}</p>
                      </div>
                    )}
                    {device.macAddress && (
                      <div>
                        <p className="text-xs text-muted-foreground">MAC Address</p>
                        <p className="text-sm font-medium">{device.macAddress}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">Connection</p>
                      <div className="flex items-center space-x-1">
                        {getConnectionIcon(device.connection)}
                        <span className="text-sm font-medium">{device.connection}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <FileCode className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                    <Button size="sm" variant="outline">
                      <Activity className="h-4 w-4 mr-2" />
                      Diagnostics
                    </Button>
                    <Button size="sm" variant="default">
                      <Zap className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Devices Found */}
          {!scanning && devices.length === 0 && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No devices found</h3>
              <p className="text-muted-foreground">
                Click "Scan for Devices" to search for connected IoT devices
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Browser Compatibility Alert */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Requirements:</strong> Device scanning requires HTTPS and modern browser support. 
          For USB devices, use Chrome/Edge 89+ with Web Serial API. For Bluetooth devices, 
          use Chrome/Edge 56+ with Web Bluetooth API.
        </AlertDescription>
      </Alert>
    </div>
  );
}
