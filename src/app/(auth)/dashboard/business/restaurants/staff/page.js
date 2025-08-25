"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { UserCheck, Clock, Users, Calendar, Plus } from "lucide-react";

export default function RestaurantStaffPage() {
  const [staff] = useState([
    { id: 1, name: "Alice Johnson", role: "Head Chef", status: "on_duty", shift: "Morning", hours: "6:00 AM - 2:00 PM" },
    { id: 2, name: "Bob Smith", role: "Server", status: "on_duty", shift: "Evening", hours: "2:00 PM - 10:00 PM" },
    { id: 3, name: "Carol Davis", role: "Bartender", status: "off_duty", shift: "Evening", hours: "4:00 PM - 12:00 AM" },
    { id: 4, name: "David Wilson", role: "Line Cook", status: "on_duty", shift: "Morning", hours: "7:00 AM - 3:00 PM" }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case "on_duty": return "bg-success/10 text-success";
      case "off_duty": return "bg-muted text-muted-foreground";
      case "break": return "bg-warning/10 text-warning";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getRoleIcon = (role) => {
    switch (role.toLowerCase()) {
      case "head chef":
      case "line cook":
        return "👨‍🍳";
      case "server":
        return "🍽️";
      case "bartender":
        return "🍸";
      case "host":
        return "🎯";
      default:
        return "👤";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Restaurant Staff</h1>
          <p className="text-muted-foreground">Manage staff schedules and performance</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {/* Staff Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff on Duty</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12/16</div>
            <p className="text-xs text-muted-foreground">Currently working</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">All employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32.5</div>
            <p className="text-xs text-muted-foreground">Per week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">16</div>
            <p className="text-xs text-muted-foreground">Staff members</p>
          </CardContent>
        </Card>
      </div>

      {/* Staff List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Staff</CardTitle>
          <CardDescription>Today's staff schedule and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {staff.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-lg">
                    {getRoleIcon(member.role)}
                  </div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {member.hours}
                      </span>
                      <span>{member.shift} Shift</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(member.status)}>
                    {member.status.replace('_', ' ')}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Edit
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
