"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Truck, MapPin, Clock, Fuel, AlertTriangle, TrendingUp, Navigation } from "lucide-react";

/**
 * Fleet Management Widget
 * Vehicle tracking and fleet management overview
 */
export function FleetManagementWidget() {
	// Mock fleet data
	const fleetData = {
		totalVehicles: 12,
		activeVehicles: 9,
		idleVehicles: 3,
		maintenanceDue: 2,
		totalMileage: "4,890",
		fuelEfficiency: "12.4 MPG",
		alerts: [
			{
				vehicleId: "TRK-001",
				type: "maintenance",
				message: "Scheduled maintenance due",
				priority: "medium"
			},
			{
				vehicleId: "VAN-003", 
				type: "fuel",
				message: "Low fuel warning",
				priority: "high"
			}
		],
		activeRoutes: [
			{
				driver: "John Smith",
				vehicle: "TRK-001",
				destination: "Downtown Delivery",
				eta: "25 min",
				status: "en_route"
			},
			{
				driver: "Maria Garcia",
				vehicle: "VAN-002", 
				destination: "Warehouse Pickup",
				eta: "45 min",
				status: "loading"
			}
		]
	};

	const getAlertIcon = (type) => {
		switch (type) {
			case 'maintenance': return <AlertTriangle className="h-3 w-3 text-orange-500" />;
			case 'fuel': return <Fuel className="h-3 w-3 text-red-500" />;
			default: return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
		}
	};

	const getStatusColor = (status) => {
		switch (status) {
			case 'en_route': return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200';
			case 'loading': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200';
			case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200';
			default: return 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200';
		}
	};

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
							<Truck className="h-4 w-4 text-blue-600" />
						</div>
						<div>
							<CardTitle className="text-sm">Fleet Management</CardTitle>
							<CardDescription className="text-xs">Vehicle tracking overview</CardDescription>
						</div>
					</div>
					<Button size="sm" variant="outline" className="text-xs h-7">
						Track All
					</Button>
				</div>
			</CardHeader>
			<CardContent className="pt-0 space-y-4">
				{/* Fleet Status Grid */}
				<div className="grid grid-cols-2 gap-3">
					<div className="space-y-1">
						<div className="flex items-center space-x-1">
							<Truck className="h-3 w-3 text-blue-600" />
							<span className="text-xs text-muted-foreground">Active</span>
						</div>
						<p className="font-semibold text-sm text-blue-600">{fleetData.activeVehicles}</p>
					</div>
					<div className="space-y-1">
						<div className="flex items-center space-x-1">
							<Clock className="h-3 w-3 text-gray-600" />
							<span className="text-xs text-muted-foreground">Idle</span>
						</div>
						<p className="font-semibold text-sm">{fleetData.idleVehicles}</p>
					</div>
					<div className="space-y-1">
						<div className="flex items-center space-x-1">
							<TrendingUp className="h-3 w-3 text-green-600" />
							<span className="text-xs text-muted-foreground">Mileage</span>
						</div>
						<p className="font-semibold text-sm">{fleetData.totalMileage}</p>
					</div>
					<div className="space-y-1">
						<div className="flex items-center space-x-1">
							<Fuel className="h-3 w-3 text-orange-600" />
							<span className="text-xs text-muted-foreground">Efficiency</span>
						</div>
						<p className="font-semibold text-sm">{fleetData.fuelEfficiency}</p>
					</div>
				</div>

				{/* Active Routes */}
				<div className="space-y-2">
					<h4 className="text-xs font-medium text-muted-foreground">Active Routes</h4>
					<div className="space-y-2">
						{fleetData.activeRoutes.slice(0, 2).map((route, index) => (
							<div key={index} className="p-2 border rounded text-xs space-y-1">
								<div className="flex items-center justify-between">
									<span className="font-medium">{route.driver}</span>
									<Badge className={`text-xs ${getStatusColor(route.status)}`}>
										{route.status.replace('_', ' ')}
									</Badge>
								</div>
								<div className="flex items-center justify-between text-muted-foreground">
									<span>{route.vehicle}</span>
									<span>ETA: {route.eta}</span>
								</div>
								<div className="flex items-center space-x-1 text-muted-foreground">
									<MapPin className="h-3 w-3" />
									<span className="truncate">{route.destination}</span>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Alerts */}
				{fleetData.alerts.length > 0 && (
					<div className="space-y-2">
						<h4 className="text-xs font-medium text-muted-foreground">Alerts</h4>
						<div className="space-y-1">
							{fleetData.alerts.slice(0, 2).map((alert, index) => (
								<div key={index} className="flex items-start space-x-2 p-2 bg-muted/20 rounded text-xs">
									{getAlertIcon(alert.type)}
									<div className="flex-1">
										<span className="font-medium">{alert.vehicleId}</span>
										<p className="text-muted-foreground">{alert.message}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				<Button size="sm" variant="outline" className="w-full">
					<Navigation className="h-3 w-3 mr-1" />
					View Fleet Map
				</Button>
			</CardContent>
		</Card>
	);
}

// Default export for compatibility
export default FleetManagementWidget;
