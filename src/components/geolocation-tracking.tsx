"use client";

import React, { useState } from "react";

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';

import { Label } from '@/components/ui/label';

import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

import {
  Brain,
  MapPin,
  Navigation,
  Satellite,
  Shield,
  CheckCircle,
  AlertTriangle,
  Plus,
  Edit,
  Eye,
  Settings,
  Download,
  Search,
  Filter,
  Bell,
  Activity,
  Timer,
  Globe,
  Compass,
  Radio,
  TrendingUp,
  BarChart3,
  Zap,
  Target,
  AlertCircle,
  Users,
  Clock,
  User,
  Building,
  CalendarDays,
  Award,
  Smartphone,
  Wifi,
  Signal,
  Car,
  Home,
  Briefcase,
  Coffee,
  Route,
  Map,
  Crosshair,
  MapIcon,
  Radar,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Alert,
  AlertDescription
} from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
const locationOverview = {
  totalEmployees: 24,
  activeTracking: 18,
  insideGeofences: 16,
  outsideGeofences: 2,
  accuracyLevel: 95.8,
  batteryOptimized: 21,
  privacyCompliant: 100,
  aiAnomalies: 1,
  locationUpdates: 1247
};

const activeLocations = [
  {
    id: "LOC-001",
    employeeId: "EMP-001",
    employeeName: "Sarah Johnson",
    department: "Engineering",
    currentLocation: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: "123 Tech Street, San Francisco, CA 94105",
      accuracy: 8,
      timestamp: "2024-02-15T14:30:00Z"
    },
    geofence: "SF Office Main",
    status: "inside",
    workMode: "office",
    batteryLevel: 78,
    signalStrength: "strong",
    movementPattern: "stationary",
    timeAtLocation: 342,
    lastMovement: "2024-02-15T14:15:00Z",
    privacyLevel: "work-hours",
    deviceType: "iPhone"
  },
  {
    id: "LOC-002",
    employeeId: "EMP-002",
    employeeName: "Mike Chen",
    department: "Engineering",
    currentLocation: {
      latitude: 37.7849,
      longitude: -122.4094,
      address: "456 Remote Work Ave, San Francisco, CA 94110",
      accuracy: 15,
      timestamp: "2024-02-15T14:28:00Z"
    },
    geofence: "Remote Work Zone",
    status: "inside",
    workMode: "remote",
    batteryLevel: 45,
    signalStrength: "medium",
    movementPattern: "minimal",
    timeAtLocation: 180,
    lastMovement: "2024-02-15T13:45:00Z",
    privacyLevel: "work-hours",
    deviceType: "Android"
  },
  {
    id: "LOC-003",
    employeeId: "EMP-003",
    employeeName: "Lisa Wang",
    department: "Marketing",
    currentLocation: {
      latitude: 37.7649,
      longitude: -122.4394,
      address: "789 Client Street, San Francisco, CA 94103",
      accuracy: 12,
      timestamp: "2024-02-15T14:25:00Z"
    },
    geofence: "Client Site A",
    status: "inside",
    workMode: "field",
    batteryLevel: 67,
    signalStrength: "strong",
    movementPattern: "active",
    timeAtLocation: 95,
    lastMovement: "2024-02-15T14:20:00Z",
    privacyLevel: "work-hours",
    deviceType: "iPhone"
  },
  {
    id: "LOC-004",
    employeeId: "EMP-004",
    employeeName: "David Wilson",
    department: "Sales",
    currentLocation: {
      latitude: 37.7949,
      longitude: -122.4294,
      address: "Unknown Location",
      accuracy: 45,
      timestamp: "2024-02-15T14:20:00Z"
    },
    geofence: null,
    status: "outside",
    workMode: "field",
    batteryLevel: 23,
    signalStrength: "weak",
    movementPattern: "traveling",
    timeAtLocation: 25,
    lastMovement: "2024-02-15T14:18:00Z",
    privacyLevel: "work-hours",
    deviceType: "Android"
  }
];

const geofences = [
  {
    id: "GF-001",
    name: "SF Office Main",
    type: "office",
    address: "123 Tech Street, San Francisco, CA 94105",
    coordinates: {
      center: { lat: 37.7749, lng: -122.4194 },
      radius: 100
    },
    employeesInside: 12,
    status: "active",
    createdDate: "2024-01-15",
    workHoursOnly: true,
    notifications: true,
    autoClockIn: true,
    autoClockOut: true,
    bufferZone: 25,
    description: "Primary office location for SF team"
  },
  {
    id: "GF-002",
    name: "Remote Work Zone",
    type: "remote",
    address: "Residential areas within 50 miles of SF",
    coordinates: {
      center: { lat: 37.7749, lng: -122.4194 },
      radius: 80467 // ~50 miles in meters
    },
    employeesInside: 4,
    status: "active",
    createdDate: "2024-01-20",
    workHoursOnly: false,
    notifications: false,
    autoClockIn: false,
    autoClockOut: false,
    bufferZone: 1000,
    description: "Approved remote work area"
  },
  {
    id: "GF-003",
    name: "Client Site A",
    type: "client",
    address: "789 Client Street, San Francisco, CA 94103",
    coordinates: {
      center: { lat: 37.7649, lng: -122.4394 },
      radius: 50
    },
    employeesInside: 1,
    status: "active",
    createdDate: "2024-02-01",
    workHoursOnly: true,
    notifications: true,
    autoClockIn: true,
    autoClockOut: true,
    bufferZone: 15,
    description: "Major client location for project work"
  },
  {
    id: "GF-004",
    name: "NYC Office",
    type: "office",
    address: "456 Business Ave, New York, NY 10001",
    coordinates: {
      center: { lat: 40.7589, lng: -73.9851 },
      radius: 75
    },
    employeesInside: 0,
    status: "active",
    createdDate: "2024-01-10",
    workHoursOnly: true,
    notifications: true,
    autoClockIn: true,
    autoClockOut: true,
    bufferZone: 20,
    description: "East coast office location"
  },
  {
    id: "GF-005",
    name: "Restricted Area",
    type: "restricted",
    address: "Competitor Location",
    coordinates: {
      center: { lat: 37.7849, lng: -122.4294 },
      radius: 200
    },
    employeesInside: 0,
    status: "active",
    createdDate: "2024-01-25",
    workHoursOnly: false,
    notifications: true,
    autoClockIn: false,
    autoClockOut: false,
    bufferZone: 50,
    description: "Area with restricted access for compliance reasons"
  }
];

const locationHistory = [
  {
    id: "HIST-001",
    employeeId: "EMP-001",
    employeeName: "Sarah Johnson",
    date: "2024-02-15",
    locations: [
      {
        timestamp: "08:45:00",
        address: "Home - 123 Residential St",
        geofence: "Remote Work Zone",
        duration: 15,
        activity: "stationary"
      },
      {
        timestamp: "09:00:00",
        address: "Commute - Highway 101",
        geofence: null,
        duration: 30,
        activity: "traveling"
      },
      {
        timestamp: "09:30:00",
        address: "123 Tech Street, SF Office",
        geofence: "SF Office Main",
        duration: 300,
        activity: "working"
      }
    ],
    totalDistance: 12.5,
    avgSpeed: 25,
    workLocations: 2,
    complianceIssues: 0
  }
];

const privacySettings = [
  {
    category: "Data Collection",
    setting: "Location Tracking",
    value: "Work Hours Only",
    description: "GPS tracking active only during scheduled work hours",
    complianceLevel: "GDPR Compliant"
  },
  {
    category: "Data Storage",
    setting: "Retention Period",
    value: "90 Days",
    description: "Location data automatically deleted after 90 days",
    complianceLevel: "Industry Standard"
  },
  {
    category: "Data Access",
    setting: "Manager Visibility",
    value: "Geofence Status Only",
    description: "Managers see geofence compliance, not exact locations",
    complianceLevel: "Privacy First"
  },
  {
    category: "Employee Control",
    setting: "Opt-out Option",
    value: "Available",
    description: "Employees can disable tracking during breaks/lunch",
    complianceLevel: "Employee Rights"
  }
];

const aiInsights = [
  {
    type: "efficiency",
    title: "Commute Pattern Optimization",
    description: "AI analysis shows employees using Highway 101 route average 23% longer commute times than alternative routes. Smart route suggestions can improve punctuality.",
    confidence: 91.5,
    impact: "medium",
    affectedEmployees: 8,
    recommendation: "Implement smart route recommendations",
    metrics: {
      timeSaving: "18 minutes/day",
      fuelSaving: "$15/week",
      stressReduction: "15%"
    }
  },
  {
    type: "compliance",
    title: "Geofence Boundary Optimization",
    description: "Remote Work Zone geofence has 5% false positives due to GPS accuracy variations. AI suggests expanding buffer zone by 15 meters.",
    confidence: 94.8,
    impact: "low",
    affectedEmployees: 3,
    recommendation: "Adjust geofence buffer zones",
    falsePositives: 5,
    accuracyImprovement: "98%"
  },
  {
    type: "security",
    title: "Unusual Location Pattern Alert",
    description: "Employee David Wilson detected in competitor vicinity twice this week. Pattern analysis suggests potential compliance concern requiring attention.",
    confidence: 87.3,
    impact: "high",
    affectedEmployees: 1,
    recommendation: "Investigate and schedule discussion",
    riskLevel: "medium",
    actionRequired: true
  },
  {
    type: "wellness",
    title: "Work-Life Balance Analysis",
    description: "Location data indicates 3 employees working from office during off-hours regularly. AI recommends wellness check-ins to prevent burnout.",
    confidence: 89.7,
    impact: "medium",
    affectedEmployees: 3,
    recommendation: "Schedule wellness conversations",
    overtimeHours: 12.5,
    wellnessScore: 6.8
  }
];

export function GeolocationTracking() {
  const [selectedLocation, setSelectedLocation] = useState(activeLocations[0]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [mapView, setMapView] = useState("satellite");

  const filteredLocations = activeLocations.filter(location => {
    const matchesSearch = location.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || location.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Geolocation Tracking</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered GPS tracking with geofencing, privacy compliance, and smart insights
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Shield className="mr-2 h-4 w-4" />
            Privacy Settings
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-payroll-primary to-payroll-secondary">
                <Plus className="mr-2 h-4 w-4" />
                Create Geofence
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Geofence</DialogTitle>
                <DialogDescription>
                  Set up location-based boundaries with AI-optimized settings
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="geofenceName">Geofence Name</Label>
                    <Input id="geofenceName" placeholder="e.g. Downtown Office" />
                  </div>
                  <div>
                    <Label htmlFor="geofenceType">Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="client">Client Site</SelectItem>
                        <SelectItem value="remote">Remote Area</SelectItem>
                        <SelectItem value="restricted">Restricted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="Enter full address..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="radius">Radius (meters)</Label>
                    <Input id="radius" type="number" placeholder="100" />
                  </div>
                  <div>
                    <Label htmlFor="buffer">Buffer Zone (meters)</Label>
                    <Input id="buffer" type="number" placeholder="25" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="autoClockIn" />
                    <Label htmlFor="autoClockIn">Auto Clock In</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="autoClockOut" />
                    <Label htmlFor="autoClockOut">Auto Clock Out</Label>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Brief description of this location..." rows={2} />
                </div>
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    AI will optimize geofence settings based on GPS accuracy patterns and employee movement data.
                  </AlertDescription>
                </Alert>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Save Draft</Button>
                  <Button>
                    <Zap className="mr-2 h-4 w-4" />
                    Create with AI
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* AI Location Intelligence */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-950/20 dark:to-cyan-950/20 rounded-lg p-6 border border-indigo-200 dark:border-indigo-800"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
              <Satellite className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">AI Location Intelligence</h3>
              <p className="text-indigo-700 dark:text-indigo-300 text-sm">
                {locationOverview.activeTracking} active • {locationOverview.accuracyLevel}% accuracy • {locationOverview.privacyCompliant}% privacy compliant
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-indigo-900 dark:text-indigo-100 mb-1">
              {locationOverview.locationUpdates}
            </div>
            <div className="text-sm text-indigo-700 dark:text-indigo-300">Location Updates Today</div>
          </div>
        </div>
      </motion.div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{locationOverview.insideGeofences}</p>
                <p className="text-xs text-muted-foreground">Inside Zones</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{locationOverview.outsideGeofences}</p>
                <p className="text-xs text-muted-foreground">Outside Zones</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{locationOverview.accuracyLevel}%</p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{locationOverview.aiAnomalies}</p>
                <p className="text-xs text-muted-foreground">AI Alerts</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="live">Live Tracking</TabsTrigger>
          <TabsTrigger value="geofences">Geofences</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="inside">Inside Geofence</SelectItem>
                  <SelectItem value="outside">Outside Geofence</SelectItem>
                </SelectContent>
              </Select>
              <Select value={mapView} onValueChange={setMapView}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Map view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="satellite">Satellite</SelectItem>
                  <SelectItem value="map">Map</SelectItem>
                  <SelectItem value="terrain">Terrain</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-3 w-3" />
              Export Locations
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Live Location Map
                </CardTitle>
                <CardDescription>
                  Real-time employee locations with geofence overlays
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative">
                  <MapIcon className="h-24 w-24 text-muted-foreground/50" />
                  <div className="absolute inset-4 flex flex-col justify-end">
                    <div className="bg-background/90 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">{locationOverview.insideGeofences} employees in zones</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">{locationOverview.outsideGeofences} employees outside zones</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  Active Employee Locations
                </CardTitle>
                <CardDescription>
                  Current location status with AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredLocations.map((location, index) => (
                    <motion.div
                      key={location.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedLocation(location)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            location.status === "inside" 
                              ? "bg-green-100 dark:bg-green-900/20" 
                              : "bg-orange-100 dark:bg-orange-900/20"
                          }`}>
                            <MapPin className={`h-4 w-4 ${
                              location.status === "inside" ? "text-green-600" : "text-orange-600"
                            }`} />
                          </div>
                          <div>
                            <h5 className="font-semibold">{location.employeeName}</h5>
                            <p className="text-xs text-muted-foreground">{location.department}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={location.status === "inside" ? "default" : "destructive"}>
                            {location.status === "inside" ? "Inside Zone" : "Outside Zone"}
                          </Badge>
                          <div className="flex items-center space-x-2 mt-1">
                            <Signal className={`h-3 w-3 ${
                              location.signalStrength === "strong" ? "text-green-600" :
                              location.signalStrength === "medium" ? "text-yellow-600" : "text-red-600"
                            }`} />
                            <span className="text-xs">±{location.currentLocation.accuracy}m</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-xs text-muted-foreground">
                        {location.geofence || "No geofence"} • {location.movementPattern} • {location.timeAtLocation}min
                      </div>
                      
                      <div className="mt-2 flex items-center space-x-1">
                        <Smartphone className="h-3 w-3" />
                        <span className="text-xs">{location.batteryLevel}%</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {selectedLocation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  {selectedLocation.employeeName} - Location Details
                </CardTitle>
                <CardDescription>
                  Detailed location information with movement patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h5 className="font-semibold mb-3">Current Location</h5>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{selectedLocation.currentLocation.address}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Crosshair className="h-4 w-4 text-green-600" />
                        <span className="text-sm">±{selectedLocation.currentLocation.accuracy}m accuracy</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">
                          Updated {new Date(selectedLocation.currentLocation.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold mb-3">Status & Activity</h5>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant={selectedLocation.status === "inside" ? "default" : "destructive"}>
                          {selectedLocation.status === "inside" ? "Inside Geofence" : "Outside Geofence"}
                        </Badge>
                      </div>
                      <div className="text-sm">
                        <strong>Movement:</strong> {selectedLocation.movementPattern}
                      </div>
                      <div className="text-sm">
                        <strong>Work Mode:</strong> {selectedLocation.workMode}
                      </div>
                      <div className="text-sm">
                        <strong>Time at Location:</strong> {selectedLocation.timeAtLocation} minutes
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold mb-3">Device & Signal</h5>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="h-4 w-4" />
                        <span className="text-sm">{selectedLocation.deviceType}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          selectedLocation.batteryLevel > 50 ? "bg-green-500" :
                          selectedLocation.batteryLevel > 20 ? "bg-yellow-500" : "bg-red-500"
                        }`}></div>
                        <span className="text-sm">{selectedLocation.batteryLevel}% battery</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Signal className={`h-4 w-4 ${
                          selectedLocation.signalStrength === "strong" ? "text-green-600" :
                          selectedLocation.signalStrength === "medium" ? "text-yellow-600" : "text-red-600"
                        }`} />
                        <span className="text-sm">{selectedLocation.signalStrength} signal</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="geofences" className="space-y-4">
          <div className="grid gap-4">
            {geofences.map((geofence, index) => (
              <motion.div
                key={geofence.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`p-2 rounded-full ${
                            geofence.type === "office" ? "bg-blue-100 dark:bg-blue-900/20" :
                            geofence.type === "client" ? "bg-green-100 dark:bg-green-900/20" :
                            geofence.type === "remote" ? "bg-purple-100 dark:bg-purple-900/20" :
                            "bg-red-100 dark:bg-red-900/20"
                          }'}>
                            {geofence.type === "office" ? (
                              <Building className="h-5 w-5 text-blue-600" />
                            ) : geofence.type === "client" ? (
                              <Briefcase className="h-5 w-5 text-green-600" />
                            ) : geofence.type === "remote" ? (
                              <Home className="h-5 w-5 text-purple-600" />
                            ) : (
                              <Shield className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold">{geofence.name}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline">{geofence.type}</Badge>
                              <Badge variant={geofence.status === "active" ? "default" : "secondary"}>
                                {geofence.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-4">{geofence.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <label className="text-xs text-muted-foreground">Employees Inside</label>
                            <p className="text-lg font-bold text-green-600">{geofence.employeesInside}</p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Radius</label>
                            <p className="text-lg font-bold text-blue-600">{geofence.coordinates.radius}m</p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Buffer Zone</label>
                            <p className="text-lg font-bold text-purple-600">{geofence.bufferZone}m</p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Created</label>
                            <p className="text-sm font-medium">
                              {new Date(geofence.createdDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center space-x-2">
                            {geofence.autoClockIn ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-sm">Auto Clock In</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {geofence.autoClockOut ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-sm">Auto Clock Out</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {geofence.notifications ? (
                              <Bell className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Bell className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-sm">Notifications</span>
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          <MapPin className="inline h-3 w-3 mr-1" />
                          {geofence.address}
                        </div>
                      </div>
                      
                      <div className="text-right ml-6">
                        <div className="flex space-x-2 mb-4">
                          <Button size="sm" variant="outline">
                            <Eye className="mr-2 h-3 w-3" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="mr-2 h-3 w-3" />
                            Edit
                          </Button>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {geofence.workHoursOnly ? "Work hours only" : "24/7 active"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Route className="mr-2 h-5 w-5" />
                Location History
              </CardTitle>
              <CardDescription>
                Historical location data and movement patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {locationHistory.map((history, index) => (
                <div key={history.id} className="border-l-2 border-blue-200 pl-4 pb-6 last:pb-0">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center -ml-7">
                      <User className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <h5 className="font-semibold">{history.employeeName}</h5>
                      <p className="text-sm text-muted-foreground">
                        {new Date(history.date).toLocaleDateString()} • {history.totalDistance} miles traveled
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 ml-3">
                    {history.locations.map((location, i) => (
                      <div key={i} className="flex items-center space-x-3 p-2 bg-muted/50 rounded">
                        <div className="text-sm font-mono">{location.timestamp}</div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{location.address}</div>
                          <div className="text-xs text-muted-foreground">
                            {location.geofence || "Outside zones"} • {location.duration}min • {location.activity}
                          </div>
                        </div>
                        <Badge variant={location.geofence ? "default" : "outline"} className="text-xs">
                          {location.geofence ? "Inside Zone" : "Transit"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-3 ml-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{history.totalDistance}mi</div>
                      <div className="text-xs text-muted-foreground">Distance</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{history.avgSpeed}mph</div>
                      <div className="text-xs text-muted-foreground">Avg Speed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">{history.workLocations}</div>
                      <div className="text-xs text-muted-foreground">Work Locations</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              All location data is encrypted and processed in accordance with GDPR, CCPA, and company privacy policies. Employees have full control over their location data.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {privacySettings.map((setting, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                            <Shield className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{setting.setting}</h4>
                            <p className="text-sm text-muted-foreground">{setting.category}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{setting.description}</p>
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          {setting.complianceLevel}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600 mb-1">
                          {setting.value}
                        </div>
                        <Button size="sm" variant="outline">
                          <Settings className="mr-2 h-3 w-3" />
                          Configure
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {aiInsights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={'p-2 rounded-full ${
                        insight.type === "efficiency" 
                          ? "bg-green-100 dark:bg-green-900/20" 
                          : insight.type === "compliance"
                          ? "bg-blue-100 dark:bg-blue-900/20"
                          : insight.type === "security"
                          ? "bg-red-100 dark:bg-red-900/20"
                          : "bg-purple-100 dark:bg-purple-900/20"
                      }'}>
                        {insight.type === "efficiency" ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : insight.type === "compliance" ? (
                          <Shield className="h-4 w-4 text-blue-600" />
                        ) : insight.type === "security" ? (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        ) : (
                          <Activity className="h-4 w-4 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{insight.title}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant={insight.impact === "high" ? "destructive" : 
                                           insight.impact === "medium" ? "default" : "secondary"}>
                              {insight.impact} impact
                            </Badge>
                            <Badge variant="outline" className="text-green-600">
                              <Brain className="mr-1 h-2 w-2" />
                              {insight.confidence}% confident
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          {insight.description}
                        </p>
                        
                        {insight.metrics && (
                          <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-600">{insight.metrics.timeSaving}</div>
                              <div className="text-xs text-muted-foreground">Time Saved</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600">{insight.metrics.fuelSaving}</div>
                              <div className="text-xs text-muted-foreground">Fuel Saved</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-purple-600">{insight.metrics.stressReduction}</div>
                              <div className="text-xs text-muted-foreground">Stress Reduction</div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <strong>Affects:</strong> {insight.affectedEmployees} employees
                            {insight.actionRequired && <span className="text-red-600 ml-2">• Action Required</span>}
                          </div>
                          <Button size="sm" variant={insight.impact === "high" ? "destructive" : "default"}>
                            <Zap className="mr-2 h-3 w-3" />
                            {insight.recommendation.split(' ').slice(0, 2).join(' ')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Location Distribution
                </CardTitle>
                <CardDescription>
                  Time spent in different geofenced areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Location distribution analytics will be displayed here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Route className="mr-2 h-5 w-5" />
                  Movement Patterns
                </CardTitle>
                <CardDescription>
                  Employee movement and commute analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Route className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Movement pattern analysis will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Geolocation Summary</CardTitle>
              <CardDescription>
                Overall location tracking metrics and system performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{locationOverview.accuracyLevel}%</div>
                  <div className="text-sm text-muted-foreground">GPS Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{locationOverview.batteryOptimized}</div>
                  <div className="text-sm text-muted-foreground">Battery Optimized</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{locationOverview.privacyCompliant}%</div>
                  <div className="text-sm text-muted-foreground">Privacy Compliant</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">{locationOverview.locationUpdates}</div>
                  <div className="text-sm text-muted-foreground">Daily Updates</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}