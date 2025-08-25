"use client";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";

export default function ToolsIndexPage() {
	const items = [
		["Hourly Rate Calculator", "/dashboard/business/tools/hourly-rate-calculator"],
		["Commission Calculator", "/dashboard/business/tools/commission-calculator"],
		["Breakeven Analyzer", "/dashboard/business/tools/breakeven-analyzer"],
		["Job Profit Estimator", "/dashboard/business/tools/job-profit-estimator"],
		["Pricing Builder", "/dashboard/business/tools/pricing-builder"],
		["Marketing ROI", "/dashboard/business/tools/marketing-roi"],
		["Equipment ROI", "/dashboard/business/tools/equipment-roi"],
		["Service Agreement ROI", "/dashboard/business/tools/service-agreement-roi"],
		["Payment Estimator", "/dashboard/business/tools/payment-estimator"],
		["Labor Cost Analyzer", "/dashboard/business/tools/labor-cost-analyzer"],
		["Custom KPI Builder", "/dashboard/business/tools/custom-kpi-builder"],
	];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Business Tools</h1>
          <p className="text-muted-foreground">Calculators and planners</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {items.map(([title, href]) => (
          <Card key={href}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>Open tool</CardDescription>
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
