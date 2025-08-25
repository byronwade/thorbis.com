"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Package, AlertTriangle, TrendingDown, Plus, Search } from "lucide-react";

export default function RestaurantInventoryPage() {
  const [inventoryItems] = useState([
    { id: 1, name: "Fresh Salmon", category: "Protein", stock: 15, unit: "lbs", reorderLevel: 10, status: "good" },
    { id: 2, name: "Romaine Lettuce", category: "Vegetables", stock: 3, unit: "heads", reorderLevel: 5, status: "low" },
    { id: 3, name: "Olive Oil", category: "Pantry", stock: 0, unit: "bottles", reorderLevel: 2, status: "out" },
    { id: 4, name: "Chicken Breast", category: "Protein", stock: 25, unit: "lbs", reorderLevel: 15, status: "good" }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case "good": return "bg-success/10 text-success";
      case "low": return "bg-warning/10 text-warning";
      case "out": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "low": return <TrendingDown className="h-4 w-4" />;
      case "out": return <AlertTriangle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Restaurant Inventory</h1>
          <p className="text-muted-foreground">Track ingredients, supplies, and stock levels</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Inventory Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">247</div>
            <p className="text-sm text-muted-foreground">Total Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-warning">23</div>
            <p className="text-sm text-muted-foreground">Low Stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-destructive">5</div>
            <p className="text-sm text-muted-foreground">Out of Stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">$12,450</div>
            <p className="text-sm text-muted-foreground">Total Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Items */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>Current stock levels and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inventoryItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Package className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-medium">{item.stock} {item.unit}</p>
                    <p className="text-sm text-muted-foreground">Reorder at {item.reorderLevel}</p>
                  </div>
                  <Badge className={getStatusColor(item.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(item.status)}
                      <span className="capitalize">{item.status}</span>
                    </div>
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
