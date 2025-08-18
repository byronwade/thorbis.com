/**
 * LocalHub Dashboard Directory Health Section
 * Extracted from monolithic LocalHub dashboard page
 * Displays directory performance and health metrics
 */

"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Progress } from "@components/ui/progress";
import { Badge } from "@components/ui/badge";
import { Shield, Heart, Activity, CheckCircle, AlertTriangle } from "lucide-react";

const LocalHubDirectoryHealthSection = ({ healthData }) => {
	// Directory Health Metrics (would come from API/store in real implementation)
	const healthMetrics = [
		{
			metric: "Business Retention",
			value: 97.9,
			status: "excellent",
			description: "Businesses staying subscribed",
			icon: Heart,
			target: 95,
		},
		{
			metric: "Payment Success Rate",
			value: 99.2,
			status: "excellent",
			description: "Successful payment processing",
			icon: CheckCircle,
			target: 98,
		},
		{
			metric: "Directory Uptime",
			value: 99.9,
			status: "excellent",
			description: "Directory availability",
			icon: Activity,
			target: 99.5,
		},
		{
			metric: "Support Response Time",
			value: 87.3,
			status: "good",
			description: "Average response under 2 hours",
			icon: Shield,
			target: 90,
		},
	];

	const getStatusColor = (status) => {
		switch (status) {
			case "excellent":
				return "text-green-600";
			case "good":
				return "text-blue-600";
			case "warning":
				return "text-yellow-600";
			case "critical":
				return "text-red-600";
			default:
				return "text-gray-600";
		}
	};

	const getStatusBadge = (status) => {
		switch (status) {
			case "excellent":
				return "bg-green-100 text-green-800";
			case "good":
				return "bg-blue-100 text-blue-800";
			case "warning":
				return "bg-yellow-100 text-yellow-800";
			case "critical":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getOverallHealthScore = () => {
		const average = healthMetrics.reduce((sum, metric) => sum + metric.value, 0) / healthMetrics.length;
		return Math.round(average * 10) / 10;
	};

	const getOverallStatus = (score) => {
		if (score >= 95) return "excellent";
		if (score >= 85) return "good";
		if (score >= 75) return "warning";
		return "critical";
	};

	const overallScore = getOverallHealthScore();
	const overallStatus = getOverallStatus(overallScore);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Shield className="h-5 w-5" />
					Directory Health
				</CardTitle>
				<CardDescription>Your directory performance and reliability metrics</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Overall Health Score */}
				<div className="p-4 bg-muted/50 rounded-lg">
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm font-medium">Overall Health Score</span>
						<Badge className={getStatusBadge(overallStatus)}>{overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}</Badge>
					</div>
					<div className="flex items-center gap-3">
						<div className={`text-2xl font-bold ${getStatusColor(overallStatus)}`}>{overallScore}%</div>
						<div className="flex-1">
							<Progress value={overallScore} className="h-2" />
						</div>
					</div>
				</div>

				{/* Individual Metrics */}
				<div className="space-y-4">
					{healthMetrics.map((metric, index) => {
						const IconComponent = metric.icon;
						const isAboveTarget = metric.value >= metric.target;

						return (
							<div key={index} className="space-y-2">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<IconComponent className={`h-4 w-4 ${getStatusColor(metric.status)}`} />
										<span className="text-sm font-medium">{metric.metric}</span>
										{isAboveTarget ? <CheckCircle className="h-3 w-3 text-green-500" /> : <AlertTriangle className="h-3 w-3 text-yellow-500" />}
									</div>
									<span className={`font-medium ${getStatusColor(metric.status)}`}>{metric.value}%</span>
								</div>

								<Progress value={metric.value} className="h-2" />

								<div className="flex items-center justify-between text-xs text-muted-foreground">
									<span>{metric.description}</span>
									<span>Target: {metric.target}%</span>
								</div>
							</div>
						);
					})}
				</div>

				{/* Health Insights */}
				<div className="pt-4 border-t space-y-3">
					<h4 className="text-sm font-medium">Health Insights</h4>

					<div className="space-y-2">
						<div className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-950 rounded text-xs">
							<CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
							<span className="text-green-700 dark:text-green-300">Excellent retention rate - businesses are satisfied with your directory</span>
						</div>

						<div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded text-xs">
							<Activity className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
							<span className="text-blue-700 dark:text-blue-300">High uptime ensures consistent business visibility</span>
						</div>

						{healthMetrics.some((m) => m.value < m.target) && (
							<div className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-950 rounded text-xs">
								<AlertTriangle className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
								<span className="text-yellow-700 dark:text-yellow-300">Consider improving support response times to reach the 90% target</span>
							</div>
						)}
					</div>
				</div>

				{/* Actions */}
				<div className="pt-4 border-t">
					<div className="grid grid-cols-2 gap-2">
						<button className="text-xs p-2 rounded border hover:bg-muted transition-colors">View Detailed Report</button>
						<button className="text-xs p-2 rounded border hover:bg-muted transition-colors">Health History</button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default LocalHubDirectoryHealthSection;
