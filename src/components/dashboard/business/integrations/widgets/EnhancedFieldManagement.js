"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { MapPin, Users, Clock, CheckCircle, AlertCircle, Wrench, TrendingUp } from "lucide-react";

/**
 * Enhanced Field Management Widget  
 * Advanced field service management with real-time updates
 */
export default function EnhancedFieldManagementWidget() {
	// Mock field management data
	const fieldData = {
		activeJobs: 12,
		completedToday: 8,
		technicianUtilization: 87,
		customerSatisfaction: 4.8,
		activeRoutes: [
			{
				id: 1,
				technician: "Mike Johnson",
				jobsRemaining: 3,
				eta: "45 min",
				status: "on_route",
				efficiency: 92
			},
			{
				id: 2,
				technician: "Sarah Davis", 
				jobsRemaining: 2,
				eta: "1.2 hrs",
				status: "at_location",
				efficiency: 88
			}
		],
		alerts: [
			{
				type: "delay",
				message: "Job #1234 delayed by 30 minutes",
				severity: "medium"
			},
			{
				type: "completion",
				message: "Emergency repair completed",
				severity: "low"
			}
		]
	};

	const getStatusColor = (status) => {
		switch (status) {
			case 'on_route': return 'bg-primary/10 text-primary dark:bg-primary dark:text-primary/80';
			case 'at_location': return 'bg-success/10 text-success dark:bg-success dark:text-success/80';
			case 'completed': return 'bg-muted text-foreground dark:bg-card dark:text-muted-foreground';
			default: return 'bg-warning/10 text-warning dark:bg-warning dark:text-warning/80';
		}
	};

	const getSeverityIcon = (severity) => {
		switch (severity) {
			case 'high': return <AlertCircle className="h-3 w-3 text-destructive" />;
			case 'medium': return <Clock className="h-3 w-3 text-warning" />;
			default: return <CheckCircle className="h-3 w-3 text-success" />;
		}
	};

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<div className="p-2 bg-indigo-100 dark:bg-indigo-950 rounded-lg">
							<Wrench className="h-4 w-4 text-indigo-600" />
						</div>
						<div>
							<CardTitle className="text-sm">Field Management</CardTitle>
							<CardDescription className="text-xs">Real-time operations</CardDescription>
						</div>
					</div>
					<Button size="sm" variant="outline" className="text-xs h-7">
						Live View
					</Button>
				</div>
			</CardHeader>
			<CardContent className="pt-0 space-y-4">
				{/* Key Metrics Grid */}
				<div className="grid grid-cols-2 gap-3">
					<div className="space-y-1">
						<div className="flex items-center space-x-1">
							<Wrench className="h-3 w-3 text-primary" />
							<span className="text-xs text-muted-foreground">Active Jobs</span>
						</div>
						<p className="font-semibold text-sm">{fieldData.activeJobs}</p>
					</div>
					<div className="space-y-1">
						<div className="flex items-center space-x-1">
							<CheckCircle className="h-3 w-3 text-success" />
							<span className="text-xs text-muted-foreground">Completed</span>
						</div>
						<p className="font-semibold text-sm text-success">{fieldData.completedToday}</p>
					</div>
					<div className="space-y-1">
						<div className="flex items-center space-x-1">
							<Users className="h-3 w-3 text-purple-600" />
							<span className="text-xs text-muted-foreground">Utilization</span>
						</div>
						<p className="font-semibold text-sm">{fieldData.technicianUtilization}%</p>
					</div>
					<div className="space-y-1">
						<div className="flex items-center space-x-1">
							<TrendingUp className="h-3 w-3 text-warning" />
							<span className="text-xs text-muted-foreground">Satisfaction</span>
						</div>
						<p className="font-semibold text-sm text-warning">{fieldData.customerSatisfaction}/5</p>
					</div>
				</div>

				{/* Active Routes */}
				<div className="space-y-2">
					<h4 className="text-xs font-medium text-muted-foreground">Active Technicians</h4>
					<div className="space-y-2">
						{fieldData.activeRoutes.map((route) => (
							<div key={route.id} className="p-2 border rounded text-xs space-y-1">
								<div className="flex items-center justify-between">
									<span className="font-medium">{route.technician}</span>
									<Badge className={`text-xs ${getStatusColor(route.status)}`}>
										{route.status.replace('_', ' ')}
									</Badge>
								</div>
								<div className="flex items-center justify-between text-muted-foreground">
									<span>{route.jobsRemaining} jobs remaining</span>
									<span>ETA: {route.eta}</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Efficiency</span>
									<span className={`font-medium ${route.efficiency >= 90 ? 'text-success' : 'text-warning'}`}>
										{route.efficiency}%
									</span>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Recent Alerts */}
				<div className="space-y-2">
					<h4 className="text-xs font-medium text-muted-foreground">Recent Alerts</h4>
					<div className="space-y-1">
						{fieldData.alerts.map((alert, index) => (
							<div key={index} className="flex items-start space-x-2 p-2 bg-muted/20 rounded text-xs">
								{getSeverityIcon(alert.severity)}
								<span className="flex-1 text-muted-foreground">{alert.message}</span>
							</div>
						))}
					</div>
				</div>

				<Button size="sm" variant="outline" className="w-full">
					<MapPin className="h-3 w-3 mr-1" />
					View Field Map
				</Button>
			</CardContent>
		</Card>
	);
}
