"use client";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";

export default function InvoicesIndexPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Billing and payments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>List</CardTitle>
            <CardDescription>All invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm"><Link href="/dashboard/business/invoices/list">Open</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Create</CardTitle>
            <CardDescription>New invoice</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm"><Link href="/dashboard/business/invoices/create">Open</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
            <CardDescription>Record and track</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm"><Link href="/dashboard/business/invoices/payments">Open</Link></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


