"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Progress } from "@components/ui/progress";
import { Separator } from "@components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { Copy, Edit, Trash2, Plus, Search, Calendar, Clock, DollarSign, Users, Settings, Star, MoreVertical, Eye, ArrowUp, ArrowDown } from "lucide-react";

// Mock data for service plan templates
const mockTemplates = [
	{
		id: "TPL001",
		name: "HVAC Maintenance Plan - Gold",
		category: "HVAC",
		type: "maintenance",
		description: "Comprehensive HVAC maintenance with bi-annual inspections, priority scheduling, and discounted repairs",
		duration: "12 months",
		price: 299,
		billingCycle: "annual",
		popularity: 85,
		activePlans: 127,
		revenue: 38273,
		services: [
			{ name: "Bi-annual system inspection", frequency: "Every 6 months", duration: "2 hours" },
			{ name: "Filter replacement", frequency: "Quarterly", duration: "30 minutes" },
			{ name: "Coil cleaning", frequency: "Annual", duration: "1 hour" },
			{ name: "Priority emergency service", frequency: "As needed", duration: "Variable" },
		],
		benefits: ["20% discount on repairs", "Priority scheduling", "Extended equipment warranty", "24/7 emergency support"],
		terms: "12-month commitment required",
		status: "active",
		created: "2024-01-10",
		lastModified: "2024-01-14",
	},
	{
		id: "TPL002",
		name: "Plumbing Protection Plus",
		category: "Plumbing",
		type: "protection",
		description: "Annual plumbing inspection with emergency coverage and fixture discounts",
		duration: "12 months",
		price: 199,
		billingCycle: "annual",
		popularity: 72,
		activePlans: 89,
		revenue: 17711,
		services: [
			{ name: "Annual plumbing inspection", frequency: "Annual", duration: "1.5 hours" },
			{ name: "Water heater maintenance", frequency: "Annual", duration: "1 hour" },
			{ name: "Drain cleaning service", frequency: "Bi-annual", duration: "1 hour" },
			{ name: "Emergency plumbing coverage", frequency: "As needed", duration: "Variable" },
		],
		benefits: ["15% discount on fixtures", "Free emergency service calls", "Water damage protection", "Annual water quality test"],
		terms: "12-month commitment required",
		status: "active",
		created: "2024-01-05",
		lastModified: "2024-01-12",
	},
	{
		id: "TPL003",
		name: "Electrical Safety Basic",
		category: "Electrical",
		type: "safety",
		description: "Essential electrical safety inspections and basic maintenance services",
		duration: "12 months",
		price: 149,
		billingCycle: "annual",
		popularity: 58,
		activePlans: 43,
		revenue: 6407,
		services: [
			{ name: "Electrical safety inspection", frequency: "Annual", duration: "2 hours" },
			{ name: "Panel maintenance", frequency: "Annual", duration: "1 hour" },
			{ name: "GFCI testing", frequency: "Bi-annual", duration: "30 minutes" },
			{ name: "Basic outlet services", frequency: "As needed", duration: "Variable" },
		],
		benefits: ["10% discount on electrical work", "Free safety consultations", "Code compliance verification", "Emergency electrical support"],
		terms: "12-month commitment required",
		status: "active",
		created: "2023-12-15",
		lastModified: "2024-01-08",
	},
	{
		id: "TPL004",
		name: "Multi-Service Deluxe",
		category: "Multi-Service",
		type: "comprehensive",
		description: "Complete home service protection covering HVAC, plumbing, and electrical systems",
		duration: "12 months",
		price: 599,
		billingCycle: "annual",
		popularity: 91,
		activePlans: 156,
		revenue: 93444,
		services: [
			{ name: "Comprehensive system inspections", frequency: "Bi-annual", duration: "4 hours" },
			{ name: "All filter replacements", frequency: "Quarterly", duration: "1 hour" },
			{ name: "Priority multi-service support", frequency: "As needed", duration: "Variable" },
			{ name: "Preventive maintenance", frequency: "Monthly", duration: "2 hours" },
		],
		benefits: ["25% discount on all repairs", "Priority scheduling across all services", "Extended warranties on all systems", "24/7 emergency support", "Free annual home safety report"],
		terms: "12-month commitment required",
		status: "active",
		created: "2023-11-20",
		lastModified: "2024-01-10",
	},
	{
		id: "TPL005",
		name: "HVAC Tune-Up Basic",
		category: "HVAC",
		type: "maintenance",
		description: "Basic HVAC maintenance plan with annual tune-up and filter service",
		duration: "12 months",
		price: 129,
		billingCycle: "annual",
		popularity: 45,
		activePlans: 31,
		revenue: 3999,
		services: [
			{ name: "Annual HVAC tune-up", frequency: "Annual", duration: "1.5 hours" },
			{ name: "Filter replacement", frequency: "Bi-annual", duration: "30 minutes" },
			{ name: "Basic system check", frequency: "Annual", duration: "1 hour" },
		],
		benefits: ["5% discount on repairs", "Filter delivery service", "Basic warranty extension"],
		terms: "12-month commitment required",
		status: "draft",
		created: "2024-01-12",
		lastModified: "2024-01-15",
	},
];

const categoryColors = {
	HVAC: "bg-blue-100 text-blue-800",
	Plumbing: "bg-green-100 text-green-800",
	Electrical: "bg-yellow-100 text-yellow-800",
	"Multi-Service": "bg-purple-100 text-purple-800",
};

const typeColors = {
	maintenance: "bg-orange-100 text-orange-800",
	protection: "bg-teal-100 text-teal-800",
	safety: "bg-red-100 text-red-800",
	comprehensive: "bg-indigo-100 text-indigo-800",
};

const statusColors = {
	active: "bg-green-100 text-green-800",
	draft: "bg-muted text-muted-foreground",
	inactive: "bg-red-100 text-red-800",
};

export default function ServicePlanTemplates() {
	const router = useRouter();
	const [templates, setTemplates] = useState(mockTemplates);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [selectedType, setSelectedType] = useState("all");
	const [selectedStatus, setSelectedStatus] = useState("all");
	const [sortBy, setSortBy] = useState("popularity");
	const [sortOrder, setSortOrder] = useState("desc");
	const [viewMode, setViewMode] = useState("grid");
	const [selectedTemplate, setSelectedTemplate] = useState(null);
	const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

	// Filter and sort templates
	const filteredTemplates = templates
		.filter((template) => {
			if (searchTerm && !template.name.toLowerCase().includes(searchTerm.toLowerCase()) && !template.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
			if (selectedCategory !== "all" && template.category !== selectedCategory) return false;
			if (selectedType !== "all" && template.type !== selectedType) return false;
			if (selectedStatus !== "all" && template.status !== selectedStatus) return false;
			return true;
		})
		.sort((a, b) => {
			const direction = sortOrder === "asc" ? 1 : -1;
			switch (sortBy) {
				case "name":
					return direction * a.name.localeCompare(b.name);
				case "price":
					return direction * (a.price - b.price);
				case "popularity":
					return direction * (a.popularity - b.popularity);
				case "revenue":
					return direction * (a.revenue - b.revenue);
				case "activePlans":
					return direction * (a.activePlans - b.activePlans);
				default:
					return 0;
			}
		});

	const handleCreateTemplate = () => {
		router.push("/dashboard/business/service-plans/create");
	};

	const handleEditTemplate = (template) => {
		// In a real app, navigate to edit page with template ID
		console.log("Edit template:", template.id);
	};

	const handleDuplicateTemplate = (template) => {
		const duplicated = {
			...template,
			id: `TPL${String(templates.length + 1).padStart(3, "0")}`,
			name: `${template.name} (Copy)`,
			status: "draft",
			activePlans: 0,
			revenue: 0,
			created: new Date().toISOString().split("T")[0],
			lastModified: new Date().toISOString().split("T")[0],
		};
		setTemplates([duplicated, ...templates]);
	};

	const handleDeleteTemplate = (templateId) => {
		setTemplates(templates.filter((t) => t.id !== templateId));
	};

	const handleStatusChange = (templateId, newStatus) => {
		setTemplates(templates.map((t) => (t.id === templateId ? { ...t, status: newStatus, lastModified: new Date().toISOString().split("T")[0] } : t)));
	};

	const getTotalRevenue = () => {
		return filteredTemplates.reduce((sum, template) => sum + template.revenue, 0);
	};

	const getTotalActivePlans = () => {
		return filteredTemplates.reduce((sum, template) => sum + template.activePlans, 0);
	};

	const getAveragePrice = () => {
		const total = filteredTemplates.reduce((sum, template) => sum + template.price, 0);
		return filteredTemplates.length > 0 ? total / filteredTemplates.length : 0;
	};

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Service Plan Templates</h1>
					<p className="text-muted-foreground">Create and manage reusable service plan templates</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
						{viewMode === "grid" ? "List View" : "Grid View"}
					</Button>
					<Button onClick={handleCreateTemplate}>
						<Plus className="w-4 h-4 mr-2" />
						Create Template
					</Button>
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Total Templates</p>
								<p className="text-2xl font-bold">{filteredTemplates.length}</p>
							</div>
							<Settings className="w-8 h-8 text-blue-500" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Total Revenue</p>
								<p className="text-2xl font-bold">${getTotalRevenue().toLocaleString()}</p>
							</div>
							<DollarSign className="w-8 h-8 text-green-500" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Active Plans</p>
								<p className="text-2xl font-bold">{getTotalActivePlans()}</p>
							</div>
							<Users className="w-8 h-8 text-purple-500" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Avg. Price</p>
								<p className="text-2xl font-bold">${getAveragePrice().toFixed(0)}</p>
							</div>
							<Star className="w-8 h-8 text-orange-500" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<Card>
				<CardContent className="p-4">
					<div className="flex flex-wrap gap-4 items-center">
						<div className="flex-1 min-w-[200px]">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
								<Input placeholder="Search templates..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
							</div>
						</div>

						<Select value={selectedCategory} onValueChange={setSelectedCategory}>
							<SelectTrigger className="w-[150px]">
								<SelectValue placeholder="Category" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Categories</SelectItem>
								<SelectItem value="HVAC">HVAC</SelectItem>
								<SelectItem value="Plumbing">Plumbing</SelectItem>
								<SelectItem value="Electrical">Electrical</SelectItem>
								<SelectItem value="Multi-Service">Multi-Service</SelectItem>
							</SelectContent>
						</Select>

						<Select value={selectedType} onValueChange={setSelectedType}>
							<SelectTrigger className="w-[150px]">
								<SelectValue placeholder="Type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Types</SelectItem>
								<SelectItem value="maintenance">Maintenance</SelectItem>
								<SelectItem value="protection">Protection</SelectItem>
								<SelectItem value="safety">Safety</SelectItem>
								<SelectItem value="comprehensive">Comprehensive</SelectItem>
							</SelectContent>
						</Select>

						<Select value={selectedStatus} onValueChange={setSelectedStatus}>
							<SelectTrigger className="w-[150px]">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Statuses</SelectItem>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="draft">Draft</SelectItem>
								<SelectItem value="inactive">Inactive</SelectItem>
							</SelectContent>
						</Select>

						<Select value={sortBy} onValueChange={setSortBy}>
							<SelectTrigger className="w-[150px]">
								<SelectValue placeholder="Sort by" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="popularity">Popularity</SelectItem>
								<SelectItem value="name">Name</SelectItem>
								<SelectItem value="price">Price</SelectItem>
								<SelectItem value="revenue">Revenue</SelectItem>
								<SelectItem value="activePlans">Active Plans</SelectItem>
							</SelectContent>
						</Select>

						<Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
							{sortOrder === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Templates Display */}
			{viewMode === "grid" ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredTemplates.map((template) => (
						<Card key={template.id} className="hover:shadow-lg transition-shadow">
							<CardHeader className="pb-3">
								<div className="flex justify-between items-start">
									<div className="flex-1">
										<CardTitle className="text-lg">{template.name}</CardTitle>
										<div className="flex gap-2 mt-2">
											<Badge className={categoryColors[template.category]}>{template.category}</Badge>
											<Badge className={typeColors[template.type]}>{template.type}</Badge>
											<Badge className={statusColors[template.status]}>{template.status}</Badge>
										</div>
									</div>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="sm">
												<MoreVertical className="w-4 h-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem onClick={() => setSelectedTemplate(template)}>
												<Eye className="w-4 h-4 mr-2" />
												View Details
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => handleEditTemplate(template)}>
												<Edit className="w-4 h-4 mr-2" />
												Edit
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
												<Copy className="w-4 h-4 mr-2" />
												Duplicate
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => handleDeleteTemplate(template.id)} className="text-red-600">
												<Trash2 className="w-4 h-4 mr-2" />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground mb-4">{template.description}</p>

								<div className="space-y-3">
									<div className="flex justify-between items-center">
										<span className="text-sm font-medium">Price</span>
										<span className="text-lg font-bold text-green-600">
											${template.price}/{template.billingCycle}
										</span>
									</div>

									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">Popularity</span>
										<div className="flex items-center gap-2">
											<Progress value={template.popularity} className="w-16 h-2" />
											<span className="text-sm font-medium">{template.popularity}%</span>
										</div>
									</div>

									<div className="grid grid-cols-2 gap-4 text-sm">
										<div>
											<span className="text-muted-foreground">Active Plans</span>
											<p className="font-medium">{template.activePlans}</p>
										</div>
										<div>
											<span className="text-muted-foreground">Revenue</span>
											<p className="font-medium">${template.revenue.toLocaleString()}</p>
										</div>
									</div>

									<Separator />

									<div className="text-sm text-muted-foreground">
										<p>Services: {template.services.length}</p>
										<p>Benefits: {template.benefits.length}</p>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : (
				<Card>
					<CardContent className="p-0">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="border-b">
									<tr>
										<th className="text-left p-4 font-medium">Template</th>
										<th className="text-left p-4 font-medium">Category</th>
										<th className="text-left p-4 font-medium">Type</th>
										<th className="text-left p-4 font-medium">Price</th>
										<th className="text-left p-4 font-medium">Popularity</th>
										<th className="text-left p-4 font-medium">Active Plans</th>
										<th className="text-left p-4 font-medium">Revenue</th>
										<th className="text-left p-4 font-medium">Status</th>
										<th className="text-left p-4 font-medium">Actions</th>
									</tr>
								</thead>
								<tbody>
									{filteredTemplates.map((template) => (
										<tr key={template.id} className="border-b hover:bg-accent/50">
											<td className="p-4">
												<div>
													<p className="font-medium">{template.name}</p>
													<p className="text-sm text-muted-foreground">{template.description.slice(0, 50)}...</p>
												</div>
											</td>
											<td className="p-4">
												<Badge className={categoryColors[template.category]}>{template.category}</Badge>
											</td>
											<td className="p-4">
												<Badge className={typeColors[template.type]}>{template.type}</Badge>
											</td>
											<td className="p-4">
												<span className="font-medium">${template.price}</span>
												<span className="text-sm text-muted-foreground">/{template.billingCycle}</span>
											</td>
											<td className="p-4">
												<div className="flex items-center gap-2">
													<Progress value={template.popularity} className="w-16 h-2" />
													<span className="text-sm">{template.popularity}%</span>
												</div>
											</td>
											<td className="p-4">{template.activePlans}</td>
											<td className="p-4">${template.revenue.toLocaleString()}</td>
											<td className="p-4">
												<Badge className={statusColors[template.status]}>{template.status}</Badge>
											</td>
											<td className="p-4">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="sm">
															<MoreVertical className="w-4 h-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem onClick={() => setSelectedTemplate(template)}>
															<Eye className="w-4 h-4 mr-2" />
															View
														</DropdownMenuItem>
														<DropdownMenuItem onClick={() => handleEditTemplate(template)}>
															<Edit className="w-4 h-4 mr-2" />
															Edit
														</DropdownMenuItem>
														<DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
															<Copy className="w-4 h-4 mr-2" />
															Duplicate
														</DropdownMenuItem>
														<DropdownMenuItem onClick={() => handleDeleteTemplate(template.id)} className="text-red-600">
															<Trash2 className="w-4 h-4 mr-2" />
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Template Details Dialog */}
			{selectedTemplate && (
				<Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
					<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-3">
								{selectedTemplate.name}
								<div className="flex gap-2">
									<Badge className={categoryColors[selectedTemplate.category]}>{selectedTemplate.category}</Badge>
									<Badge className={typeColors[selectedTemplate.type]}>{selectedTemplate.type}</Badge>
									<Badge className={statusColors[selectedTemplate.status]}>{selectedTemplate.status}</Badge>
								</div>
							</DialogTitle>
							<DialogDescription>{selectedTemplate.description}</DialogDescription>
						</DialogHeader>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-4">
								<div>
									<h4 className="font-medium mb-2">Pricing Information</h4>
									<div className="bg-accent p-4 rounded-lg">
										<div className="text-2xl font-bold text-green-600">${selectedTemplate.price}</div>
										<div className="text-sm text-muted-foreground">per {selectedTemplate.billingCycle}</div>
										<div className="text-sm text-muted-foreground mt-1">Duration: {selectedTemplate.duration}</div>
									</div>
								</div>

								<div>
									<h4 className="font-medium mb-2">Performance Metrics</h4>
									<div className="space-y-2">
										<div className="flex justify-between">
											<span className="text-sm">Popularity</span>
											<span className="text-sm font-medium">{selectedTemplate.popularity}%</span>
										</div>
										<Progress value={selectedTemplate.popularity} />
										<div className="grid grid-cols-2 gap-4 text-sm">
											<div>
												<span className="text-muted-foreground">Active Plans</span>
												<p className="font-medium">{selectedTemplate.activePlans}</p>
											</div>
											<div>
												<span className="text-muted-foreground">Total Revenue</span>
												<p className="font-medium">${selectedTemplate.revenue.toLocaleString()}</p>
											</div>
										</div>
									</div>
								</div>

								<div>
									<h4 className="font-medium mb-2">Plan Benefits</h4>
									<ul className="space-y-1">
										{selectedTemplate.benefits.map((benefit, index) => (
											<li key={index} className="text-sm flex items-center gap-2">
												<div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
												{benefit}
											</li>
										))}
									</ul>
								</div>
							</div>

							<div className="space-y-4">
								<div>
									<h4 className="font-medium mb-2">Included Services</h4>
									<div className="space-y-3">
										{selectedTemplate.services.map((service, index) => (
											<div key={index} className="border rounded-lg p-3">
												<h5 className="font-medium text-sm">{service.name}</h5>
												<div className="text-xs text-muted-foreground mt-1">
													<div className="flex items-center gap-4">
														<span className="flex items-center gap-1">
															<Calendar className="w-3 h-3" />
															{service.frequency}
														</span>
														<span className="flex items-center gap-1">
															<Clock className="w-3 h-3" />
															{service.duration}
														</span>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>

								<div>
									<h4 className="font-medium mb-2">Terms & Conditions</h4>
									<p className="text-sm text-muted-foreground">{selectedTemplate.terms}</p>
								</div>

								<div>
									<h4 className="font-medium mb-2">Template Info</h4>
									<div className="text-sm space-y-1">
										<div className="flex justify-between">
											<span className="text-muted-foreground">Created</span>
											<span>{selectedTemplate.created}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Last Modified</span>
											<span>{selectedTemplate.lastModified}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Template ID</span>
											<span>{selectedTemplate.id}</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						<DialogFooter>
							<Button variant="outline" onClick={() => setSelectedTemplate(null)}>
								Close
							</Button>
							<Button variant="outline" onClick={() => handleDuplicateTemplate(selectedTemplate)}>
								<Copy className="w-4 h-4 mr-2" />
								Duplicate
							</Button>
							<Button onClick={() => handleEditTemplate(selectedTemplate)}>
								<Edit className="w-4 h-4 mr-2" />
								Edit Template
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
