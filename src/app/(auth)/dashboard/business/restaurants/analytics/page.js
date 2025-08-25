"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { BarChart3, TrendingUp, DollarSign, Users, Clock, Star, Download } from "lucide-react";

export default function RestaurantAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("today");

  const analyticsData = {
    revenue: {
      today: 3247,
      yesterday: 2890,
      change: 12.4
    },
    orders: {
      today: 87,
      yesterday: 76,
      change: 14.5
    },
    avgOrderValue: {
      today: 37.36,
      yesterday: 38.03,
      change: -1.8
    },
    customerSatisfaction: 4.6,
    popularItems: [
      { name: "Grilled Salmon", orders: 23, revenue: 575 },
      { name: "Ribeye Steak", orders: 18, revenue: 594 },
      { name: "Caesar Salad", orders: 31, revenue: 403 },
      { name: "Chocolate Cake", orders: 15, revenue: 135 }
    ],
    hourlyData: [
      { hour: "11 AM", orders: 5, revenue: 187 },
      { hour: "12 PM", orders: 12, revenue: 448 },
      { hour: "1 PM", orders: 18, revenue: 672 },
      { hour: "2 PM", orders: 15, revenue: 561 },
      { hour: "6 PM", orders: 22, revenue: 823 },
      { hour: "7 PM", orders: 15, revenue: 556 }
    ]
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercentage = (value) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  const getTrendColor = (value) => {
    return value >= 0 ? "text-success" : "text-destructive";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Restaurant Analytics</h1>
          <p className="text-muted-foreground">Sales reports, trends, and business insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.revenue.today)}</div>
            <p className={`text-xs ${getTrendColor(analyticsData.revenue.change)}`}>
              {formatPercentage(analyticsData.revenue.change)} from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.orders.today}</div>
            <p className={`text-xs ${getTrendColor(analyticsData.orders.change)}`}>
              {formatPercentage(analyticsData.orders.change)} from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.avgOrderValue.today)}</div>
            <p className={`text-xs ${getTrendColor(analyticsData.avgOrderValue.change)}`}>
              {formatPercentage(analyticsData.avgOrderValue.change)} from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.customerSatisfaction}</div>
            <p className="text-xs text-muted-foreground">Based on 47 reviews</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Popular Items */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Items Today</CardTitle>
            <CardDescription>Best-selling menu items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.popularItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(item.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hourly Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Hourly Performance</CardTitle>
            <CardDescription>Orders and revenue by hour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.hourlyData.map((hour, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{hour.hour}</p>
                      <p className="text-sm text-muted-foreground">{hour.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(hour.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
          <CardDescription>Key performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-success">94%</div>
              <p className="text-sm text-muted-foreground">Order Accuracy</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">18 min</div>
              <p className="text-sm text-muted-foreground">Avg Prep Time</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-warning">2.3</div>
              <p className="text-sm text-muted-foreground">Table Turns</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
