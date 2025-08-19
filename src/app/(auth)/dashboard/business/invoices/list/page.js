"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { Search, Plus, MoreHorizontal, Eye, Edit3, Send, Download, Trash2, Copy, Clock, Building, User, AlertTriangle, CheckCircle, FileText, TrendingUp, TrendingDown } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";

// Mock invoice data
const mockInvoices = [
	{
		id: "INV-001",
		number: "INV-2024-001",
		customer: {
			id: "CUST001",
			name: "TechCorp Inc.",
			type: "commercial",
			email: "billing@techcorp.com",
		},
		issueDate: "2024-01-15T00:00:00Z",
		dueDate: "2024-02-14T00:00:00Z",
		amount: 1250.0,
		paidAmount: 1250.0,
		status: "paid",
		lineItems: 3,
		jobId: "JOB001",
		poNumber: "PO-2024-156",
		lastModified: "2024-01-15T10:30:00Z",
	},
	{
		id: "INV-002",
		number: "INV-2024-002",
		customer: {
			id: "CUST002",
			name: "Sarah Miller",
			type: "residential",
			email: "sarah.miller@email.com",
		},
		issueDate: "2024-01-18T00:00:00Z",
		dueDate: "2024-02-17T00:00:00Z",
		amount: 325.5,
		paidAmount: 0,
		status: "sent",
		lineItems: 2,
		jobId: "JOB002",
		poNumber: null,
		lastModified: "2024-01-18T14:15:00Z",
	},
	{
		id: "INV-003",
		number: "INV-2024-003",
		customer: {
			id: "CUST003",
			name: "Metro Restaurant",
			type: "commercial",
			email: "accounting@metrorestaurant.com",
		},
		issueDate: "2024-01-20T00:00:00Z",
		dueDate: "2024-01-25T00:00:00Z",
		amount: 850.0,
		paidAmount: 0,
		status: "overdue",
		lineItems: 4,
		jobId: "JOB003",
		poNumber: "MR-2024-003",
		lastModified: "2024-01-20T09:45:00Z",
	},
	{
		id: "INV-004",
		number: "INV-2024-004",
		customer: {
			id: "CUST001",
			name: "TechCorp Inc.",
			type: "commercial",
			email: "billing@techcorp.com",
		},
		issueDate: "2024-01-22T00:00:00Z",
		dueDate: "2024-02-21T00:00:00Z",
		amount: 2100.0,
		paidAmount: 1000.0,
		status: "partial",
		lineItems: 5,
		jobId: "JOB004",
		poNumber: "PO-2024-189",
		lastModified: "2024-01-23T16:20:00Z",
	},
	{
		id: "INV-005",
		number: "INV-2024-005",
		customer: {
			id: "CUST004",
			name: "Green Valley Apartments",
			type: "commercial",
			email: "maintenance@greenvalley.com",
		},
		issueDate: "2024-01-25T00:00:00Z",
		dueDate: "2024-02-24T00:00:00Z",
		amount: 475.75,
		paidAmount: 0,
		status: "draft",
		lineItems: 2,
		jobId: null,
		poNumber: null,
		lastModified: "2024-01-25T11:30:00Z",
	},
];

// Summary statistics
const invoiceStats = {
	total: {
		count: mockInvoices.length,
		amount: mockInvoices.reduce((sum, inv) => sum + inv.amount, 0),
	},
	paid: {
		count: mockInvoices.filter((inv) => inv.status === "paid").length,
		amount: mockInvoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.paidAmount, 0),
	},
	outstanding: {
		count: mockInvoices.filter((inv) => ["sent", "overdue", "partial"].includes(inv.status)).length,
		amount: mockInvoices.filter((inv) => ["sent", "overdue", "partial"].includes(inv.status)).reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0),
	},
	overdue: {
		count: mockInvoices.filter((inv) => inv.status === "overdue").length,
		amount: mockInvoices.filter((inv) => inv.status === "overdue").reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0),
	},
};

export default function InvoicesList() {
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [customerFilter, setCustomerFilter] = useState("all");
	const [selectedInvoices, setSelectedInvoices] = useState([]);
	const [sortBy, setSortBy] = useState("issueDate");
	const [sortOrder, setSortOrder] = useState("desc");

	// Filter invoices
	const filteredInvoices = mockInvoices.filter((invoice) => {
		const matchesSearch = invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) || invoice.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || (invoice.poNumber && invoice.poNumber.toLowerCase().includes(searchQuery.toLowerCase()));

		const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
		const matchesCustomer = customerFilter === "all" || invoice.customer.type === customerFilter;

		return matchesSearch && matchesStatus && matchesCustomer;
	});

	// Sort invoices
	const sortedInvoices = [...filteredInvoices].sort((a, b) => {
		let aValue = a[sortBy];
		let bValue = b[sortBy];

		if (sortBy === "customer") {
			aValue = a.customer.name;
			bValue = b.customer.name;
		} else if (sortBy === "amount") {
			aValue = a.amount;
			bValue = b.amount;
		} else if (["issueDate", "dueDate"].includes(sortBy)) {
			aValue = new Date(aValue);
			bValue = new Date(bValue);
		}

		if (sortOrder === "asc") {
			return aValue > bValue ? 1 : -1;
		} else {
			return aValue < bValue ? 1 : -1;
		}
	});

	const getStatusColor = (status) => {
		switch (status) {
			case "paid":
				return "bg-success";
			case "sent":
				return "bg-primary";
			case "partial":
				return "bg-warning";
			case "overdue":
				return "bg-destructive";
			case "draft":
				return "bg-muted-foreground";
			default:
				return "bg-muted-foreground";
		}
	};

	const getStatusIcon = (status) => {
		switch (status) {
			case "paid":
				return <CheckCircle className="w-4 h-4" />;
			case "sent":
				return <Send className="w-4 h-4" />;
			case "partial":
				return <Clock className="w-4 h-4" />;
			case "overdue":
				return <AlertTriangle className="w-4 h-4" />;
			case "draft":
				return <FileText className="w-4 h-4" />;
			default:
				return <FileText className="w-4 h-4" />;
		}
	};

	const getDaysUntilDue = (invoice) => {
		const today = new Date();
		const dueDate = parseISO(invoice.dueDate);
		return differenceInDays(dueDate, today);
	};

	const handleBulkAction = (action) => {
		console.log(`Performing ${action} on invoices:`, selectedInvoices);
		// Implement bulk actions
		setSelectedInvoices([]);
	};

	const toggleInvoiceSelection = (invoiceId) => {
		setSelectedInvoices((prev) => (prev.includes(invoiceId) ? prev.filter((id) => id !== invoiceId) : [...prev, invoiceId]));
	};

	const selectAllInvoices = () => {
		if (selectedInvoices.length === sortedInvoices.length) {
			setSelectedInvoices([]);
		} else {
			setSelectedInvoices(sortedInvoices.map((inv) => inv.id));
		}
	};

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Invoices</h1>
					<p className="text-muted-foreground">Manage and track all your invoices</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" size="sm">
						<Download className="w-4 h-4 mr-2" />
						Export
					</Button>
					<Button>
						<Plus className="w-4 h-4 mr-2" />
						New Invoice
					</Button>
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Total Invoices</p>
								<p className="text-2xl font-bold">{invoiceStats.total.count}</p>
								<p className="text-xs text-muted-foreground">${invoiceStats.total.amount.toLocaleString()}</p>
							</div>
							<FileText className="w-8 h-8 text-primary" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Paid</p>
								<p className="text-2xl font-bold text-success">{invoiceStats.paid.count}</p>
								<p className="text-xs text-muted-foreground">${invoiceStats.paid.amount.toLocaleString()}</p>
							</div>
							<CheckCircle className="w-8 h-8 text-success" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Outstanding</p>
								<p className="text-2xl font-bold text-warning">{invoiceStats.outstanding.count}</p>
								<p className="text-xs text-muted-foreground">${invoiceStats.outstanding.amount.toLocaleString()}</p>
							</div>
							<Clock className="w-8 h-8 text-warning" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Overdue</p>
								<p className="text-2xl font-bold text-destructive">{invoiceStats.overdue.count}</p>
								<p className="text-xs text-muted-foreground">${invoiceStats.overdue.amount.toLocaleString()}</p>
							</div>
							<AlertTriangle className="w-8 h-8 text-destructive" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters and Search */}
			<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
				<div className="flex flex-1 gap-4 items-center max-w-2xl">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
						<Input placeholder="Search invoices, customers, or PO numbers..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
					</div>

					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-32">
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Status</SelectItem>
							<SelectItem value="paid">Paid</SelectItem>
							<SelectItem value="sent">Sent</SelectItem>
							<SelectItem value="partial">Partial</SelectItem>
							<SelectItem value="overdue">Overdue</SelectItem>
							<SelectItem value="draft">Draft</SelectItem>
						</SelectContent>
					</Select>

					<Select value={customerFilter} onValueChange={setCustomerFilter}>
						<SelectTrigger className="w-40">
							<SelectValue placeholder="Customer Type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Customers</SelectItem>
							<SelectItem value="commercial">Commercial</SelectItem>
							<SelectItem value="residential">Residential</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{selectedInvoices.length > 0 && (
					<div className="flex gap-2">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm">
									Bulk Actions ({selectedInvoices.length})
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem onClick={() => handleBulkAction("send")}>
									<Send className="w-4 h-4 mr-2" />
									Send Invoices
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => handleBulkAction("download")}>
									<Download className="w-4 h-4 mr-2" />
									Download PDFs
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={() => handleBulkAction("delete")} className="text-destructive">
									<Trash2 className="w-4 h-4 mr-2" />
									Delete Invoices
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				)}
			</div>

			{/* Invoices Table */}
			<Card>
				<CardHeader>
					<div className="flex justify-between items-center">
						<div>
							<CardTitle>Invoice List</CardTitle>
							<CardDescription>
								{sortedInvoices.length} of {mockInvoices.length} invoices
							</CardDescription>
						</div>
						<div className="flex gap-2">
							<Select value={sortBy} onValueChange={setSortBy}>
								<SelectTrigger className="w-40">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="issueDate">Issue Date</SelectItem>
									<SelectItem value="dueDate">Due Date</SelectItem>
									<SelectItem value="customer">Customer</SelectItem>
									<SelectItem value="amount">Amount</SelectItem>
									<SelectItem value="status">Status</SelectItem>
								</SelectContent>
							</Select>
							<Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
								{sortOrder === "asc" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
							</Button>
						</div>
					</div>
				</CardHeader>

				<CardContent className="p-0">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="border-b bg-muted/50">
								<tr className="text-left">
									<th className="p-4">
										<input type="checkbox" checked={selectedInvoices.length === sortedInvoices.length && sortedInvoices.length > 0} onChange={selectAllInvoices} className="rounded border-border" />
									</th>
									<th className="p-4 font-medium">Invoice</th>
									<th className="p-4 font-medium">Customer</th>
									<th className="p-4 font-medium">Issue Date</th>
									<th className="p-4 font-medium">Due Date</th>
									<th className="p-4 font-medium">Amount</th>
									<th className="p-4 font-medium">Status</th>
									<th className="p-4 font-medium">Actions</th>
								</tr>
							</thead>
							<tbody>
								{sortedInvoices.map((invoice) => {
									const daysUntilDue = getDaysUntilDue(invoice);
									return (
										<tr key={invoice.id} className="border-b hover:bg-muted/50">
											<td className="p-4">
												<input type="checkbox" checked={selectedInvoices.includes(invoice.id)} onChange={() => toggleInvoiceSelection(invoice.id)} className="rounded border-border" />
											</td>

											<td className="p-4">
												<div>
													<p className="font-medium">{invoice.number}</p>
													{invoice.poNumber && <p className="text-xs text-muted-foreground">PO: {invoice.poNumber}</p>}
													{invoice.jobId && <p className="text-xs text-muted-foreground">Job: {invoice.jobId}</p>}
												</div>
											</td>

											<td className="p-4">
												<div className="flex items-center gap-2">
													{invoice.customer.type === "commercial" ? <Building className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-success" />}
													<div>
														<p className="font-medium">{invoice.customer.name}</p>
														<p className="text-xs text-muted-foreground">{invoice.customer.email}</p>
													</div>
												</div>
											</td>

											<td className="p-4">
												<p className="text-sm">{format(parseISO(invoice.issueDate), "MMM d, yyyy")}</p>
											</td>

											<td className="p-4">
												<div>
													<p className="text-sm">{format(parseISO(invoice.dueDate), "MMM d, yyyy")}</p>
													{invoice.status !== "paid" && <p className={`text-xs ${daysUntilDue < 0 ? "text-destructive" : daysUntilDue < 7 ? "text-warning" : "text-muted-foreground"}`}>{daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : daysUntilDue === 0 ? "Due today" : `${daysUntilDue} days left`}</p>}
												</div>
											</td>

											<td className="p-4">
												<div>
													<p className="font-medium">${invoice.amount.toLocaleString()}</p>
													{invoice.paidAmount > 0 && invoice.status !== "paid" && <p className="text-xs text-muted-foreground">${invoice.paidAmount.toLocaleString()} paid</p>}
												</div>
											</td>

											<td className="p-4">
												<div className="flex items-center gap-1">
													{getStatusIcon(invoice.status)}
													<Badge className={getStatusColor(invoice.status)} variant="secondary">
														{invoice.status}
													</Badge>
												</div>
											</td>

											<td className="p-4">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="sm">
															<MoreHorizontal className="w-4 h-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuLabel>Actions</DropdownMenuLabel>
														<DropdownMenuSeparator />
														<DropdownMenuItem>
															<Eye className="w-4 h-4 mr-2" />
															View Invoice
														</DropdownMenuItem>
														<DropdownMenuItem>
															<Edit3 className="w-4 h-4 mr-2" />
															Edit Invoice
														</DropdownMenuItem>
														<DropdownMenuItem>
															<Copy className="w-4 h-4 mr-2" />
															Duplicate
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														{invoice.status !== "paid" && (
															<DropdownMenuItem>
																<Send className="w-4 h-4 mr-2" />
																Send to Customer
															</DropdownMenuItem>
														)}
														<DropdownMenuItem>
															<Download className="w-4 h-4 mr-2" />
															Download PDF
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem className="text-destructive">
															<Trash2 className="w-4 h-4 mr-2" />
															Delete Invoice
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>

					{sortedInvoices.length === 0 && (
						<div className="text-center py-12">
							<FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
							<h3 className="text-lg font-medium text-foreground mb-2">No invoices found</h3>
							<p className="text-muted-foreground mb-4">{searchQuery || statusFilter !== "all" || customerFilter !== "all" ? "Try adjusting your search criteria" : "Get started by creating your first invoice"}</p>
							{!searchQuery && statusFilter === "all" && customerFilter === "all" && (
								<Button>
									<Plus className="w-4 h-4 mr-2" />
									Create First Invoice
								</Button>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
