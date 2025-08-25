"use client";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";

export default function PerformanceIndex() {
	const items = [
		["Scorecards", "/dashboard/business/performance/scorecards"],
		["Efficiency Reports", "/dashboard/business/performance/efficiency-reports"],
	];
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Performance</h1>
				<p className="text-muted-foreground">Scorecards and efficiency reporting</p>
			</div>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
