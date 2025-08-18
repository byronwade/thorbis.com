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
import { CheckCircle, XCircle, Clock, AlertTriangle, DollarSign, Calendar, FileText, Eye, Edit, Send, MessageSquare, Search, Download, Target, Timer } from "lucide-react";
import { toast } from "@components/ui/use-toast";

export default function EstimateApprovals() {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("pending");
	const [searchTerm, setSearchTerm] = useState("");
	const [filterPriority, setFilterPriority] = useState("all");
	const [selectedEstimates, setSelectedEstimates] = useState([]);

	// Mock estimates data with approval workflow
	const [estimates, setEstimates] = useState([
		{
			id: "est_001",
			number: "EST-2024-001",
			customer: {
				id: "c_001",
				name: "John Smith",
				email: "john@email.com",
				phone: "(555) 123-4567",
				address: "123 Main St, Anytown, ST 12345",
				avatar: "/placeholder.svg",
			},
			job: {
				title: "Kitchen Faucet Replacement",
				description: "Replace old kitchen faucet with new stainless steel model",
				serviceType: "Plumbing",
				priority: "medium",
				estimatedDuration: "2 hours",
			},
			pricing: {
				subtotal: 350.0,
				tax: 28.88,
				discount: 0,
				total: 378.88,
			},
			status: "pending_approval",
			createdAt: "2024-01-05T10:30:00",
			validUntil: "2024-02-05",
			sentAt: "2024-01-05T10:35:00",
			approvalRequest: {
				requestedAt: "2024-01-05T10:35:00",
				viewedAt: "2024-01-05T14:20:00",
				remindersSent: 1,
				lastReminderAt: "2024-01-07T09:00:00",
				requiresManagerApproval: false,
			},
			technician: {
				id: "t_001",
				name: "Mike Rodriguez",
				avatar: "/placeholder.svg",
			},
			conversionProbability: 85,
			followUpNotes: "Customer asked about warranty options",
			lineItems: [
				{ name: "Kitchen Faucet", quantity: 1, unitPrice: 180, total: 180 },
				{ name: "Installation Labor", quantity: 2, unitPrice: 85, total: 170 },
			],
		},
		{
			id: "est_002",
			number: "EST-2024-002",
			customer: {
				id: "c_002",
				name: "Sarah Johnson",
				email: "sarah@email.com",
				phone: "(555) 234-5678",
				address: "456 Oak Ave, Anytown, ST 12345",
				avatar: "/placeholder.svg",
			},
			job: {
				title: "HVAC System Inspection",
				description: "Annual maintenance and inspection of HVAC system",
				serviceType: "HVAC",
				priority: "low",
				estimatedDuration: "3 hours",
			},
			pricing: {
				subtotal: 450.0,
				tax: 37.13,
				discount: 50.0,
				total: 437.13,
			},
			status: "approved",
			createdAt: "2024-01-04T14:15:00",
			validUntil: "2024-02-04",
			sentAt: "2024-01-04T14:20:00",
			approvalRequest: {
				requestedAt: "2024-01-04T14:20:00",
				viewedAt: "2024-01-04T16:45:00",
				approvedAt: "2024-01-04T17:30:00",
				remindersSent: 0,
				requiresManagerApproval: false,
			},
			technician: {
				id: "t_002",
				name: "Alex Johnson",
				avatar: "/placeholder.svg",
			},
			conversionProbability: 95,
			followUpNotes: "Customer ready to schedule immediately",
			lineItems: [
				{ name: "HVAC Inspection", quantity: 1, unitPrice: 200, total: 200 },
				{ name: "Filter Replacement", quantity: 2, unitPrice: 25, total: 50 },
				{ name: "System Cleaning", quantity: 1, unitPrice: 150, total: 150 },
				{ name: "Labor", quantity: 3, unitPrice: 50, total: 150 },
			],
		},
		{
			id: "est_003",
			number: "EST-2024-003",
			customer: {
				id: "c_003",
				name: "Mike Davis",
				email: "mike@email.com",
				phone: "(555) 345-6789",
				address: "789 Pine St, Anytown, ST 12345",
				avatar: "/placeholder.svg",
			},
			job: {
				title: "Emergency Plumbing Repair",
				description: "Fix burst pipe in basement",
				serviceType: "Plumbing",
				priority: "urgent",
				estimatedDuration: "4 hours",
			},
			pricing: {
				subtotal: 850.0,
				tax: 70.13,
				discount: 0,
				total: 920.13,
			},
			status: "rejected",
			createdAt: "2024-01-03T09:45:00",
			validUntil: "2024-02-03",
			sentAt: "2024-01-03T09:50:00",
			approvalRequest: {
				requestedAt: "2024-01-03T09:50:00",
				viewedAt: "2024-01-03T11:20:00",
				rejectedAt: "2024-01-03T12:15:00",
				rejectionReason: "Price too high, looking for other quotes",
				remindersSent: 0,
				requiresManagerApproval: true,
			},
			technician: {
				id: "t_003",
				name: "Sarah Davis",
				avatar: "/placeholder.svg",
			},
			conversionProbability: 35,
			followUpNotes: "Customer shopping around for better price",
			lineItems: [
				{ name: "Emergency Service Call", quantity: 1, unitPrice: 150, total: 150 },
				{ name: "Pipe Replacement", quantity: 10, unitPrice: 25, total: 250 },
				{ name: "Emergency Labor", quantity: 4, unitPrice: 112.5, total: 450 },
			],
		},
		{
			id: "est_004",
			number: "EST-2024-004",
			customer: {
				id: "c_004",
				name: "Lisa Chen",
				email: "lisa@email.com",
				phone: "(555) 456-7890",
				address: "321 Elm Dr, Anytown, ST 12345",
				avatar: "/placeholder.svg",
			},
			job: {
				title: "Electrical Panel Upgrade",
				description: "Upgrade electrical panel to 200 amp service",
				serviceType: "Electrical",
				priority: "high",
				estimatedDuration: "6 hours",
			},
			pricing: {
				subtotal: 2500.0,
				tax: 206.25,
				discount: 250.0,
				total: 2456.25,
			},
			status: "pending_approval",
			createdAt: "2024-01-06T08:00:00",
			validUntil: "2024-02-06",
			sentAt: "2024-01-06T08:05:00",
			approvalRequest: {
				requestedAt: "2024-01-06T08:05:00",
				viewedAt: null,
				remindersSent: 2,
				lastReminderAt: "2024-01-08T10:00:00",
				requiresManagerApproval: true,
			},
			technician: {
				id: "t_004",
				name: "Tom Wilson",
				avatar: "/placeholder.svg",
			},
			conversionProbability: 70,
			followUpNotes: "Customer interested but wants time to consider",
			lineItems: [
				{ name: "200 Amp Panel", quantity: 1, unitPrice: 800, total: 800 },
				{ name: "Installation Materials", quantity: 1, unitPrice: 300, total: 300 },
				{ name: "Electrical Labor", quantity: 6, unitPrice: 125, total: 750 },
				{ name: "Permit Fees", quantity: 1, unitPrice: 150, total: 150 },
				{ name: "Inspection", quantity: 1, unitPrice: 100, total: 100 },
			],
		},
	]);

	// Dashboard stats
	const [dashboardStats, setDashboardStats] = useState({
		total: estimates.length,
		pending: estimates.filter((est) => est.status === "pending_approval").length,
		approved: estimates.filter((est) => est.status === "approved").length,
		rejected: estimates.filter((est) => est.status === "rejected").length,
		totalValue: estimates.reduce((sum, est) => sum + est.pricing.total, 0),
		avgApprovalTime: "2.5 days",
		approvalRate: 67.5,
		conversionRate: 82.3,
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
			year: "numeric",
		}).format(new Date(dateString));
	};

	const formatDateTime = (dateString) => {
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
			case "pending_approval":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
			case "approved":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
			case "rejected":
				return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
			default:
				return "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground";
		}
	};

	const getStatusIcon = (status) => {
		switch (status) {
			case "pending_approval":
				return <Clock className="w-4 h-4" />;
			case "approved":
				return <CheckCircle className="w-4 h-4" />;
			case "rejected":
				return <XCircle className="w-4 h-4" />;
			default:
				return <AlertTriangle className="w-4 h-4" />;
		}
	};

	const getPriorityColor = (priority) => {
		switch (priority) {
			case "urgent":
				return "text-red-600 dark:text-red-400";
			case "high":
				return "text-orange-600 dark:text-orange-400";
			case "medium":
				return "text-yellow-600 dark:text-yellow-400";
			case "low":
				return "text-green-600 dark:text-green-400";
			default:
				return "text-muted-foreground dark:text-muted-foreground";
		}
	};

	const getConversionColor = (probability) => {
		if (probability >= 80) return "text-green-600 dark:text-green-400";
		if (probability >= 60) return "text-yellow-600 dark:text-yellow-400";
		return "text-red-600 dark:text-red-400";
	};

	const getDaysOverdue = (validUntil) => {
		const today = new Date();
		const expiry = new Date(validUntil);
		const diffTime = today - expiry;
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays > 0 ? diffDays : 0;
	};

	const filteredEstimates = estimates.filter((estimate) => {
		const matchesSearch = estimate.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || estimate.job.title.toLowerCase().includes(searchTerm.toLowerCase()) || estimate.number.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesPriority = filterPriority === "all" || estimate.job.priority === filterPriority;

		const matchesTab = activeTab === "all" || (activeTab === "pending" && estimate.status === "pending_approval") || (activeTab === "approved" && estimate.status === "approved") || (activeTab === "rejected" && estimate.status === "rejected");

		return matchesSearch && matchesPriority && matchesTab;
	});

	const handleSendReminder = (estimateId) => {
		setEstimates(
			estimates.map((est) =>
				est.id === estimateId
					? {
							...est,
							approvalRequest: {
								...est.approvalRequest,
								remindersSent: est.approvalRequest.remindersSent + 1,
								lastReminderAt: new Date().toISOString(),
							},
						}
					: est
			)
		);

		toast({
			title: "Reminder Sent",
			description: "Follow-up reminder has been sent to the customer.",
		});
	};

	const handleBulkAction = (action) => {
		switch (action) {
			case "send_reminder":
				selectedEstimates.forEach((id) => handleSendReminder(id));
				break;
			case "mark_approved":
				setEstimates(
					estimates.map((est) =>
						selectedEstimates.includes(est.id)
							? {
									...est,
									status: "approved",
									approvalRequest: {
										...est.approvalRequest,
										approvedAt: new Date().toISOString(),
									},
								}
							: est
					)
				);
				break;
			case "mark_rejected":
				setEstimates(
					estimates.map((est) =>
						selectedEstimates.includes(est.id)
							? {
									...est,
									status: "rejected",
									approvalRequest: {
										...est.approvalRequest,
										rejectedAt: new Date().toISOString(),
									},
								}
							: est
					)
				);
				break;
		}

		setSelectedEstimates([]);
		toast({
			title: "Bulk Action Completed",
			description: `${action.replace("_", " ")} applied to ${selectedEstimates.length} estimates.`,
		});
	};

	return (
		<div className="py-8 mx-auto max-w-7xl space-y-8">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Estimate Approvals</h1>
					<p className="text-muted-foreground">Track and manage customer estimate approvals</p>
				</div>
				<Button onClick={() => router.push("/dashboard/business/estimates/create")}>
					<FileText className="mr-2 w-4 h-4" />
					Create Estimate
				</Button>
			</div>

			{/* Dashboard Stats */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex justify-between items-center">
							<div>
								<p className="text-sm text-muted-foreground">Total Estimates</p>
								<p className="text-2xl font-bold">{dashboardStats.total}</p>
							</div>
							<FileText className="w-8 h-8 text-blue-600" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex justify-between items-center">
							<div>
								<p className="text-sm text-muted-foreground">Pending Approval</p>
								<p className="text-2xl font-bold text-yellow-600">{dashboardStats.pending}</p>
							</div>
							<Clock className="w-8 h-8 text-yellow-600" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex justify-between items-center">
							<div>
								<p className="text-sm text-muted-foreground">Approval Rate</p>
								<p className="text-2xl font-bold text-green-600">{dashboardStats.approvalRate}%</p>
							</div>
							<Target className="w-8 h-8 text-green-600" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex justify-between items-center">
							<div>
								<p className="text-sm text-muted-foreground">Total Value</p>
								<p className="text-2xl font-bold">{formatCurrency(dashboardStats.totalValue)}</p>
							</div>
							<DollarSign className="w-8 h-8 text-green-600" />
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
								<Input placeholder="Search estimates..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
							</div>
							<Select value={filterPriority} onValueChange={setFilterPriority}>
								<SelectTrigger className="w-40">
									<SelectValue placeholder="Filter by priority" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Priorities</SelectItem>
									<SelectItem value="urgent">Urgent</SelectItem>
									<SelectItem value="high">High</SelectItem>
									<SelectItem value="medium">Medium</SelectItem>
									<SelectItem value="low">Low</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{selectedEstimates.length > 0 && (
							<div className="flex gap-2 items-center">
								<span className="text-sm text-muted-foreground">{selectedEstimates.length} selected</span>
								<Button variant="outline" size="sm" onClick={() => handleBulkAction("send_reminder")}>
									<Send className="mr-1 w-4 h-4" />
									Send Reminder
								</Button>
								<Button variant="outline" size="sm" onClick={() => handleBulkAction("mark_approved")}>
									<CheckCircle className="mr-1 w-4 h-4" />
									Mark Approved
								</Button>
								<Button variant="destructive" size="sm" onClick={() => handleBulkAction("mark_rejected")}>
									<XCircle className="mr-1 w-4 h-4" />
									Mark Rejected
								</Button>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList>
					<TabsTrigger value="pending">Pending ({dashboardStats.pending})</TabsTrigger>
					<TabsTrigger value="approved">Approved ({dashboardStats.approved})</TabsTrigger>
					<TabsTrigger value="rejected">Rejected ({dashboardStats.rejected})</TabsTrigger>
					<TabsTrigger value="all">All ({dashboardStats.total})</TabsTrigger>
				</TabsList>

				<TabsContent value={activeTab} className="mt-6">
					{/* Estimates List */}
					<div className="space-y-4">
						{filteredEstimates.map((estimate) => (
							<Card key={estimate.id} className="hover:shadow-md transition-shadow">
								<CardContent className="p-6">
									<div className="flex gap-4 items-start">
										<Checkbox
											checked={selectedEstimates.includes(estimate.id)}
											onCheckedChange={(checked) => {
												setSelectedEstimates(checked ? [...selectedEstimates, estimate.id] : selectedEstimates.filter((id) => id !== estimate.id));
											}}
										/>

										<div className="flex-1 space-y-4">
											{/* Header */}
											<div className="flex justify-between items-start">
												<div className="flex gap-4 items-start">
													<Avatar className="w-12 h-12">
														<AvatarImage src={estimate.customer.avatar} />
														<AvatarFallback>
															{estimate.customer.name
																.split(" ")
																.map((n) => n[0])
																.join("")}
														</AvatarFallback>
													</Avatar>
													<div>
														<h3 className="text-lg font-semibold">{estimate.job.title}</h3>
														<p className="text-muted-foreground">{estimate.customer.name}</p>
														<p className="text-sm text-muted-foreground">{estimate.number}</p>
													</div>
												</div>
												<div className="flex gap-2 items-center">
													<Badge className={getStatusColor(estimate.status)}>
														{getStatusIcon(estimate.status)}
														<span className="ml-1">{estimate.status.replace("_", " ")}</span>
													</Badge>
													<Badge variant="outline" className={getPriorityColor(estimate.job.priority)}>
														{estimate.job.priority}
													</Badge>
												</div>
											</div>

											{/* Estimate Details */}
											<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
												<div className="flex gap-2 items-center">
													<DollarSign className="w-4 h-4 text-muted-foreground" />
													<span className="text-sm">
														<span className="font-medium">{formatCurrency(estimate.pricing.total)}</span>
													</span>
												</div>
												<div className="flex gap-2 items-center">
													<Calendar className="w-4 h-4 text-muted-foreground" />
													<span className="text-sm">Valid until {formatDate(estimate.validUntil)}</span>
												</div>
												<div className="flex gap-2 items-center">
													<Timer className="w-4 h-4 text-muted-foreground" />
													<span className="text-sm">{estimate.job.estimatedDuration}</span>
												</div>
												<div className="flex gap-2 items-center">
													<Target className="w-4 h-4 text-muted-foreground" />
													<span className={`text-sm font-medium ${getConversionColor(estimate.conversionProbability)}`}>{estimate.conversionProbability}% conversion</span>
												</div>
											</div>

											{/* Approval Timeline */}
											<div className="p-4 bg-muted/50 rounded-lg">
												<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
													<div>
														<p className="text-xs text-muted-foreground">Sent</p>
														<p className="text-sm font-medium">{formatDateTime(estimate.sentAt)}</p>
													</div>
													{estimate.approvalRequest.viewedAt && (
														<div>
															<p className="text-xs text-muted-foreground">Viewed</p>
															<p className="text-sm font-medium">{formatDateTime(estimate.approvalRequest.viewedAt)}</p>
														</div>
													)}
													{estimate.approvalRequest.approvedAt && (
														<div>
															<p className="text-xs text-muted-foreground">Approved</p>
															<p className="text-sm font-medium text-green-600">{formatDateTime(estimate.approvalRequest.approvedAt)}</p>
														</div>
													)}
													{estimate.approvalRequest.rejectedAt && (
														<div>
															<p className="text-xs text-muted-foreground">Rejected</p>
															<p className="text-sm font-medium text-red-600">{formatDateTime(estimate.approvalRequest.rejectedAt)}</p>
														</div>
													)}
												</div>

												{estimate.status === "pending_approval" && (
													<div className="mt-3 text-sm">
														<p className="text-muted-foreground">
															Reminders sent: <span className="font-medium">{estimate.approvalRequest.remindersSent}</span>
															{estimate.approvalRequest.lastReminderAt && <span className="ml-2">Last: {formatDateTime(estimate.approvalRequest.lastReminderAt)}</span>}
														</p>
														{getDaysOverdue(estimate.validUntil) > 0 && (
															<div className="flex gap-2 items-center mt-2">
																<AlertTriangle className="w-4 h-4 text-red-500" />
																<span className="text-red-600 font-medium">Overdue by {getDaysOverdue(estimate.validUntil)} days</span>
															</div>
														)}
													</div>
												)}

												{estimate.approvalRequest.rejectionReason && (
													<div className="mt-3">
														<p className="text-xs text-muted-foreground">Rejection Reason</p>
														<p className="text-sm text-red-600">{estimate.approvalRequest.rejectionReason}</p>
													</div>
												)}
											</div>

											{/* Line Items Preview */}
											<div>
												<p className="text-sm font-medium mb-2">Line Items ({estimate.lineItems.length})</p>
												<div className="space-y-1">
													{estimate.lineItems.slice(0, 3).map((item, index) => (
														<div key={index} className="flex justify-between items-center text-sm">
															<span>
																{item.name} × {item.quantity}
															</span>
															<span className="font-medium">{formatCurrency(item.total)}</span>
														</div>
													))}
													{estimate.lineItems.length > 3 && <p className="text-xs text-muted-foreground">+{estimate.lineItems.length - 3} more items</p>}
												</div>
											</div>

											{/* Follow-up Notes */}
											{estimate.followUpNotes && (
												<div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
													<div className="flex gap-2 items-start">
														<MessageSquare className="w-4 h-4 text-blue-600 mt-0.5" />
														<div>
															<p className="text-xs text-blue-600 font-medium">Follow-up Notes</p>
															<p className="text-sm">{estimate.followUpNotes}</p>
														</div>
													</div>
												</div>
											)}

											{/* Actions */}
											<div className="flex justify-between items-center">
												<div className="flex gap-2 items-center">
													<Avatar className="w-6 h-6">
														<AvatarImage src={estimate.technician.avatar} />
														<AvatarFallback className="text-xs">
															{estimate.technician.name
																.split(" ")
																.map((n) => n[0])
																.join("")}
														</AvatarFallback>
													</Avatar>
													<span className="text-sm text-muted-foreground">{estimate.technician.name}</span>
													{estimate.approvalRequest.requiresManagerApproval && (
														<Badge variant="outline" className="text-xs">
															Manager Approval Required
														</Badge>
													)}
												</div>

												<div className="flex gap-2">
													<Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/business/estimates/${estimate.id}`)}>
														<Eye className="w-4 h-4" />
													</Button>
													<Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/business/estimates/${estimate.id}/edit`)}>
														<Edit className="w-4 h-4" />
													</Button>
													{estimate.status === "pending_approval" && (
														<Button variant="outline" size="sm" onClick={() => handleSendReminder(estimate.id)}>
															<Send className="w-4 h-4" />
														</Button>
													)}
													<Button variant="ghost" size="sm">
														<Download className="w-4 h-4" />
													</Button>
												</div>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						))}

						{filteredEstimates.length === 0 && (
							<Card>
								<CardContent className="p-12 text-center">
									<FileText className="mx-auto mb-4 w-12 h-12 text-muted-foreground" />
									<h3 className="mb-2 text-lg font-semibold">No estimates found</h3>
									<p className="mb-6 text-muted-foreground">{searchTerm || filterPriority !== "all" ? "Try adjusting your filters" : "No estimates match the current criteria"}</p>
								</CardContent>
							</Card>
						)}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
