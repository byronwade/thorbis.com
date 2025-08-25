"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Avatar, AvatarFallback } from "@components/ui/avatar";
import { Switch } from "@components/ui/switch";
import {
	Calculator,
	Plus,
	Trash2,
	Save,
	Send,
	Eye,
	User,
	MapPin,
	Phone,
	Mail,
	DollarSign,
	CheckCircle,
	Settings,
	Wrench,
} from "lucide-react";
import { toast } from "@components/ui/use-toast";

export default function CreateEstimate() {
	const router = useRouter();
	const [currentStep, setCurrentStep] = useState(1);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPreview, setShowPreview] = useState(false);

	// Estimate form data
	const [estimateData, setEstimateData] = useState({
		// Customer Information
		customer: {
			type: "existing", // 'existing' or 'new'
			id: "",
			name: "",
			email: "",
			phone: "",
			address: "",
			city: "",
			state: "",
			zipCode: "",
			company: "",
		},
		// Job Information
		job: {
			title: "",
			description: "",
			serviceType: "",
			priority: "medium",
			location: "customer", // 'customer' or 'custom'
			customLocation: "",
			scheduledDate: "",
			estimatedDuration: "",
			notes: "",
		},
		// Line Items
		lineItems: [
			{
				id: 1,
				type: "service", // 'service', 'material', 'labor'
				name: "",
				description: "",
				quantity: 1,
				unitPrice: 0,
				discount: 0,
				tax: 0,
				total: 0,
			},
		],
		// Pricing
		pricing: {
			subtotal: 0,
			taxRate: 8.25,
			taxAmount: 0,
			discountType: "amount", // 'amount' or 'percentage'
			discountValue: 0,
			discountAmount: 0,
			total: 0,
		},
		// Terms and Settings
		settings: {
			validUntil: "",
			terms: "",
			notes: "",
			requiresApproval: false,
			allowOnlineAcceptance: true,
			sendAutomatically: false,
			includeImages: false,
			template: "standard",
		},
		// Attachments
		attachments: [],
	});

	// Mock data for dropdowns
	const [customers, setCustomers] = useState([
		{ id: "c_001", name: "John Smith", email: "john@email.com", phone: "(555) 123-4567", address: "123 Main St" },
		{ id: "c_002", name: "Sarah Johnson", email: "sarah@email.com", phone: "(555) 234-5678", address: "456 Oak Ave" },
		{ id: "c_003", name: "Mike Davis", email: "mike@email.com", phone: "(555) 345-6789", address: "789 Pine St" },
	]);

	const [serviceTypes, setServiceTypes] = useState([
		"Plumbing Repair",
		"HVAC Installation",
		"Electrical Work",
		"Emergency Service",
		"Maintenance",
		"Inspection",
		"Consultation",
	]);

	const [pricebookItems, setPricebookItems] = useState([
		{ id: "p_001", name: "Service Call", type: "service", price: 85, description: "Standard service call fee" },
		{ id: "p_002", name: "Hourly Labor", type: "labor", price: 95, description: "Standard labor rate per hour" },
		{ id: "p_003", name: "Emergency Service", type: "service", price: 150, description: "After-hours emergency service" },
		{ id: "p_004", name: "Copper Pipe (1/2\")", type: "material", price: 12.5, description: "Per foot of copper pipe" },
		{ id: "p_005", name: "PVC Pipe (1\")", type: "material", price: 8.75, description: "Per foot of PVC pipe" },
		{ id: "p_006", name: "Toilet Installation", type: "service", price: 250, description: "Standard toilet installation" },
	]);

	const steps = [
		{ id: 1, title: "Customer", icon: User },
		{ id: 2, title: "Job Details", icon: Wrench },
		{ id: 3, title: "Line Items", icon: Calculator },
		{ id: 4, title: "Pricing", icon: DollarSign },
		{ id: 5, title: "Settings", icon: Settings },
		{ id: 6, title: "Review", icon: CheckCircle },
	];

	// Calculate totals when line items change
	useEffect(() => {
		const subtotal = estimateData.lineItems.reduce((sum, item) => {
			const itemTotal = item.quantity * item.unitPrice;
			const discountAmount = (itemTotal * item.discount) / 100;
			return sum + (itemTotal - discountAmount);
		}, 0);

		const discountAmount = estimateData.pricing.discountType === "percentage" ? (subtotal * estimateData.pricing.discountValue) / 100 : estimateData.pricing.discountValue;

		const taxableAmount = subtotal - discountAmount;
		const taxAmount = (taxableAmount * estimateData.pricing.taxRate) / 100;
		const total = taxableAmount + taxAmount;

		setEstimateData((prev) => ({
			...prev,
			pricing: {
				...prev.pricing,
				subtotal,
				discountAmount,
				taxAmount,
				total,
			},
		}));
	}, [estimateData.lineItems, estimateData.pricing.discountType, estimateData.pricing.discountValue, estimateData.pricing.taxRate]);

	// Set default valid until date (30 days from now)
	useEffect(() => {
		const validUntil = new Date();
		validUntil.setDate(validUntil.getDate() + 30);
		setEstimateData((prev) => ({
			...prev,
			settings: {
				...prev.settings,
				validUntil: validUntil.toISOString().split("T")[0],
			},
		}));
	}, []);

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	const addLineItem = () => {
		const newItem = {
			id: Date.now(),
			type: "service",
			name: "",
			description: "",
			quantity: 1,
			unitPrice: 0,
			discount: 0,
			tax: 0,
			total: 0,
		};
		setEstimateData((prev) => ({
			...prev,
			lineItems: [...prev.lineItems, newItem],
		}));
	};

	const updateLineItem = (id, field, value) => {
		setEstimateData((prev) => ({
			...prev,
			lineItems: prev.lineItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
		}));
	};

	const removeLineItem = (id) => {
		setEstimateData((prev) => ({
			...prev,
			lineItems: prev.lineItems.filter((item) => item.id !== id),
		}));
	};

	const addPricebookItem = (pricebookItem) => {
		const newItem = {
			id: Date.now(),
			type: pricebookItem.type,
			name: pricebookItem.name,
			description: pricebookItem.description,
			quantity: 1,
			unitPrice: pricebookItem.price,
			discount: 0,
			tax: 0,
			total: pricebookItem.price,
		};
		setEstimateData((prev) => ({
			...prev,
			lineItems: [...prev.lineItems, newItem],
		}));
	};

	const selectCustomer = (customerId) => {
		const customer = customers.find((c) => c.id === customerId);
		if (customer) {
			setEstimateData((prev) => ({
				...prev,
				customer: {
					...prev.customer,
					id: customer.id,
					name: customer.name,
					email: customer.email,
					phone: customer.phone,
					address: customer.address,
				},
			}));
		}
	};

	const handleNext = () => {
		if (currentStep < 6) {
			setCurrentStep(currentStep + 1);
		}
	};

	const handleBack = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleSave = async (action = "save") => {
		setIsSubmitting(true);
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 2000));

			if (action === "send") {
				toast({
					title: "Estimate Sent",
					description: "The estimate has been sent to the customer.",
				});
			} else {
				toast({
					title: "Estimate Saved",
					description: "The estimate has been saved as a draft.",
				});
			}

			router.push("/dashboard/business/estimates/list");
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to save estimate. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const validateStep = (step) => {
		switch (step) {
			case 1:
				return estimateData.customer.name && estimateData.customer.email;
			case 2:
				return estimateData.job.title && estimateData.job.serviceType;
			case 3:
				return estimateData.lineItems.length > 0 && estimateData.lineItems.every((item) => item.name && item.unitPrice > 0);
			case 4:
				return true; // Pricing is automatically calculated
			case 5:
				return estimateData.settings.validUntil;
			default:
				return true;
		}
	};

	const renderStepContent = () => {
		switch (currentStep) {
			case 1:
				return (
					<div className="space-y-6">
						<div>
							<Label className="text-base font-medium">Customer Type</Label>
							<Select
								value={estimateData.customer.type}
								onValueChange={(value) =>
									setEstimateData((prev) => ({
										...prev,
										customer: { ...prev.customer, type: value },
									}))
								}
							>
								<SelectTrigger className="mt-2">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="existing">Existing Customer</SelectItem>
									<SelectItem value="new">New Customer</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{estimateData.customer.type === "existing" ? (
							<div>
								<Label className="text-base font-medium">Select Customer</Label>
								<Select value={estimateData.customer.id} onValueChange={selectCustomer}>
									<SelectTrigger className="mt-2">
										<SelectValue placeholder="Choose a customer..." />
									</SelectTrigger>
									<SelectContent>
										{customers.map((customer) => (
											<SelectItem key={customer.id} value={customer.id}>
												<div className="flex justify-between items-center w-full">
													<span>{customer.name}</span>
													<span className="text-sm text-muted-foreground">{customer.phone}</span>
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						) : (
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div>
									<Label htmlFor="customerName">Name *</Label>
									<Input
										id="customerName"
										value={estimateData.customer.name}
										onChange={(e) =>
											setEstimateData((prev) => ({
												...prev,
												customer: { ...prev.customer, name: e.target.value },
											}))
										}
									/>
								</div>
								<div>
									<Label htmlFor="customerEmail">Email *</Label>
									<Input
										id="customerEmail"
										type="email"
										value={estimateData.customer.email}
										onChange={(e) =>
											setEstimateData((prev) => ({
												...prev,
												customer: { ...prev.customer, email: e.target.value },
											}))
										}
									/>
								</div>
								<div>
									<Label htmlFor="customerPhone">Phone</Label>
									<Input
										id="customerPhone"
										value={estimateData.customer.phone}
										onChange={(e) =>
											setEstimateData((prev) => ({
												...prev,
												customer: { ...prev.customer, phone: e.target.value },
											}))
										}
									/>
								</div>
								<div>
									<Label htmlFor="customerCompany">Company</Label>
									<Input
										id="customerCompany"
										value={estimateData.customer.company}
										onChange={(e) =>
											setEstimateData((prev) => ({
												...prev,
												customer: { ...prev.customer, company: e.target.value },
											}))
										}
									/>
								</div>
								<div className="md:col-span-2">
									<Label htmlFor="customerAddress">Address</Label>
									<Input
										id="customerAddress"
										value={estimateData.customer.address}
										onChange={(e) =>
											setEstimateData((prev) => ({
												...prev,
												customer: { ...prev.customer, address: e.target.value },
											}))
										}
									/>
								</div>
								<div>
									<Label htmlFor="customerCity">City</Label>
									<Input
										id="customerCity"
										value={estimateData.customer.city}
										onChange={(e) =>
											setEstimateData((prev) => ({
												...prev,
												customer: { ...prev.customer, city: e.target.value },
											}))
										}
									/>
								</div>
								<div>
									<Label htmlFor="customerState">State</Label>
									<Input
										id="customerState"
										value={estimateData.customer.state}
										onChange={(e) =>
											setEstimateData((prev) => ({
												...prev,
												customer: { ...prev.customer, state: e.target.value },
											}))
										}
									/>
								</div>
							</div>
						)}

						{estimateData.customer.id && (
							<Card>
								<CardContent className="p-4">
									<div className="flex gap-3 items-start">
										<Avatar>
											<AvatarFallback>
												{estimateData.customer.name
													.split(" ")
													.map((n) => n[0])
													.join("")}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1">
											<h4 className="font-medium">{estimateData.customer.name}</h4>
											<div className="space-y-1 text-sm text-muted-foreground">
												<div className="flex gap-2 items-center">
													<Mail className="w-4 h-4" />
													{estimateData.customer.email}
												</div>
												<div className="flex gap-2 items-center">
													<Phone className="w-4 h-4" />
													{estimateData.customer.phone}
												</div>
												<div className="flex gap-2 items-center">
													<MapPin className="w-4 h-4" />
													{estimateData.customer.address}
												</div>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						)}
					</div>
				);

			case 2:
				return (
					<div className="space-y-6">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<Label htmlFor="jobTitle">Job Title *</Label>
								<Input
									id="jobTitle"
									value={estimateData.job.title}
									onChange={(e) =>
										setEstimateData((prev) => ({
											...prev,
											job: { ...prev.job, title: e.target.value },
										}))
									}
									placeholder="e.g., Kitchen Faucet Repair"
								/>
							</div>
							<div>
								<Label htmlFor="serviceType">Service Type *</Label>
								<Select
									value={estimateData.job.serviceType}
									onValueChange={(value) =>
										setEstimateData((prev) => ({
											...prev,
											job: { ...prev.job, serviceType: value },
										}))
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select service type..." />
									</SelectTrigger>
									<SelectContent>
										{serviceTypes.map((type) => (
											<SelectItem key={type} value={type}>
												{type}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="priority">Priority</Label>
								<Select
									value={estimateData.job.priority}
									onValueChange={(value) =>
										setEstimateData((prev) => ({
											...prev,
											job: { ...prev.job, priority: value },
										}))
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="low">Low</SelectItem>
										<SelectItem value="medium">Medium</SelectItem>
										<SelectItem value="high">High</SelectItem>
										<SelectItem value="urgent">Urgent</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="estimatedDuration">Estimated Duration (hours)</Label>
								<Input
									id="estimatedDuration"
									type="number"
									value={estimateData.job.estimatedDuration}
									onChange={(e) =>
										setEstimateData((prev) => ({
											...prev,
											job: { ...prev.job, estimatedDuration: e.target.value },
										}))
									}
									placeholder="2.5"
								/>
							</div>
						</div>

						<div>
							<Label htmlFor="jobDescription">Description</Label>
							<Textarea
								id="jobDescription"
								value={estimateData.job.description}
								onChange={(e) =>
									setEstimateData((prev) => ({
										...prev,
										job: { ...prev.job, description: e.target.value },
									}))
								}
								placeholder="Detailed description of the work to be performed..."
								rows={4}
							/>
						</div>

						<div>
							<Label htmlFor="jobNotes">Internal Notes</Label>
							<Textarea
								id="jobNotes"
								value={estimateData.job.notes}
								onChange={(e) =>
									setEstimateData((prev) => ({
										...prev,
										job: { ...prev.job, notes: e.target.value },
									}))
								}
								placeholder="Internal notes (not visible to customer)..."
								rows={3}
							/>
						</div>

						<div>
							<Label htmlFor="scheduledDate">Preferred Date</Label>
							<Input
								id="scheduledDate"
								type="date"
								value={estimateData.job.scheduledDate}
								onChange={(e) =>
									setEstimateData((prev) => ({
										...prev,
										job: { ...prev.job, scheduledDate: e.target.value },
									}))
								}
							/>
						</div>
					</div>
				);

			case 3:
				return (
					<div className="space-y-6">
						{/* Quick Add from Pricebook */}
						<Card>
							<CardHeader>
								<CardTitle className="text-base">Quick Add from Pricebook</CardTitle>
								<CardDescription>Add commonly used services and materials</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
									{pricebookItems.map((item) => (
										<Button key={item.id} variant="outline" className="justify-start h-auto p-3" onClick={() => addPricebookItem(item)}>
											<div className="text-left">
												<div className="font-medium">{item.name}</div>
												<div className="text-sm text-muted-foreground">{formatCurrency(item.price)}</div>
											</div>
										</Button>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Line Items */}
						<Card>
							<CardHeader>
								<CardTitle className="text-base">Line Items</CardTitle>
								<CardDescription>Add services, labor, and materials</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{estimateData.lineItems.map((item, index) => (
										<div key={item.id} className="grid grid-cols-12 gap-4 items-end p-4 bg-muted/50 rounded-lg">
											<div className="col-span-3">
												<Label>Type</Label>
												<Select value={item.type} onValueChange={(value) => updateLineItem(item.id, "type", value)}>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="service">Service</SelectItem>
														<SelectItem value="labor">Labor</SelectItem>
														<SelectItem value="material">Material</SelectItem>
													</SelectContent>
												</Select>
											</div>
											<div className="col-span-3">
												<Label>Name</Label>
												<Input value={item.name} onChange={(e) => updateLineItem(item.id, "name", e.target.value)} placeholder="Item name" />
											</div>
											<div className="col-span-2">
												<Label>Quantity</Label>
												<Input type="number" value={item.quantity} onChange={(e) => updateLineItem(item.id, "quantity", parseFloat(e.target.value) || 0)} />
											</div>
											<div className="col-span-2">
												<Label>Unit Price</Label>
												<Input type="number" value={item.unitPrice} onChange={(e) => updateLineItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)} />
											</div>
											<div className="col-span-1">
												<Label>Discount %</Label>
												<Input type="number" value={item.discount} onChange={(e) => updateLineItem(item.id, "discount", parseFloat(e.target.value) || 0)} />
											</div>
											<div className="col-span-1 text-right">
												<Label>Total</Label>
												<div className="text-sm font-medium">{formatCurrency(item.quantity * item.unitPrice * (1 - item.discount / 100))}</div>
												<Button variant="ghost" size="sm" onClick={() => removeLineItem(item.id)} className="mt-1 text-destructive">
													<Trash2 className="w-4 h-4" />
												</Button>
											</div>
											{item.description && (
												<div className="col-span-12">
													<Textarea
														value={item.description}
														onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
														placeholder="Item description (optional)"
														rows={2}
													/>
												</div>
											)}
										</div>
									))}

									<Button variant="outline" onClick={addLineItem} className="w-full">
										<Plus className="mr-2 w-4 h-4" />
										Add Line Item
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				);

			case 4:
				return (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="text-base">Pricing Summary</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex justify-between items-center">
									<span>Subtotal</span>
									<span className="font-medium">{formatCurrency(estimateData.pricing.subtotal)}</span>
								</div>

								<div className="space-y-2">
									<Label>Discount</Label>
									<div className="flex gap-2">
										<Select
											value={estimateData.pricing.discountType}
											onValueChange={(value) =>
												setEstimateData((prev) => ({
													...prev,
													pricing: { ...prev.pricing, discountType: value, discountValue: 0 },
												}))
											}
										>
											<SelectTrigger className="w-32">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="amount">Amount</SelectItem>
												<SelectItem value="percentage">Percentage</SelectItem>
											</SelectContent>
										</Select>
										<Input
											type="number"
											value={estimateData.pricing.discountValue}
											onChange={(e) =>
												setEstimateData((prev) => ({
													...prev,
													pricing: { ...prev.pricing, discountValue: parseFloat(e.target.value) || 0 },
												}))
											}
											placeholder={estimateData.pricing.discountType === "percentage" ? "%" : "$"}
										/>
									</div>
									{estimateData.pricing.discountAmount > 0 && (
										<div className="flex justify-between items-center text-success">
											<span>Discount Applied</span>
											<span>-{formatCurrency(estimateData.pricing.discountAmount)}</span>
										</div>
									)}
								</div>

								<div className="space-y-2">
									<Label>Tax Rate (%)</Label>
									<Input
										type="number"
										value={estimateData.pricing.taxRate}
										onChange={(e) =>
											setEstimateData((prev) => ({
												...prev,
												pricing: { ...prev.pricing, taxRate: parseFloat(e.target.value) || 0 },
											}))
										}
									/>
									<div className="flex justify-between items-center">
										<span>Tax</span>
										<span className="font-medium">{formatCurrency(estimateData.pricing.taxAmount)}</span>
									</div>
								</div>

								<div className="pt-4 border-t border-border">
									<div className="flex justify-between items-center">
										<span className="text-lg font-semibold">Total</span>
										<span className="text-lg font-bold">{formatCurrency(estimateData.pricing.total)}</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				);

			case 5:
				return (
					<div className="space-y-6">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<Label htmlFor="validUntil">Valid Until *</Label>
								<Input
									id="validUntil"
									type="date"
									value={estimateData.settings.validUntil}
									onChange={(e) =>
										setEstimateData((prev) => ({
											...prev,
											settings: { ...prev.settings, validUntil: e.target.value },
										}))
									}
								/>
							</div>
							<div>
								<Label htmlFor="template">Template</Label>
								<Select
									value={estimateData.settings.template}
									onValueChange={(value) =>
										setEstimateData((prev) => ({
											...prev,
											settings: { ...prev.settings, template: value },
										}))
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="standard">Standard</SelectItem>
										<SelectItem value="detailed">Detailed</SelectItem>
										<SelectItem value="simple">Simple</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div>
							<Label htmlFor="terms">Terms and Conditions</Label>
							<Textarea
								id="terms"
								value={estimateData.settings.terms}
								onChange={(e) =>
									setEstimateData((prev) => ({
										...prev,
										settings: { ...prev.settings, terms: e.target.value },
									}))
								}
								placeholder="Enter terms and conditions..."
								rows={4}
							/>
						</div>

						<div>
							<Label htmlFor="notes">Notes</Label>
							<Textarea
								id="notes"
								value={estimateData.settings.notes}
								onChange={(e) =>
									setEstimateData((prev) => ({
										...prev,
										settings: { ...prev.settings, notes: e.target.value },
									}))
								}
								placeholder="Additional notes for the customer..."
								rows={3}
							/>
						</div>

						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<div>
									<Label>Require Approval</Label>
									<p className="text-sm text-muted-foreground">Customer must approve before work begins</p>
								</div>
								<Switch
									checked={estimateData.settings.requiresApproval}
									onCheckedChange={(checked) =>
										setEstimateData((prev) => ({
											...prev,
											settings: { ...prev.settings, requiresApproval: checked },
										}))
									}
								/>
							</div>

							<div className="flex justify-between items-center">
								<div>
									<Label>Allow Online Acceptance</Label>
									<p className="text-sm text-muted-foreground">Customer can accept estimate online</p>
								</div>
								<Switch
									checked={estimateData.settings.allowOnlineAcceptance}
									onCheckedChange={(checked) =>
										setEstimateData((prev) => ({
											...prev,
											settings: { ...prev.settings, allowOnlineAcceptance: checked },
										}))
									}
								/>
							</div>

							<div className="flex justify-between items-center">
								<div>
									<Label>Send Automatically</Label>
									<p className="text-sm text-muted-foreground">Send to customer after creation</p>
								</div>
								<Switch
									checked={estimateData.settings.sendAutomatically}
									onCheckedChange={(checked) =>
										setEstimateData((prev) => ({
											...prev,
											settings: { ...prev.settings, sendAutomatically: checked },
										}))
									}
								/>
							</div>
						</div>
					</div>
				);

			case 6:
				return (
					<div className="space-y-6">
						{/* Summary Cards */}
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<Card>
								<CardHeader>
									<CardTitle className="text-base">Customer</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										<p className="font-medium">{estimateData.customer.name}</p>
										<p className="text-sm text-muted-foreground">{estimateData.customer.email}</p>
										<p className="text-sm text-muted-foreground">{estimateData.customer.phone}</p>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="text-base">Job Details</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										<p className="font-medium">{estimateData.job.title}</p>
										<p className="text-sm text-muted-foreground">{estimateData.job.serviceType}</p>
										<Badge variant="outline">{estimateData.job.priority} priority</Badge>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Pricing Summary */}
						<Card>
							<CardHeader>
								<CardTitle className="text-base">Estimate Total</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<div className="flex justify-between">
										<span>Subtotal</span>
										<span>{formatCurrency(estimateData.pricing.subtotal)}</span>
									</div>
									{estimateData.pricing.discountAmount > 0 && (
										<div className="flex justify-between text-success">
											<span>Discount</span>
											<span>-{formatCurrency(estimateData.pricing.discountAmount)}</span>
										</div>
									)}
									<div className="flex justify-between">
										<span>Tax ({estimateData.pricing.taxRate}%)</span>
										<span>{formatCurrency(estimateData.pricing.taxAmount)}</span>
									</div>
									<div className="pt-2 border-t border-border">
										<div className="flex justify-between items-center">
											<span className="text-lg font-semibold">Total</span>
											<span className="text-lg font-bold">{formatCurrency(estimateData.pricing.total)}</span>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Line Items Preview */}
						<Card>
							<CardHeader>
								<CardTitle className="text-base">Line Items ({estimateData.lineItems.length})</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									{estimateData.lineItems.map((item, index) => (
										<div key={item.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
											<div>
												<span className="font-medium">{item.name}</span>
												<span className="ml-2 text-sm text-muted-foreground">
													({item.quantity} × {formatCurrency(item.unitPrice)})
												</span>
											</div>
											<span className="font-medium">{formatCurrency(item.quantity * item.unitPrice * (1 - item.discount / 100))}</span>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Settings Summary */}
						<Card>
							<CardHeader>
								<CardTitle className="text-base">Settings</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<div className="flex justify-between">
										<span>Valid Until</span>
										<span>{new Date(estimateData.settings.validUntil).toLocaleDateString()}</span>
									</div>
									<div className="flex justify-between">
										<span>Requires Approval</span>
										<span>{estimateData.settings.requiresApproval ? "Yes" : "No"}</span>
									</div>
									<div className="flex justify-between">
										<span>Online Acceptance</span>
										<span>{estimateData.settings.allowOnlineAcceptance ? "Enabled" : "Disabled"}</span>
									</div>
									<div className="flex justify-between">
										<span>Send Automatically</span>
										<span>{estimateData.settings.sendAutomatically ? "Yes" : "No"}</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<div className="w-full px-4 py-8 space-y-8">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Create Estimate</h1>
					<p className="text-muted-foreground">Generate professional estimates for your customers</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
						<Eye className="mr-2 w-4 h-4" />
						Preview
					</Button>
					<Button variant="outline" onClick={() => router.back()}>
						Cancel
					</Button>
				</div>
			</div>

			{/* Progress Steps */}
			<Card>
				<CardContent className="p-6">
					<div className="flex justify-between items-center">
						{steps.map((step, index) => (
							<div key={step.id} className="flex items-center">
								<div className="flex flex-col items-center">
									<div
										className={`flex justify-center items-center w-10 h-10 rounded-full border-2 transition-colors ${
											currentStep >= step.id ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground"
										}`}
									>
										{React.createElement(step.icon, { className: "w-5 h-5" })}
									</div>
									<span className={`mt-2 text-xs font-medium ${currentStep >= step.id ? "text-foreground" : "text-muted-foreground"}`}>{step.title}</span>
								</div>
								{index < steps.length - 1 && <div className={`flex-1 h-0.5 mx-4 ${currentStep > step.id ? "bg-primary" : "bg-muted"}`} />}
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Step Content */}
			<Card>
				<CardHeader>
					<CardTitle>{steps[currentStep - 1].title}</CardTitle>
					<CardDescription>
						Step {currentStep} of {steps.length}
					</CardDescription>
				</CardHeader>
				<CardContent>{renderStepContent()}</CardContent>
			</Card>

			{/* Navigation */}
			<div className="flex justify-between items-center">
				<Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
					Back
				</Button>
				<div className="flex gap-2">
					{currentStep < 6 ? (
						<Button onClick={handleNext} disabled={!validateStep(currentStep)}>
							Next
						</Button>
					) : (
						<div className="flex gap-2">
							<Button variant="outline" onClick={() => handleSave("save")} disabled={isSubmitting}>
								<Save className="mr-2 w-4 h-4" />
								Save Draft
							</Button>
							<Button onClick={() => handleSave("send")} disabled={isSubmitting}>
								<Send className="mr-2 w-4 h-4" />
								{estimateData.settings.sendAutomatically ? "Save & Send" : "Save Estimate"}
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
