"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Progress } from "@components/ui/progress";
import { Alert, AlertDescription } from "@components/ui/alert";
import { 
  Download, 
  Upload, 
  FileCode, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Activity,
  Cpu,
  Terminal,
  Zap,
  Shield,
  Clock,
  FileText,
  RefreshCw
} from "lucide-react";
import { useToast } from "@hooks/use-toast";

/**
 * Firmware Management Component
 * Handles firmware updates for ESP32, Arduino, and other IoT devices
 */
export default function FirmwareManager({ devices = [], onFirmwareUpdate }) {
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [firmwareFiles, setFirmwareFiles] = useState([]);
  const [updateLog, setUpdateLog] = useState([]);

  useEffect(() => {
    // Initialize firmware files for available device types
    const deviceTypes = [...new Set(devices.map(d => d.type))];
    const generatedFirmwareFiles = generateFirmwareFiles(deviceTypes);
    setFirmwareFiles(generatedFirmwareFiles);
  }, [devices]);

  const generateFirmwareFiles = (deviceTypes) => {
    const firmwareFiles = [];

    deviceTypes.forEach(type => {
      if (type === 'ESP32') {
        firmwareFiles.push({
          id: `esp32-latest`,
          name: "ESP32 Firmware Latest",
          version: "2.4.2",
          deviceType: "ESP32",
          size: "1.2MB",
          releaseDate: new Date().toISOString().split('T')[0],
          description: "Latest ESP32 firmware with improved WiFi stability and new features",
          compatible: ["ESP32", "ESP32-S2", "ESP32-S3"]
        });
      } else if (type === 'Arduino') {
        firmwareFiles.push({
          id: `arduino-latest`,
          name: "Arduino Firmware Latest",
          version: "1.8.20",
          deviceType: "Arduino",
          size: "256KB",
          releaseDate: new Date().toISOString().split('T')[0],
          description: "Arduino bootloader update with enhanced compatibility",
          compatible: ["Arduino Uno", "Arduino Nano", "Arduino Mega"]
        });
      } else {
        firmwareFiles.push({
          id: `${type.toLowerCase().replace(/\s+/g, '-')}-latest`,
          name: `${type} Firmware Latest`,
          version: "1.2.1",
          deviceType: type,
          size: "512KB",
          releaseDate: new Date().toISOString().split('T')[0],
          description: `${type} firmware with improved features and bug fixes`,
          compatible: [type]
        });
      }
    });

    return firmwareFiles;
  };

  const checkForUpdates = async () => {
    toast({
      title: "Checking for Updates",
      description: "Scanning for available firmware updates...",
    });

    // Simulate update check - in real implementation this would query device firmware
    await new Promise(resolve => setTimeout(resolve, 2000));

    // For demo purposes, assume all devices have updates available
    const updateCount = devices.length;
    toast({
      title: "Update Check Complete",
      description: `${updateCount} devices have firmware updates available`,
    });
  };

  const downloadFirmware = async (firmwareFile) => {
    try {
      // Simulate firmware download
      toast({
        title: "Downloading Firmware",
        description: `Downloading ${firmwareFile.name}...`,
      });

      await new Promise(resolve => setTimeout(resolve, 3000));

      toast({
        title: "Download Complete",
        description: `${firmwareFile.name} downloaded successfully`,
      });

      return firmwareFile;
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download firmware file",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateDeviceFirmware = async (device, firmwareFile) => {
    setUpdating(true);
    setUpdateProgress(0);
    setUpdateLog([]);
    setSelectedDevice(device);

    try {
      // Step 1: Download firmware (10%)
      addLogEntry("Downloading firmware file...");
      await downloadFirmware(firmwareFile);
      setUpdateProgress(10);

      // Step 2: Verify device connection (20%)
      addLogEntry("Verifying device connection...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUpdateProgress(20);

      // Step 3: Backup current firmware (30%)
      addLogEntry("Creating firmware backup...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      setUpdateProgress(30);

      // Step 4: Erase flash memory (50%)
      addLogEntry("Erasing flash memory...");
      await new Promise(resolve => setTimeout(resolve, 3000));
      setUpdateProgress(50);

      // Step 5: Write new firmware (80%)
      addLogEntry("Writing new firmware...");
      await new Promise(resolve => setTimeout(resolve, 4000));
      setUpdateProgress(80);

      // Step 6: Verify firmware (90%)
      addLogEntry("Verifying firmware integrity...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      setUpdateProgress(90);

      // Step 7: Restart device (100%)
      addLogEntry("Restarting device...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUpdateProgress(100);

      // Update device firmware version in parent component
      if (onFirmwareUpdate) {
        onFirmwareUpdate(device.id, {
          ...device,
          firmware: {
            ...device.firmware,
            version: firmwareFile.version,
            updateAvailable: false,
            lastUpdate: new Date().toISOString()
          }
        });
      }

      addLogEntry("Firmware update completed successfully!", "success");
      
      toast({
        title: "Update Complete",
        description: `Successfully updated ${device.name} to ${firmwareFile.version}`,
      });

    } catch (error) {
      addLogEntry(`Update failed: ${error.message}`, "error");
      toast({
        title: "Update Failed",
        description: "Firmware update failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
      setUpdateProgress(0);
      setSelectedDevice(null);
    }
  };

  const addLogEntry = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setUpdateLog(prev => [...prev, { timestamp, message, type }]);
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case "ESP32":
        return <Cpu className="h-5 w-5" />;
      case "Arduino":
        return <Terminal className="h-5 w-5" />;
      case "IoT Sensor":
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

  const getLogIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Firmware Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Updates Available</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {devices.filter(d => d.updateAvailable).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Firmware updates pending
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Firmware Files</CardTitle>
            <FileCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{firmwareFiles.length}</div>
            <p className="text-xs text-muted-foreground">
              Available firmware versions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Update</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {devices.length > 0 ? 
                new Date(Math.max(...devices.map(d => new Date(d.lastUpdate)))).toLocaleDateString() 
                : 'Never'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Most recent firmware update
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Device Firmware Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Device Firmware</CardTitle>
              <CardDescription>
                Manage firmware updates for your IoT devices
              </CardDescription>
            </div>
            <Button onClick={checkForUpdates} disabled={updating}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Check for Updates
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {devices.map((device) => {
              const compatibleFirmware = firmwareFiles.filter(f => 
                f.compatible.includes(device.type)
              );
              
              return (
                <div key={device.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getDeviceIcon(device.type)}
                      <div>
                        <h3 className="font-medium">{device.name || `Device ${device.id}`}</h3>
                        <p className="text-sm text-muted-foreground">
                          Current: {device.firmware?.version || 'Unknown'} • Latest: {compatibleFirmware[0]?.version || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(device.status)}
                      {device.updateAvailable && (
                        <Badge variant="default" className="bg-orange-500">
                          Update Available
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Device Type</p>
                      <p className="text-sm font-medium">{device.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Connection</p>
                      <p className="text-sm font-medium">{device.connection}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Last Update</p>
                      <p className="text-sm font-medium">
                        {device.firmware?.lastUpdate ? new Date(device.firmware.lastUpdate).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge variant={device.status === 'connected' || device.status === 'online' ? 'default' : 'secondary'}>
                        {device.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {compatibleFirmware.length > 0 && (
                      <Button
                        onClick={() => updateDeviceFirmware(device, compatibleFirmware[0])}
                        disabled={updating}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {updating && selectedDevice?.id === device.id ? 'Updating...' : 'Update Firmware'}
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Shield className="h-4 w-4 mr-2" />
                      Backup
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Update Progress */}
      {updating && selectedDevice && (
        <Card>
          <CardHeader>
            <CardTitle>Firmware Update Progress</CardTitle>
            <CardDescription>
              Updating {selectedDevice.name} to latest firmware
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{updateProgress}%</span>
              </div>
              <Progress value={updateProgress} className="w-full" />
              
              {/* Update Log */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Update Log</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {updateLog.map((log, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      {getLogIcon(log.type)}
                      <span className="text-muted-foreground">{log.timestamp}</span>
                      <span>{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Firmware Files */}
      <Card>
        <CardHeader>
          <CardTitle>Available Firmware</CardTitle>
          <CardDescription>
            Download and manage firmware files for different device types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {firmwareFiles.map((firmware) => (
              <div key={firmware.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{firmware.name}</h3>
                    <p className="text-sm text-muted-foreground">{firmware.description}</p>
                  </div>
                  <Badge variant="outline">{firmware.version}</Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Device Type</p>
                    <p className="text-sm font-medium">{firmware.deviceType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Size</p>
                    <p className="text-sm font-medium">{firmware.size}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Release Date</p>
                    <p className="text-sm font-medium">{firmware.releaseDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Compatible</p>
                    <p className="text-sm font-medium">{firmware.compatible.length} devices</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Release Notes
                  </Button>
                  <Button size="sm" variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Verify Checksum
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Safety Warning */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Firmware updates can potentially brick your device if interrupted. 
          Ensure stable power supply and don't disconnect the device during the update process. 
          Always backup your current firmware before updating.
        </AlertDescription>
      </Alert>
    </div>
  );
}
