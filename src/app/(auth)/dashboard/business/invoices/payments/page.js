"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Calendar } from "@components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { DollarSign, CreditCard, Calendar as CalendarIcon, Search, Plus, Download, MoreHorizontal, CheckCircle, Clock, AlertTriangle, Building, User, Banknote, Wallet, Receipt, Send } from "lucide-react";
import { format, parseISO } from "date-fns";

// Mock payment data
const mockPayments = [
	{
		id: "PAY-001",
		invoiceId: "INV-001",
		invoiceNumber: "INV-2024-001",
		customer: {
			id: "CUST001",
			name: "TechCorp Inc.",
			type: "commercial",
		},
		amount: 1250.0,
		method: "bank_transfer",
		status: "completed",
		receivedDate: "2024-01-20T14:30:00Z",
		reference: "BT-2024-001",
		notes: "Wire transfer received",
		processingFee: 0,
	},
	{
		id: "PAY-002",
		invoiceId: "INV-004",
		invoiceNumber: "INV-2024-004",
		customer: {
			id: "CUST001",
			name: "TechCorp Inc.",
			type: "commercial",
		},
		amount: 1000.0,
		method: "credit_card",
		status: "completed",
		receivedDate: "2024-01-23T10:15:00Z",
		reference: "CC-2024-002",
		notes: "Partial payment via credit card",
		processingFee: 29.0,
	},
	{
		id: "PAY-003",
		invoiceId: "INV-002",
		invoiceNumber: "INV-2024-002",
		customer: {
			id: "CUST002",
			name: "Sarah Miller",
			type: "residential",
		},
		amount: 325.5,
		method: "check",
		status: "pending",
		receivedDate: "2024-01-25T00:00:00Z",
		reference: "CHECK-1234",
		notes: "Check deposited, waiting for clearance",
		processingFee: 0,
	},
	{
		id: "PAY-004",
		invoiceId: "INV-005",
		invoiceNumber: "INV-2024-005",
		customer: {
			id: "CUST004",
			name: "Green Valley Apartments",
			type: "commercial",
		},
		amount: 475.75,
		method: "ach",
		status: "failed",
		receivedDate: "2024-01-24T09:00:00Z",
		reference: "ACH-2024-001",
		notes: "ACH payment failed - insufficient funds",
		processingFee: 2.5,
	},
];

// Outstanding invoices that need payment
const mockOutstandingInvoices = [
	{
		id: "INV-002",
		number: "INV-2024-002",
		customer: { name: "Sarah Miller", type: "residential" },
		amount: 325.5,
		dueDate: "2024-02-17T00:00:00Z",
		daysOverdue: 0,
	},
	{
		id: "INV-003",
		number: "INV-2024-003",
		customer: { name: "Metro Restaurant", type: "commercial" },
		amount: 850.0,
		dueDate: "2024-01-25T00:00:00Z",
		daysOverdue: 5,
	},
	{
		id: "INV-004",
		number: "INV-2024-004",
		customer: { name: "TechCorp Inc.", type: "commercial" },
		amount: 1100.0, // Remaining balance
		dueDate: "2024-02-21T00:00:00Z",
		daysOverdue: 0,
	},
];

export default function PaymentsPage() {
	const [activeTab, setActiveTab] = useState("received");
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [methodFilter, setMethodFilter] = useState("all");
	const [dateRange, setDateRange] = useState("30_days");
	const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
	const [selectedInvoice, setSelectedInvoice] = useState(null);

	// Payment form state
	const [paymentAmount, setPaymentAmount] = useState("");
	const [paymentMethod, setPaymentMethod] = useState("credit_card");
	const [paymentDate, setPaymentDate] = useState(new Date());
	const [paymentReference, setPaymentReference] = useState("");
	const [paymentNotes, setPaymentNotes] = useState("");

	// Filter payments based on search and filters
	const filteredPayments = mockPayments.filter((payment) => {
		const matchesSearch = payment.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) || payment.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || payment.reference.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
		const matchesMethod = methodFilter === "all" || payment.method === methodFilter;

		// Date range filtering would go here

		return matchesSearch && matchesStatus && matchesMethod;
	});

	// Calculate payment statistics
	const paymentStats = {
		total: {
			count: mockPayments.length,
			amount: mockPayments.reduce((sum, payment) => sum + payment.amount, 0),
		},
		completed: {
			count: mockPayments.filter((p) => p.status === "completed").length,
			amount: mockPayments.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0),
		},
		pending: {
			count: mockPayments.filter((p) => p.status === "pending").length,
			amount: mockPayments.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0),
		},
		failed: {
			count: mockPayments.filter((p) => p.status === "failed").length,
			amount: mockPayments.filter((p) => p.status === "failed").reduce((sum, p) => sum + p.amount, 0),
		},
	};

	const outstandingStats = {
		total: mockOutstandingInvoices.reduce((sum, inv) => sum + inv.amount, 0),
		overdue: mockOutstandingInvoices.filter((inv) => inv.daysOverdue > 0).reduce((sum, inv) => sum + inv.amount, 0),
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "completed":
				return "bg-success";
			case "pending":
				return "bg-warning";
			case "failed":
				return "bg-destructive";
			default:
				return "bg-muted-foreground";
		}
	};

	const getPaymentMethodIcon = (method) => {
		switch (method) {
			case "credit_card":
				return <CreditCard className="w-4 h-4" />;
			case "bank_transfer":
				return <Banknote className="w-4 h-4" />;
			case "check":
				return <Receipt className="w-4 h-4" />;
			case "ach":
				return <Wallet className="w-4 h-4" />;
			case "cash":
				return <DollarSign className="w-4 h-4" />;
			default:
				return <DollarSign className="w-4 h-4" />;
		}
	};

	const handleRecordPayment = () => {
		if (!selectedInvoice || !paymentAmount) return;

		const newPayment = {
			id: `PAY-${Date.now()}`,
			invoiceId: selectedInvoice.id,
			invoiceNumber: selectedInvoice.number,
			customer: selectedInvoice.customer,
			amount: parseFloat(paymentAmount),
			method: paymentMethod,
			status: "completed",
			receivedDate: paymentDate.toISOString(),
			reference: paymentReference,
			notes: paymentNotes,
			processingFee: paymentMethod === "credit_card" ? parseFloat(paymentAmount) * 0.029 : 0,
		};

		console.log("Recording payment:", newPayment);

		// Reset form
		setPaymentAmount("");
		setPaymentMethod("credit_card");
		setPaymentDate(new Date());
		setPaymentReference("");
		setPaymentNotes("");
		setSelectedInvoice(null);
		setRecordPaymentOpen(false);
	};

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Payments</h1>
					<p className="text-muted-foreground">Track and manage customer payments</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" size="sm">
						<Download className="w-4 h-4 mr-2" />
						Export
					</Button>
					<Dialog open={recordPaymentOpen} onOpenChange={setRecordPaymentOpen}>
						<DialogTrigger asChild>
							<Button>
								<Plus className="w-4 h-4 mr-2" />
								Record Payment
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-md">
							<DialogHeader>
								<DialogTitle>Record Payment</DialogTitle>
								<DialogDescription>Record a payment received from a customer</DialogDescription>
							</DialogHeader>

							<div className="space-y-4">
								<div>
									<Label>Select Invoice</Label>
									<Select
										value={selectedInvoice?.id || ""}
										onValueChange={(value) => {
											const invoice = mockOutstandingInvoices.find((inv) => inv.id === value);
											setSelectedInvoice(invoice);
											setPaymentAmount(invoice?.amount.toString() || "");
										}}
									>
										<SelectTrigger>
											<SelectValue placeholder="Choose invoice..." />
										</SelectTrigger>
										<SelectContent>
											{mockOutstandingInvoices.map((invoice) => (
												<SelectItem key={invoice.id} value={invoice.id}>
													{invoice.number} - {invoice.customer.name} (${invoice.amount})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="amount">Amount</Label>
										<Input id="amount" type="number" step="0.01" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="0.00" />
									</div>
									<div>
										<Label>Payment Method</Label>
										<Select value={paymentMethod} onValueChange={setPaymentMethod}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="credit_card">Credit Card</SelectItem>
												<SelectItem value="bank_transfer">Bank Transfer</SelectItem>
												<SelectItem value="check">Check</SelectItem>
												<SelectItem value="ach">ACH</SelectItem>
												<SelectItem value="cash">Cash</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>

								<div>
									<Label>Payment Date</Label>
									<Popover>
										<PopoverTrigger asChild>
											<Button variant="outline" className="w-full justify-start text-left font-normal">
												<CalendarIcon className="mr-2 h-4 w-4" />
												{format(paymentDate, "PPP")}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0">
											<Calendar mode="single" selected={paymentDate} onSelect={setPaymentDate} initialFocus />
										</PopoverContent>
									</Popover>
								</div>

								<div>
									<Label htmlFor="reference">Reference Number</Label>
									<Input id="reference" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} placeholder="Check number, transaction ID, etc." />
								</div>

								<div>
									<Label htmlFor="notes">Notes (Optional)</Label>
									<Input id="notes" value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} placeholder="Additional payment details..." />
								</div>
							</div>

							<DialogFooter>
								<Button variant="outline" onClick={() => setRecordPaymentOpen(false)}>
									Cancel
								</Button>
								<Button onClick={handleRecordPayment} disabled={!selectedInvoice || !paymentAmount}>
									Record Payment
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Total Received</p>
								<p className="text-2xl font-bold">${paymentStats.completed.amount.toLocaleString()}</p>
								<p className="text-xs text-muted-foreground">{paymentStats.completed.count} payments</p>
							</div>
							<CheckCircle className="w-8 h-8 text-success" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Pending</p>
								<p className="text-2xl font-bold">${paymentStats.pending.amount.toLocaleString()}</p>
								<p className="text-xs text-muted-foreground">{paymentStats.pending.count} payments</p>
							</div>
							<Clock className="w-8 h-8 text-warning" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Outstanding</p>
								<p className="text-2xl font-bold">${outstandingStats.total.toLocaleString()}</p>
								<p className="text-xs text-muted-foreground">{mockOutstandingInvoices.length} invoices</p>
							</div>
							<AlertTriangle className="w-8 h-8 text-warning" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Failed</p>
								<p className="text-2xl font-bold">${paymentStats.failed.amount.toLocaleString()}</p>
								<p className="text-xs text-muted-foreground">{paymentStats.failed.count} payments</p>
							</div>
							<AlertTriangle className="w-8 h-8 text-destructive" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Main Content */}
			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="received">Payment History</TabsTrigger>
					<TabsTrigger value="outstanding">Outstanding Invoices</TabsTrigger>
				</TabsList>

				{/* Payment History Tab */}
				<TabsContent value="received" className="space-y-6">
					{/* Filters */}
					<div className="flex flex-col sm:flex-row gap-4 items-center">
						<div className="relative flex-1 max-w-md">
							<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
							<Input placeholder="Search payments..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
						</div>

						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger className="w-32">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="completed">Completed</SelectItem>
								<SelectItem value="pending">Pending</SelectItem>
								<SelectItem value="failed">Failed</SelectItem>
							</SelectContent>
						</Select>

						<Select value={methodFilter} onValueChange={setMethodFilter}>
							<SelectTrigger className="w-40">
								<SelectValue placeholder="Method" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Methods</SelectItem>
								<SelectItem value="credit_card">Credit Card</SelectItem>
								<SelectItem value="bank_transfer">Bank Transfer</SelectItem>
								<SelectItem value="check">Check</SelectItem>
								<SelectItem value="ach">ACH</SelectItem>
								<SelectItem value="cash">Cash</SelectItem>
							</SelectContent>
						</Select>

						<Select value={dateRange} onValueChange={setDateRange}>
							<SelectTrigger className="w-32">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="7_days">Last 7 days</SelectItem>
								<SelectItem value="30_days">Last 30 days</SelectItem>
								<SelectItem value="90_days">Last 90 days</SelectItem>
								<SelectItem value="this_month">This month</SelectItem>
								<SelectItem value="last_month">Last month</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Payments Table */}
					<Card>
						<CardHeader>
							<CardTitle>Payment History</CardTitle>
							<CardDescription>{filteredPayments.length} payments</CardDescription>
						</CardHeader>

						<CardContent className="p-0">
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead className="border-b bg-muted/50">
										<tr className="text-left">
											<th className="p-4 font-medium">Payment</th>
											<th className="p-4 font-medium">Invoice</th>
											<th className="p-4 font-medium">Customer</th>
											<th className="p-4 font-medium">Amount</th>
											<th className="p-4 font-medium">Method</th>
											<th className="p-4 font-medium">Date</th>
											<th className="p-4 font-medium">Status</th>
											<th className="p-4 font-medium">Actions</th>
										</tr>
									</thead>
									<tbody>
										{filteredPayments.map((payment) => (
											<tr key={payment.id} className="border-b hover:bg-muted/50">
												<td className="p-4">
													<div>
														<p className="font-medium">{payment.reference}</p>
														{payment.notes && <p className="text-xs text-muted-foreground">{payment.notes}</p>}
													</div>
												</td>

												<td className="p-4">
													<p className="font-medium">{payment.invoiceNumber}</p>
												</td>

												<td className="p-4">
													<div className="flex items-center gap-2">
														{payment.customer.type === "commercial" ? <Building className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-success" />}
														<span className="font-medium">{payment.customer.name}</span>
													</div>
												</td>

												<td className="p-4">
													<div>
														<p className="font-medium">${payment.amount.toLocaleString()}</p>
														{payment.processingFee > 0 && <p className="text-xs text-muted-foreground">Fee: ${payment.processingFee.toFixed(2)}</p>}
													</div>
												</td>

												<td className="p-4">
													<div className="flex items-center gap-2">
														{getPaymentMethodIcon(payment.method)}
														<span className="capitalize text-sm">{payment.method.replace("_", " ")}</span>
													</div>
												</td>

												<td className="p-4">
													<p className="text-sm">{format(parseISO(payment.receivedDate), "MMM d, yyyy")}</p>
													<p className="text-xs text-muted-foreground">{format(parseISO(payment.receivedDate), "HH:mm")}</p>
												</td>

												<td className="p-4">
													<Badge className={getStatusColor(payment.status)} variant="secondary">
														{payment.status}
													</Badge>
												</td>

												<td className="p-4">
													<Button variant="ghost" size="sm">
														<MoreHorizontal className="w-4 h-4" />
													</Button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							{filteredPayments.length === 0 && (
								<div className="text-center py-12">
									<DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
									<h3 className="text-lg font-medium text-foreground mb-2">No payments found</h3>
									<p className="text-muted-foreground">{searchQuery || statusFilter !== "all" || methodFilter !== "all" ? "Try adjusting your search criteria" : "Payments will appear here once recorded"}</p>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Outstanding Invoices Tab */}
				<TabsContent value="outstanding" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Outstanding Invoices</CardTitle>
							<CardDescription>Invoices awaiting payment</CardDescription>
						</CardHeader>

						<CardContent className="p-0">
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead className="border-b bg-muted/50">
										<tr className="text-left">
											<th className="p-4 font-medium">Invoice</th>
											<th className="p-4 font-medium">Customer</th>
											<th className="p-4 font-medium">Amount</th>
											<th className="p-4 font-medium">Due Date</th>
											<th className="p-4 font-medium">Status</th>
											<th className="p-4 font-medium">Actions</th>
										</tr>
									</thead>
									<tbody>
										{mockOutstandingInvoices.map((invoice) => (
											<tr key={invoice.id} className="border-b hover:bg-muted/50">
												<td className="p-4">
													<p className="font-medium">{invoice.number}</p>
												</td>

												<td className="p-4">
													<div className="flex items-center gap-2">
														{invoice.customer.type === "commercial" ? <Building className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-success" />}
														<span>{invoice.customer.name}</span>
													</div>
												</td>

												<td className="p-4">
													<p className="font-medium">${invoice.amount.toLocaleString()}</p>
												</td>

												<td className="p-4">
													<div>
														<p className="text-sm">{format(parseISO(invoice.dueDate), "MMM d, yyyy")}</p>
														{invoice.daysOverdue > 0 && <p className="text-xs text-destructive">{invoice.daysOverdue} days overdue</p>}
													</div>
												</td>

												<td className="p-4">
													<Badge variant="outline" className={invoice.daysOverdue > 0 ? "border-red-500 text-destructive" : "border-orange-500 text-warning"}>
														{invoice.daysOverdue > 0 ? "Overdue" : "Outstanding"}
													</Badge>
												</td>

												<td className="p-4">
													<div className="flex gap-2">
														<Button
															size="sm"
															variant="outline"
															onClick={() => {
																setSelectedInvoice(invoice);
																setPaymentAmount(invoice.amount.toString());
																setRecordPaymentOpen(true);
															}}
														>
															<DollarSign className="w-4 h-4 mr-2" />
															Record Payment
														</Button>
														<Button size="sm" variant="outline">
															<Send className="w-4 h-4 mr-2" />
															Send Reminder
														</Button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							{mockOutstandingInvoices.length === 0 && (
								<div className="text-center py-12">
									<CheckCircle className="w-12 h-12 mx-auto text-success mb-4" />
									<h3 className="text-lg font-medium text-foreground mb-2">All caught up!</h3>
									<p className="text-muted-foreground">No outstanding invoices at the moment</p>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
