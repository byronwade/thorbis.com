"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Clock, Users, MapPin, Phone, Plus, Filter, Search, ChevronLeft, ChevronRight, Settings, Eye, Edit, Timer, Truck, Wrench, DollarSign, Zap } from "lucide-react";
import { format, addDays, subDays, startOfWeek, addWeeks, subWeeks, isSameDay, parseISO } from "date-fns";
/**
 * Advanced FSM Scheduling Calendar
 * Drag-and-drop calendar with job management, technician scheduling, and route optimization
 */
export default function ScheduleCalendar() {
	const router = useRouter();
	const [currentDate, setCurrentDate] = useState(new Date());
	const [viewMode, setViewMode] = useState("week"); // day, week, month
	const [selectedTechnician, setSelectedTechnician] = useState("all");
	const [searchTerm, setSearchTerm] = useState("");
	const [showFilters, setShowFilters] = useState(false);
	const [scheduledJobs, setScheduledJobs] = useState([]);
	const [technicians, setTechnicians] = useState([]);
	const [selectedJob, setSelectedJob] = useState(null);

	// Mock data
	const mockTechnicians = [
		{
			id: "TECH001",
			name: "Mike Wilson",
			role: "Senior Technician",
			skills: ["HVAC", "Plumbing", "Electrical"],
			color: "hsl(var(--primary))",
			status: "available",
			todaysJobs: 4,
			efficiency: 92,
		},
		{
			id: "TECH002",
			name: "Lisa Chen",
			role: "Electrical Specialist",
			skills: ["Electrical", "Lighting", "Wiring"],
			color: "hsl(var(--muted-foreground))",
			status: "on_job",
			todaysJobs: 3,
			efficiency: 87,
		},
		{
			id: "TECH003",
			name: "David Brown",
			role: "Plumbing Expert",
			skills: ["Plumbing", "Drainage", "Water Systems"],
			color: "hsl(var(--accent))",
			status: "available",
			todaysJobs: 5,
			efficiency: 95,
		},
		{
			id: "TECH004",
			name: "Emma Davis",
			role: "HVAC Technician",
			skills: ["HVAC", "Air Systems", "Refrigeration"],
			color: "#8B5CF6",
			status: "traveling",
			todaysJobs: 3,
			efficiency: 89,
		},
	];

	const mockJobs = [
		{
			id: "JOB001",
			title: "HVAC System Maintenance",
			customer: "Sarah Johnson",
			customerPhone: "(555) 123-4567",
			address: "123 Main St, Downtown",
			scheduledStart: "2024-01-22T09:00:00",
			scheduledEnd: "2024-01-22T11:00:00",
			assignedTo: "TECH001",
			status: "scheduled",
			priority: "normal",
			serviceType: "HVAC",
			estimatedValue: 320,
			description: "Annual maintenance and filter replacement",
			equipment: ["Furnace", "Air Conditioner"],
			partsNeeded: ["Air Filter", "Thermostat Battery"],
		},
		{
			id: "JOB002",
			title: "Emergency Electrical Repair",
			customer: "Bob's Restaurant",
			customerPhone: "(555) 456-7890",
			address: "456 Business Ave, Business District",
			scheduledStart: "2024-01-22T13:30:00",
			scheduledEnd: "2024-01-22T16:00:00",
			assignedTo: "TECH002",
			status: "in_progress",
			priority: "urgent",
			serviceType: "Electrical",
			estimatedValue: 450,
			description: "Circuit breaker replacement and wiring repair",
			equipment: ["Main Panel", "Circuit Breakers"],
			partsNeeded: ["20A Breaker", "Electrical Wire"],
		},
		{
			id: "JOB003",
			title: "Drain Cleaning Service",
			customer: "Mountain View Apartments",
			customerPhone: "(555) 789-0123",
			address: "789 Residential Rd, Residential Zone",
			scheduledStart: "2024-01-22T14:00:00",
			scheduledEnd: "2024-01-22T15:30:00",
			assignedTo: "TECH003",
			status: "completed",
			priority: "normal",
			serviceType: "Plumbing",
			estimatedValue: 180,
			description: "Kitchen and bathroom drain cleaning",
			equipment: ["Drain Snake", "Hydro Jetter"],
			partsNeeded: [],
		},
		{
			id: "JOB004",
			title: "Air Conditioning Installation",
			customer: "Tech Solutions Inc",
			customerPhone: "(555) 321-6543",
			address: "321 Corporate Blvd, Business Park",
			scheduledStart: "2024-01-23T08:00:00",
			scheduledEnd: "2024-01-23T12:00:00",
			assignedTo: "TECH004",
			status: "scheduled",
			priority: "high",
			serviceType: "HVAC",
			estimatedValue: 1200,
			description: "New AC unit installation for conference room",
			equipment: ["AC Unit", "Ductwork", "Thermostat"],
			partsNeeded: ["Refrigerant Lines", "Electrical Conduit"],
		},
	];

	useEffect(() => {
		setTechnicians(mockTechnicians);
		setScheduledJobs(mockJobs);
	}, []);

	// Helper functions
	const getStatusColor = (status) => {
		switch (status) {
			case "completed":
				return "bg-success/10 text-success dark:bg-success/20 dark:text-success/90";
			case "in_progress":
				return "bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning/90";
			case "scheduled":
				return "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary/90";
			case "overdue":
				return "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive/90";
			default:
				return "bg-muted text-muted-foreground dark:bg-muted/20 dark:text-muted-foreground";
		}
	};

	const getPriorityColor = (priority) => {
		switch (priority) {
			case "urgent":
				return "border-l-red-500";
			case "high":
				return "border-l-orange-500";
			case "normal":
				return "border-l-blue-500";
			case "low":
				return "border-l-green-500";
			default:
				return "border-l-muted-foreground";
		}
	};

	const getServiceIcon = (serviceType) => {
		switch (serviceType) {
			case "HVAC":
				return <Timer className="w-4 h-4" />;
			case "Electrical":
				return <Zap className="w-4 h-4" />;
			case "Plumbing":
				return <Wrench className="w-4 h-4" />;
			default:
				return <Settings className="w-4 h-4" />;
		}
	};

	const getTechnicianById = (techId) => {
		return technicians.find((tech) => tech.id === techId);
	};

	const getJobsForDate = (date) => {
		return scheduledJobs.filter((job) => isSameDay(parseISO(job.scheduledStart), date));
	};

	const getJobsForTechnician = (techId, date) => {
		return scheduledJobs.filter((job) => job.assignedTo === techId && isSameDay(parseISO(job.scheduledStart), date));
	};

	// Navigation functions
	const navigateDate = (direction) => {
		if (viewMode === "day") {
			setCurrentDate(direction === "prev" ? subDays(currentDate, 1) : addDays(currentDate, 1));
		} else if (viewMode === "week") {
			setCurrentDate(direction === "prev" ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
		}
	};

	const getWeekDays = () => {
		const start = startOfWeek(currentDate);
		return Array.from({ length: 7 }, (_, i) => addDays(start, i));
	};

	const renderWeekView = () => {
		const weekDays = getWeekDays();
		const timeSlots = Array.from({ length: 12 }, (_, i) => i + 7); // 7 AM to 6 PM

		return (
			<div className="flex-1 bg-background rounded-lg border overflow-hidden">
				{/* Week header */}
				<div className="grid grid-cols-8 border-b">
					<div className="p-4 border-r">
						<span className="text-sm font-medium text-muted-foreground">Time</span>
					</div>
					{weekDays.map((day) => (
						<div key={day.getTime()} className="p-4 border-r last:border-r-0">
							<div className="text-center">
								<div className="text-sm font-medium">{format(day, "EEE")}</div>
								<div className={`text-lg font-bold ${isSameDay(day, new Date()) ? "text-primary" : ""}`}>{format(day, "d")}</div>
							</div>
						</div>
					))}
				</div>

				{/* Week content */}
				<div className="overflow-auto max-h-[600px]">
					{timeSlots.map((hour) => (
						<div key={hour} className="grid grid-cols-8 border-b border-border">
							<div className="p-2 text-sm text-muted-foreground border-r">{format(new Date().setHours(hour, 0, 0, 0), "HH:mm")}</div>
							{weekDays.map((day) => {
								const dayJobs = getJobsForDate(day).filter((job) => new Date(job.scheduledStart).getHours() === hour);
								return (
									<div key={`${day.getTime()}-${hour}`} className="p-1 border-r last:border-r-0 min-h-[60px]">
										{dayJobs.map((job) => {
											const technician = getTechnicianById(job.assignedTo);
											return (
												<div key={job.id} className={`p-2 rounded-lg border-l-4 ${getPriorityColor(job.priority)} bg-card shadow-sm mb-1 cursor-pointer hover:shadow-md transition-shadow`} style={{ backgroundColor: `${technician?.color}20` }} onClick={() => setSelectedJob(job)}>
													<div className="text-xs font-medium truncate">{job.title}</div>
													<div className="text-xs text-muted-foreground truncate">{job.customer}</div>
													<div className="text-xs text-muted-foreground">{technician?.name}</div>
												</div>
											);
										})}
									</div>
								);
							})}
						</div>
					))}
				</div>
			</div>
		);
	};

	const renderTechnicianPanel = () => {
		return (
			<Card className="w-80">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="w-5 h-5" />
						Team Schedule
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{technicians.map((technician) => {
						const todaysJobs = getJobsForTechnician(technician.id, currentDate);
						return (
							<div key={technician.id} className="p-3 rounded-lg border">
								<div className="flex items-center justify-between mb-2">
									<div className="flex items-center gap-3">
										<div className="w-4 h-4 rounded-full" style={{ backgroundColor: technician.color }}></div>
										<div>
											<p className="font-medium text-sm">{technician.name}</p>
											<p className="text-xs text-muted-foreground">{technician.role}</p>
										</div>
									</div>
									<Badge className={technician.status === "available" ? "bg-success/10 text-success" : technician.status === "on_job" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"} variant="secondary">
										{technician.status.replace("_", " ")}
									</Badge>
								</div>
								<div className="text-xs text-muted-foreground">
									<p>
										{todaysJobs.length} jobs today • {technician.efficiency}% efficiency
									</p>
									<p className="mt-1">Skills: {technician.skills.join(", ")}</p>
								</div>
								{todaysJobs.length > 0 && (
									<div className="mt-2 space-y-1">
										{todaysJobs.slice(0, 2).map((job) => (
											<div key={job.id} className="text-xs p-2 bg-muted rounded">
												<div className="font-medium">{job.title}</div>
												<div className="text-muted-foreground">
													{format(parseISO(job.scheduledStart), "HH:mm")} - {format(parseISO(job.scheduledEnd), "HH:mm")}
												</div>
											</div>
										))}
										{todaysJobs.length > 2 && <div className="text-xs text-muted-foreground text-center">+{todaysJobs.length - 2} more jobs</div>}
									</div>
								)}
							</div>
						);
					})}
				</CardContent>
			</Card>
		);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="space-y-1">
					<h1 className="text-3xl font-bold tracking-tight">Schedule Calendar</h1>
					<p className="text-muted-foreground">Manage appointments, assign technicians, and optimize routes</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
						<Filter className="mr-2 w-4 h-4" />
						Filters
					</Button>
					<Button variant="outline" size="sm" onClick={() => router.push("/dashboard/business/schedule/route-planner")}>
						<Truck className="mr-2 w-4 h-4" />
						Route Planner
					</Button>
					<Button size="sm" onClick={() => router.push("/dashboard/business/schedule/new-job")}>
						<Plus className="mr-2 w-4 h-4" />
						New Job
					</Button>
				</div>
			</div>

			{/* Calendar Controls */}
			<div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm" onClick={() => navigateDate("prev")}>
							<ChevronLeft className="w-4 h-4" />
						</Button>
						<Button variant="outline" onClick={() => setCurrentDate(new Date())}>
							Today
						</Button>
						<Button variant="outline" size="sm" onClick={() => navigateDate("next")}>
							<ChevronRight className="w-4 h-4" />
						</Button>
					</div>
					<h2 className="text-xl font-semibold">{format(startOfWeek(currentDate), "MMM d, yyyy")} - Week View</h2>
				</div>

				<div className="flex items-center gap-2">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
						<Input placeholder="Search jobs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-64" />
					</div>
					<Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
						<SelectTrigger className="w-48">
							<SelectValue placeholder="All Technicians" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Technicians</SelectItem>
							{technicians.map((tech) => (
								<SelectItem key={tech.id} value={tech.id}>
									{tech.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Filters Panel */}
			{showFilters && (
				<Card>
					<CardContent className="p-4">
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
							<Select>
								<SelectTrigger>
									<SelectValue placeholder="Service Type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Services</SelectItem>
									<SelectItem value="hvac">HVAC</SelectItem>
									<SelectItem value="electrical">Electrical</SelectItem>
									<SelectItem value="plumbing">Plumbing</SelectItem>
								</SelectContent>
							</Select>
							<Select>
								<SelectTrigger>
									<SelectValue placeholder="Priority" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Priorities</SelectItem>
									<SelectItem value="urgent">Urgent</SelectItem>
									<SelectItem value="high">High</SelectItem>
									<SelectItem value="normal">Normal</SelectItem>
									<SelectItem value="low">Low</SelectItem>
								</SelectContent>
							</Select>
							<Select>
								<SelectTrigger>
									<SelectValue placeholder="Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Status</SelectItem>
									<SelectItem value="scheduled">Scheduled</SelectItem>
									<SelectItem value="in_progress">In Progress</SelectItem>
									<SelectItem value="completed">Completed</SelectItem>
									<SelectItem value="overdue">Overdue</SelectItem>
								</SelectContent>
							</Select>
							<Button variant="outline" onClick={() => setShowFilters(false)}>
								Clear Filters
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Main Calendar Content */}
			<div className="flex gap-6">
				{renderWeekView()}
				{renderTechnicianPanel()}
			</div>

			{/* Job Details Modal/Panel */}
			{selectedJob && (
				<Card className="fixed right-6 top-24 w-96 z-50 shadow-lg">
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="text-lg">{selectedJob.title}</CardTitle>
							<Button variant="ghost" size="sm" onClick={() => setSelectedJob(null)}>
								×
							</Button>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center gap-2">
							<Badge className={getStatusColor(selectedJob.status)} variant="secondary">
								{selectedJob.status}
							</Badge>
							<Badge variant="outline" className={selectedJob.priority === "urgent" ? "text-destructive" : ""}>
								{selectedJob.priority}
							</Badge>
						</div>

						<div className="space-y-2 text-sm">
							<div className="flex items-center gap-2">
								<Users className="w-4 h-4 text-muted-foreground" />
								<span>{selectedJob.customer}</span>
							</div>
							<div className="flex items-center gap-2">
								<Phone className="w-4 h-4 text-muted-foreground" />
								<span>{selectedJob.customerPhone}</span>
							</div>
							<div className="flex items-center gap-2">
								<MapPin className="w-4 h-4 text-muted-foreground" />
								<span>{selectedJob.address}</span>
							</div>
							<div className="flex items-center gap-2">
								<Clock className="w-4 h-4 text-muted-foreground" />
								<span>
									{format(parseISO(selectedJob.scheduledStart), "MMM d, HH:mm")} -{format(parseISO(selectedJob.scheduledEnd), "HH:mm")}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<DollarSign className="w-4 h-4 text-muted-foreground" />
								<span>${selectedJob.estimatedValue}</span>
							</div>
						</div>

						<div>
							<p className="text-sm font-medium mb-1">Description</p>
							<p className="text-sm text-muted-foreground dark:text-muted-foreground">{selectedJob.description}</p>
						</div>

						<div>
							<p className="text-sm font-medium mb-1">Assigned Technician</p>
							<div className="flex items-center gap-2">
								<div className="w-3 h-3 rounded-full" style={{ backgroundColor: getTechnicianById(selectedJob.assignedTo)?.color }}></div>
								<span className="text-sm">{getTechnicianById(selectedJob.assignedTo)?.name}</span>
							</div>
						</div>

						<div className="flex gap-2">
							<Button size="sm" className="flex-1">
								<Edit className="w-4 h-4 mr-2" />
								Edit
							</Button>
							<Button variant="outline" size="sm" className="flex-1">
								<Eye className="w-4 h-4 mr-2" />
								View
							</Button>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
