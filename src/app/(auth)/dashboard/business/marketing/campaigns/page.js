"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Progress } from "@components/ui/progress";
import { Separator } from "@components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { Plus, Search, Calendar, TrendingUp, Target, Mail, MessageSquare, Phone, DollarSign, Eye, Edit, Copy, Trash2, MoreVertical, Play, Pause, BarChart3, Settings, FileText, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { toast } from "@components/ui/use-toast";

// Mock data for marketing campaigns
const mockCampaigns = [
	{
		id: "CAM001",
		name: "Spring HVAC Tune-Up Special",
		type: "promotional",
		channel: "email",
		status: "active",
		startDate: "2024-03-01",
		endDate: "2024-04-30",
		budget: 1500,
		spent: 892,
		target: {
			audience: "residential_customers",
			criteria: "HVAC customers from last year",
			size: 1247,
		},
		results: {
			sent: 1247,
			opened: 374,
			clicked: 127,
			converted: 43,
			revenue: 12890,
			roi: 844,
		},
		content: {
			subject: "Get Your HVAC Ready for Spring - 20% Off Tune-Ups",
			preview: "Don't let the spring season catch your HVAC system unprepared...",
			cta: "Schedule Your Tune-Up",
		},
		metrics: {
			openRate: 30.0,
			clickRate: 10.2,
			conversionRate: 3.4,
			costPerLead: 20.74,
			costPerAcquisition: 20.74,
		},
		created: "2024-02-15",
		lastModified: "2024-03-01",
	},
	{
		id: "CAM002",
		name: "Emergency Plumbing Services",
		type: "awareness",
		channel: "social",
		status: "active",
		startDate: "2024-01-15",
		endDate: "2024-06-15",
		budget: 2000,
		spent: 1456,
		target: {
			audience: "local_homeowners",
			criteria: "25-65 years old, homeowners within 15 miles",
			size: 8500,
		},
		results: {
			impressions: 45000,
			reach: 8500,
			engagement: 1275,
			clicked: 238,
			converted: 19,
			revenue: 5700,
			roi: 291,
		},
		content: {
			title: "24/7 Emergency Plumbing Services",
			description: "When plumbing disasters strike, we're here to help...",
			cta: "Call Now",
		},
		metrics: {
			engagementRate: 2.8,
			clickRate: 0.5,
			conversionRate: 8.0,
			costPerClick: 6.12,
			costPerAcquisition: 76.63,
		},
		created: "2024-01-05",
		lastModified: "2024-01-20",
	},
	{
		id: "CAM003",
		name: "Multi-Service Annual Plans",
		type: "conversion",
		channel: "direct_mail",
		status: "scheduled",
		startDate: "2024-04-01",
		endDate: "2024-05-31",
		budget: 3000,
		spent: 0,
		target: {
			audience: "high_value_customers",
			criteria: "Customers with $500+ annual spending",
			size: 456,
		},
		results: {
			sent: 0,
			opened: 0,
			clicked: 0,
			converted: 0,
			revenue: 0,
			roi: 0,
		},
		content: {
			title: "Exclusive Annual Service Plans",
			description: "Comprehensive home service protection for valued customers...",
			cta: "Learn More",
		},
		metrics: {
			openRate: 0,
			clickRate: 0,
			conversionRate: 0,
			costPerLead: 0,
			costPerAcquisition: 0,
		},
		created: "2024-03-10",
		lastModified: "2024-03-15",
	},
	{
		id: "CAM004",
		name: "Customer Referral Program",
		type: "referral",
		channel: "email",
		status: "active",
		startDate: "2024-01-01",
		endDate: "2024-12-31",
		budget: 5000,
		spent: 2340,
		target: {
			audience: "existing_customers",
			criteria: "Customers with completed jobs in last 6 months",
			size: 892,
		},
		results: {
			sent: 892,
			opened: 534,
			clicked: 178,
			converted: 67,
			revenue: 20100,
			roi: 759,
		},
		content: {
			subject: "Refer a Friend, Get $50 Credit",
			preview: "Know someone who needs our services? Refer them and save...",
			cta: "Refer Now",
		},
		metrics: {
			openRate: 59.9,
			clickRate: 20.0,
			conversionRate: 37.6,
			costPerLead: 34.93,
			costPerAcquisition: 34.93,
		},
		created: "2023-12-15",
		lastModified: "2024-01-05",
	},
	{
		id: "CAM005",
		name: "Electrical Safety Awareness",
		type: "educational",
		channel: "social",
		status: "completed",
		startDate: "2024-01-01",
		endDate: "2024-02-29",
		budget: 800,
		spent: 784,
		target: {
			audience: "homeowners",
			criteria: "Homeowners interested in safety and maintenance",
			size: 3200,
		},
		results: {
			impressions: 18500,
			reach: 3200,
			engagement: 896,
			clicked: 145,
			converted: 12,
			revenue: 1800,
			roi: 130,
		},
		content: {
			title: "Electrical Safety Tips for Your Home",
			description: "Protect your family with these essential electrical safety tips...",
			cta: "Read More",
		},
		metrics: {
			engagementRate: 4.8,
			clickRate: 0.8,
			conversionRate: 8.3,
			costPerClick: 5.41,
			costPerAcquisition: 65.33,
		},
		created: "2023-12-20",
		lastModified: "2024-03-01",
	},
];

const campaignTypes = {
	promotional: { label: "Promotional", color: "bg-success/10 text-success" },
	awareness: { label: "Awareness", color: "bg-primary/10 text-primary" },
	conversion: { label: "Conversion", color: "bg-purple-100 text-purple-800" },
	referral: { label: "Referral", color: "bg-warning/10 text-warning" },
	educational: { label: "Educational", color: "bg-teal-100 text-teal-800" },
};

const campaignChannels = {
	email: { label: "Email", icon: Mail, color: "bg-destructive/10 text-destructive" },
	social: { label: "Social Media", icon: MessageSquare, color: "bg-primary/10 text-primary" },
	direct_mail: { label: "Direct Mail", icon: FileText, color: "bg-purple-100 text-purple-800" },
	phone: { label: "Phone", icon: Phone, color: "bg-success/10 text-success" },
};

const statusColors = {
	active: "bg-success/10 text-success",
	scheduled: "bg-warning/10 text-warning",
	paused: "bg-warning/10 text-warning",
	completed: "bg-muted text-muted-foreground",
	draft: "bg-muted text-muted-foreground",
};

export default function MarketingCampaigns() {
	const router = useRouter();
	const [campaigns, setCampaigns] = useState(mockCampaigns);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedType, setSelectedType] = useState("all");
	const [selectedChannel, setSelectedChannel] = useState("all");
	const [selectedStatus, setSelectedStatus] = useState("all");
	const [sortBy, setSortBy] = useState("created");
	const [sortOrder, setSortOrder] = useState("desc");
	const [selectedCampaign, setSelectedCampaign] = useState(null);
	const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);

	// Filter and sort campaigns
	const filteredCampaigns = campaigns
		.filter((campaign) => {
			if (searchTerm && !campaign.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
			if (selectedType !== "all" && campaign.type !== selectedType) return false;
			if (selectedChannel !== "all" && campaign.channel !== selectedChannel) return false;
			if (selectedStatus !== "all" && campaign.status !== selectedStatus) return false;
			return true;
		})
		.sort((a, b) => {
			const direction = sortOrder === "asc" ? 1 : -1;
			switch (sortBy) {
				case "name":
					return direction * a.name.localeCompare(b.name);
				case "budget":
					return direction * (a.budget - b.budget);
				case "roi":
					return direction * (a.results.roi - b.results.roi);
				case "startDate":
					return direction * (new Date(a.startDate) - new Date(b.startDate));
				case "created":
					return direction * (new Date(a.created) - new Date(b.created));
				default:
					return 0;
			}
		});

	// Calculate summary stats
	const stats = {
		total: filteredCampaigns.length,
		active: filteredCampaigns.filter((c) => c.status === "active").length,
		totalBudget: filteredCampaigns.reduce((sum, c) => sum + c.budget, 0),
		totalSpent: filteredCampaigns.reduce((sum, c) => sum + c.spent, 0),
		totalRevenue: filteredCampaigns.reduce((sum, c) => sum + c.results.revenue, 0),
		avgROI: filteredCampaigns.length > 0 ? filteredCampaigns.reduce((sum, c) => sum + c.results.roi, 0) / filteredCampaigns.length : 0,
	};

	const handleAction = (campaign, action) => {
		switch (action) {
			case "play":
				setCampaigns(campaigns.map((c) => (c.id === campaign.id ? { ...c, status: "active" } : c)));
				toast({ title: "Campaign Activated", description: `${campaign.name} is now running` });
				break;
			case "pause":
				setCampaigns(campaigns.map((c) => (c.id === campaign.id ? { ...c, status: "paused" } : c)));
				toast({ title: "Campaign Paused", description: `${campaign.name} has been paused` });
				break;
			case "duplicate":
				const duplicated = {
					...campaign,
					id: `CAM${String(campaigns.length + 1).padStart(3, "0")}`,
					name: `${campaign.name} (Copy)`,
					status: "draft",
					startDate: new Date().toISOString().split("T")[0],
					created: new Date().toISOString().split("T")[0],
					results: { ...campaign.results, sent: 0, opened: 0, clicked: 0, converted: 0, revenue: 0, roi: 0 },
					spent: 0,
				};
				setCampaigns([duplicated, ...campaigns]);
				toast({ title: "Campaign Duplicated", description: "Campaign copy created as draft" });
				break;
			case "delete":
				setCampaigns(campaigns.filter((c) => c.id !== campaign.id));
				toast({ title: "Campaign Deleted", description: "Campaign has been removed" });
				break;
		}
	};

	const formatCurrency = (amount) => `$${amount.toLocaleString()}`;
	const formatPercentage = (value) => `${value.toFixed(1)}%`;

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Marketing Campaigns</h1>
					<p className="text-muted-foreground">Create and manage marketing campaigns to grow your business</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline">
						<BarChart3 className="w-4 h-4 mr-2" />
						Analytics
					</Button>
					<Button onClick={() => setCreateDialogOpen(true)}>
						<Plus className="w-4 h-4 mr-2" />
						Create Campaign
					</Button>
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-6 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Total Campaigns</p>
								<p className="text-2xl font-bold">{stats.total}</p>
							</div>
							<Target className="w-8 h-8 text-primary" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Active</p>
								<p className="text-2xl font-bold text-success">{stats.active}</p>
							</div>
							<Play className="w-8 h-8 text-success" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Total Budget</p>
								<p className="text-2xl font-bold">{formatCurrency(stats.totalBudget)}</p>
							</div>
							<DollarSign className="w-8 h-8 text-purple-500" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Spent</p>
								<p className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</p>
							</div>
							<TrendingUp className="w-8 h-8 text-warning" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Revenue</p>
								<p className="text-2xl font-bold text-success">{formatCurrency(stats.totalRevenue)}</p>
							</div>
							<DollarSign className="w-8 h-8 text-success" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Avg ROI</p>
								<p className="text-2xl font-bold">{formatPercentage(stats.avgROI)}</p>
							</div>
							<TrendingUp className="w-8 h-8 text-primary" />
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
								<Input placeholder="Search campaigns..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
							</div>
						</div>

						<Select value={selectedType} onValueChange={setSelectedType}>
							<SelectTrigger className="w-[150px]">
								<SelectValue placeholder="Type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Types</SelectItem>
								{Object.entries(campaignTypes).map(([key, type]) => (
									<SelectItem key={key} value={key}>
										{type.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select value={selectedChannel} onValueChange={setSelectedChannel}>
							<SelectTrigger className="w-[150px]">
								<SelectValue placeholder="Channel" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Channels</SelectItem>
								{Object.entries(campaignChannels).map(([key, channel]) => (
									<SelectItem key={key} value={key}>
										{channel.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select value={selectedStatus} onValueChange={setSelectedStatus}>
							<SelectTrigger className="w-[150px]">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Statuses</SelectItem>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="scheduled">Scheduled</SelectItem>
								<SelectItem value="paused">Paused</SelectItem>
								<SelectItem value="completed">Completed</SelectItem>
								<SelectItem value="draft">Draft</SelectItem>
							</SelectContent>
						</Select>

						<Select value={sortBy} onValueChange={setSortBy}>
							<SelectTrigger className="w-[150px]">
								<SelectValue placeholder="Sort by" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="created">Created Date</SelectItem>
								<SelectItem value="name">Name</SelectItem>
								<SelectItem value="budget">Budget</SelectItem>
								<SelectItem value="roi">ROI</SelectItem>
								<SelectItem value="startDate">Start Date</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Campaigns List */}
			<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
				{filteredCampaigns.map((campaign) => {
					const ChannelIcon = campaignChannels[campaign.channel].icon;
					const budgetUsed = campaign.budget > 0 ? (campaign.spent / campaign.budget) * 100 : 0;

					return (
						<Card key={campaign.id} className="hover:shadow-lg transition-shadow">
							<CardHeader className="pb-3">
								<div className="flex justify-between items-start">
									<div className="flex-1">
										<CardTitle className="text-lg mb-2">{campaign.name}</CardTitle>
										<div className="flex gap-2 mb-2">
											<Badge className={campaignTypes[campaign.type].color}>{campaignTypes[campaign.type].label}</Badge>
											<Badge className={campaignChannels[campaign.channel].color}>
												<ChannelIcon className="w-3 h-3 mr-1" />
												{campaignChannels[campaign.channel].label}
											</Badge>
											<Badge className={statusColors[campaign.status]}>{campaign.status}</Badge>
										</div>
									</div>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="sm">
												<MoreVertical className="w-4 h-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem onClick={() => setSelectedCampaign(campaign)}>
												<Eye className="w-4 h-4 mr-2" />
												View Details
											</DropdownMenuItem>
											<DropdownMenuItem>
												<Edit className="w-4 h-4 mr-2" />
												Edit
											</DropdownMenuItem>
											{campaign.status === "paused" || campaign.status === "draft" ? (
												<DropdownMenuItem onClick={() => handleAction(campaign, "play")}>
													<Play className="w-4 h-4 mr-2" />
													Start
												</DropdownMenuItem>
											) : campaign.status === "active" ? (
												<DropdownMenuItem onClick={() => handleAction(campaign, "pause")}>
													<Pause className="w-4 h-4 mr-2" />
													Pause
												</DropdownMenuItem>
											) : null}
											<DropdownMenuItem onClick={() => handleAction(campaign, "duplicate")}>
												<Copy className="w-4 h-4 mr-2" />
												Duplicate
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => handleAction(campaign, "delete")} className="text-destructive">
												<Trash2 className="w-4 h-4 mr-2" />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{/* Performance Metrics */}
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div>
											<span className="text-muted-foreground">Target Audience</span>
											<p className="font-medium">{campaign.target.size.toLocaleString()}</p>
										</div>
										<div>
											<span className="text-muted-foreground">ROI</span>
											<p className={`font-medium ${campaign.results.roi > 200 ? "text-success" : campaign.results.roi > 100 ? "text-warning" : "text-destructive"}`}>
												{formatPercentage(campaign.results.roi)}
												{campaign.results.roi > 200 ? <ArrowUpRight className="w-3 h-3 inline ml-1" /> : campaign.results.roi < 100 ? <ArrowDownRight className="w-3 h-3 inline ml-1" /> : null}
											</p>
										</div>
									</div>

									{/* Budget Progress */}
									<div>
										<div className="flex justify-between text-sm mb-2">
											<span className="text-muted-foreground">Budget Used</span>
											<span className="font-medium">
												{formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}
											</span>
										</div>
										<Progress value={budgetUsed} className="h-2" />
									</div>

									{/* Key Metrics */}
									<div className="space-y-2">
										{campaign.channel === "email" && (
											<div className="grid grid-cols-2 gap-4 text-sm">
												<div>
													<span className="text-muted-foreground">Open Rate</span>
													<p className="font-medium">{formatPercentage(campaign.metrics.openRate)}</p>
												</div>
												<div>
													<span className="text-muted-foreground">Click Rate</span>
													<p className="font-medium">{formatPercentage(campaign.metrics.clickRate)}</p>
												</div>
											</div>
										)}
										{campaign.channel === "social" && (
											<div className="grid grid-cols-2 gap-4 text-sm">
												<div>
													<span className="text-muted-foreground">Engagement</span>
													<p className="font-medium">{formatPercentage(campaign.metrics.engagementRate)}</p>
												</div>
												<div>
													<span className="text-muted-foreground">Reach</span>
													<p className="font-medium">{campaign.results.reach?.toLocaleString() || "N/A"}</p>
												</div>
											</div>
										)}
									</div>

									{/* Revenue & Conversions */}
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div>
											<span className="text-muted-foreground">Conversions</span>
											<p className="font-medium">{campaign.results.converted}</p>
										</div>
										<div>
											<span className="text-muted-foreground">Revenue</span>
											<p className="font-medium text-success">{formatCurrency(campaign.results.revenue)}</p>
										</div>
									</div>

									{/* Campaign Dates */}
									<div className="text-xs text-muted-foreground">
										<div className="flex items-center gap-1 mb-1">
											<Calendar className="w-3 h-3" />
											{new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Campaign Details Dialog */}
			{selectedCampaign && (
				<Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
					<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-3">
								{selectedCampaign.name}
								<div className="flex gap-2">
									<Badge className={campaignTypes[selectedCampaign.type].color}>{campaignTypes[selectedCampaign.type].label}</Badge>
									<Badge className={campaignChannels[selectedCampaign.channel].color}>{campaignChannels[selectedCampaign.channel].label}</Badge>
									<Badge className={statusColors[selectedCampaign.status]}>{selectedCampaign.status}</Badge>
								</div>
							</DialogTitle>
							<DialogDescription>Campaign ID: {selectedCampaign.id}</DialogDescription>
						</DialogHeader>

						<Tabs defaultValue="overview" className="space-y-4">
							<TabsList>
								<TabsTrigger value="overview">Overview</TabsTrigger>
								<TabsTrigger value="performance">Performance</TabsTrigger>
								<TabsTrigger value="audience">Audience</TabsTrigger>
								<TabsTrigger value="content">Content</TabsTrigger>
							</TabsList>

							<TabsContent value="overview" className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-4">
										<div>
											<h4 className="font-medium mb-3">Campaign Details</h4>
											<div className="space-y-2 text-sm">
												<div className="flex justify-between">
													<span className="text-muted-foreground">Type</span>
													<span>{campaignTypes[selectedCampaign.type].label}</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">Channel</span>
													<span>{campaignChannels[selectedCampaign.channel].label}</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">Start Date</span>
													<span>{new Date(selectedCampaign.startDate).toLocaleDateString()}</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">End Date</span>
													<span>{new Date(selectedCampaign.endDate).toLocaleDateString()}</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">Created</span>
													<span>{new Date(selectedCampaign.created).toLocaleDateString()}</span>
												</div>
											</div>
										</div>

										<div>
											<h4 className="font-medium mb-3">Budget & Spending</h4>
											<div className="space-y-2 text-sm">
												<div className="flex justify-between">
													<span className="text-muted-foreground">Total Budget</span>
													<span className="font-medium">{formatCurrency(selectedCampaign.budget)}</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">Amount Spent</span>
													<span className="font-medium">{formatCurrency(selectedCampaign.spent)}</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">Remaining</span>
													<span className="font-medium">{formatCurrency(selectedCampaign.budget - selectedCampaign.spent)}</span>
												</div>
												<Separator />
												<div className="flex justify-between">
													<span className="font-medium">Budget Used</span>
													<span className="font-medium">{formatPercentage((selectedCampaign.spent / selectedCampaign.budget) * 100)}</span>
												</div>
											</div>
										</div>
									</div>

									<div className="space-y-4">
										<div>
											<h4 className="font-medium mb-3">Results Summary</h4>
											<div className="space-y-2 text-sm">
												<div className="flex justify-between">
													<span className="text-muted-foreground">Total Revenue</span>
													<span className="font-medium text-success">{formatCurrency(selectedCampaign.results.revenue)}</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">Conversions</span>
													<span className="font-medium">{selectedCampaign.results.converted}</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">Cost per Acquisition</span>
													<span className="font-medium">{formatCurrency(selectedCampaign.metrics.costPerAcquisition)}</span>
												</div>
												<Separator />
												<div className="flex justify-between">
													<span className="font-medium">ROI</span>
													<span className={`font-medium ${selectedCampaign.results.roi > 200 ? "text-success" : selectedCampaign.results.roi > 100 ? "text-warning" : "text-destructive"}`}>{formatPercentage(selectedCampaign.results.roi)}</span>
												</div>
											</div>
										</div>

										<div>
											<h4 className="font-medium mb-3">Quick Actions</h4>
											<div className="space-y-2">
												{selectedCampaign.status === "active" && (
													<Button variant="outline" className="w-full justify-start" onClick={() => handleAction(selectedCampaign, "pause")}>
														<Pause className="w-4 h-4 mr-2" />
														Pause Campaign
													</Button>
												)}
												{(selectedCampaign.status === "paused" || selectedCampaign.status === "draft") && (
													<Button variant="outline" className="w-full justify-start" onClick={() => handleAction(selectedCampaign, "play")}>
														<Play className="w-4 h-4 mr-2" />
														Start Campaign
													</Button>
												)}
												<Button variant="outline" className="w-full justify-start" onClick={() => handleAction(selectedCampaign, "duplicate")}>
													<Copy className="w-4 h-4 mr-2" />
													Duplicate Campaign
												</Button>
												<Button variant="outline" className="w-full justify-start">
													<Edit className="w-4 h-4 mr-2" />
													Edit Campaign
												</Button>
											</div>
										</div>
									</div>
								</div>
							</TabsContent>

							<TabsContent value="performance" className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									<div className="space-y-4">
										<h4 className="font-medium">Engagement Metrics</h4>
										{selectedCampaign.channel === "email" && (
											<div className="space-y-3">
												<div className="flex justify-between">
													<span className="text-sm text-muted-foreground">Emails Sent</span>
													<span className="font-medium">{selectedCampaign.results.sent?.toLocaleString()}</span>
												</div>
												<div className="flex justify-between">
													<span className="text-sm text-muted-foreground">Opened</span>
													<span className="font-medium">{selectedCampaign.results.opened?.toLocaleString()}</span>
												</div>
												<div className="flex justify-between">
													<span className="text-sm text-muted-foreground">Clicked</span>
													<span className="font-medium">{selectedCampaign.results.clicked?.toLocaleString()}</span>
												</div>
												<Separator />
												<div className="flex justify-between">
													<span className="text-sm text-muted-foreground">Open Rate</span>
													<span className="font-medium">{formatPercentage(selectedCampaign.metrics.openRate)}</span>
												</div>
												<div className="flex justify-between">
													<span className="text-sm text-muted-foreground">Click Rate</span>
													<span className="font-medium">{formatPercentage(selectedCampaign.metrics.clickRate)}</span>
												</div>
											</div>
										)}
										{selectedCampaign.channel === "social" && (
											<div className="space-y-3">
												<div className="flex justify-between">
													<span className="text-sm text-muted-foreground">Impressions</span>
													<span className="font-medium">{selectedCampaign.results.impressions?.toLocaleString()}</span>
												</div>
												<div className="flex justify-between">
													<span className="text-sm text-muted-foreground">Reach</span>
													<span className="font-medium">{selectedCampaign.results.reach?.toLocaleString()}</span>
												</div>
												<div className="flex justify-between">
													<span className="text-sm text-muted-foreground">Engagement</span>
													<span className="font-medium">{selectedCampaign.results.engagement?.toLocaleString()}</span>
												</div>
												<Separator />
												<div className="flex justify-between">
													<span className="text-sm text-muted-foreground">Engagement Rate</span>
													<span className="font-medium">{formatPercentage(selectedCampaign.metrics.engagementRate)}</span>
												</div>
											</div>
										)}
									</div>

									<div className="space-y-4">
										<h4 className="font-medium">Conversion Metrics</h4>
										<div className="space-y-3">
											<div className="flex justify-between">
												<span className="text-sm text-muted-foreground">Conversions</span>
												<span className="font-medium">{selectedCampaign.results.converted}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-sm text-muted-foreground">Conversion Rate</span>
												<span className="font-medium">{formatPercentage(selectedCampaign.metrics.conversionRate)}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-sm text-muted-foreground">Cost per Lead</span>
												<span className="font-medium">{formatCurrency(selectedCampaign.metrics.costPerLead || 0)}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-sm text-muted-foreground">Cost per Acquisition</span>
												<span className="font-medium">{formatCurrency(selectedCampaign.metrics.costPerAcquisition)}</span>
											</div>
										</div>
									</div>

									<div className="space-y-4">
										<h4 className="font-medium">Financial Results</h4>
										<div className="space-y-3">
											<div className="flex justify-between">
												<span className="text-sm text-muted-foreground">Revenue Generated</span>
												<span className="font-medium text-success">{formatCurrency(selectedCampaign.results.revenue)}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-sm text-muted-foreground">Amount Spent</span>
												<span className="font-medium">{formatCurrency(selectedCampaign.spent)}</span>
											</div>
											<Separator />
											<div className="flex justify-between">
												<span className="text-sm text-muted-foreground">Net Profit</span>
												<span className={`font-medium ${selectedCampaign.results.revenue - selectedCampaign.spent > 0 ? "text-success" : "text-destructive"}`}>{formatCurrency(selectedCampaign.results.revenue - selectedCampaign.spent)}</span>
											</div>
											<div className="flex justify-between">
												<span className="font-medium">ROI</span>
												<span className={`font-bold ${selectedCampaign.results.roi > 200 ? "text-success" : selectedCampaign.results.roi > 100 ? "text-warning" : "text-destructive"}`}>{formatPercentage(selectedCampaign.results.roi)}</span>
											</div>
										</div>
									</div>
								</div>
							</TabsContent>

							<TabsContent value="audience" className="space-y-4">
								<div className="space-y-4">
									<h4 className="font-medium">Target Audience</h4>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<h5 className="font-medium mb-2">Audience Type</h5>
											<p className="text-sm text-muted-foreground mb-4">{selectedCampaign.target.audience.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}</p>

											<h5 className="font-medium mb-2">Targeting Criteria</h5>
											<p className="text-sm text-muted-foreground">{selectedCampaign.target.criteria}</p>
										</div>

										<div>
											<h5 className="font-medium mb-2">Audience Size</h5>
											<div className="text-3xl font-bold text-primary mb-2">{selectedCampaign.target.size.toLocaleString()}</div>
											<p className="text-sm text-muted-foreground">Total targeted customers</p>
										</div>
									</div>
								</div>
							</TabsContent>

							<TabsContent value="content" className="space-y-4">
								<div className="space-y-4">
									<h4 className="font-medium">Campaign Content</h4>
									{selectedCampaign.channel === "email" && (
										<div className="space-y-4">
											<div>
												<Label className="text-sm font-medium">Subject Line</Label>
												<p className="text-sm text-muted-foreground mt-1">{selectedCampaign.content.subject}</p>
											</div>
											<div>
												<Label className="text-sm font-medium">Preview Text</Label>
												<p className="text-sm text-muted-foreground mt-1">{selectedCampaign.content.preview}</p>
											</div>
											<div>
												<Label className="text-sm font-medium">Call to Action</Label>
												<p className="text-sm text-muted-foreground mt-1">{selectedCampaign.content.cta}</p>
											</div>
										</div>
									)}
									{selectedCampaign.channel === "social" && (
										<div className="space-y-4">
											<div>
												<Label className="text-sm font-medium">Title</Label>
												<p className="text-sm text-muted-foreground mt-1">{selectedCampaign.content.title}</p>
											</div>
											<div>
												<Label className="text-sm font-medium">Description</Label>
												<p className="text-sm text-muted-foreground mt-1">{selectedCampaign.content.description}</p>
											</div>
											<div>
												<Label className="text-sm font-medium">Call to Action</Label>
												<p className="text-sm text-muted-foreground mt-1">{selectedCampaign.content.cta}</p>
											</div>
										</div>
									)}
									{selectedCampaign.channel === "direct_mail" && (
										<div className="space-y-4">
											<div>
												<Label className="text-sm font-medium">Title</Label>
												<p className="text-sm text-muted-foreground mt-1">{selectedCampaign.content.title}</p>
											</div>
											<div>
												<Label className="text-sm font-medium">Description</Label>
												<p className="text-sm text-muted-foreground mt-1">{selectedCampaign.content.description}</p>
											</div>
											<div>
												<Label className="text-sm font-medium">Call to Action</Label>
												<p className="text-sm text-muted-foreground mt-1">{selectedCampaign.content.cta}</p>
											</div>
										</div>
									)}
								</div>
							</TabsContent>
						</Tabs>

						<DialogFooter>
							<Button variant="outline" onClick={() => setSelectedCampaign(null)}>
								Close
							</Button>
							<Button>Edit Campaign</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}

			{/* Create Campaign Dialog */}
			<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create New Campaign</DialogTitle>
						<DialogDescription>Choose how you'd like to create your marketing campaign</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<Button className="w-full justify-start" onClick={() => router.push("/dashboard/business/marketing/campaigns/create")}>
							<Plus className="w-4 h-4 mr-2" />
							Create from Scratch
						</Button>
						<Button variant="outline" className="w-full justify-start">
							<Copy className="w-4 h-4 mr-2" />
							Use Template
						</Button>
						<Button variant="outline" className="w-full justify-start">
							<Settings className="w-4 h-4 mr-2" />
							Import Campaign
						</Button>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
							Cancel
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
