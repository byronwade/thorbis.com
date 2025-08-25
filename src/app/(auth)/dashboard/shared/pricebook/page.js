"use client";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";

export default function PricebookIndexPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pricebook</h1>
          <p className="text-muted-foreground">Services, products, and categories</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
            <CardDescription>Service catalog</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm"><Link href="/dashboard/business/pricebook/services">Open</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>Parts catalog</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm"><Link href="/dashboard/business/pricebook/products">Open</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Organize catalog</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm"><Link href="/dashboard/business/pricebook/categories">Open</Link></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


