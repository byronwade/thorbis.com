"use client";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";

export default function MarketingIndexPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Marketing</h1>
          <p className="text-muted-foreground">Campaigns and reviews</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Campaigns</CardTitle>
            <CardDescription>Manage marketing efforts</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm"><Link href="/dashboard/business/marketing/campaigns">Open</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reviews</CardTitle>
            <CardDescription>Customer feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm"><Link href="/dashboard/business/marketing/reviews">Open</Link></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


