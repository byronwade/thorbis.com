"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Progress } from "@components/ui/progress";
import { Users, MapPin, Phone, Star, CheckCircle, XCircle, AlertTriangle, Activity, Search, Settings, Plus, Edit, Eye, Calendar as CalendarIcon, Target, Award, Navigation, Wrench } from "lucide-react";

export default function TechnicianAvailability() {
	const [activeTab, setActiveTab] = useState("overview");
	const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState("all");

	// Mock technician data with detailed availability and performance metrics
	const [technicians, setTechnicians] = useState([
		{
			id: "t_001",
			name: "Mike Rodriguez",
			avatar: "/placeholder.svg",
			phone: "(555) 123-4567",
			email: "mike.rodriguez@company.com",
			status: "on_job",
			location: {
				current: "Downtown Area",
				coordinates: { lat: 40.7128, lng: -74.006 },
			},
			currentJob: {
				id: "j_001",
				title: "Emergency Plumbing Repair",
				customer: "Sarah Chen",
				address: "123 Main St",
				estimatedEnd: "2024-01-08T14:30:00",
			},
			schedule: {
				workingHours: { start: "08:00", end: "17:00" },
				breakTime: { start: "12:00", end: "13:00" },
				overtime: true,
				weekendWork: false,
			},
			skills: ["Plumbing", "Emergency Repairs", "Water Heaters"],
			certifications: ["Licensed Plumber", "Backflow Prevention"],
			performance: {
				rating: 4.9,
				completionRate: 98.5,
				responseTime: 12,
				customerSatisfaction: 4.8,
				jobsToday: 4,
				hoursWorked: 6.5,
				efficiency: 94,
			},
			availability: {
				nextAvailable: "2024-01-08T15:00:00",
				bookedHours: 6.5,
				availableHours: 1.5,
				utilizationRate: 81,
			},
			vehicle: {
				id: "v_001",
				type: "Van",
				plate: "PLB-001",
				fuelLevel: 75,
				location: "Downtown Area",
			},
			todayJobs: [
				{
					id: "j_001",
					time: "08:00-10:30",
					title: "Faucet Installation",
					status: "completed",
					customer: "John Smith",
				},
				{
					id: "j_002",
					time: "11:00-12:00",
					title: "Leak Detection",
					status: "completed",
					customer: "Mary Johnson",
				},
				{
					id: "j_003",
					time: "13:00-14:30",
					title: "Emergency Repair",
					status: "in_progress",
					customer: "Sarah Chen",
				},
				{
					id: "j_004",
					time: "15:00-17:00",
					title: "Water Heater Service",
					status: "scheduled",
					customer: "Bob Wilson",
				},
			],
		},
		{
			id: "t_002",
			name: "Alex Johnson",
			avatar: "/placeholder.svg",
			phone: "(555) 234-5678",
			email: "alex.johnson@company.com",
			status: "available",
			location: {
				current: "North Side",
				coordinates: { lat: 40.7589, lng: -73.9851 },
			},
			currentJob: null,
			schedule: {
				workingHours: { start: "09:00", end: "18:00" },
				breakTime: { start: "12:30", end: "13:30" },
				overtime: true,
				weekendWork: true,
			},
			skills: ["HVAC", "Air Conditioning", "Heating Systems"],
			certifications: ["EPA 608", "NATE Certified"],
			performance: {
				rating: 4.8,
				completionRate: 96.2,
				responseTime: 15,
				customerSatisfaction: 4.7,
				jobsToday: 3,
				hoursWorked: 5.5,
				efficiency: 89,
			},
			availability: {
				nextAvailable: "2024-01-08T13:30:00",
				bookedHours: 5.5,
				availableHours: 2.5,
				utilizationRate: 69,
			},
			vehicle: {
				id: "v_002",
				type: "Truck",
				plate: "HVC-002",
				fuelLevel: 60,
				location: "North Side",
			},
			todayJobs: [
				{
					id: "j_005",
					time: "09:00-11:30",
					title: "AC Maintenance",
					status: "completed",
					customer: "Lisa Brown",
				},
				{
					id: "j_006",
					time: "14:00-16:00",
					title: "Thermostat Installation",
					status: "scheduled",
					customer: "Tom Davis",
				},
				{
					id: "j_007",
					time: "16:30-18:00",
					title: "System Inspection",
					status: "scheduled",
					customer: "Jennifer Lee",
				},
			],
		},
		{
			id: "t_003",
			name: "Sarah Davis",
			avatar: "/placeholder.svg",
			phone: "(555) 345-6789",
			email: "sarah.davis@company.com",
			status: "traveling",
			location: {
				current: "En route to South Side",
				coordinates: { lat: 40.6892, lng: -74.0445 },
			},
			currentJob: {
				id: "j_008",
				title: "Electrical Inspection",
				customer: "Mike Garcia",
				address: "456 Oak Ave",
				estimatedArrival: "2024-01-08T14:00:00",
			},
			schedule: {
				workingHours: { start: "07:00", end: "16:00" },
				breakTime: { start: "11:30", end: "12:30" },
				overtime: false,
				weekendWork: false,
			},
			skills: ["Electrical", "Panel Upgrades", "Wiring"],
			certifications: ["Master Electrician", "Code Inspector"],
			performance: {
				rating: 4.7,
				completionRate: 97.8,
				responseTime: 18,
				customerSatisfaction: 4.6,
				jobsToday: 2,
				hoursWorked: 4.0,
				efficiency: 87,
			},
			availability: {
				nextAvailable: "2024-01-08T16:30:00",
				bookedHours: 7.0,
				availableHours: 1.0,
				utilizationRate: 88,
			},
			vehicle: {
				id: "v_003",
				type: "Van",
				plate: "ELC-003",
				fuelLevel: 45,
				location: "En route",
			},
			todayJobs: [
				{
					id: "j_009",
					time: "07:00-11:00",
					title: "Panel Upgrade",
					status: "completed",
					customer: "David Kim",
				},
				{
					id: "j_010",
					time: "13:00-16:00",
					title: "Electrical Inspection",
					status: "in_progress",
					customer: "Mike Garcia",
				},
			],
		},
		{
			id: "t_004",
			name: "Tom Wilson",
			avatar: "/placeholder.svg",
			phone: "(555) 456-7890",
			email: "tom.wilson@company.com",
			status: "off_duty",
			location: {
				current: "Office",
				coordinates: { lat: 40.7831, lng: -73.9712 },
			},
			currentJob: null,
			schedule: {
				workingHours: { start: "10:00", end: "19:00" },
				breakTime: { start: "14:00", end: "15:00" },
				overtime: true,
				weekendWork: true,
			},
			skills: ["General Maintenance", "Landscaping", "Cleaning"],
			certifications: ["Safety Certified", "Equipment Operator"],
			performance: {
				rating: 4.5,
				completionRate: 94.1,
				responseTime: 22,
				customerSatisfaction: 4.4,
				jobsToday: 1,
				hoursWorked: 3.0,
				efficiency: 78,
			},
			availability: {
				nextAvailable: "2024-01-09T10:00:00",
				bookedHours: 3.0,
				availableHours: 5.0,
				utilizationRate: 38,
			},
			vehicle: {
				id: "v_004",
				type: "Truck",
				plate: "MNT-004",
				fuelLevel: 90,
				location: "Office",
			},
			todayJobs: [
				{
					id: "j_011",
					time: "10:00-13:00",
					title: "Maintenance Service",
					status: "completed",
					customer: "Anna Martinez",
				},
			],
		},
	]);

	const [teamStats, setTeamStats] = useState({
		total: technicians.length,
		available: technicians.filter((t) => t.status === "available").length,
		onJob: technicians.filter((t) => t.status === "on_job").length,
		traveling: technicians.filter((t) => t.status === "traveling").length,
		offDuty: technicians.filter((t) => t.status === "off_duty").length,
		avgUtilization: technicians.reduce((sum, t) => sum + t.availability.utilizationRate, 0) / technicians.length,
		avgRating: technicians.reduce((sum, t) => sum + t.performance.rating, 0) / technicians.length,
		totalJobsToday: technicians.reduce((sum, t) => sum + t.performance.jobsToday, 0),
		avgResponseTime: technicians.reduce((sum, t) => sum + t.performance.responseTime, 0) / technicians.length,
	});

	const filteredTechnicians = technicians.filter((tech) => {
		const matchesSearch = tech.name.toLowerCase().includes(searchTerm.toLowerCase()) || tech.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()));
		const matchesStatus = filterStatus === "all" || tech.status === filterStatus;
		return matchesSearch && matchesStatus;
	});

	const getStatusColor = (status) => {
		switch (status) {
			case "available":
				return "bg-success/10 text-success dark:bg-success dark:text-success/90";
			case "on_job":
				return "bg-primary/10 text-primary dark:bg-primary dark:text-primary/90";
			case "traveling":
				return "bg-warning/10 text-warning dark:bg-warning dark:text-warning/90";
			case "off_duty":
				return "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground";
			default:
				return "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground";
		}
	};

	const getStatusIcon = (status) => {
		switch (status) {
			case "available":
				return <CheckCircle className="w-4 h-4 text-success" />;
			case "on_job":
				return <Activity className="w-4 h-4 text-primary" />;
			case "traveling":
				return <Navigation className="w-4 h-4 text-warning" />;
			case "off_duty":
				return <XCircle className="w-4 h-4 text-muted-foreground" />;
			default:
				return <AlertTriangle className="w-4 h-4 text-destructive" />;
		}
	};

	const getUtilizationColor = (rate) => {
		if (rate >= 80) return "text-success";
		if (rate >= 60) return "text-warning";
		return "text-destructive";
	};

	const formatTime = (timeString) => {
		return new Date(timeString).toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		});
	};

	const formatDuration = (hours) => {
		const h = Math.floor(hours);
		const m = Math.round((hours - h) * 60);
		return `${h}h ${m}m`;
	};

	return (
		<div className="py-8 mx-auto max-w-7xl space-y-8">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Technician Availability</h1>
					<p className="text-muted-foreground">Monitor team status, schedules, and performance in real-time</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline">
						<Settings className="mr-2 w-4 h-4" />
						Manage Team
					</Button>
					<Button>
						<Plus className="mr-2 w-4 h-4" />
						Add Technician
					</Button>
				</div>
			</div>

			{/* Team Overview Stats */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex justify-between items-center">
							<div>
								<p className="text-sm text-muted-foreground">Team Status</p>
								<div className="flex gap-2 items-center mt-1">
									<div className="flex gap-1">
										<div className="w-2 h-2 bg-success rounded-full"></div>
										<span className="text-xs">{teamStats.available}</span>
									</div>
									<div className="flex gap-1">
										<div className="w-2 h-2 bg-primary rounded-full"></div>
										<span className="text-xs">{teamStats.onJob}</span>
									</div>
									<div className="flex gap-1">
										<div className="w-2 h-2 bg-warning rounded-full"></div>
										<span className="text-xs">{teamStats.traveling}</span>
									</div>
									<div className="flex gap-1">
										<div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
										<span className="text-xs">{teamStats.offDuty}</span>
									</div>
								</div>
							</div>
							<Users className="w-8 h-8 text-primary" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex justify-between items-center">
							<div>
								<p className="text-sm text-muted-foreground">Avg Utilization</p>
								<p className={`text-2xl font-bold ${getUtilizationColor(teamStats.avgUtilization)}`}>{teamStats.avgUtilization.toFixed(1)}%</p>
							</div>
							<Target className="w-8 h-8 text-success" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex justify-between items-center">
							<div>
								<p className="text-sm text-muted-foreground">Jobs Today</p>
								<p className="text-2xl font-bold">{teamStats.totalJobsToday}</p>
							</div>
							<Wrench className="w-8 h-8 text-warning" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex justify-between items-center">
							<div>
								<p className="text-sm text-muted-foreground">Avg Rating</p>
								<div className="flex gap-1 items-center">
									<p className="text-2xl font-bold">{teamStats.avgRating.toFixed(1)}</p>
									<Star className="w-4 h-4 fill-yellow-400 text-warning" />
								</div>
							</div>
							<Award className="w-8 h-8 text-purple-600" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<Card>
				<CardContent className="p-6">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<div className="flex flex-1 gap-4 items-center">
							<div className="relative flex-1 max-w-sm">
								<Search className="absolute left-3 top-1/2 w-4 h-4 text-muted-foreground transform -translate-y-1/2" />
								<Input placeholder="Search technicians or skills..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
							</div>
							<Select value={filterStatus} onValueChange={setFilterStatus}>
								<SelectTrigger className="w-40">
									<SelectValue placeholder="Filter by status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Status</SelectItem>
									<SelectItem value="available">Available</SelectItem>
									<SelectItem value="on_job">On Job</SelectItem>
									<SelectItem value="traveling">Traveling</SelectItem>
									<SelectItem value="off_duty">Off Duty</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex gap-2 items-center">
							<Label htmlFor="date-filter">Date:</Label>
							<Input type="date" id="date-filter" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-40" />
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Technician Cards */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				{filteredTechnicians.map((tech) => (
					<Card key={tech.id} className="hover:shadow-lg transition-shadow">
						<CardHeader className="pb-4">
							<div className="flex justify-between items-start">
								<div className="flex gap-3 items-center">
									<Avatar className="w-12 h-12">
										<AvatarImage src={tech.avatar} />
										<AvatarFallback className="text-sm">
											{tech.name
												.split(" ")
												.map((n) => n[0])
												.join("")}
										</AvatarFallback>
									</Avatar>
									<div>
										<h3 className="text-lg font-semibold">{tech.name}</h3>
										<div className="flex gap-2 items-center">
											{getStatusIcon(tech.status)}
											<Badge className={getStatusColor(tech.status)}>{tech.status.replace("_", " ")}</Badge>
										</div>
									</div>
								</div>
								<div className="flex gap-1">
									<Button variant="ghost" size="sm">
										<Eye className="w-4 h-4" />
									</Button>
									<Button variant="ghost" size="sm">
										<Edit className="w-4 h-4" />
									</Button>
								</div>
							</div>
						</CardHeader>

						<CardContent className="space-y-6">
							{/* Current Status */}
							<div className="space-y-2">
								<div className="flex justify-between items-center">
									<span className="text-sm font-medium">Current Status</span>
									<span className="text-sm text-muted-foreground">{tech.location.current}</span>
								</div>
								{tech.currentJob && (
									<div className="p-3 bg-muted/50 rounded-lg">
										<p className="text-sm font-medium">{tech.currentJob.title}</p>
										<p className="text-xs text-muted-foreground">Customer: {tech.currentJob.customer}</p>
										<p className="text-xs text-muted-foreground">{tech.status === "traveling" ? `ETA: ${formatTime(tech.currentJob.estimatedArrival)}` : `End: ${formatTime(tech.currentJob.estimatedEnd)}`}</p>
									</div>
								)}
							</div>

							{/* Performance Metrics */}
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">Utilization</span>
										<span className={`text-sm font-medium ${getUtilizationColor(tech.availability.utilizationRate)}`}>{tech.availability.utilizationRate}%</span>
									</div>
									<Progress value={tech.availability.utilizationRate} className="h-2" />
								</div>
								<div className="space-y-2">
									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">Efficiency</span>
										<span className={`text-sm font-medium ${getUtilizationColor(tech.performance.efficiency)}`}>{tech.performance.efficiency}%</span>
									</div>
									<Progress value={tech.performance.efficiency} className="h-2" />
								</div>
							</div>

							{/* Key Stats */}
							<div className="grid grid-cols-4 gap-4 text-center">
								<div>
									<p className="text-sm text-muted-foreground">Rating</p>
									<div className="flex gap-1 justify-center items-center">
										<p className="text-lg font-semibold">{tech.performance.rating}</p>
										<Star className="w-4 h-4 fill-yellow-400 text-warning" />
									</div>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Jobs Today</p>
									<p className="text-lg font-semibold">{tech.performance.jobsToday}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Hours Worked</p>
									<p className="text-lg font-semibold">{formatDuration(tech.performance.hoursWorked)}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Response Time</p>
									<p className="text-lg font-semibold">{tech.performance.responseTime}min</p>
								</div>
							</div>

							{/* Skills & Certifications */}
							<div className="space-y-3">
								<div>
									<p className="text-sm font-medium mb-2">Skills</p>
									<div className="flex flex-wrap gap-1">
										{tech.skills.map((skill, index) => (
											<Badge key={index} variant="outline" className="text-xs">
												{skill}
											</Badge>
										))}
									</div>
								</div>
								<div>
									<p className="text-sm font-medium mb-2">Certifications</p>
									<div className="flex flex-wrap gap-1">
										{tech.certifications.map((cert, index) => (
											<Badge key={index} variant="secondary" className="text-xs">
												{cert}
											</Badge>
										))}
									</div>
								</div>
							</div>

							{/* Today's Schedule */}
							<div className="space-y-3">
								<div className="flex justify-between items-center">
									<p className="text-sm font-medium">Today's Schedule</p>
									<span className="text-xs text-muted-foreground">Next available: {tech.availability.nextAvailable ? formatTime(tech.availability.nextAvailable) : "Tomorrow"}</span>
								</div>
								<div className="space-y-2">
									{tech.todayJobs.map((job, index) => (
										<div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded text-xs">
											<div>
												<span className="font-medium">{job.time}</span>
												<span className="ml-2 text-muted-foreground">{job.title}</span>
											</div>
											<Badge className={job.status === "completed" ? "bg-success/10 text-success" : job.status === "in_progress" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"} variant="secondary">
												{job.status.replace("_", " ")}
											</Badge>
										</div>
									))}
								</div>
							</div>

							{/* Vehicle Info */}
							<div className="p-3 bg-muted/50 rounded-lg">
								<div className="flex justify-between items-center">
									<div>
										<p className="text-sm font-medium">
											{tech.vehicle.type} ({tech.vehicle.plate})
										</p>
										<p className="text-xs text-muted-foreground">{tech.vehicle.location}</p>
									</div>
									<div className="text-right">
										<p className="text-sm font-medium">Fuel: {tech.vehicle.fuelLevel}%</p>
										<Progress value={tech.vehicle.fuelLevel} className="w-16 h-2" />
									</div>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex gap-2">
								<Button variant="outline" size="sm" className="flex-1">
									<Phone className="mr-1 w-4 h-4" />
									Call
								</Button>
								<Button variant="outline" size="sm" className="flex-1">
									<MapPin className="mr-1 w-4 h-4" />
									Locate
								</Button>
								<Button variant="outline" size="sm" className="flex-1">
									<CalendarIcon className="mr-1 w-4 h-4" />
									Schedule
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{filteredTechnicians.length === 0 && (
				<Card>
					<CardContent className="p-12 text-center">
						<Users className="mx-auto mb-4 w-12 h-12 text-muted-foreground" />
						<h3 className="mb-2 text-lg font-semibold">No technicians found</h3>
						<p className="mb-6 text-muted-foreground">Try adjusting your search terms or filters</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
