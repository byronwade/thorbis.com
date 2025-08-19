"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Checkbox } from "@components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Users, UserPlus, Phone, Mail, Search, Filter, MoreVertical, Edit, Eye, Trash2, Star, Calendar, DollarSign, Award, Truck, Download, SortAsc, SortDesc, Target, CreditCard } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";

/**
 * Staff List Page - Comprehensive employee management
 * Features: Employee profiles, performance tracking, scheduling, certifications, and payroll integration
 */
export default function StaffList() {
	const router = useRouter();
	const [employees, setEmployees] = useState([]);
	const [filteredEmployees, setFilteredEmployees] = useState([]);
	const [selectedEmployees, setSelectedEmployees] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const [departmentFilter, setDepartmentFilter] = useState("all");
	const [sortBy, setSortBy] = useState("name");
	const [sortOrder, setSortOrder] = useState("asc");
	const [showFilters, setShowFilters] = useState(false);
	const [currentTab, setCurrentTab] = useState("all");

	// Mock data
	const mockEmployees = [
		{
			id: "EMP001",
			employeeId: "TECH001",
			name: "Mike Wilson",
			email: "mike.wilson@company.com",
			phone: "(555) 987-6543",
			address: "123 Oak St, Technician District",
			role: "Senior Technician",
			department: "Field Operations",
			status: "active",
			hireDate: "2022-03-15T00:00:00",
			avatar: "/avatars/mike.jpg",
			skills: ["HVAC", "Plumbing", "Electrical"],
			certifications: [
				{ name: "EPA 608", expiry: "2025-03-15", status: "valid" },
				{ name: "HVAC Certification", expiry: "2024-12-31", status: "valid" },
			],
			performance: {
				rating: 4.8,
				efficiency: 94,
				customerSatisfaction: 4.9,
				jobsCompleted: 342,
				avgJobTime: 2.4,
				revenue: 156750,
			},
			schedule: {
				hoursPerWeek: 40,
				currentAssignments: 5,
				nextAvailable: "2024-01-23T08:00:00",
			},
			vehicle: {
				assigned: "Van #001",
				mileage: 45200,
				lastMaintenance: "2024-01-15",
			},
			payroll: {
				hourlyRate: 32.5,
				overtime: 48.75,
				ytdEarnings: 67600,
				lastPaycheck: "2024-01-15",
			},
			emergencyContact: {
				name: "Sarah Wilson",
				relationship: "Spouse",
				phone: "(555) 987-6544",
			},
		},
		{
			id: "EMP002",
			employeeId: "TECH002",
			name: "Lisa Chen",
			email: "lisa.chen@company.com",
			phone: "(555) 876-5432",
			address: "456 Maple Ave, Service Zone",
			role: "Electrical Specialist",
			department: "Field Operations",
			status: "active",
			hireDate: "2021-08-20T00:00:00",
			avatar: "/avatars/lisa.jpg",
			skills: ["Electrical", "Lighting", "Wiring", "Solar"],
			certifications: [
				{ name: "Master Electrician", expiry: "2026-08-20", status: "valid" },
				{ name: "Solar Installation", expiry: "2024-10-15", status: "expiring_soon" },
			],
			performance: {
				rating: 4.6,
				efficiency: 89,
				customerSatisfaction: 4.7,
				jobsCompleted: 298,
				avgJobTime: 2.8,
				revenue: 134200,
			},
			schedule: {
				hoursPerWeek: 40,
				currentAssignments: 3,
				nextAvailable: "2024-01-22T13:00:00",
			},
			vehicle: {
				assigned: "Truck #002",
				mileage: 52300,
				lastMaintenance: "2024-01-10",
			},
			payroll: {
				hourlyRate: 35.0,
				overtime: 52.5,
				ytdEarnings: 72800,
				lastPaycheck: "2024-01-15",
			},
			emergencyContact: {
				name: "David Chen",
				relationship: "Brother",
				phone: "(555) 876-5433",
			},
		},
		{
			id: "EMP003",
			employeeId: "TECH003",
			name: "David Brown",
			email: "david.brown@company.com",
			phone: "(555) 765-4321",
			address: "789 Pine Rd, Field District",
			role: "Plumbing Expert",
			department: "Field Operations",
			status: "active",
			hireDate: "2020-01-10T00:00:00",
			avatar: "/avatars/david.jpg",
			skills: ["Plumbing", "Drainage", "Water Systems", "Gas Lines"],
			certifications: [
				{ name: "Master Plumber", expiry: "2025-01-10", status: "valid" },
				{ name: "Gas Line Certification", expiry: "2024-06-30", status: "expiring_soon" },
			],
			performance: {
				rating: 4.7,
				efficiency: 92,
				customerSatisfaction: 4.8,
				jobsCompleted: 456,
				avgJobTime: 2.2,
				revenue: 189300,
			},
			schedule: {
				hoursPerWeek: 45,
				currentAssignments: 4,
				nextAvailable: "2024-01-22T09:30:00",
			},
			vehicle: {
				assigned: "Van #003",
				mileage: 48700,
				lastMaintenance: "2024-01-08",
			},
			payroll: {
				hourlyRate: 30.0,
				overtime: 45.0,
				ytdEarnings: 70200,
				lastPaycheck: "2024-01-15",
			},
			emergencyContact: {
				name: "Mary Brown",
				relationship: "Wife",
				phone: "(555) 765-4322",
			},
		},
		{
			id: "EMP004",
			employeeId: "TECH004",
			name: "Emma Davis",
			email: "emma.davis@company.com",
			phone: "(555) 654-3210",
			address: "321 Elm St, Technical Area",
			role: "HVAC Technician",
			department: "Field Operations",
			status: "active",
			hireDate: "2023-05-01T00:00:00",
			avatar: "/avatars/emma.jpg",
			skills: ["HVAC", "Air Systems", "Refrigeration"],
			certifications: [
				{ name: "HVAC Certification", expiry: "2026-05-01", status: "valid" },
				{ name: "EPA 608", expiry: "2027-05-01", status: "valid" },
			],
			performance: {
				rating: 4.5,
				efficiency: 85,
				customerSatisfaction: 4.6,
				jobsCompleted: 128,
				avgJobTime: 3.1,
				revenue: 89600,
			},
			schedule: {
				hoursPerWeek: 40,
				currentAssignments: 2,
				nextAvailable: "2024-01-22T14:00:00",
			},
			vehicle: {
				assigned: "Van #004",
				mileage: 23400,
				lastMaintenance: "2024-01-12",
			},
			payroll: {
				hourlyRate: 28.0,
				overtime: 42.0,
				ytdEarnings: 58240,
				lastPaycheck: "2024-01-15",
			},
			emergencyContact: {
				name: "John Davis",
				relationship: "Father",
				phone: "(555) 654-3211",
			},
		},
		{
			id: "EMP005",
			employeeId: "ADM001",
			name: "Jennifer Martinez",
			email: "jennifer.martinez@company.com",
			phone: "(555) 543-2109",
			address: "654 Business Blvd, Admin District",
			role: "Operations Manager",
			department: "Administration",
			status: "active",
			hireDate: "2021-11-15T00:00:00",
			avatar: "/avatars/jennifer.jpg",
			skills: ["Management", "Operations", "Customer Service"],
			certifications: [
				{ name: "Project Management", expiry: "2025-11-15", status: "valid" },
				{ name: "Six Sigma Green Belt", expiry: "2026-11-15", status: "valid" },
			],
			performance: {
				rating: 4.9,
				efficiency: 96,
				customerSatisfaction: 4.8,
				jobsCompleted: 0, // Admin role
				avgJobTime: 0,
				revenue: 0, // Indirect revenue contribution
			},
			schedule: {
				hoursPerWeek: 40,
				currentAssignments: 0,
				nextAvailable: "2024-01-22T08:00:00",
			},
			vehicle: {
				assigned: null,
				mileage: 0,
				lastMaintenance: null,
			},
			payroll: {
				hourlyRate: 45.0,
				overtime: 67.5,
				ytdEarnings: 93600,
				lastPaycheck: "2024-01-15",
			},
			emergencyContact: {
				name: "Carlos Martinez",
				relationship: "Husband",
				phone: "(555) 543-2108",
			},
		},
	];

	useEffect(() => {
		setEmployees(mockEmployees);
	}, []);

	// Filter and sort employees
	const processedEmployees = useMemo(() => {
		let filtered = [...employees];

		// Apply search filter
		if (searchTerm) {
			filtered = filtered.filter((employee) => employee.name.toLowerCase().includes(searchTerm.toLowerCase()) || employee.email.toLowerCase().includes(searchTerm.toLowerCase()) || employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) || employee.role.toLowerCase().includes(searchTerm.toLowerCase()));
		}

		// Apply role filter
		if (roleFilter !== "all") {
			filtered = filtered.filter((employee) => employee.role.toLowerCase().includes(roleFilter.toLowerCase()));
		}

		// Apply status filter
		if (statusFilter !== "all") {
			filtered = filtered.filter((employee) => employee.status === statusFilter);
		}

		// Apply department filter
		if (departmentFilter !== "all") {
			filtered = filtered.filter((employee) => employee.department === departmentFilter);
		}

		// Apply tab filter
		switch (currentTab) {
			case "technicians":
				filtered = filtered.filter((employee) => employee.department === "Field Operations");
				break;
			case "management":
				filtered = filtered.filter((employee) => employee.department === "Administration");
				break;
			case "certifications":
				filtered = filtered.filter((employee) => employee.certifications.some((cert) => cert.status === "expiring_soon"));
				break;
		}

		// Apply sorting
		filtered.sort((a, b) => {
			let aValue = a[sortBy];
			let bValue = b[sortBy];

			if (sortBy === "hireDate") {
				aValue = new Date(aValue);
				bValue = new Date(bValue);
			}

			if (sortBy === "performance.rating" || sortBy === "performance.efficiency") {
				aValue = a.performance[sortBy.split(".")[1]];
				bValue = b.performance[sortBy.split(".")[1]];
			}

			if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
			if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
			return 0;
		});

		return filtered;
	}, [employees, searchTerm, roleFilter, statusFilter, departmentFilter, sortBy, sortOrder, currentTab]);

	useEffect(() => {
		setFilteredEmployees(processedEmployees);
	}, [processedEmployees]);

	// Helper functions
	const getStatusColor = (status) => {
		switch (status) {
			case "active":
				return "bg-success/10 text-success dark:bg-success/20 dark:text-success/90";
			case "inactive":
				return "bg-muted text-muted-foreground dark:bg-muted/20 dark:text-muted-foreground";
			case "on_leave":
				return "bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning/90";
			case "terminated":
				return "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive/90";
			default:
				return "bg-muted text-muted-foreground dark:bg-muted/20 dark:text-muted-foreground";
		}
	};

	const getCertificationStatus = (status) => {
		switch (status) {
			case "valid":
				return "bg-success/10 text-success";
			case "expiring_soon":
				return "bg-warning/10 text-warning";
			case "expired":
				return "bg-destructive/10 text-destructive";
			default:
				return "bg-muted text-muted-foreground";
		}
	};

	const getRatingStars = (rating) => {
		return Array.from({ length: 5 }, (_, i) => <Star key={i} className={`w-3 h-3 ${i < Math.floor(rating) ? "text-warning fill-current" : "text-muted-foreground/30"}`} />);
	};

	const getExperienceYears = (hireDate) => {
		const years = differenceInDays(new Date(), parseISO(hireDate)) / 365;
		return Math.floor(years);
	};

	// Actions
	const handleSelectEmployee = (employeeId) => {
		setSelectedEmployees((prev) => (prev.includes(employeeId) ? prev.filter((id) => id !== employeeId) : [...prev, employeeId]));
	};

	const handleSelectAll = () => {
		setSelectedEmployees(selectedEmployees.length === filteredEmployees.length ? [] : filteredEmployees.map((employee) => employee.id));
	};

	const handleBulkAction = (action) => {
		console.log(`Bulk action: ${action} on employees:`, selectedEmployees);
		setSelectedEmployees([]);
	};

	const handleSort = (field) => {
		if (sortBy === field) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortBy(field);
			setSortOrder("asc");
		}
	};

	// Stats for tabs
	const employeeStats = useMemo(() => {
		const certificationExpiring = employees.filter((employee) => employee.certifications.some((cert) => cert.status === "expiring_soon")).length;

		return {
			all: employees.length,
			technicians: employees.filter((employee) => employee.department === "Field Operations").length,
			management: employees.filter((employee) => employee.department === "Administration").length,
			certifications: certificationExpiring,
		};
	}, [employees]);

	const totalPayroll = employees.reduce((sum, employee) => sum + employee.payroll.ytdEarnings, 0);
	const avgRating = employees.reduce((sum, employee) => sum + employee.performance.rating, 0) / employees.length || 0;
	const avgEfficiency = employees.reduce((sum, employee) => sum + employee.performance.efficiency, 0) / employees.length || 0;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="space-y-1">
					<h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
					<p className="text-muted-foreground">Manage employees, performance, and scheduling</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
						<Filter className="mr-2 w-4 h-4" />
						Filters
					</Button>
					<Button variant="outline" size="sm">
						<Download className="mr-2 w-4 h-4" />
						Export
					</Button>
					<Button size="sm">
						<UserPlus className="mr-2 w-4 h-4" />
						Add Employee
					</Button>
				</div>
			</div>

			{/* Key Metrics */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Total Staff</p>
								<p className="text-2xl font-bold">{employeeStats.all}</p>
							</div>
							<Users className="w-8 h-8 text-primary" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">YTD Payroll</p>
								<p className="text-2xl font-bold">${totalPayroll.toLocaleString()}</p>
							</div>
							<DollarSign className="w-8 h-8 text-success" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Avg Performance</p>
								<p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
							</div>
							<Star className="w-8 h-8 text-warning" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Avg Efficiency</p>
								<p className="text-2xl font-bold">{avgEfficiency.toFixed(0)}%</p>
							</div>
							<Target className="w-8 h-8 text-purple-500" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			{showFilters && (
				<Card>
					<CardContent className="p-4">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
								<Input placeholder="Search staff..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
							</div>
							<Select value={roleFilter} onValueChange={setRoleFilter}>
								<SelectTrigger>
									<SelectValue placeholder="Role" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Roles</SelectItem>
									<SelectItem value="technician">Technicians</SelectItem>
									<SelectItem value="manager">Managers</SelectItem>
									<SelectItem value="specialist">Specialists</SelectItem>
								</SelectContent>
							</Select>
							<Select value={departmentFilter} onValueChange={setDepartmentFilter}>
								<SelectTrigger>
									<SelectValue placeholder="Department" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Departments</SelectItem>
									<SelectItem value="Field Operations">Field Operations</SelectItem>
									<SelectItem value="Administration">Administration</SelectItem>
								</SelectContent>
							</Select>
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger>
									<SelectValue placeholder="Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Status</SelectItem>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="inactive">Inactive</SelectItem>
									<SelectItem value="on_leave">On Leave</SelectItem>
								</SelectContent>
							</Select>
							<Button
								variant="outline"
								onClick={() => {
									setSearchTerm("");
									setRoleFilter("all");
									setDepartmentFilter("all");
									setStatusFilter("all");
								}}
							>
								Clear Filters
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Tabs and bulk actions */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full sm:w-auto">
					<TabsList>
						<TabsTrigger value="all">All ({employeeStats.all})</TabsTrigger>
						<TabsTrigger value="technicians">Technicians ({employeeStats.technicians})</TabsTrigger>
						<TabsTrigger value="management">Management ({employeeStats.management})</TabsTrigger>
						<TabsTrigger value="certifications">Certifications ({employeeStats.certifications})</TabsTrigger>
					</TabsList>
				</Tabs>

				{selectedEmployees.length > 0 && (
					<div className="flex items-center gap-2">
						<span className="text-sm text-muted-foreground">{selectedEmployees.length} selected</span>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm">
									Bulk Actions
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem onClick={() => handleBulkAction("update_status")}>Update Status</DropdownMenuItem>
								<DropdownMenuItem onClick={() => handleBulkAction("schedule")}>Schedule Training</DropdownMenuItem>
								<DropdownMenuItem onClick={() => handleBulkAction("export")}>Export Selected</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={() => handleBulkAction("terminate")} className="text-destructive">
									Terminate Selected
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				)}
			</div>

			{/* Employee List */}
			<Card>
				<CardContent className="p-0">
					{/* Table Header */}
					<div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 text-sm font-medium">
						<div className="flex items-center">
							<Checkbox checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0} onCheckedChange={handleSelectAll} />
						</div>
						<div className="col-span-3">
							<Button variant="ghost" size="sm" className="h-auto p-0 font-medium" onClick={() => handleSort("name")}>
								Employee
								{sortBy === "name" && (sortOrder === "asc" ? <SortAsc className="ml-1 w-4 h-4" /> : <SortDesc className="ml-1 w-4 h-4" />)}
							</Button>
						</div>
						<div className="col-span-2">Contact & Role</div>
						<div>Status</div>
						<div>Performance</div>
						<div>Schedule</div>
						<div>Certifications</div>
						<div>Experience</div>
						<div>Actions</div>
					</div>

					{/* Employees */}
					{filteredEmployees.length > 0 ? (
						<div className="divide-y">
							{filteredEmployees.map((employee) => {
								const experienceYears = getExperienceYears(employee.hireDate);
								const expiringCerts = employee.certifications.filter((cert) => cert.status === "expiring_soon").length;
								return (
									<div key={employee.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-accent/50 transition-colors">
										<div className="flex items-center">
											<Checkbox checked={selectedEmployees.includes(employee.id)} onCheckedChange={() => handleSelectEmployee(employee.id)} />
										</div>
										<div className="col-span-3">
											<div className="flex items-center gap-3">
												<Avatar className="w-10 h-10">
													<AvatarImage src={employee.avatar} />
													<AvatarFallback>
														{employee.name
															.split(" ")
															.map((n) => n[0])
															.join("")}
													</AvatarFallback>
												</Avatar>
												<div>
													<p className="font-medium">{employee.name}</p>
													<p className="text-sm text-muted-foreground">ID: {employee.employeeId}</p>
													<div className="flex flex-wrap gap-1 mt-1">
														{employee.skills.slice(0, 2).map((skill) => (
															<Badge key={skill} variant="secondary" className="text-xs px-1.5 py-0.5">
																{skill}
															</Badge>
														))}
														{employee.skills.length > 2 && (
															<Badge variant="secondary" className="text-xs px-1.5 py-0.5">
																+{employee.skills.length - 2}
															</Badge>
														)}
													</div>
												</div>
											</div>
										</div>
										<div className="col-span-2">
											<div className="space-y-1">
												<p className="font-medium text-sm">{employee.role}</p>
												<p className="text-xs text-muted-foreground">{employee.department}</p>
												<div className="flex items-center gap-1 text-xs text-muted-foreground">
													<Phone className="w-3 h-3" />
													{employee.phone}
												</div>
												<div className="flex items-center gap-1 text-xs text-muted-foreground">
													<Mail className="w-3 h-3" />
													{employee.email}
												</div>
											</div>
										</div>
										<div>
											<Badge className={getStatusColor(employee.status)} variant="secondary">
												{employee.status.replace("_", " ")}
											</Badge>
											{employee.vehicle.assigned && (
												<div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
													<Truck className="w-3 h-3" />
													{employee.vehicle.assigned}
												</div>
											)}
										</div>
										<div>
											<div className="space-y-1">
												<div className="flex items-center gap-1">
													{getRatingStars(employee.performance.rating)}
													<span className="text-sm font-medium ml-1">{employee.performance.rating}</span>
												</div>
												<div className="text-xs text-muted-foreground">Efficiency: {employee.performance.efficiency}%</div>
												{employee.department === "Field Operations" && <div className="text-xs text-muted-foreground">{employee.performance.jobsCompleted} jobs</div>}
											</div>
										</div>
										<div>
											<div className="space-y-1">
												<p className="text-sm font-medium">{employee.schedule.hoursPerWeek}h/week</p>
												{employee.schedule.currentAssignments > 0 && <p className="text-xs text-muted-foreground">{employee.schedule.currentAssignments} assignments</p>}
												<p className="text-xs text-muted-foreground">Next: {format(parseISO(employee.schedule.nextAvailable), "MMM d HH:mm")}</p>
											</div>
										</div>
										<div>
											<div className="space-y-1">
												<p className="text-sm font-medium">{employee.certifications.length} certs</p>
												{expiringCerts > 0 && (
													<Badge className={getCertificationStatus("expiring_soon")} variant="secondary" className="text-xs">
														{expiringCerts} expiring
													</Badge>
												)}
											</div>
										</div>
										<div>
											<div className="space-y-1">
												<p className="text-sm font-medium">{experienceYears} years</p>
												<p className="text-xs text-muted-foreground">Since {format(parseISO(employee.hireDate), "MMM yyyy")}</p>
											</div>
										</div>
										<div>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="sm">
														<MoreVertical className="w-4 h-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent>
													<DropdownMenuItem>
														<Eye className="mr-2 w-4 h-4" />
														View Profile
													</DropdownMenuItem>
													<DropdownMenuItem>
														<Edit className="mr-2 w-4 h-4" />
														Edit Employee
													</DropdownMenuItem>
													<DropdownMenuItem>
														<Calendar className="mr-2 w-4 h-4" />
														View Schedule
													</DropdownMenuItem>
													<DropdownMenuItem>
														<Award className="mr-2 w-4 h-4" />
														Manage Certifications
													</DropdownMenuItem>
													<DropdownMenuItem>
														<CreditCard className="mr-2 w-4 h-4" />
														Payroll Details
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem className="text-destructive">
														<Trash2 className="mr-2 w-4 h-4" />
														Terminate Employee
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<div className="text-center py-12">
							<Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
							<h3 className="text-lg font-medium mb-2">No employees found</h3>
							<p className="text-muted-foreground mb-4">No employees match your current filters. Try adjusting your search criteria.</p>
							<Button>
								<UserPlus className="mr-2 w-4 h-4" />
								Add New Employee
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
