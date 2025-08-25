"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Users, Star, Phone, Mail, MapPin, Plus } from "lucide-react";

export default function RestaurantCustomersPage() {
  const [customers] = useState([
    { id: 1, name: "John Smith", email: "john@example.com", phone: "(555) 123-4567", visits: 15, lastVisit: "2024-01-15", rating: 5, preferences: ["Vegetarian", "No Spice"] },
    { id: 2, name: "Sarah Johnson", email: "sarah@example.com", phone: "(555) 987-6543", visits: 8, lastVisit: "2024-01-12", rating: 4, preferences: ["Gluten-Free"] },
    { id: 3, name: "Mike Wilson", email: "mike@example.com", phone: "(555) 456-7890", visits: 23, lastVisit: "2024-01-14", rating: 5, preferences: ["Seafood Lover"] },
    { id: 4, name: "Lisa Chen", email: "lisa@example.com", phone: "(555) 321-0987", visits: 3, lastVisit: "2024-01-10", rating: 4, preferences: ["Dairy-Free", "Vegan"] }
  ]);

  const getCustomerTier = (visits) => {
    if (visits >= 20) return { tier: "VIP", color: "bg-yellow-500/10 text-yellow-600" };
    if (visits >= 10) return { tier: "Regular", color: "bg-blue-500/10 text-blue-600" };
    return { tier: "New", color: "bg-gray-500/10 text-gray-600" };
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Restaurant Customers</h1>
          <p className="text-muted-foreground">Manage customer relationships and preferences</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Customer Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">+12% this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Customers</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">20+ visits</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.6</div>
            <p className="text-xs text-muted-foreground">Customer satisfaction</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repeat Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">Return customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
          <CardDescription>Customer profiles and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customers.map((customer) => {
              const tierInfo = getCustomerTier(customer.visits);
              return (
                <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{customer.name}</p>
                        <Badge className={tierInfo.color}>
                          {tierInfo.tier}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {customer.email}
                        </span>
                        <span className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {customer.phone}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{customer.visits} visits</span>
                        <span>Last visit: {customer.lastVisit}</span>
                      </div>
                      {customer.preferences.length > 0 && (
                        <div className="flex items-center space-x-1 mt-1">
                          <span className="text-xs text-muted-foreground">Preferences:</span>
                          {customer.preferences.map((pref, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {pref}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 mb-2">
                      {renderStars(customer.rating)}
                    </div>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
