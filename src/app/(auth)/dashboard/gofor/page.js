"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { 
  Package, 
  Truck, 
  Clock, 
  MapPin, 
  Phone, 
  DollarSign, 
  Star, 
  Plus, 
  Search, 
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  Navigation,
  Timer,
  Receipt,
  MessageSquare,
  History,
  BarChart3,
  RefreshCw,
  Download,
  Calculator
} from "lucide-react";

/**
 * GoFor Delivery Platform - DoorDash-style B2B delivery service
 * Enables businesses to request deliveries for parts, supplies, and business needs
 */
export default function GoForDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [deliveryRequests, setDeliveryRequests] = useState([]);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Mock data for demonstration
  const mockStats = {
    totalDeliveries: 152,
    activeDeliveries: 8,
    availableDrivers: 12,
    avgDeliveryTime: "28 mins",
    customerRating: 4.8,
    monthlySpend: "$2,450"
  };

  const mockActiveDeliveries = [
    {
      id: "DEL-001",
      items: "PVC pipes, fittings",
      pickup: "Home Depot - Main St",
      delivery: "Johnson Plumbing - 123 Oak Ave",
      driver: {
        name: "Mike Rodriguez",
        phone: "+1-555-0123",
        avatar: null,
        rating: 4.9
      },
      status: "picking_up",
      estimatedTime: "15 mins",
      cost: "$25.00",
      created: "2024-01-15 10:30 AM"
    },
    {
      id: "DEL-002",
      items: "Industrial gaskets, valve parts",
      pickup: "Industrial Supply Co",
      delivery: "Wade's Plumbing Shop",
      driver: {
        name: "Sarah Johnson",
        phone: "+1-555-0124",
        avatar: null,
        rating: 4.7
      },
      status: "en_route",
      estimatedTime: "22 mins",
      cost: "$18.50",
      created: "2024-01-15 11:15 AM"
    }
  ];

  const mockDrivers = [
    {
      id: "DRV-001",
      name: "Mike Rodriguez",
      phone: "+1-555-0123",
      vehicle: "Honda Civic",
      rating: 4.9,
      deliveries: 89,
      status: "busy",
      location: "Downtown"
    },
    {
      id: "DRV-002",
      name: "Sarah Johnson",
      phone: "+1-555-0124",
      vehicle: "Toyota Camry",
      rating: 4.7,
      deliveries: 76,
      status: "busy",
      location: "North Side"
    },
    {
      id: "DRV-003",
      name: "Carlos Martinez",
      phone: "+1-555-0125",
      vehicle: "Ford Transit",
      rating: 4.8,
      deliveries: 124,
      status: "available",
      location: "South End"
    }
  ];

  const mockHistory = [
    {
      id: "DEL-095",
      items: "Electrical components",
      pickup: "Electrical Supply Store",
      delivery: "Johnson Electric - 456 Pine St",
      driver: "Mike Rodriguez",
      status: "completed",
      cost: "$22.00",
      completed: "2024-01-14 3:45 PM",
      rating: 5
    },
    {
      id: "DEL-094",
      items: "HVAC filters, refrigerant",
      pickup: "HVAC Supply Warehouse",
      delivery: "Cool Air Solutions",
      driver: "Sarah Johnson",
      status: "completed",
      cost: "$35.00",
      completed: "2024-01-14 1:20 PM",
      rating: 4
    }
  ];

  useEffect(() => {
    setActiveDeliveries(mockActiveDeliveries);
    setAvailableDrivers(mockDrivers);
  }, []);

  const handleRequestDelivery = () => {
    setShowRequestDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-warning/10 text-warning border-yellow-300";
      case "picking_up": return "bg-primary/10 text-primary border-primary/40";
      case "en_route": return "bg-purple-100 text-purple-800 border-purple-300";
      case "delivered": return "bg-success/10 text-success border-green-300";
      case "completed": return "bg-success/10 text-success border-green-300";
      case "cancelled": return "bg-destructive/10 text-destructive border-red-300";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "picking_up": return <Package className="w-4 h-4" />;
      case "en_route": return <Truck className="w-4 h-4" />;
      case "delivered": return <CheckCircle className="w-4 h-4" />;
      case "completed": return <CheckCircle className="w-4 h-4" />;
      case "cancelled": return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const renderDashboardOverview = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Truck className="h-8 w-8 text-primary" />
            GoFor Delivery Platform
          </h1>
          <p className="text-muted-foreground mt-2">
            On-demand delivery service for business parts, supplies, and materials
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleRequestDelivery} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Request Delivery
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalDeliveries}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deliveries</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.activeDeliveries}</div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Drivers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.availableDrivers}</div>
            <p className="text-xs text-muted-foreground">Ready for pickup</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Delivery Time</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.avgDeliveryTime}</div>
            <p className="text-xs text-muted-foreground">-5% improvement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.customerRating}</div>
            <p className="text-xs text-muted-foreground">⭐ Excellent service</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.monthlySpend}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Active Deliveries
          </CardTitle>
          <CardDescription>Track your current delivery requests</CardDescription>
        </CardHeader>
        <CardContent>
          {activeDeliveries.length > 0 ? (
            <div className="space-y-4">
              {activeDeliveries.map((delivery) => (
                <div key={delivery.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(delivery.status)} border`}>
                          {getStatusIcon(delivery.status)}
                          <span className="ml-1 capitalize">{delivery.status.replace('_', ' ')}</span>
                        </Badge>
                        <span className="text-sm font-medium">#{delivery.id}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium">{delivery.items}</p>
                          <div className="text-sm text-muted-foreground space-y-1 mt-1">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>From: {delivery.pickup}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Navigation className="w-3 h-3" />
                              <span>To: {delivery.delivery}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={delivery.driver.avatar} />
                            <AvatarFallback>{delivery.driver.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{delivery.driver.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              <span>{delivery.driver.phone}</span>
                              <Star className="w-3 h-3 fill-yellow-400 text-warning" />
                              <span>{delivery.driver.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <p className="font-bold text-lg">{delivery.cost}</p>
                      <p className="text-sm text-muted-foreground">ETA: {delivery.estimatedTime}</p>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Phone className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No active deliveries</p>
              <Button onClick={handleRequestDelivery} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Request Your First Delivery
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Drivers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Available Drivers
          </CardTitle>
          <CardDescription>Drivers ready for immediate pickup</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableDrivers.filter(driver => driver.status === 'available').map((driver) => (
              <div key={driver.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>{driver.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{driver.name}</p>
                    <p className="text-sm text-muted-foreground">{driver.vehicle}</p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-success border-green-200">
                    Available
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating:</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-warning" />
                      <span>{driver.rating}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deliveries:</span>
                    <span>{driver.deliveries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span>{driver.location}</span>
                  </div>
                </div>
                
                <Button className="w-full mt-3" size="sm">
                  <Phone className="w-3 h-3 mr-2" />
                  Contact Driver
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRequestDeliveryForm = () => (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Request New Delivery</h2>
        <p className="text-muted-foreground">Fill out the details for your delivery request</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Details</CardTitle>
          <CardDescription>Provide information about what needs to be delivered</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pickup-location">Pickup Location</Label>
              <Input id="pickup-location" placeholder="Store name or address" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery-location">Delivery Location</Label>
              <Input id="delivery-location" placeholder="Your business address" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="items">Items to Deliver</Label>
            <Textarea 
              id="items" 
              placeholder="List the items that need to be picked up (e.g., PVC pipes, electrical components, gaskets)" 
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency Level</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (1-2 hours)</SelectItem>
                  <SelectItem value="urgent">Urgent (30-60 minutes)</SelectItem>
                  <SelectItem value="emergency">Emergency (ASAP)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated-cost">Estimated Item Cost</Label>
              <Input id="estimated-cost" placeholder="$0.00" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="special-instructions">Vehicle Size</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car">Car/Small Vehicle</SelectItem>
                  <SelectItem value="suv">SUV/Van</SelectItem>
                  <SelectItem value="truck">Truck/Large Vehicle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="special-instructions">Special Instructions</Label>
            <Textarea 
              id="special-instructions" 
              placeholder="Any special handling instructions, contact details, or notes for the driver"
              rows={2}
            />
          </div>

          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <DollarSign className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">Estimated Delivery Fee: $15.00 - $35.00</p>
              <p className="text-sm text-muted-foreground">Final cost depends on distance, urgency, and vehicle size</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Submit Delivery Request
            </Button>
            <Button variant="outline">
              <Calculator className="w-4 h-4 mr-2" />
              Get Quote
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDeliveryHistory = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Delivery History</h2>
          <p className="text-muted-foreground">View and manage your past deliveries</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search deliveries..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Deliveries</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Date Range
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {mockHistory.map((delivery) => (
              <div key={delivery.id} className="p-6 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(delivery.status)} border`}>
                        {getStatusIcon(delivery.status)}
                        <span className="ml-1 capitalize">{delivery.status}</span>
                      </Badge>
                      <span className="text-sm font-medium">#{delivery.id}</span>
                      <span className="text-sm text-muted-foreground">• {delivery.completed}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium">{delivery.items}</p>
                        <div className="text-sm text-muted-foreground space-y-1 mt-1">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>From: {delivery.pickup}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Navigation className="w-3 h-3" />
                            <span>To: {delivery.delivery}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Driver: {delivery.driver}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-sm text-muted-foreground">Rating:</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 ${i < delivery.rating ? 'fill-yellow-400 text-warning' : 'text-muted-foreground'}`} 
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <p className="font-bold text-lg">{delivery.cost}</p>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">
                        <Receipt className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="request" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Request Delivery
          </TabsTrigger>
          <TabsTrigger value="drivers" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Drivers
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          {renderDashboardOverview()}
        </TabsContent>

        <TabsContent value="request">
          {renderRequestDeliveryForm()}
        </TabsContent>

        <TabsContent value="drivers">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Driver Management</h2>
              <p className="text-muted-foreground">Manage and track your delivery drivers</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockDrivers.map((driver) => (
                <Card key={driver.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback>{driver.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{driver.name}</CardTitle>
                          <CardDescription>{driver.vehicle}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={driver.status === 'available' ? 'default' : 'secondary'}>
                        {driver.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Rating:</span>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-warning" />
                          <span className="font-medium">{driver.rating}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Deliveries:</span>
                        <p className="font-medium">{driver.deliveries}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Current Location:</span>
                        <p className="font-medium">{driver.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Phone className="w-3 h-3 mr-2" />
                        Call
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <MessageSquare className="w-3 h-3 mr-2" />
                        Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          {renderDeliveryHistory()}
        </TabsContent>
      </Tabs>

      {/* Request Delivery Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="w-full max-w-4xl">
          <DialogHeader>
            <DialogTitle>Quick Delivery Request</DialogTitle>
            <DialogDescription>
              Get an instant quote for your delivery needs
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pickup Location</Label>
                <Input placeholder="Store or address" />
              </div>
              <div className="space-y-2">
                <Label>Delivery Location</Label>
                <Input placeholder="Your location" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>What needs to be delivered?</Label>
              <Textarea placeholder="Describe the items..." />
            </div>
            
            <div className="flex gap-3">
              <Button className="flex-1">Get Quote & Submit</Button>
              <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
