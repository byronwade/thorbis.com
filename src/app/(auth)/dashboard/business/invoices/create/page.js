"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Label } from "@components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Calendar } from "@components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { Checkbox } from "@components/ui/checkbox";
import { Separator } from "@components/ui/separator";
import { Calendar as CalendarIcon, Plus, Trash2, Search, Building, User, Phone, Mail, MapPin, FileText, Save, Send, Eye, Hash, Clock, X } from "lucide-react";
import { format, addDays } from "date-fns";

// Mock data for customers and services
const mockCustomers = [
	{
		id: "CUST001",
		name: "TechCorp Inc.",
		email: "billing@techcorp.com",
		phone: "(555) 111-2222",
		address: "123 Business Ave, Downtown, CA 90210",
		type: "commercial",
		taxExempt: false,
	},
	{
		id: "CUST002",
		name: "Sarah Miller",
		email: "sarah.miller@email.com",
		phone: "(555) 222-3333",
		address: "456 Oak Street, Residential, CA 90211",
		type: "residential",
		taxExempt: false,
	},
	{
		id: "CUST003",
		name: "Metro Restaurant",
		email: "accounting@metrorestaurant.com",
		phone: "(555) 333-4444",
		address: "789 Main Street, Commercial, CA 90212",
		type: "commercial",
		taxExempt: true,
	},
];

const mockServices = [
	{
		id: "SVC001",
		name: "HVAC Maintenance",
		description: "Quarterly HVAC system maintenance and inspection",
		rate: 85,
		unit: "hour",
		category: "Maintenance",
	},
	{
		id: "SVC002",
		name: "Plumbing Repair",
		description: "General plumbing repair services",
		rate: 75,
		unit: "hour",
		category: "Repair",
	},
	{
		id: "SVC003",
		name: "Electrical Installation",
		description: "Electrical system installation and setup",
		rate: 95,
		unit: "hour",
		category: "Installation",
	},
	{
		id: "SVC004",
		name: "Emergency Service Call",
		description: "After-hours emergency service",
		rate: 150,
		unit: "flat",
		category: "Emergency",
	},
];

const mockParts = [
	{
		id: "PART001",
		name: "HVAC Filter 20x25x1",
		description: "High efficiency air filter",
		price: 15.99,
		category: "HVAC Parts",
	},
	{
		id: "PART002",
		name: "Copper Pipe 1/2 inch",
		description: "Type L copper pipe per foot",
		price: 3.5,
		category: "Plumbing",
	},
	{
		id: "PART003",
		name: "Circuit Breaker 20A",
		description: "20 amp single pole circuit breaker",
		price: 12.99,
		category: "Electrical",
	},
];

export default function CreateInvoice() {
	const [selectedCustomer, setSelectedCustomer] = useState(null);
	const [customerSearch, setCustomerSearch] = useState("");
	const [issueDate, setIssueDate] = useState(new Date());
	const [dueDate, setDueDate] = useState(addDays(new Date(), 30));
	const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now().toString().slice(-6)}`);
	const [poNumber, setPoNumber] = useState("");

	// Line items
	const [lineItems, setLineItems] = useState([
		{
			id: 1,
			type: "service", // "service" or "part"
			itemId: "",
			description: "",
			quantity: 1,
			rate: 0,
			amount: 0,
			taxable: true,
		},
	]);

	// Totals
	const [discountType, setDiscountType] = useState("percentage"); // "percentage" or "fixed"
	const [discountValue, setDiscountValue] = useState(0);
	const [taxRate, setTaxRate] = useState(8.75); // Default CA tax rate
	const [notes, setNotes] = useState("");
	const [terms, setTerms] = useState("Payment is due within 30 days of invoice date.");

	// Filter customers based on search
	const filteredCustomers = mockCustomers.filter((customer) => customer.name.toLowerCase().includes(customerSearch.toLowerCase()) || customer.email.toLowerCase().includes(customerSearch.toLowerCase()));

	// Calculate totals
	const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
	const discountAmount = discountType === "percentage" ? (subtotal * discountValue) / 100 : discountValue;
	const taxableAmount = lineItems.filter((item) => item.taxable).reduce((sum, item) => sum + item.amount, 0) - discountAmount;
	const taxAmount = selectedCustomer?.taxExempt ? 0 : (taxableAmount * taxRate) / 100;
	const total = subtotal - discountAmount + taxAmount;

	const handleCustomerSelect = (customer) => {
		setSelectedCustomer(customer);
		setCustomerSearch("");
	};

	const addLineItem = () => {
		const newItem = {
			id: lineItems.length + 1,
			type: "service",
			itemId: "",
			description: "",
			quantity: 1,
			rate: 0,
			amount: 0,
			taxable: true,
		};
		setLineItems([...lineItems, newItem]);
	};

	const removeLineItem = (id) => {
		setLineItems(lineItems.filter((item) => item.id !== id));
	};

	const updateLineItem = (id, field, value) => {
		setLineItems(
			lineItems.map((item) => {
				if (item.id === id) {
					const updated = { ...item, [field]: value };

					// Auto-populate from service/part selection
					if (field === "itemId" && value) {
						if (item.type === "service") {
							const service = mockServices.find((s) => s.id === value);
							if (service) {
								updated.description = service.description;
								updated.rate = service.rate;
							}
						} else if (item.type === "part") {
							const part = mockParts.find((p) => p.id === value);
							if (part) {
								updated.description = part.description;
								updated.rate = part.price;
							}
						}
					}

					// Recalculate amount
					if (field === "quantity" || field === "rate") {
						updated.amount = updated.quantity * updated.rate;
					}

					return updated;
				}
				return item;
			})
		);
	};

	const handleSaveDraft = () => {
		// Save invoice as draft
		console.log("Saving draft...", {
			customer: selectedCustomer,
			invoiceNumber,
			lineItems,
			totals: { subtotal, discountAmount, taxAmount, total },
		});
	};

	const handleSendInvoice = () => {
		// Send invoice to customer
		console.log("Sending invoice...", {
			customer: selectedCustomer,
			invoiceNumber,
			lineItems,
			totals: { subtotal, discountAmount, taxAmount, total },
		});
	};

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Create Invoice</h1>
					<p className="text-muted-foreground">Generate a new invoice for services and materials</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={handleSaveDraft}>
						<Save className="mr-2 w-4 h-4" />
						Save Draft
					</Button>
					<Button>
						<Eye className="mr-2 w-4 h-4" />
						Preview
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Main Form */}
				<div className="space-y-6 lg:col-span-2">
					{/* Customer Selection */}
					<Card>
						<CardHeader>
							<CardTitle>Customer Information</CardTitle>
							<CardDescription>Select or search for the customer</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="relative">
								<Search className="absolute top-3 left-3 w-4 h-4 text-muted-foreground" />
								<Input placeholder="Search customers..." className="pl-10" value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} />
							</div>

							{customerSearch && filteredCustomers.length > 0 && (
								<div className="overflow-y-auto max-h-48 rounded-lg border">
									{filteredCustomers.map((customer) => (
										<div key={customer.id} className="p-3 border-b cursor-pointer hover:bg-accent last:border-b-0" onClick={() => handleCustomerSelect(customer)}>
											<div className="flex gap-3 items-center">
												{customer.type === "commercial" ? <Building className="w-5 h-5 text-primary" /> : <User className="w-5 h-5 text-success" />}
												<div className="flex-1">
													<p className="font-medium">{customer.name}</p>
													<p className="text-sm text-muted-foreground">{customer.email}</p>
												</div>
												{customer.taxExempt && <Badge variant="outline">Tax Exempt</Badge>}
											</div>
										</div>
									))}
								</div>
							)}

							{selectedCustomer && (
								<div className="p-4 rounded-lg bg-accent/50">
									<div className="flex justify-between items-start">
										<div className="space-y-2">
											<div className="flex gap-2 items-center">
												{selectedCustomer.type === "commercial" ? <Building className="w-5 h-5 text-primary" /> : <User className="w-5 h-5 text-success" />}
												<h3 className="font-medium">{selectedCustomer.name}</h3>
												{selectedCustomer.taxExempt && <Badge variant="outline">Tax Exempt</Badge>}
											</div>
											<div className="space-y-1 text-sm text-muted-foreground">
												<div className="flex gap-2 items-center">
													<Mail className="w-4 h-4" />
													{selectedCustomer.email}
												</div>
												<div className="flex gap-2 items-center">
													<Phone className="w-4 h-4" />
													{selectedCustomer.phone}
												</div>
												<div className="flex gap-2 items-center">
													<MapPin className="w-4 h-4" />
													{selectedCustomer.address}
												</div>
											</div>
										</div>
										<Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(null)}>
											<X className="w-4 h-4" />
										</Button>
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Invoice Details */}
					<Card>
						<CardHeader>
							<CardTitle>Invoice Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div>
									<Label htmlFor="invoice-number">Invoice Number</Label>
									<Input id="invoice-number" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
								</div>
								<div>
									<Label htmlFor="po-number">PO Number (Optional)</Label>
									<Input id="po-number" placeholder="Customer PO number" value={poNumber} onChange={(e) => setPoNumber(e.target.value)} />
								</div>
							</div>

							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div>
									<Label>Issue Date</Label>
									<Popover>
										<PopoverTrigger asChild>
											<Button variant="outline" className="justify-start w-full font-normal text-left">
												<CalendarIcon className="mr-2 w-4 h-4" />
												{format(issueDate, "PPP")}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="p-0 w-auto">
											<Calendar mode="single" selected={issueDate} onSelect={setIssueDate} initialFocus />
										</PopoverContent>
									</Popover>
								</div>
								<div>
									<Label>Due Date</Label>
									<Popover>
										<PopoverTrigger asChild>
											<Button variant="outline" className="justify-start w-full font-normal text-left">
												<CalendarIcon className="mr-2 w-4 h-4" />
												{format(dueDate, "PPP")}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="p-0 w-auto">
											<Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
										</PopoverContent>
									</Popover>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Line Items */}
					<Card>
						<CardHeader>
							<div className="flex justify-between items-center">
								<div>
									<CardTitle>Line Items</CardTitle>
									<CardDescription>Add services and parts to the invoice</CardDescription>
								</div>
								<Button onClick={addLineItem}>
									<Plus className="mr-2 w-4 h-4" />
									Add Item
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{lineItems.map((item, index) => (
									<div key={item.id} className="p-4 space-y-4 rounded-lg border">
										<div className="flex justify-between items-center">
											<div className="flex gap-2 items-center">
												<span className="font-medium">Item #{index + 1}</span>
												<Select value={item.type} onValueChange={(value) => updateLineItem(item.id, "type", value)}>
													<SelectTrigger className="w-32">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="service">Service</SelectItem>
														<SelectItem value="part">Part</SelectItem>
													</SelectContent>
												</Select>
											</div>
											{lineItems.length > 1 && (
												<Button variant="ghost" size="sm" onClick={() => removeLineItem(item.id)}>
													<Trash2 className="w-4 h-4" />
												</Button>
											)}
										</div>

										<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
											<div>
												<Label>Select {item.type}</Label>
												<Select value={item.itemId} onValueChange={(value) => updateLineItem(item.id, "itemId", value)}>
													<SelectTrigger>
														<SelectValue placeholder={`Choose ${item.type}...`} />
													</SelectTrigger>
													<SelectContent>
														{(item.type === "service" ? mockServices : mockParts).map((option) => (
															<SelectItem key={option.id} value={option.id}>
																{option.name} - ${option.price || option.rate}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
											<div>
												<Label>Description</Label>
												<Input value={item.description} onChange={(e) => updateLineItem(item.id, "description", e.target.value)} placeholder="Item description" />
											</div>
										</div>

										<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
											<div>
												<Label>Quantity</Label>
												<Input type="number" min="0" step="0.01" value={item.quantity} onChange={(e) => updateLineItem(item.id, "quantity", parseFloat(e.target.value) || 0)} />
											</div>
											<div>
												<Label>Rate</Label>
												<Input type="number" min="0" step="0.01" value={item.rate} onChange={(e) => updateLineItem(item.id, "rate", parseFloat(e.target.value) || 0)} />
											</div>
											<div>
												<Label>Amount</Label>
												<Input value={`$${item.amount.toFixed(2)}`} disabled className="bg-muted" />
											</div>
											<div className="flex items-center pt-6 space-x-2">
												<Checkbox id={`taxable-${item.id}`} checked={item.taxable} onCheckedChange={(checked) => updateLineItem(item.id, "taxable", checked)} />
												<Label htmlFor={`taxable-${item.id}`} className="text-sm">
													Taxable
												</Label>
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Notes and Terms */}
					<Card>
						<CardHeader>
							<CardTitle>Additional Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label htmlFor="notes">Notes (Optional)</Label>
								<Textarea id="notes" placeholder="Add any additional notes or comments..." value={notes} onChange={(e) => setNotes(e.target.value)} />
							</div>
							<div>
								<Label htmlFor="terms">Terms & Conditions</Label>
								<Textarea id="terms" placeholder="Payment terms and conditions..." value={terms} onChange={(e) => setTerms(e.target.value)} />
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Invoice Summary Sidebar */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Invoice Summary</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<div className="flex justify-between">
									<span>Subtotal</span>
									<span>${subtotal.toFixed(2)}</span>
								</div>

								{/* Discount */}
								<div className="space-y-2">
									<Label className="text-sm">Discount</Label>
									<div className="flex gap-2">
										<Select value={discountType} onValueChange={setDiscountType}>
											<SelectTrigger className="w-24">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="percentage">%</SelectItem>
												<SelectItem value="fixed">$</SelectItem>
											</SelectContent>
										</Select>
										<Input type="number" min="0" step="0.01" value={discountValue} onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)} placeholder="0.00" />
									</div>
									<div className="flex justify-between text-sm">
										<span>Discount amount</span>
										<span>-${discountAmount.toFixed(2)}</span>
									</div>
								</div>

								<Separator />

								{/* Tax */}
								<div className="space-y-2">
									<div className="flex justify-between items-center">
										<Label className="text-sm">Tax Rate (%)</Label>
										{selectedCustomer?.taxExempt && (
											<Badge variant="outline" className="text-xs">
												Tax Exempt
											</Badge>
										)}
									</div>
									<Input type="number" min="0" step="0.01" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} disabled={selectedCustomer?.taxExempt} />
									<div className="flex justify-between text-sm">
										<span>Tax amount</span>
										<span>${taxAmount.toFixed(2)}</span>
									</div>
								</div>

								<Separator />

								<div className="flex justify-between text-lg font-bold">
									<span>Total</span>
									<span>${total.toFixed(2)}</span>
								</div>
							</div>

							<div className="pt-4 space-y-2">
								<Button className="w-full" onClick={handleSendInvoice} disabled={!selectedCustomer || lineItems.length === 0}>
									<Send className="mr-2 w-4 h-4" />
									Send Invoice
								</Button>
								<Button variant="outline" className="w-full" onClick={handleSaveDraft}>
									<Save className="mr-2 w-4 h-4" />
									Save as Draft
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Quick Stats */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Quick Reference</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex gap-2 items-center text-sm">
								<Hash className="w-4 h-4 text-muted-foreground" />
								<span>Invoice: {invoiceNumber}</span>
							</div>
							<div className="flex gap-2 items-center text-sm">
								<Clock className="w-4 h-4 text-muted-foreground" />
								<span>Due: {format(dueDate, "MMM d")}</span>
							</div>
							<div className="flex gap-2 items-center text-sm">
								<FileText className="w-4 h-4 text-muted-foreground" />
								<span>{lineItems.length} line items</span>
							</div>
							{selectedCustomer && (
								<div className="flex gap-2 items-center text-sm">
									{selectedCustomer.type === "commercial" ? <Building className="w-4 h-4 text-muted-foreground" /> : <User className="w-4 h-4 text-muted-foreground" />}
									<span>{selectedCustomer.name}</span>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
