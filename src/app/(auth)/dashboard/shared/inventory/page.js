"use client";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";

export default function InventoryIndexPage() {
	const items = [
		["Stock List", "/dashboard/business/inventory/stock-list"],
		["Orders & Reorders", "/dashboard/business/inventory/orders-reorders"],
		["Parts Usage", "/dashboard/business/inventory/parts-usage"],
		["Equipment Profiles", "/dashboard/business/inventory/equipment-profiles"],
		["Alerts & Reports", "/dashboard/business/inventory/alerts-reports"],
		["Multi-location", "/dashboard/business/inventory/multi-location"],
	];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Parts and equipment management</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {items.map(([title, href]) => (
          <Card key={href}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>Open</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="sm">
                <Link href={href}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
