"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { ChefHat, Clock, AlertTriangle, CheckCircle, Timer } from "lucide-react";

export default function RestaurantKitchenPage() {
  const [orders] = useState([
    { id: "ORD-001", table: "Table 5", items: ["Grilled Salmon", "Caesar Salad"], time: "12:45 PM", status: "preparing", priority: "normal" },
    { id: "ORD-002", table: "Table 12", items: ["Ribeye Steak", "Mashed Potatoes"], time: "12:50 PM", status: "ready", priority: "high" },
    { id: "ORD-003", table: "Takeout", items: ["Chicken Pasta", "Garlic Bread"], time: "1:00 PM", status: "pending", priority: "normal" }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case "ready": return "bg-success/10 text-success";
      case "preparing": return "bg-warning/10 text-warning";
      case "pending": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "ready": return <CheckCircle className="h-4 w-4" />;
      case "preparing": return <Timer className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kitchen Operations</h1>
          <p className="text-muted-foreground">Kitchen display system and order management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-success border-green-600">
            <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
            Kitchen Open
          </Badge>
        </div>
      </div>

      {/* Kitchen Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">8</div>
            <p className="text-sm text-muted-foreground">Orders in Queue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">12 min</div>
            <p className="text-sm text-muted-foreground">Avg Prep Time</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">3</div>
            <p className="text-sm text-muted-foreground">Ready to Serve</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">5</div>
            <p className="text-sm text-muted-foreground">Staff on Duty</p>
          </CardContent>
        </Card>
      </div>

      {/* Kitchen Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Kitchen Display System</CardTitle>
          <CardDescription>Current orders in preparation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <ChefHat className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{order.id} - {order.table}</p>
                    <p className="text-sm text-muted-foreground">{order.items.join(", ")}</p>
                    <p className="text-xs text-muted-foreground">Ordered at {order.time}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(order.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </div>
                  </Badge>
                  {order.priority === "high" && (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Priority
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
