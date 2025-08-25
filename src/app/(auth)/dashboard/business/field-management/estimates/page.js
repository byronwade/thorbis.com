"use client";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";

export default function EstimatesIndexPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Estimates</h1>
          <p className="text-muted-foreground">Quotes and approvals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>List</CardTitle>
            <CardDescription>All estimates</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm"><Link href="/dashboard/business/estimates/list">Open</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Create</CardTitle>
            <CardDescription>New estimate</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm"><Link href="/dashboard/business/estimates/create">Open</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Approvals</CardTitle>
            <CardDescription>Pending decisions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm"><Link href="/dashboard/business/estimates/approvals">Open</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Follow-ups</CardTitle>
            <CardDescription>Track engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm"><Link href="/dashboard/business/estimates/follow-ups">Open</Link></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


