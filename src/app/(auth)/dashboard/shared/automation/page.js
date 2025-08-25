"use client";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";

export default function AutomationIndexPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Automation</h1>
					<p className="text-muted-foreground">AI-powered workflows</p>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				{[
					["Auto-scheduling AI", "/dashboard/business/automation/auto-scheduling-ai"],
					["Route Optimizer AI", "/dashboard/business/automation/route-optimizer-ai"],
					["Sales Suggestions AI", "/dashboard/business/automation/sales-suggestions-ai"],
					["Proactive Campaigns AI", "/dashboard/business/automation/proactive-campaigns-ai"],
					["Virtual Call Assistant", "/dashboard/business/automation/virtual-call-assistant"],
					["AI Performance Coach", "/dashboard/business/automation/ai-performance-coach"],
					["Workflow Automations", "/dashboard/business/automation/workflow-automations"],
				].map(([title, href]) => (
					<Card key={href}>
						<CardHeader>
							<CardTitle>{title}</CardTitle>
							<CardDescription>Configuration and monitoring</CardDescription>
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
