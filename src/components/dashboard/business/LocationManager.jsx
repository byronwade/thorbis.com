"use client";

import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Filter,
  SortAsc,
  MoreVertical,
  MapPin,
  Clock,
  User,
  Tag,
  AlertCircle,
  CheckCircle,
  XCircle,
  Star,
  StarOff,
  FileText,
  Download,
  Share,
  Archive,
  Trash2,
  Edit,
  Eye,
  Phone,
  Mail,
  Calendar,
  Settings,
  Users,
  TrendingUp,
  BarChart3,
  Bell,
  BellOff,
  Lock,
  Globe,
  Hash,
  ArrowUp,
  ArrowDown,
  Circle,
  Check,
  X,
  Info,
  HelpCircle,
  Bug,
  Lightbulb,
  Wrench,
  Shield,
  Zap,
  Target,
  Flag,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Navigation,
  Car,
  Building2,
  Home,
  Store,
  Factory,
  Warehouse,
  Office,
  Camera,
  Wifi,
  ParkingMeter,
  Coffee,
  Utensils,
  CreditCard,
  DollarSign,
  Percent,
  Clock4,
  CalendarDays,
  Map,
  Navigation2,
  Compass,
  Globe2,
  Pin,
  PinOff,
  Route,
  Navigation2 as NavigationIcon
} from 'lucide-react';
import { cn } from '@utils';

// Sample data
const LOCATIONS = [
  {
    id: 1,
    name: "Downtown Office",
    type: "office",
    address: "123 Main Street, Downtown, NY 10001",
    coordinates: { lat: 40.7128, lng: -74.0060 },
    status: "active",
    capacity: 50,
    currentOccupancy: 32,
    manager: "Sarah Johnson",
    phone: "+1 (555) 123-4567",
    email: "downtown@company.com",
    hours: "Mon-Fri 9AM-6PM",
    services: ["WiFi", "Parking", "Coffee", "Meeting Rooms"],
    rating: 4.8,
    reviews: 124,
    isPrimary: true,
    isVerified: true,
    lastUpdated: "2024-01-15T10:30:00Z",
    images: ["/placeholder-business.jpg"],
    description: "Our main office location in downtown Manhattan, featuring modern amenities and easy access to public transportation."
  },
  {
    id: 2,
    name: "Westside Warehouse",
    type: "warehouse",
    address: "456 Industrial Blvd, Westside, NY 10002",
    coordinates: { lat: 40.7589, lng: -73.9851 },
    status: "active",
    capacity: 200,
    currentOccupancy: 180,
    manager: "Mike Chen",
    phone: "+1 (555) 234-5678",
    email: "warehouse@company.com",
    hours: "Mon-Sat 7AM-10PM",
    services: ["Loading Dock", "Forklift", "Security", "24/7 Access"],
    rating: 4.6,
    reviews: 89,
    isPrimary: false,
    isVerified: true,
    lastUpdated: "2024-01-14T16:45:00Z",
    images: ["/placeholder-business.jpg"],
    description: "Large warehouse facility for storage and distribution operations."
  },
  {
    id: 3,
    name: "Brooklyn Store",
    type: "retail",
    address: "789 Brooklyn Ave, Brooklyn, NY 11201",
    coordinates: { lat: 40.7505, lng: -73.9934 },
    status: "active",
    capacity: 25,
    currentOccupancy: 18,
    manager: "Lisa Park",
    phone: "+1 (555) 345-6789",
    email: "brooklyn@company.com",
    hours: "Mon-Sun 10AM-8PM",
    services: ["POS System", "Customer Service", "Returns", "Gift Cards"],
    rating: 4.9,
    reviews: 256,
    isPrimary: false,
    isVerified: true,
    lastUpdated: "2024-01-15T09:15:00Z",
    images: ["/placeholder-business.jpg"],
    description: "Retail store serving the Brooklyn community with excellent customer service."
  },
  {
    id: 4,
    name: "Queens Factory",
    type: "factory",
    address: "321 Queens Blvd, Queens, NY 11101",
    coordinates: { lat: 40.7421, lng: -73.9911 },
    status: "maintenance",
    capacity: 150,
    currentOccupancy: 0,
    manager: "David Wilson",
    phone: "+1 (555) 456-7890",
    email: "factory@company.com",
    hours: "Mon-Fri 6AM-2PM",
    services: ["Production Line", "Quality Control", "Safety Equipment", "Training"],
    rating: 4.4,
    reviews: 67,
    isPrimary: false,
    isVerified: true,
    lastUpdated: "2024-01-13T14:20:00Z",
    images: ["/placeholder-business.jpg"],
    description: "Manufacturing facility currently under maintenance and upgrades."
  }
];

const LOCATION_TYPES = [
  { id: "office", name: "Office", icon: Building2, color: "text-blue-600" },
  { id: "warehouse", name: "Warehouse", icon: Warehouse, color: "text-orange-600" },
  { id: "retail", name: "Retail Store", icon: Store, color: "text-green-600" },
  { id: "factory", name: "Factory", icon: Factory, color: "text-purple-600" },
  { id: "home", name: "Home Office", icon: Home, color: "text-gray-600" }
];

const SERVICES = [
  { id: "wifi", name: "WiFi", icon: Wifi },
  { id: "parking", name: "Parking", icon: ParkingMeter },
  { id: "coffee", name: "Coffee", icon: Coffee },
  { id: "meeting_rooms", name: "Meeting Rooms", icon: Users },
  { id: "security", name: "Security", icon: Shield },
  { id: "loading_dock", name: "Loading Dock", icon: Car },
  { id: "pos_system", name: "POS System", icon: CreditCard },
  { id: "camera", name: "Security Cameras", icon: Camera }
];

export default function LocationManager() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showCreateLocation, setShowCreateLocation] = useState(false);
  const [showMap, setShowMap] = useState(true);

  const filteredLocations = useMemo(() => {
    return LOCATIONS.filter(location => {
      const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           location.manager.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || location.status === statusFilter;
      const matchesType = typeFilter === "all" || location.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [searchQuery, statusFilter, typeFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "maintenance": return "bg-yellow-500";
      case "inactive": return "bg-gray-500";
      case "closed": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getTypeIcon = (type) => {
    const locationType = LOCATION_TYPES.find(t => t.id === type);
    return locationType ? locationType.icon : Building2;
  };

  const getTypeColor = (type) => {
    const locationType = LOCATION_TYPES.find(t => t.id === type);
    return locationType ? locationType.color : "text-gray-600";
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getOccupancyPercentage = (current, capacity) => {
    return Math.round((current / capacity) * 100);
  };

  const getOccupancyColor = (percentage) => {
    if (percentage < 50) return "text-green-600";
    if (percentage < 80) return "text-yellow-600";
    return "text-red-600";
  };

  if (selectedLocation) {
    return (
      <div className="flex h-[calc(100vh-120px)] -mx-4 -my-6 lg:-mx-8">
        {/* Location List */}
        <div className="w-96 border-r bg-muted/30">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Locations</h2>
              <Button size="sm" onClick={() => setShowCreateLocation(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <ScrollArea className="h-full">
            <div className="p-2 space-y-2">
              {filteredLocations.map((location) => (
                <div
                  key={location.id}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-colors",
                    selectedLocation?.id === location.id
                      ? "bg-background border shadow-sm"
                      : "hover:bg-background/50"
                  )}
                  onClick={() => setSelectedLocation(location)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{location.name}</p>
                      <p className="text-xs text-muted-foreground">{location.address}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {location.isPrimary && <Star className="h-3 w-3 text-yellow-500" />}
                      {location.isVerified && <CheckCircle className="h-3 w-3 text-green-500" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {location.type}
                    </Badge>
                    <div className={cn("w-2 h-2 rounded-full", getStatusColor(location.status))} />
                    <span className="text-xs text-muted-foreground">{location.manager}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Location Details */}
        <div className="flex-1 flex flex-col">
          {/* Location Header */}
          <div className="flex-shrink-0 p-6 border-b">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-xl font-semibold">{selectedLocation.name}</h1>
                  <Badge variant="outline" className="text-xs">
                    {selectedLocation.type}
                  </Badge>
                  <div className={cn("w-3 h-3 rounded-full", getStatusColor(selectedLocation.status))} />
                  {selectedLocation.isPrimary && <Badge className="text-xs">Primary</Badge>}
                </div>
                <p className="text-muted-foreground">{selectedLocation.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Star className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Share className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Location
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Manager:</span>
                <p className="font-medium">{selectedLocation.manager}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>
                <p className="font-medium">{selectedLocation.phone}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Hours:</span>
                <p className="font-medium">{selectedLocation.hours}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Updated:</span>
                <p className="font-medium">{formatTime(selectedLocation.lastUpdated)}</p>
              </div>
            </div>
          </div>

          {/* Location Content */}
          <div className="flex-1 p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Map Placeholder */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Map className="h-5 w-5" />
                        Location Map
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">Map View</p>
                          <p className="text-sm text-muted-foreground">{selectedLocation.address}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Capacity & Occupancy */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Capacity & Occupancy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Current Occupancy</span>
                            <span className={cn("font-medium", getOccupancyColor(getOccupancyPercentage(selectedLocation.currentOccupancy, selectedLocation.capacity)))}>
                              {selectedLocation.currentOccupancy}/{selectedLocation.capacity}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className={cn("h-2 rounded-full", {
                                "bg-green-500": getOccupancyPercentage(selectedLocation.currentOccupancy, selectedLocation.capacity) < 50,
                                "bg-yellow-500": getOccupancyPercentage(selectedLocation.currentOccupancy, selectedLocation.capacity) >= 50 && getOccupancyPercentage(selectedLocation.currentOccupancy, selectedLocation.capacity) < 80,
                                "bg-red-500": getOccupancyPercentage(selectedLocation.currentOccupancy, selectedLocation.capacity) >= 80
                              })}
                              style={{ width: `${getOccupancyPercentage(selectedLocation.currentOccupancy, selectedLocation.capacity)}%` }}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Total Capacity:</span>
                            <p className="font-medium">{selectedLocation.capacity}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Available:</span>
                            <p className="font-medium">{selectedLocation.capacity - selectedLocation.currentOccupancy}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Services */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Available Services</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedLocation.services.map((service) => (
                          <Badge key={service} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contact Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{selectedLocation.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{selectedLocation.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{selectedLocation.hours}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="services" className="flex-1">
                <div className="text-center py-12">
                  <Wrench className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Services Management</h3>
                  <p className="text-muted-foreground mb-4">
                    Manage services and amenities for this location.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="flex-1">
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Location Analytics</h3>
                  <p className="text-muted-foreground mb-4">
                    View detailed analytics and performance metrics for this location.
                  </p>
                  <Button>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="flex-1">
                <div className="text-center py-12">
                  <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Customer Reviews</h3>
                  <p className="text-muted-foreground mb-4">
                    {selectedLocation.reviews} reviews with an average rating of {selectedLocation.rating}/5
                  </p>
                  <Button>
                    <Eye className="h-4 w-4 mr-2" />
                    View All Reviews
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] -mx-4 -my-6 lg:-mx-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b">
          <div>
            <h1 className="text-2xl font-bold">Locations</h1>
            <p className="text-muted-foreground">Manage your business locations and facilities</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setShowMap(!showMap)}>
              <Map className="h-4 w-4 mr-2" />
              {showMap ? "Hide Map" : "Show Map"}
            </Button>
            <Button onClick={() => setShowCreateLocation(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex-shrink-0 p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("active")}>Active</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("maintenance")}>Maintenance</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>Inactive</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <SortAsc className="h-4 w-4 mr-2" />
                  Type
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setTypeFilter("all")}>All Types</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("office")}>Office</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("warehouse")}>Warehouse</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("retail")}>Retail</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("factory")}>Factory</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 px-6 pt-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <TabsContent value={activeTab} className="h-full">
            <div className="space-y-4">
              {filteredLocations.map((location) => (
                <Card key={location.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedLocation(location)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{location.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {location.type}
                          </Badge>
                          {location.isPrimary && <Badge className="text-xs">Primary</Badge>}
                          {location.isVerified && <CheckCircle className="h-4 w-4 text-green-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{location.address}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Manager: {location.manager}</span>
                          <span>•</span>
                          <span>Capacity: {location.currentOccupancy}/{location.capacity}</span>
                          <span>•</span>
                          <span>Rating: {location.rating}/5 ({location.reviews} reviews)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 rounded-full", getStatusColor(location.status))} />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredLocations.length === 0 && (
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No locations found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? "Try adjusting your search criteria." : "Add your first business location to get started."}
                  </p>
                  <Button onClick={() => setShowCreateLocation(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Location
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
