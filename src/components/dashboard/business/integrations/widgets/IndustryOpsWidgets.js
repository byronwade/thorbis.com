"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Tractor, Car, ShoppingCart, Truck, Home, Hotel } from "lucide-react";

/**
 * Agriculture Management Widget
 */
export function AgricultureWidget() {
	return (
		<Card>
			<CardHeader className="pb-2">
				<div className="flex items-center space-x-2">
					<div className="p-2 bg-success/10 dark:bg-success rounded-lg">
						<Tractor className="h-4 w-4 text-success" />
					</div>
					<div>
						<CardTitle className="text-sm">Agriculture</CardTitle>
						<CardDescription className="text-xs">Farm management tools</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				<div className="space-y-2">
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Active Fields</span>
						<span className="font-medium">12</span>
					</div>
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Crop Health</span>
						<Badge variant="default" className="text-xs">Excellent</Badge>
					</div>
				</div>
				<Button size="sm" variant="outline" className="w-full mt-3">
					View Details
				</Button>
			</CardContent>
		</Card>
	);
}

/**
 * Automotive Management Widget
 */
export function AutomotiveWidget() {
	return (
		<Card>
			<CardHeader className="pb-2">
				<div className="flex items-center space-x-2">
					<div className="p-2 bg-primary/10 dark:bg-primary rounded-lg">
						<Car className="h-4 w-4 text-primary" />
					</div>
					<div>
						<CardTitle className="text-sm">Automotive</CardTitle>
						<CardDescription className="text-xs">Service management</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				<div className="space-y-2">
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Active Services</span>
						<span className="font-medium">8</span>
					</div>
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Revenue Today</span>
						<span className="font-medium text-success">$1,240</span>
					</div>
				</div>
				<Button size="sm" variant="outline" className="w-full mt-3">
					Manage Services
				</Button>
			</CardContent>
		</Card>
	);
}

/**
 * E-commerce Management Widget
 */
export function EcommerceWidget() {
	return (
		<Card>
			<CardHeader className="pb-2">
				<div className="flex items-center space-x-2">
					<div className="p-2 bg-purple-100 dark:bg-purple-950 rounded-lg">
						<ShoppingCart className="h-4 w-4 text-purple-600" />
					</div>
					<div>
						<CardTitle className="text-sm">E-commerce</CardTitle>
						<CardDescription className="text-xs">Online store metrics</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				<div className="space-y-2">
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Orders Today</span>
						<span className="font-medium">23</span>
					</div>
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Conversion</span>
						<span className="font-medium text-success">3.2%</span>
					</div>
				</div>
				<Button size="sm" variant="outline" className="w-full mt-3">
					View Store
				</Button>
			</CardContent>
		</Card>
	);
}

/**
 * Logistics Management Widget
 */
export function LogisticsWidget() {
	return (
		<Card>
			<CardHeader className="pb-2">
				<div className="flex items-center space-x-2">
					<div className="p-2 bg-warning/10 dark:bg-warning rounded-lg">
						<Truck className="h-4 w-4 text-warning" />
					</div>
					<div>
						<CardTitle className="text-sm">Logistics</CardTitle>
						<CardDescription className="text-xs">Fleet & delivery</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				<div className="space-y-2">
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Active Routes</span>
						<span className="font-medium">15</span>
					</div>
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">On-time Rate</span>
						<span className="font-medium text-success">94%</span>
					</div>
				</div>
				<Button size="sm" variant="outline" className="w-full mt-3">
					Track Fleet
				</Button>
			</CardContent>
		</Card>
	);
}

/**
 * Property Management Widget
 */
export function PropertyManagementWidget() {
	return (
		<Card>
			<CardHeader className="pb-2">
				<div className="flex items-center space-x-2">
					<div className="p-2 bg-indigo-100 dark:bg-indigo-950 rounded-lg">
						<Home className="h-4 w-4 text-indigo-600" />
					</div>
					<div>
						<CardTitle className="text-sm">Property</CardTitle>
						<CardDescription className="text-xs">Property management</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				<div className="space-y-2">
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Active Listings</span>
						<span className="font-medium">45</span>
					</div>
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Occupancy</span>
						<span className="font-medium text-success">92%</span>
					</div>
				</div>
				<Button size="sm" variant="outline" className="w-full mt-3">
					Manage Properties
				</Button>
			</CardContent>
		</Card>
	);
}

/**
 * Hospitality Management Widget
 */
export function HospitalityWidget() {
	return (
		<Card>
			<CardHeader className="pb-2">
				<div className="flex items-center space-x-2">
					<div className="p-2 bg-teal-100 dark:bg-teal-950 rounded-lg">
						<Hotel className="h-4 w-4 text-teal-600" />
					</div>
					<div>
						<CardTitle className="text-sm">Hospitality</CardTitle>
						<CardDescription className="text-xs">Guest management</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				<div className="space-y-2">
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Reservations</span>
						<span className="font-medium">28</span>
					</div>
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Check-ins Today</span>
						<span className="font-medium">12</span>
					</div>
				</div>
				<Button size="sm" variant="outline" className="w-full mt-3">
					View Bookings
				</Button>
			</CardContent>
		</Card>
	);
}
