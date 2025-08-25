"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Checkbox } from "@components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Clock, Phone, Mail, MessageSquare, FileText, AlertTriangle, CheckCircle, Target, DollarSign, Search, Plus, Eye, Star, Timer, Zap, BarChart3, Activity } from "lucide-react";
import { toast } from "@components/ui/use-toast";

export default function EstimateFollowUps() {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("overdue");
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState("all");
	const [selectedFollowUps, setSelectedFollowUps] = useState([]);
	const [showNewFollowUpDialog, setShowNewFollowUpDialog] = useState(false);

	// Mock follow-up data with automation rules and tracking
	const [followUps, setFollowUps] = useState([
		{
			id: "fu_001",
			estimate: {
				id: "est_001",
				number: "EST-2024-001",
				total: 378.88,
				validUntil: "2024-01-20",
				status: "pending_approval",
			},
			customer: {
				id: "c_001",
				name: "John Smith",
				email: "john@email.com",
				phone: "(555) 123-4567",
				avatar: "/placeholder.svg",
				preferredContact: "email",
			},
			job: {
				title: "Kitchen Faucet Replacement",
				serviceType: "Plumbing",
				priority: "medium",
			},
			followUpStatus: "overdue",
			nextFollowUp: "2024-01-08T10:00:00",
			lastContact: "2024-01-05T14:30:00",
			contactAttempts: 3,
			conversionProbability: 75,
			automationRules: {
				enabled: true,
				sequence: "standard",
				daysSinceLastContact: 3,
				maxAttempts: 5,
			},
			notes: [
				{
					id: "n_001",
					createdAt: "2024-01-05T14:30:00",
					type: "email",
					content: "Initial estimate sent, customer confirmed receipt",
					createdBy: "Mike Rodriguez",
				},
				{
					id: "n_002",
					createdAt: "2024-01-07T09:15:00",
					type: "phone",
					content: "Left voicemail, customer hasn't responded yet",
					createdBy: "Sarah Davis",
				},
			],
			engagement: {
				emailOpens: 2,
				emailClicks: 1,
				websiteVisits: 3,
				lastActivity: "2024-01-06T16:20:00",
			},
		},
		{
			id: "fu_002",
			estimate: {
				id: "est_002",
				number: "EST-2024-002",
				total: 1250.0,
				validUntil: "2024-01-25",
				status: "pending_approval",
			},
			customer: {
				id: "c_002",
				name: "Sarah Johnson",
				email: "sarah@email.com",
				phone: "(555) 234-5678",
				avatar: "/placeholder.svg",
				preferredContact: "phone",
			},
			job: {
				title: "HVAC System Maintenance",
				serviceType: "HVAC",
				priority: "low",
			},
			followUpStatus: "scheduled",
			nextFollowUp: "2024-01-09T14:00:00",
			lastContact: "2024-01-08T11:45:00",
			contactAttempts: 1,
			conversionProbability: 85,
			automationRules: {
				enabled: true,
				sequence: "high_value",
				daysSinceLastContact: 1,
				maxAttempts: 7,
			},
			notes: [
				{
					id: "n_003",
					createdAt: "2024-01-08T11:45:00",
					type: "email",
					content: "Customer interested, wants to discuss scheduling options",
					createdBy: "Alex Johnson",
				},
			],
			engagement: {
				emailOpens: 1,
				emailClicks: 1,
				websiteVisits: 1,
				lastActivity: "2024-01-08T12:30:00",
			},
		},
		{
			id: "fu_003",
			estimate: {
				id: "est_003",
				number: "EST-2024-003",
				total: 2800.0,
				validUntil: "2024-01-15",
				status: "pending_approval",
			},
			customer: {
				id: "c_003",
				name: "Mike Davis",
				email: "mike@email.com",
				phone: "(555) 345-6789",
				avatar: "/placeholder.svg",
				preferredContact: "email",
			},
			job: {
				title: "Electrical Panel Upgrade",
				serviceType: "Electrical",
				priority: "high",
			},
			followUpStatus: "expired",
			nextFollowUp: null,
			lastContact: "2024-01-02T16:20:00",
			contactAttempts: 5,
			conversionProbability: 25,
			automationRules: {
				enabled: false,
				sequence: "aggressive",
				daysSinceLastContact: 7,
				maxAttempts: 5,
			},
			notes: [
				{
					id: "n_004",
					createdAt: "2024-01-02T16:20:00",
					type: "phone",
					content: "Customer not responding to calls or emails, estimate expired",
					createdBy: "Tom Wilson",
				},
			],
			engagement: {
				emailOpens: 0,
				emailClicks: 0,
				websiteVisits: 0,
				lastActivity: "2024-01-02T16:20:00",
			},
		},
		{
			id: "fu_004",
			estimate: {
				id: "est_004",
				number: "EST-2024-004",
				total: 580.0,
				validUntil: "2024-01-30",
				status: "pending_approval",
			},
			customer: {
				id: "c_004",
				name: "Lisa Chen",
				email: "lisa@email.com",
				phone: "(555) 456-7890",
				avatar: "/placeholder.svg",
				preferredContact: "text",
			},
			job: {
				title: "Bathroom Leak Repair",
				serviceType: "Plumbing",
				priority: "urgent",
			},
			followUpStatus: "hot_lead",
			nextFollowUp: "2024-01-09T09:00:00",
			lastContact: "2024-01-08T15:30:00",
			contactAttempts: 2,
			conversionProbability: 90,
			automationRules: {
				enabled: true,
				sequence: "urgent",
				daysSinceLastContact: 0,
				maxAttempts: 3,
			},
			notes: [
				{
					id: "n_005",
					createdAt: "2024-01-08T15:30:00",
					type: "phone",
					content: "Customer very interested, wants to schedule ASAP, waiting for spouse approval",
					createdBy: "Mike Rodriguez",
				},
			],
			engagement: {
				emailOpens: 3,
				emailClicks: 2,
				websiteVisits: 5,
				lastActivity: "2024-01-08T17:45:00",
			},
		},
	]);

	// Follow-up automation sequences
	const [automationSequences, setAutomationSequences] = useState([
		{
			id: "standard",
			name: "Standard Follow-up",
			description: "Regular follow-up for standard estimates",
			steps: [
				{ day: 1, action: "email", template: "initial_reminder" },
				{ day: 3, action: "phone", template: "phone_follow_up" },
				{ day: 7, action: "email", template: "final_reminder" },
			],
		},
		{
			id: "high_value",
			name: "High Value Follow-up",
			description: "Intensive follow-up for high-value estimates",
			steps: [
				{ day: 1, action: "phone", template: "high_value_call" },
				{ day: 2, action: "email", template: "high_value_email" },
				{ day: 5, action: "phone", template: "value_proposition" },
				{ day: 10, action: "email", template: "final_offer" },
			],
		},
		{
			id: "urgent",
			name: "Urgent Follow-up",
			description: "Fast follow-up for urgent jobs",
			steps: [
				{ day: 0, action: "phone", template: "urgent_call" },
				{ day: 1, action: "text", template: "urgent_text" },
				{ day: 2, action: "email", template: "urgent_final" },
			],
		},
	]);

	// Dashboard stats
	const [dashboardStats, setDashboardStats] = useState({
		total: followUps.length,
		overdue: followUps.filter((f) => f.followUpStatus === "overdue").length,
		scheduled: followUps.filter((f) => f.followUpStatus === "scheduled").length,
		hotLeads: followUps.filter((f) => f.followUpStatus === "hot_lead").length,
		expired: followUps.filter((f) => f.followUpStatus === "expired").length,
		avgResponseTime: "2.3 hours",
		conversionRate: 68.5,
		totalValue: followUps.reduce((sum, f) => sum + f.estimate.total, 0),
		automationEnabled: followUps.filter((f) => f.automationRules.enabled).length,
	});

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	const formatDate = (dateString) => {
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		}).format(new Date(dateString));
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "overdue":
				return "bg-destructive/10 text-destructive dark:bg-destructive dark:text-destructive/90";
			case "scheduled":
				return "bg-primary/10 text-primary dark:bg-primary dark:text-primary/90";
			case "hot_lead":
				return "bg-success/10 text-success dark:bg-success dark:text-success/90";
			case "expired":
				return "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground";
			default:
				return "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground";
		}
	};

	const getStatusIcon = (status) => {
		switch (status) {
			case "overdue":
				return <AlertTriangle className="w-4 h-4" />;
			case "scheduled":
				return <Clock className="w-4 h-4" />;
			case "hot_lead":
				return <Star className="w-4 h-4" />;
			case "expired":
				return <CheckCircle className="w-4 h-4" />;
			default:
				return <Activity className="w-4 h-4" />;
		}
	};

	const getPriorityColor = (priority) => {
		switch (priority) {
			case "urgent":
				return "text-destructive dark:text-destructive";
			case "high":
				return "text-warning dark:text-warning";
			case "medium":
				return "text-warning dark:text-warning";
			case "low":
				return "text-success dark:text-success";
			default:
				return "text-muted-foreground dark:text-muted-foreground";
		}
	};

	const getConversionColor = (probability) => {
		if (probability >= 80) return "text-success dark:text-success";
		if (probability >= 60) return "text-warning dark:text-warning";
		return "text-destructive dark:text-destructive";
	};

	const getEngagementScore = (engagement) => {
		const score = engagement.emailOpens * 10 + engagement.emailClicks * 20 + engagement.websiteVisits * 15;
		return Math.min(100, score);
	};

	const getEngagementColor = (score) => {
		if (score >= 70) return "text-success dark:text-success";
		if (score >= 40) return "text-warning dark:text-warning";
		return "text-destructive dark:text-destructive";
	};

	const filteredFollowUps = followUps.filter((followUp) => {
		const matchesSearch = followUp.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || followUp.job.title.toLowerCase().includes(searchTerm.toLowerCase()) || followUp.estimate.number.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesStatus = filterStatus === "all" || followUp.followUpStatus === filterStatus;

		const matchesTab = activeTab === "all" || (activeTab === "overdue" && followUp.followUpStatus === "overdue") || (activeTab === "scheduled" && followUp.followUpStatus === "scheduled") || (activeTab === "hot_leads" && followUp.followUpStatus === "hot_lead") || (activeTab === "expired" && followUp.followUpStatus === "expired");

		return matchesSearch && matchesStatus && matchesTab;
	});

	const handleSendFollowUp = (followUpId, method) => {
		const followUp = followUps.find((f) => f.id === followUpId);
		if (followUp) {
			setFollowUps(
				followUps.map((f) =>
					f.id === followUpId
						? {
								...f,
								lastContact: new Date().toISOString(),
								contactAttempts: f.contactAttempts + 1,
								notes: [
									...f.notes,
									{
										id: `n_${Date.now()}`,
										createdAt: new Date().toISOString(),
										type: method,
										content: `${method} follow-up sent`,
										createdBy: "Current User",
									},
								],
							}
						: f
				)
			);

			toast({
				title: "Follow-up Sent",
				description: `${method} follow-up has been sent to ${followUp.customer.name}.`,
			});
		}
	};

	const handleUpdateStatus = (followUpId, newStatus) => {
		setFollowUps(
			followUps.map((f) =>
				f.id === followUpId
					? {
							...f,
							followUpStatus: newStatus,
						}
					: f
			)
		);

		toast({
			title: "Status Updated",
			description: "Follow-up status has been updated.",
		});
	};

	const handleToggleAutomation = (followUpId) => {
		setFollowUps(
			followUps.map((f) =>
				f.id === followUpId
					? {
							...f,
							automationRules: {
								...f.automationRules,
								enabled: !f.automationRules.enabled,
							},
						}
					: f
			)
		);

		toast({
			title: "Automation Updated",
			description: "Follow-up automation has been toggled.",
		});
	};

	const handleBulkAction = (action) => {
		switch (action) {
			case "send_email":
				selectedFollowUps.forEach((id) => handleSendFollowUp(id, "email"));
				break;
			case "mark_hot":
				selectedFollowUps.forEach((id) => handleUpdateStatus(id, "hot_lead"));
				break;
			case "enable_automation":
				setFollowUps(
					followUps.map((f) =>
						selectedFollowUps.includes(f.id)
							? {
									...f,
									automationRules: { ...f.automationRules, enabled: true },
								}
							: f
					)
				);
				break;
		}

		setSelectedFollowUps([]);
		toast({
			title: "Bulk Action Completed",
			description: `${action.replace("_", " ")} applied to ${selectedFollowUps.length} follow-ups.`,
		});
	};

	return (
		<div className="w-full py-8 space-y-8">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Estimate Follow-ups</h1>
					<p className="text-muted-foreground">Manage customer follow-ups and conversion tracking</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => router.push("/dashboard/business/estimates/follow-ups/automation")}>
						<Zap className="mr-2 w-4 h-4" />
						Automation Rules
					</Button>
					<Button onClick={() => router.push("/dashboard/business/estimates/create")}>
						<Plus className="mr-2 w-4 h-4" />
						Create Estimate
					</Button>
				</div>
			</div>

			{/* Dashboard Stats */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
				<Card>
					<CardContent className="p-4">
						<div className="flex justify-between items-center">
							<div>
								<p className="text-sm text-muted-foreground">Total Follow-ups</p>
								<p className="text-2xl font-bold">{dashboardStats.total}</p>
							</div>
							<FileText className="w-8 h-8 text-primary" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex justify-between items-center">
							<div>
								<p className="text-sm text-muted-foreground">Overdue</p>
								<p className="text-2xl font-bold text-destructive">{dashboardStats.overdue}</p>
							</div>
							<AlertTriangle className="w-8 h-8 text-destructive" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex justify-between items-center">
							<div>
								<p className="text-sm text-muted-foreground">Hot Leads</p>
								<p className="text-2xl font-bold text-success">{dashboardStats.hotLeads}</p>
							</div>
							<Star className="w-8 h-8 text-success" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex justify-between items-center">
							<div>
								<p className="text-sm text-muted-foreground">Conversion Rate</p>
								<p className="text-2xl font-bold text-success">{dashboardStats.conversionRate}%</p>
							</div>
							<Target className="w-8 h-8 text-success" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex justify-between items-center">
							<div>
								<p className="text-sm text-muted-foreground">Automation</p>
								<p className="text-2xl font-bold text-primary">{dashboardStats.automationEnabled}</p>
							</div>
							<Zap className="w-8 h-8 text-primary" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters and Search */}
			<Card>
				<CardContent className="p-6">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<div className="flex flex-1 gap-4 items-center">
							<div className="relative flex-1 max-w-sm">
								<Search className="absolute left-3 top-1/2 w-4 h-4 text-muted-foreground transform -translate-y-1/2" />
								<Input placeholder="Search follow-ups..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
							</div>
							<Select value={filterStatus} onValueChange={setFilterStatus}>
								<SelectTrigger className="w-40">
									<SelectValue placeholder="Filter by status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Status</SelectItem>
									<SelectItem value="overdue">Overdue</SelectItem>
									<SelectItem value="scheduled">Scheduled</SelectItem>
									<SelectItem value="hot_lead">Hot Leads</SelectItem>
									<SelectItem value="expired">Expired</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{selectedFollowUps.length > 0 && (
							<div className="flex gap-2 items-center">
								<span className="text-sm text-muted-foreground">{selectedFollowUps.length} selected</span>
								<Button variant="outline" size="sm" onClick={() => handleBulkAction("send_email")}>
									<Mail className="mr-1 w-4 h-4" />
									Send Email
								</Button>
								<Button variant="outline" size="sm" onClick={() => handleBulkAction("mark_hot")}>
									<Star className="mr-1 w-4 h-4" />
									Mark Hot
								</Button>
								<Button variant="outline" size="sm" onClick={() => handleBulkAction("enable_automation")}>
									<Zap className="mr-1 w-4 h-4" />
									Enable Auto
								</Button>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList>
					<TabsTrigger value="overdue">Overdue ({dashboardStats.overdue})</TabsTrigger>
					<TabsTrigger value="scheduled">Scheduled ({dashboardStats.scheduled})</TabsTrigger>
					<TabsTrigger value="hot_leads">Hot Leads ({dashboardStats.hotLeads})</TabsTrigger>
					<TabsTrigger value="expired">Expired ({dashboardStats.expired})</TabsTrigger>
					<TabsTrigger value="all">All ({dashboardStats.total})</TabsTrigger>
				</TabsList>

				<TabsContent value={activeTab} className="mt-6">
					{/* Follow-ups List */}
					<div className="space-y-4">
						{filteredFollowUps.map((followUp) => (
							<Card key={followUp.id} className="hover:shadow-md transition-shadow">
								<CardContent className="p-6">
									<div className="flex gap-4 items-start">
										<Checkbox
											checked={selectedFollowUps.includes(followUp.id)}
											onCheckedChange={(checked) => {
												setSelectedFollowUps(checked ? [...selectedFollowUps, followUp.id] : selectedFollowUps.filter((id) => id !== followUp.id));
											}}
										/>

										<div className="flex-1 space-y-4">
											{/* Header */}
											<div className="flex justify-between items-start">
												<div className="flex gap-4 items-start">
													<Avatar className="w-12 h-12">
														<AvatarImage src={followUp.customer.avatar} />
														<AvatarFallback>
															{followUp.customer.name
																.split(" ")
																.map((n) => n[0])
																.join("")}
														</AvatarFallback>
													</Avatar>
													<div>
														<h3 className="text-lg font-semibold">{followUp.job.title}</h3>
														<p className="text-muted-foreground">{followUp.customer.name}</p>
														<p className="text-sm text-muted-foreground">{followUp.estimate.number}</p>
													</div>
												</div>
												<div className="flex gap-2 items-center">
													<Badge className={getStatusColor(followUp.followUpStatus)}>
														{getStatusIcon(followUp.followUpStatus)}
														<span className="ml-1">{followUp.followUpStatus.replace("_", " ")}</span>
													</Badge>
													<Badge variant="outline" className={getPriorityColor(followUp.job.priority)}>
														{followUp.job.priority}
													</Badge>
													{followUp.automationRules.enabled && (
														<Badge variant="outline" className="text-primary">
															<Zap className="mr-1 w-3 h-3" />
															Auto
														</Badge>
													)}
												</div>
											</div>

											{/* Metrics */}
											<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
												<div className="flex gap-2 items-center">
													<DollarSign className="w-4 h-4 text-muted-foreground" />
													<span className="text-sm">
														<span className="font-medium">{formatCurrency(followUp.estimate.total)}</span>
													</span>
												</div>
												<div className="flex gap-2 items-center">
													<Target className="w-4 h-4 text-muted-foreground" />
													<span className={`text-sm font-medium ${getConversionColor(followUp.conversionProbability)}`}>{followUp.conversionProbability}% conversion</span>
												</div>
												<div className="flex gap-2 items-center">
													<Timer className="w-4 h-4 text-muted-foreground" />
													<span className="text-sm">{followUp.contactAttempts} contacts</span>
												</div>
												<div className="flex gap-2 items-center">
													<BarChart3 className="w-4 h-4 text-muted-foreground" />
													<span className={`text-sm font-medium ${getEngagementColor(getEngagementScore(followUp.engagement))}`}>{getEngagementScore(followUp.engagement)}% engagement</span>
												</div>
											</div>

											{/* Timeline and Next Action */}
											<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
												<div className="p-3 bg-muted/50 rounded-lg">
													<p className="text-xs text-muted-foreground mb-1">Last Contact</p>
													<p className="text-sm font-medium">{formatDate(followUp.lastContact)}</p>
													{followUp.nextFollowUp && (
														<>
															<p className="text-xs text-muted-foreground mt-2 mb-1">Next Follow-up</p>
															<p className="text-sm font-medium text-primary">{formatDate(followUp.nextFollowUp)}</p>
														</>
													)}
												</div>

												<div className="p-3 bg-muted/50 rounded-lg">
													<p className="text-xs text-muted-foreground mb-1">Customer Engagement</p>
													<div className="grid grid-cols-3 gap-2 text-xs">
														<div>
															<p className="font-medium">{followUp.engagement.emailOpens}</p>
															<p className="text-muted-foreground">Opens</p>
														</div>
														<div>
															<p className="font-medium">{followUp.engagement.emailClicks}</p>
															<p className="text-muted-foreground">Clicks</p>
														</div>
														<div>
															<p className="font-medium">{followUp.engagement.websiteVisits}</p>
															<p className="text-muted-foreground">Visits</p>
														</div>
													</div>
												</div>
											</div>

											{/* Recent Notes */}
											{followUp.notes.length > 0 && (
												<div>
													<p className="text-sm font-medium mb-2">Recent Activity</p>
													<div className="space-y-2">
														{followUp.notes.slice(-2).map((note) => (
															<div key={note.id} className="p-2 bg-blue-50 dark:bg-primary rounded text-sm">
																<div className="flex justify-between items-start mb-1">
																	<Badge variant="outline" className="text-xs">
																		{note.type}
																	</Badge>
																	<span className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</span>
																</div>
																<p>{note.content}</p>
																<p className="text-xs text-muted-foreground mt-1">by {note.createdBy}</p>
															</div>
														))}
													</div>
												</div>
											)}

											{/* Actions */}
											<div className="flex justify-between items-center">
												<div className="flex gap-2 items-center">
													<Badge variant="outline" className="text-xs">
														{followUp.customer.preferredContact}
													</Badge>
													{followUp.automationRules.enabled && (
														<Badge variant="outline" className="text-xs">
															{followUp.automationRules.sequence} sequence
														</Badge>
													)}
												</div>

												<div className="flex gap-2">
													<Button variant="outline" size="sm" onClick={() => handleSendFollowUp(followUp.id, "email")}>
														<Mail className="w-4 h-4" />
													</Button>
													<Button variant="outline" size="sm" onClick={() => handleSendFollowUp(followUp.id, "phone")}>
														<Phone className="w-4 h-4" />
													</Button>
													<Button variant="outline" size="sm" onClick={() => handleSendFollowUp(followUp.id, "text")}>
														<MessageSquare className="w-4 h-4" />
													</Button>
													<Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/business/estimates/${followUp.estimate.id}`)}>
														<Eye className="w-4 h-4" />
													</Button>
													<Button variant="ghost" size="sm" onClick={() => handleToggleAutomation(followUp.id)}>
														<Zap className={`w-4 h-4 ${followUp.automationRules.enabled ? "text-primary" : "text-muted-foreground"}`} />
													</Button>
												</div>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						))}

						{filteredFollowUps.length === 0 && (
							<Card>
								<CardContent className="p-12 text-center">
									<Clock className="mx-auto mb-4 w-12 h-12 text-muted-foreground" />
									<h3 className="mb-2 text-lg font-semibold">No follow-ups found</h3>
									<p className="mb-6 text-muted-foreground">{searchTerm || filterStatus !== "all" ? "Try adjusting your filters" : "No follow-ups match the current criteria"}</p>
								</CardContent>
							</Card>
						)}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
