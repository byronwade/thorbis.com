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
import { Textarea } from "@components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import {
  Settings,
  Wifi,
  WifiOff,
  Bluetooth,
  BluetoothSearching,
  Usb,
  Network,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity,
  Radio,
  Smartphone,
  Server,
  Database,
  Webhook,
  Zap,
  Clock,
  Thermometer,
  Gauge,
  Sun,
  Droplets,
  Wind,
  Cloud,
  Lightbulb,
  Speaker,
  Volume2,
  Fan,
  Thermostat,
  Camera,
  Video,
  Mic,
  MicOff,
  VolumeX,
  Bell,
  BellOff,
  ShieldCheck,
  FileCode,
  Terminal,
  GitBranch,
  Code
} from "lucide-react";
import { useToast } from "@hooks/use-toast";

/**
 * Device Configuration Panel
 * Comprehensive device configuration interface for WiFi, Bluetooth, sensors, and more
 */
export default function DeviceConfigPanel({ device, onConfigUpdate, onClose }) {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    wifi: {
      enabled: true,
      ssid: "",
      password: "",
      security: "WPA2",
      dhcp: true,
      ipAddress: "",
      gateway: "",
      subnet: "",
      dns: "",
      hostname: "",
      hidden: false,
      channel: 0,
      powerSave: false
    },
    bluetooth: {
      enabled: false,
      name: "",
      pairable: true,
      discoverable: true,
      services: [],
      advertising: true,
      powerLevel: "normal",
      pairingMode: "just_works"
    },
    mqtt: {
      enabled: false,
      broker: "",
      port: 1883,
      username: "",
      password: "",
      clientId: "",
      topic: "",
      qos: 0,
      retain: false,
      cleanSession: true,
      keepAlive: 60,
      will: {
        enabled: false,
        topic: "",
        message: "",
        qos: 0,
        retain: false
      }
    },
    sensors: {
      temperature: { enabled: true, interval: 30, threshold: { min: -40, max: 85 } },
      humidity: { enabled: true, interval: 30, threshold: { min: 0, max: 100 } },
      pressure: { enabled: true, interval: 60, threshold: { min: 800, max: 1200 } },
      light: { enabled: true, interval: 15, threshold: { min: 0, max: 1000 } },
      motion: { enabled: false, interval: 5, threshold: { sensitivity: 50 } },
      sound: { enabled: false, interval: 10, threshold: { min: 0, max: 100 } },
      airQuality: { enabled: false, interval: 30, threshold: { min: 0, max: 500 } }
    },
    actuators: {
      led: { enabled: true, pin: 2, default: false, brightness: 255 },
      relay: { enabled: false, pin: 12, default: false, name: "Switch 1" },
      servo: { enabled: false, pin: 13, minAngle: 0, maxAngle: 180, default: 90 },
      buzzer: { enabled: false, pin: 14, frequency: 1000, default: false },
      fan: { enabled: false, pin: 15, speed: 100, default: false }
    },
    system: {
      timezone: "UTC",
      ntp: { enabled: true, server: "pool.ntp.org", interval: 3600 },
      logging: { enabled: true, level: "info", remote: false, server: "" },
      watchdog: { enabled: true, timeout: 30 },
      deepSleep: { enabled: false, interval: 3600, wakePins: [] },
      ota: { enabled: true, port: 3232, password: "", automatic: false }
    },
    security: {
      password: "",
      encryption: "AES256",
      certificates: { enabled: false, ca: "", cert: "", key: "" },
      firewall: { enabled: false, rules: [] },
      accessControl: { enabled: false, users: [] }
    }
  });

  const [configuring, setConfiguring] = useState(false);
  const [configProgress, setConfigProgress] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [availableNetworks, setAvailableNetworks] = useState([]);

  useEffect(() => {
    if (device) {
      // Load existing configuration if available
      loadDeviceConfig();
      scanAvailableNetworks();
    }
  }, [device]);

  const loadDeviceConfig = async () => {
    try {
      // Simulate loading device configuration
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Load config from device or use defaults
      setConfig(prev => ({
        ...prev,
        wifi: {
          ...prev.wifi,
          ssid: device.currentNetwork || "",
          hostname: device.name.toLowerCase().replace(/\s+/g, '-')
        },
        bluetooth: {
          ...prev.bluetooth,
          name: device.name + " BT"
        }
      }));
    } catch (error) {
      console.error('Failed to load device config:', error);
    }
  };

  const scanAvailableNetworks = async () => {
    try {
      const networks = [
        { ssid: "HomeNetwork", security: "WPA2", signal: -45, channel: 6 },
        { ssid: "OfficeWiFi", security: "WPA3", signal: -52, channel: 11 },
        { ssid: "GuestNetwork", security: "WPA2", signal: -60, channel: 1 },
        { ssid: "IoT_Network", security: "WPA2", signal: -48, channel: 9 }
      ];
      setAvailableNetworks(networks);
    } catch (error) {
      console.error('Failed to scan networks:', error);
    }
  };

  const validateConfig = () => {
    const errors = {};

    // WiFi validation
    if (config.wifi.enabled) {
      if (!config.wifi.ssid) errors.ssid = "SSID is required";
      if (config.wifi.ssid.length > 32) errors.ssid = "SSID too long (max 32 chars)";
      if (!config.wifi.password && config.wifi.security !== "Open") {
        errors.password = "Password required for secure networks";
      }
      if (config.wifi.password && config.wifi.password.length < 8) {
        errors.password = "Password too short (min 8 chars)";
      }
      if (!config.wifi.dhcp && !config.wifi.ipAddress) {
        errors.ipAddress = "IP address required when DHCP is disabled";
      }
    }

    // MQTT validation
    if (config.mqtt.enabled) {
      if (!config.mqtt.broker) errors.broker = "MQTT broker is required";
      if (config.mqtt.port < 1 || config.mqtt.port > 65535) {
        errors.port = "Invalid port number";
      }
    }

    // System validation
    if (config.system.deepSleep.enabled && config.system.deepSleep.interval < 60) {
      errors.deepSleep = "Deep sleep interval too short (min 60 seconds)";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const applyConfiguration = async () => {
    if (!validateConfig()) {
      toast({
        title: "Configuration Error",
        description: "Please fix the validation errors before applying",
        variant: "destructive",
      });
      return;
    }

    setConfiguring(true);
    setConfigProgress(0);

    try {
      // Step 1: Validate configuration (10%)
      toast({
        title: "Validating Configuration",
        description: "Checking configuration settings...",
      });
      await new Promise(resolve => setTimeout(resolve, 500));
      setConfigProgress(10);

      // Step 2: Backup current config (20%)
      toast({
        title: "Backing Up Configuration",
        description: "Creating backup of current settings...",
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConfigProgress(20);

      // Step 3: Apply WiFi settings (40%)
      if (config.wifi.enabled) {
        toast({
          title: "Applying WiFi Settings",
          description: "Configuring WiFi connection...",
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
        setConfigProgress(40);
      }

      // Step 4: Apply Bluetooth settings (50%)
      if (config.bluetooth.enabled) {
        toast({
          title: "Applying Bluetooth Settings",
          description: "Configuring Bluetooth interface...",
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
        setConfigProgress(50);
      }

      // Step 5: Apply MQTT settings (60%)
      if (config.mqtt.enabled) {
        toast({
          title: "Applying MQTT Settings",
          description: "Configuring MQTT connection...",
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
        setConfigProgress(60);
      }

      // Step 6: Apply sensor settings (70%)
      toast({
        title: "Applying Sensor Settings",
        description: "Configuring sensor parameters...",
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConfigProgress(70);

      // Step 7: Apply system settings (80%)
      toast({
        title: "Applying System Settings",
        description: "Configuring system parameters...",
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConfigProgress(80);

      // Step 8: Test configuration (90%)
      toast({
        title: "Testing Configuration",
        description: "Verifying configuration changes...",
      });
      await new Promise(resolve => setTimeout(resolve, 1500));
      setConfigProgress(90);

      // Step 9: Save and restart (100%)
      toast({
        title: "Saving Configuration",
        description: "Saving settings and restarting device...",
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConfigProgress(100);

      // Notify parent component
      if (onConfigUpdate) {
        onConfigUpdate(device.id, config);
      }

      toast({
        title: "Configuration Applied",
        description: `Successfully configured ${device.name}`,
      });

    } catch (error) {
      toast({
        title: "Configuration Failed",
        description: "Failed to apply configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConfiguring(false);
      setConfigProgress(0);
    }
  };

  const exportConfig = () => {
    const configData = JSON.stringify(config, null, 2);
    const blob = new Blob([configData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${device.name}-config.json`;
    document.body.appendChild(a);
    try {
      a.click();
    } catch (error) {
      console.error('Error downloading config file:', error);
    } finally {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    toast({
      title: "Configuration Exported",
      description: "Device configuration saved to file",
    });
  };

  const importConfig = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedConfig = JSON.parse(e.target.result);
          setConfig(importedConfig);
          toast({
            title: "Configuration Imported",
            description: "Device configuration loaded from file",
          });
        } catch (error) {
          toast({
            title: "Import Failed",
            description: "Invalid configuration file",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const getSensorIcon = (sensor) => {
    switch (sensor) {
      case 'temperature':
        return <Thermometer className="h-4 w-4" />;
      case 'humidity':
        return <Droplets className="h-4 w-4" />;
      case 'pressure':
        return <Gauge className="h-4 w-4" />;
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'motion':
        return <Activity className="h-4 w-4" />;
      case 'sound':
        return <Volume2 className="h-4 w-4" />;
      case 'airQuality':
        return <Cloud className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActuatorIcon = (actuator) => {
    switch (actuator) {
      case 'led':
        return <Lightbulb className="h-4 w-4" />;
      case 'relay':
        return <Zap className="h-4 w-4" />;
      case 'servo':
        return <Settings className="h-4 w-4" />;
      case 'buzzer':
        return <Speaker className="h-4 w-4" />;
      case 'fan':
        return <Fan className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (!device) {
    return (
      <div className="text-center py-8">
        <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">No Device Selected</h3>
        <p className="text-muted-foreground">
          Select a device to configure its settings
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Device Configuration</h2>
          <p className="text-muted-foreground">
            Configure {device.name} - {device.type}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={exportConfig}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <label className="cursor-pointer">
            <Button variant="outline" as="span">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={importConfig}
              className="hidden"
            />
          </label>
          <Button onClick={applyConfiguration} disabled={configuring}>
            <Save className="h-4 w-4 mr-2" />
            {configuring ? 'Applying...' : 'Apply Config'}
          </Button>
        </div>
      </div>

      {/* Configuration Progress */}
      {configuring && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Applying configuration...</span>
              <span>{configProgress}%</span>
            </div>
            <Progress value={configProgress} className="w-full" />
          </CardContent>
        </Card>
      )}

      {/* Configuration Tabs */}
      <Tabs defaultValue="network" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="sensors">Sensors</TabsTrigger>
          <TabsTrigger value="actuators">Actuators</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Network Configuration */}
        <TabsContent value="network" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* WiFi Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wifi className="h-5 w-5" />
                  <span>WiFi Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.wifi.enabled}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      wifi: { ...prev.wifi, enabled: e.target.checked }
                    }))}
                  />
                  <Label>Enable WiFi</Label>
                </div>

                {config.wifi.enabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="ssid">Network SSID</Label>
                      <Select
                        value={config.wifi.ssid}
                        onValueChange={(value) => setConfig(prev => ({
                          ...prev,
                          wifi: { ...prev.wifi, ssid: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select network" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableNetworks.map(network => (
                            <SelectItem key={network.ssid} value={network.ssid}>
                              {network.ssid} ({network.security}) - {network.signal}dBm
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {validationErrors.ssid && (
                        <p className="text-sm text-red-500">{validationErrors.ssid}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={config.wifi.password}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            wifi: { ...prev.wifi, password: e.target.value }
                          }))}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {validationErrors.password && (
                        <p className="text-sm text-red-500">{validationErrors.password}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="security">Security</Label>
                        <Select
                          value={config.wifi.security}
                          onValueChange={(value) => setConfig(prev => ({
                            ...prev,
                            wifi: { ...prev.wifi, security: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Open">Open</SelectItem>
                            <SelectItem value="WEP">WEP</SelectItem>
                            <SelectItem value="WPA">WPA</SelectItem>
                            <SelectItem value="WPA2">WPA2</SelectItem>
                            <SelectItem value="WPA3">WPA3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="channel">Channel</Label>
                        <Input
                          id="channel"
                          type="number"
                          min="1"
                          max="14"
                          value={config.wifi.channel}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            wifi: { ...prev.wifi, channel: parseInt(e.target.value) }
                          }))}
                        />
                      </div>
                    </div>
                  </>
                )}
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
                    checked={config.bluetooth.enabled}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      bluetooth: { ...prev.bluetooth, enabled: e.target.checked }
                    }))}
                  />
                  <Label>Enable Bluetooth</Label>
                </div>

                {config.bluetooth.enabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="bt-name">Device Name</Label>
                      <Input
                        id="bt-name"
                        value={config.bluetooth.name}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          bluetooth: { ...prev.bluetooth, name: e.target.value }
                        }))}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={config.bluetooth.pairable}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            bluetooth: { ...prev.bluetooth, pairable: e.target.checked }
                          }))}
                        />
                        <Label>Pairable</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={config.bluetooth.discoverable}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            bluetooth: { ...prev.bluetooth, discoverable: e.target.checked }
                          }))}
                        />
                        <Label>Discoverable</Label>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* MQTT Configuration */}
            <Card className="md:col-span-2">
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
                    checked={config.mqtt.enabled}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      mqtt: { ...prev.mqtt, enabled: e.target.checked }
                    }))}
                  />
                  <Label>Enable MQTT</Label>
                </div>

                {config.mqtt.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="broker">MQTT Broker</Label>
                      <Input
                        id="broker"
                        placeholder="broker.example.com"
                        value={config.mqtt.broker}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          mqtt: { ...prev.mqtt, broker: e.target.value }
                        }))}
                      />
                      {validationErrors.broker && (
                        <p className="text-sm text-red-500">{validationErrors.broker}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="port">Port</Label>
                      <Input
                        id="port"
                        type="number"
                        value={config.mqtt.port}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          mqtt: { ...prev.mqtt, port: parseInt(e.target.value) }
                        }))}
                      />
                      {validationErrors.port && (
                        <p className="text-sm text-red-500">{validationErrors.port}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="topic">Topic</Label>
                      <Input
                        id="topic"
                        placeholder="device/status"
                        value={config.mqtt.topic}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          mqtt: { ...prev.mqtt, topic: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sensors Configuration */}
        <TabsContent value="sensors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sensor Configuration</CardTitle>
              <CardDescription>
                Configure sensor parameters and thresholds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(config.sensors).map(([sensor, settings]) => (
                  <div key={sensor} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getSensorIcon(sensor)}
                        <span className="font-medium capitalize">
                          {sensor.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enabled}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          sensors: {
                            ...prev.sensors,
                            [sensor]: { ...prev.sensors[sensor], enabled: e.target.checked }
                          }
                        }))}
                      />
                    </div>

                    {settings.enabled && (
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs">Interval (seconds)</Label>
                          <Input
                            type="number"
                            size="sm"
                            value={settings.interval}
                            onChange={(e) => setConfig(prev => ({
                              ...prev,
                              sensors: {
                                ...prev.sensors,
                                [sensor]: { ...prev.sensors[sensor], interval: parseInt(e.target.value) }
                              }
                            }))}
                          />
                        </div>

                        {settings.threshold && (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Min</Label>
                              <Input
                                type="number"
                                size="sm"
                                value={settings.threshold.min}
                                onChange={(e) => setConfig(prev => ({
                                  ...prev,
                                  sensors: {
                                    ...prev.sensors,
                                    [sensor]: {
                                      ...prev.sensors[sensor],
                                      threshold: {
                                        ...prev.sensors[sensor].threshold,
                                        min: parseFloat(e.target.value)
                                      }
                                    }
                                  }
                                }))}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Max</Label>
                              <Input
                                type="number"
                                size="sm"
                                value={settings.threshold.max}
                                onChange={(e) => setConfig(prev => ({
                                  ...prev,
                                  sensors: {
                                    ...prev.sensors,
                                    [sensor]: {
                                      ...prev.sensors[sensor],
                                      threshold: {
                                        ...prev.sensors[sensor].threshold,
                                        max: parseFloat(e.target.value)
                                      }
                                    }
                                  }
                                }))}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actuators Configuration */}
        <TabsContent value="actuators" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actuator Configuration</CardTitle>
              <CardDescription>
                Configure output devices and actuators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(config.actuators).map(([actuator, settings]) => (
                  <div key={actuator} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getActuatorIcon(actuator)}
                        <span className="font-medium capitalize">{actuator}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enabled}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          actuators: {
                            ...prev.actuators,
                            [actuator]: { ...prev.actuators[actuator], enabled: e.target.checked }
                          }
                        }))}
                      />
                    </div>

                    {settings.enabled && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Pin</Label>
                            <Input
                              type="number"
                              size="sm"
                              value={settings.pin}
                              onChange={(e) => setConfig(prev => ({
                                ...prev,
                                actuators: {
                                  ...prev.actuators,
                                  [actuator]: { ...prev.actuators[actuator], pin: parseInt(e.target.value) }
                                }
                              }))}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Default State</Label>
                            <Select
                              value={settings.default.toString()}
                              onValueChange={(value) => setConfig(prev => ({
                                ...prev,
                                actuators: {
                                  ...prev.actuators,
                                  [actuator]: { ...prev.actuators[actuator], default: value === "true" }
                                }
                              }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="false">Off</SelectItem>
                                <SelectItem value="true">On</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {actuator === 'led' && (
                          <div>
                            <Label className="text-xs">Brightness (0-255)</Label>
                            <Input
                              type="range"
                              min="0"
                              max="255"
                              value={settings.brightness}
                              onChange={(e) => setConfig(prev => ({
                                ...prev,
                                actuators: {
                                  ...prev.actuators,
                                  led: { ...prev.actuators.led, brightness: parseInt(e.target.value) }
                                }
                              }))}
                            />
                          </div>
                        )}

                        {actuator === 'servo' && (
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label className="text-xs">Min Angle</Label>
                              <Input
                                type="number"
                                size="sm"
                                value={settings.minAngle}
                                onChange={(e) => setConfig(prev => ({
                                  ...prev,
                                  actuators: {
                                    ...prev.actuators,
                                    servo: { ...prev.actuators.servo, minAngle: parseInt(e.target.value) }
                                  }
                                }))}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Max Angle</Label>
                              <Input
                                type="number"
                                size="sm"
                                value={settings.maxAngle}
                                onChange={(e) => setConfig(prev => ({
                                  ...prev,
                                  actuators: {
                                    ...prev.actuators,
                                    servo: { ...prev.actuators.servo, maxAngle: parseInt(e.target.value) }
                                  }
                                }))}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Default</Label>
                              <Input
                                type="number"
                                size="sm"
                                value={settings.default}
                                onChange={(e) => setConfig(prev => ({
                                  ...prev,
                                  actuators: {
                                    ...prev.actuators,
                                    servo: { ...prev.actuators.servo, default: parseInt(e.target.value) }
                                  }
                                }))}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Configuration */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Time Configuration */}
              <div className="space-y-4">
                <h4 className="font-medium">Time Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select
                      value={config.system.timezone}
                      onValueChange={(value) => setConfig(prev => ({
                        ...prev,
                        system: { ...prev.system, timezone: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>NTP Server</Label>
                    <Input
                      value={config.system.ntp.server}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        system: {
                          ...prev.system,
                          ntp: { ...prev.system.ntp, server: e.target.value }
                        }
                      }))}
                    />
                  </div>
                </div>
              </div>

              {/* Deep Sleep Configuration */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.system.deepSleep.enabled}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      system: {
                        ...prev.system,
                        deepSleep: { ...prev.system.deepSleep, enabled: e.target.checked }
                      }
                    }))}
                  />
                  <Label>Enable Deep Sleep</Label>
                </div>

                {config.system.deepSleep.enabled && (
                  <div className="space-y-2">
                    <Label>Deep Sleep Interval (seconds)</Label>
                    <Input
                      type="number"
                      value={config.system.deepSleep.interval}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        system: {
                          ...prev.system,
                          deepSleep: { ...prev.system.deepSleep, interval: parseInt(e.target.value) }
                        }
                      }))}
                    />
                    {validationErrors.deepSleep && (
                      <p className="text-sm text-red-500">{validationErrors.deepSleep}</p>
                    )}
                  </div>
                )}
              </div>

              {/* OTA Configuration */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.system.ota.enabled}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      system: {
                        ...prev.system,
                        ota: { ...prev.system.ota, enabled: e.target.checked }
                      }
                    }))}
                  />
                  <Label>Enable OTA Updates</Label>
                </div>

                {config.system.ota.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>OTA Port</Label>
                      <Input
                        type="number"
                        value={config.system.ota.port}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          system: {
                            ...prev.system,
                            ota: { ...prev.system.ota, port: parseInt(e.target.value) }
                          }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>OTA Password</Label>
                      <Input
                        type="password"
                        value={config.system.ota.password}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          system: {
                            ...prev.system,
                            ota: { ...prev.system.ota, password: e.target.value }
                          }
                        }))}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Configuration */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Device Password</Label>
                <Input
                  type="password"
                  value={config.security.password}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    security: { ...prev.security, password: e.target.value }
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Encryption Method</Label>
                <Select
                  value={config.security.encryption}
                  onValueChange={(value) => setConfig(prev => ({
                    ...prev,
                    security: { ...prev.security, encryption: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="AES128">AES-128</SelectItem>
                    <SelectItem value="AES256">AES-256</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.security.certificates.enabled}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    security: {
                      ...prev.security,
                      certificates: { ...prev.security.certificates, enabled: e.target.checked }
                    }
                  }))}
                />
                <Label>Enable SSL/TLS Certificates</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Configuration */}
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Configuration</CardTitle>
              <CardDescription>
                Advanced settings for experienced users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Watchdog Configuration */}
                <div className="space-y-4">
                  <h4 className="font-medium">Watchdog Timer</h4>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.system.watchdog.enabled}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        system: {
                          ...prev.system,
                          watchdog: { ...prev.system.watchdog, enabled: e.target.checked }
                        }
                      }))}
                    />
                    <Label>Enable Watchdog Timer</Label>
                  </div>

                  {config.system.watchdog.enabled && (
                    <div className="space-y-2">
                      <Label>Watchdog Timeout (seconds)</Label>
                      <Input
                        type="number"
                        value={config.system.watchdog.timeout}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          system: {
                            ...prev.system,
                            watchdog: { ...prev.system.watchdog, timeout: parseInt(e.target.value) }
                          }
                        }))}
                      />
                    </div>
                  )}
                </div>

                {/* Logging Configuration */}
                <div className="space-y-4">
                  <h4 className="font-medium">Logging</h4>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.system.logging.enabled}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        system: {
                          ...prev.system,
                          logging: { ...prev.system.logging, enabled: e.target.checked }
                        }
                      }))}
                    />
                    <Label>Enable Logging</Label>
                  </div>

                  {config.system.logging.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Log Level</Label>
                        <Select
                          value={config.system.logging.level}
                          onValueChange={(value) => setConfig(prev => ({
                            ...prev,
                            system: {
                              ...prev.system,
                              logging: { ...prev.system.logging, level: value }
                            }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="error">Error</SelectItem>
                            <SelectItem value="warn">Warning</SelectItem>
                            <SelectItem value="info">Info</SelectItem>
                            <SelectItem value="debug">Debug</SelectItem>
                            <SelectItem value="trace">Trace</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={config.system.logging.remote}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            system: {
                              ...prev.system,
                              logging: { ...prev.system.logging, remote: e.target.checked }
                            }
                          }))}
                        />
                        <Label>Remote Logging</Label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
