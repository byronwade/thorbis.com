"use client";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";

export default function DashboardIndexPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview and real-time insights</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Key business metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm"><Link href="/dashboard/business/dashboard/overview">Open</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Real-time Insights</CardTitle>
            <CardDescription>Live operational data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm"><Link href="/dashboard/business/dashboard/real-time-insights">Open</Link></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


