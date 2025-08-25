"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Calendar, Users, Clock, Phone, Plus } from "lucide-react";

export default function RestaurantReservationsPage() {
  const [reservations] = useState([
    { id: 1, name: "John Smith", party: 4, time: "7:00 PM", phone: "(555) 123-4567", status: "confirmed" },
    { id: 2, name: "Sarah Johnson", party: 2, time: "7:30 PM", phone: "(555) 987-6543", status: "pending" },
    { id: 3, name: "Mike Wilson", party: 6, time: "8:00 PM", phone: "(555) 456-7890", status: "confirmed" },
    { id: 4, name: "Lisa Chen", party: 3, time: "8:30 PM", phone: "(555) 321-0987", status: "seated" }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed": return "bg-success/10 text-success";
      case "pending": return "bg-warning/10 text-warning";
      case "seated": return "bg-primary/10 text-primary";
      case "cancelled": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservations</h1>
          <p className="text-muted-foreground">Manage table bookings and reservations</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Reservation
        </Button>
      </div>

      {/* Reservation Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Reservations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+3 from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78</div>
            <p className="text-xs text-muted-foreground">Expected today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Tables</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8/24</div>
            <p className="text-xs text-muted-foreground">Currently available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Party Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2</div>
            <p className="text-xs text-muted-foreground">Guests per reservation</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Reservations */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Reservations</CardTitle>
          <CardDescription>Upcoming reservations for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{reservation.name}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {reservation.party} guests
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {reservation.time}
                      </span>
                      <span className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {reservation.phone}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(reservation.status)}>
                    {reservation.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Seat
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
