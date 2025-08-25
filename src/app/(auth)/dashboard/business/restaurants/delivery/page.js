"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Truck, MapPin, Clock, Phone, Navigation } from "lucide-react";

export default function RestaurantDeliveryPage() {
  const [deliveries] = useState([
    { id: "DEL-001", order: "ORD-045", customer: "John Smith", address: "123 Main St", phone: "(555) 123-4567", status: "preparing", driver: null, estimatedTime: "25 min" },
    { id: "DEL-002", order: "ORD-046", customer: "Sarah Johnson", address: "456 Oak Ave", phone: "(555) 987-6543", status: "out_for_delivery", driver: "Mike Wilson", estimatedTime: "15 min" },
    { id: "DEL-003", order: "ORD-047", customer: "Bob Davis", address: "789 Pine St", phone: "(555) 456-7890", status: "delivered", driver: "Lisa Chen", estimatedTime: "Delivered" }
  ]);

  const [drivers] = useState([
    { id: 1, name: "Mike Wilson", status: "delivering", orders: 1, location: "Downtown" },
    { id: 2, name: "Lisa Chen", status: "available", orders: 0, location: "Restaurant" },
    { id: 3, name: "Tom Brown", status: "delivering", orders: 2, location: "Westside" }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered": return "bg-success/10 text-success";
      case "out_for_delivery": return "bg-primary/10 text-primary";
      case "preparing": return "bg-warning/10 text-warning";
      case "cancelled": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getDriverStatusColor = (status) => {
    switch (status) {
      case "available": return "bg-success/10 text-success";
      case "delivering": return "bg-primary/10 text-primary";
      case "offline": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delivery Management</h1>
          <p className="text-muted-foreground">Track deliveries and manage drivers</p>
        </div>
        <Button>
          <Truck className="w-4 h-4 mr-2" />
          Assign Delivery
        </Button>
      </div>

      {/* Delivery Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">15</div>
            <p className="text-sm text-muted-foreground">Active Deliveries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">28 min</div>
            <p className="text-sm text-muted-foreground">Avg Delivery Time</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">3</div>
            <p className="text-sm text-muted-foreground">Drivers Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">$247</div>
            <p className="text-sm text-muted-foreground">Delivery Revenue</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Deliveries */}
        <Card>
          <CardHeader>
            <CardTitle>Active Deliveries</CardTitle>
            <CardDescription>Current delivery orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deliveries.map((delivery) => (
                <div key={delivery.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Truck className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{delivery.id} - {delivery.customer}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{delivery.address}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{delivery.phone}</span>
                      </div>
                      {delivery.driver && (
                        <p className="text-sm text-muted-foreground">Driver: {delivery.driver}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(delivery.status)}>
                      {delivery.status.replace('_', ' ')}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">{delivery.estimatedTime}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Driver Status */}
        <Card>
          <CardHeader>
            <CardTitle>Driver Status</CardTitle>
            <CardDescription>Current driver availability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {drivers.map((driver) => (
                <div key={driver.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Navigation className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{driver.name}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{driver.location}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{driver.orders} active orders</p>
                    </div>
                  </div>
                  <Badge className={getDriverStatusColor(driver.status)}>
                    {driver.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
