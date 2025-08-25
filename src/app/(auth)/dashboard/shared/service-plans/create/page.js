"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Separator } from "@components/ui/separator";
import { Badge } from "@components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@components/ui/dialog";
import { Plus, Trash2, DollarSign, Settings, FileText, ArrowLeft, Save, AlertTriangle, CheckCircle, X } from "lucide-react";
import { toast } from "@components/ui/use-toast";

// Mock data for available services
const availableServices = [
	{
		id: "SVC001",
		name: "HVAC System Inspection",
		category: "HVAC",
		basePrice: 150,
		duration: 120,
		description: "Comprehensive inspection of heating and cooling systems",
		frequency: ["Annual", "Bi-annual", "Quarterly"],
	},
	{
		id: "SVC002",
		name: "Filter Replacement",
		category: "HVAC",
		basePrice: 45,
		duration: 30,
		description: "Replace air filters in HVAC system",
		frequency: ["Monthly", "Quarterly", "Bi-annual"],
	},
	{
		id: "SVC003",
		name: "Coil Cleaning",
		category: "HVAC",
		basePrice: 120,
		duration: 60,
		description: "Clean evaporator and condenser coils",
		frequency: ["Annual", "Bi-annual"],
	},
	{
		id: "SVC004",
		name: "Plumbing Inspection",
		category: "Plumbing",
		basePrice: 100,
		duration: 90,
		description: "Complete plumbing system inspection",
		frequency: ["Annual", "Bi-annual"],
	},
	{
		id: "SVC005",
		name: "Drain Cleaning",
		category: "Plumbing",
		basePrice: 85,
		duration: 45,
		description: "Professional drain cleaning service",
		frequency: ["Quarterly", "Bi-annual", "As needed"],
	},
	{
		id: "SVC006",
		name: "Water Heater Maintenance",
		category: "Plumbing",
		basePrice: 95,
		duration: 60,
		description: "Water heater inspection and maintenance",
		frequency: ["Annual", "Bi-annual"],
	},
	{
		id: "SVC007",
		name: "Electrical Safety Inspection",
		category: "Electrical",
		basePrice: 125,
		duration: 90,
		description: "Comprehensive electrical safety inspection",
		frequency: ["Annual", "Bi-annual"],
	},
	{
		id: "SVC008",
		name: "Panel Maintenance",
		category: "Electrical",
		basePrice: 80,
		duration: 45,
		description: "Electrical panel inspection and maintenance",
		frequency: ["Annual", "Bi-annual"],
	},
];

const planTypes = [
	{ value: "maintenance", label: "Maintenance Plan", description: "Regular maintenance and inspections" },
	{ value: "protection", label: "Protection Plan", description: "Coverage for repairs and emergencies" },
	{ value: "safety", label: "Safety Plan", description: "Focus on safety inspections and compliance" },
	{ value: "comprehensive", label: "Comprehensive Plan", description: "All-inclusive service and protection" },
];

const billingCycles = [
	{ value: "monthly", label: "Monthly", multiplier: 1 },
	{ value: "quarterly", label: "Quarterly", multiplier: 3 },
	{ value: "annual", label: "Annual", multiplier: 12 },
];

export default function CreateServicePlan() {
	const router = useRouter();
	const [currentStep, setCurrentStep] = useState(1);
	const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
	const [benefitDialogOpen, setBenefitDialogOpen] = useState(false);

	// Form state
	const [planData, setPlanData] = useState({
		name: "",
		description: "",
		category: "",
		type: "",
		duration: "12",
		billingCycle: "annual",
		price: 0,
		services: [],
		benefits: [],
		terms: "",
		status: "draft",
	});

	const [newService, setNewService] = useState({
		serviceId: "",
		frequency: "",
		customPrice: "",
		notes: "",
	});

	const [newBenefit, setNewBenefit] = useState("");

	const steps = [
		{ number: 1, title: "Basic Information", description: "Plan name, type, and description" },
		{ number: 2, title: "Services", description: "Add services to the plan" },
		{ number: 3, title: "Benefits & Terms", description: "Plan benefits and conditions" },
		{ number: 4, title: "Pricing", description: "Set pricing and billing" },
		{ number: 5, title: "Review", description: "Review and save plan" },
	];

	const handleInputChange = (field, value) => {
		setPlanData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const calculateEstimatedCost = () => {
		return planData.services.reduce((total, service) => {
			const baseService = availableServices.find((s) => s.id === service.serviceId);
			const price = service.customPrice ? parseFloat(service.customPrice) : baseService?.basePrice || 0;
			return total + price;
		}, 0);
	};

	const addService = () => {
		if (!newService.serviceId || !newService.frequency) {
			toast({
				title: "Validation Error",
				description: "Please select a service and frequency",
				variant: "destructive",
			});
			return;
		}

		const service = availableServices.find((s) => s.id === newService.serviceId);
		const planService = {
			...newService,
			id: Date.now().toString(),
			serviceName: service.name,
			serviceCategory: service.category,
			baseDuration: service.duration,
			basePrice: service.basePrice,
		};

		setPlanData((prev) => ({
			...prev,
			services: [...prev.services, planService],
		}));

		setNewService({ serviceId: "", frequency: "", customPrice: "", notes: "" });
		setServiceDialogOpen(false);

		toast({
			title: "Service Added",
			description: `${service.name} has been added to the plan`,
		});
	};

	const removeService = (serviceId) => {
		setPlanData((prev) => ({
			...prev,
			services: prev.services.filter((s) => s.id !== serviceId),
		}));
	};

	const addBenefit = () => {
		if (!newBenefit.trim()) return;

		setPlanData((prev) => ({
			...prev,
			benefits: [...prev.benefits, newBenefit.trim()],
		}));

		setNewBenefit("");
		setBenefitDialogOpen(false);
	};

	const removeBenefit = (index) => {
		setPlanData((prev) => ({
			...prev,
			benefits: prev.benefits.filter((_, i) => i !== index),
		}));
	};

	const handleSubmit = async () => {
		try {
			// In a real app, this would save to the database
			console.log("Saving plan:", planData);

			toast({
				title: "Service Plan Created",
				description: `${planData.name} has been created successfully`,
			});

			router.push("/dashboard/business/service-plans/templates");
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to create service plan",
				variant: "destructive",
			});
		}
	};

	const canProceedToNext = () => {
		switch (currentStep) {
			case 1:
				return planData.name && planData.type && planData.category;
			case 2:
				return planData.services.length > 0;
			case 3:
				return planData.benefits.length > 0;
			case 4:
				return planData.price > 0;
			case 5:
				return true;
			default:
				return false;
		}
	};

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" onClick={() => router.back()}>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back
				</Button>
				<div>
					<h1 className="text-3xl font-bold">Create Service Plan Template</h1>
					<p className="text-muted-foreground">Build a reusable service plan template</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				{/* Progress Steps */}
				<div className="lg:col-span-1">
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Progress</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{steps.map((step) => (
								<div key={step.number} className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${currentStep === step.number ? "bg-primary/10 border border-primary/20" : currentStep > step.number ? "bg-green-50 border border-green-200" : "bg-muted/50"}`}>
									<div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === step.number ? "bg-primary text-primary-foreground" : currentStep > step.number ? "bg-success text-white" : "bg-muted text-muted-foreground"}`}>{currentStep > step.number ? <CheckCircle className="w-4 h-4" /> : step.number}</div>
									<div className="flex-1 min-w-0">
										<p className={`font-medium text-sm ${currentStep >= step.number ? "text-foreground" : "text-muted-foreground"}`}>{step.title}</p>
										<p className="text-xs text-muted-foreground">{step.description}</p>
									</div>
								</div>
							))}
						</CardContent>
					</Card>

					{/* Quick Stats */}
					<Card className="mt-4">
						<CardHeader>
							<CardTitle className="text-lg">Plan Summary</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Services</span>
								<span className="font-medium">{planData.services.length}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Benefits</span>
								<span className="font-medium">{planData.benefits.length}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Est. Cost</span>
								<span className="font-medium">${calculateEstimatedCost()}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Price</span>
								<span className="font-medium text-success">${planData.price}</span>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Main Content */}
				<div className="lg:col-span-3">
					<Card>
						<CardHeader>
							<CardTitle>
								Step {currentStep}: {steps[currentStep - 1].title}
							</CardTitle>
							<CardDescription>{steps[currentStep - 1].description}</CardDescription>
						</CardHeader>
						<CardContent>
							{/* Step 1: Basic Information */}
							{currentStep === 1 && (
								<div className="space-y-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="name">Plan Name *</Label>
											<Input id="name" placeholder="e.g., HVAC Maintenance Gold" value={planData.name} onChange={(e) => handleInputChange("name", e.target.value)} />
										</div>

										<div className="space-y-2">
											<Label htmlFor="category">Category *</Label>
											<Select value={planData.category} onValueChange={(value) => handleInputChange("category", value)}>
												<SelectTrigger>
													<SelectValue placeholder="Select category" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="HVAC">HVAC</SelectItem>
													<SelectItem value="Plumbing">Plumbing</SelectItem>
													<SelectItem value="Electrical">Electrical</SelectItem>
													<SelectItem value="Multi-Service">Multi-Service</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="description">Description</Label>
										<Textarea id="description" placeholder="Describe what this plan offers..." value={planData.description} onChange={(e) => handleInputChange("description", e.target.value)} rows={3} />
									</div>

									<div className="space-y-3">
										<Label>Plan Type *</Label>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
											{planTypes.map((type) => (
												<div key={type.value} className={`p-4 border rounded-lg cursor-pointer transition-colors ${planData.type === type.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`} onClick={() => handleInputChange("type", type.value)}>
													<div className="flex items-center gap-2 mb-2">
														<div className={`w-3 h-3 rounded-full ${planData.type === type.value ? "bg-primary" : "bg-muted"}`} />
														<span className="font-medium">{type.label}</span>
													</div>
													<p className="text-sm text-muted-foreground">{type.description}</p>
												</div>
											))}
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="duration">Plan Duration (months)</Label>
											<Select value={planData.duration} onValueChange={(value) => handleInputChange("duration", value)}>
												<SelectTrigger>
													<SelectValue placeholder="Select duration" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="6">6 months</SelectItem>
													<SelectItem value="12">12 months</SelectItem>
													<SelectItem value="24">24 months</SelectItem>
													<SelectItem value="36">36 months</SelectItem>
												</SelectContent>
											</Select>
										</div>

										<div className="space-y-2">
											<Label htmlFor="billing">Billing Cycle</Label>
											<Select value={planData.billingCycle} onValueChange={(value) => handleInputChange("billingCycle", value)}>
												<SelectTrigger>
													<SelectValue placeholder="Select billing cycle" />
												</SelectTrigger>
												<SelectContent>
													{billingCycles.map((cycle) => (
														<SelectItem key={cycle.value} value={cycle.value}>
															{cycle.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									</div>
								</div>
							)}

							{/* Step 2: Services */}
							{currentStep === 2 && (
								<div className="space-y-6">
									<div className="flex justify-between items-center">
										<div>
											<h3 className="text-lg font-medium">Included Services</h3>
											<p className="text-sm text-muted-foreground">Add services that will be included in this plan</p>
										</div>
										<Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
											<DialogTrigger asChild>
												<Button>
													<Plus className="w-4 h-4 mr-2" />
													Add Service
												</Button>
											</DialogTrigger>
											<DialogContent>
												<DialogHeader>
													<DialogTitle>Add Service to Plan</DialogTitle>
													<DialogDescription>Select a service and configure its frequency</DialogDescription>
												</DialogHeader>

												<div className="space-y-4">
													<div className="space-y-2">
														<Label htmlFor="service">Service *</Label>
														<Select value={newService.serviceId} onValueChange={(value) => setNewService((prev) => ({ ...prev, serviceId: value }))}>
															<SelectTrigger>
																<SelectValue placeholder="Select a service" />
															</SelectTrigger>
															<SelectContent>
																{availableServices.map((service) => (
																	<SelectItem key={service.id} value={service.id}>
																		<div className="flex justify-between items-center w-full">
																			<div>
																				<span>{service.name}</span>
																				<Badge variant="outline" className="ml-2">
																					{service.category}
																				</Badge>
																			</div>
																			<span className="text-sm text-muted-foreground">${service.basePrice}</span>
																		</div>
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</div>

													{newService.serviceId && (
														<div className="space-y-2">
															<Label htmlFor="frequency">Frequency *</Label>
															<Select value={newService.frequency} onValueChange={(value) => setNewService((prev) => ({ ...prev, frequency: value }))}>
																<SelectTrigger>
																	<SelectValue placeholder="Select frequency" />
																</SelectTrigger>
																<SelectContent>
																	{availableServices
																		.find((s) => s.id === newService.serviceId)
																		?.frequency.map((freq) => (
																			<SelectItem key={freq} value={freq}>
																				{freq}
																			</SelectItem>
																		))}
																</SelectContent>
															</Select>
														</div>
													)}

													<div className="space-y-2">
														<Label htmlFor="customPrice">Custom Price (optional)</Label>
														<Input id="customPrice" type="number" placeholder="Override default price" value={newService.customPrice} onChange={(e) => setNewService((prev) => ({ ...prev, customPrice: e.target.value }))} />
													</div>

													<div className="space-y-2">
														<Label htmlFor="notes">Notes (optional)</Label>
														<Textarea id="notes" placeholder="Additional notes about this service" value={newService.notes} onChange={(e) => setNewService((prev) => ({ ...prev, notes: e.target.value }))} />
													</div>
												</div>

												<DialogFooter>
													<Button variant="outline" onClick={() => setServiceDialogOpen(false)}>
														Cancel
													</Button>
													<Button onClick={addService}>Add Service</Button>
												</DialogFooter>
											</DialogContent>
										</Dialog>
									</div>

									{planData.services.length === 0 ? (
										<div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
											<Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
											<h3 className="text-lg font-medium text-foreground mb-2">No services added yet</h3>
											<p className="text-muted-foreground mb-4">Add services that will be included in this plan</p>
											<Button onClick={() => setServiceDialogOpen(true)}>
												<Plus className="w-4 h-4 mr-2" />
												Add First Service
											</Button>
										</div>
									) : (
										<div className="space-y-4">
											{planData.services.map((service) => (
												<div key={service.id} className="border rounded-lg p-4">
													<div className="flex justify-between items-start">
														<div className="flex-1">
															<div className="flex items-center gap-2 mb-2">
																<h4 className="font-medium">{service.serviceName}</h4>
																<Badge variant="outline">{service.serviceCategory}</Badge>
															</div>
															<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
																<div>
																	<span className="text-muted-foreground">Frequency</span>
																	<p className="font-medium">{service.frequency}</p>
																</div>
																<div>
																	<span className="text-muted-foreground">Duration</span>
																	<p className="font-medium">{service.baseDuration} min</p>
																</div>
																<div>
																	<span className="text-muted-foreground">Base Price</span>
																	<p className="font-medium">${service.basePrice}</p>
																</div>
																<div>
																	<span className="text-muted-foreground">Plan Price</span>
																	<p className="font-medium text-success">${service.customPrice || service.basePrice}</p>
																</div>
															</div>
															{service.notes && <p className="text-sm text-muted-foreground mt-2">{service.notes}</p>}
														</div>
														<Button variant="ghost" size="sm" onClick={() => removeService(service.id)}>
															<Trash2 className="w-4 h-4" />
														</Button>
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							)}

							{/* Step 3: Benefits & Terms */}
							{currentStep === 3 && (
								<div className="space-y-6">
									<div>
										<div className="flex justify-between items-center mb-4">
											<div>
												<h3 className="text-lg font-medium">Plan Benefits</h3>
												<p className="text-sm text-muted-foreground">List the benefits customers get with this plan</p>
											</div>
											<Dialog open={benefitDialogOpen} onOpenChange={setBenefitDialogOpen}>
												<DialogTrigger asChild>
													<Button>
														<Plus className="w-4 h-4 mr-2" />
														Add Benefit
													</Button>
												</DialogTrigger>
												<DialogContent>
													<DialogHeader>
														<DialogTitle>Add Plan Benefit</DialogTitle>
														<DialogDescription>Describe a benefit customers get with this plan</DialogDescription>
													</DialogHeader>

													<div className="space-y-4">
														<div className="space-y-2">
															<Label htmlFor="benefit">Benefit Description</Label>
															<Textarea id="benefit" placeholder="e.g., 20% discount on repairs" value={newBenefit} onChange={(e) => setNewBenefit(e.target.value)} />
														</div>
													</div>

													<DialogFooter>
														<Button variant="outline" onClick={() => setBenefitDialogOpen(false)}>
															Cancel
														</Button>
														<Button onClick={addBenefit}>Add Benefit</Button>
													</DialogFooter>
												</DialogContent>
											</Dialog>
										</div>

										{planData.benefits.length === 0 ? (
											<div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
												<FileText className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
												<h3 className="font-medium text-foreground mb-1">No benefits added yet</h3>
												<p className="text-muted-foreground text-sm mb-3">Add benefits to make your plan attractive</p>
												<Button size="sm" onClick={() => setBenefitDialogOpen(true)}>
													<Plus className="w-4 h-4 mr-2" />
													Add First Benefit
												</Button>
											</div>
										) : (
											<div className="space-y-2">
												{planData.benefits.map((benefit, index) => (
													<div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
														<div className="w-2 h-2 bg-success rounded-full" />
														<span className="flex-1">{benefit}</span>
														<Button variant="ghost" size="sm" onClick={() => removeBenefit(index)}>
															<X className="w-4 h-4" />
														</Button>
													</div>
												))}
											</div>
										)}
									</div>

									<Separator />

									<div className="space-y-2">
										<Label htmlFor="terms">Terms & Conditions</Label>
										<Textarea id="terms" placeholder="Enter terms and conditions for this plan..." value={planData.terms} onChange={(e) => handleInputChange("terms", e.target.value)} rows={4} />
									</div>
								</div>
							)}

							{/* Step 4: Pricing */}
							{currentStep === 4 && (
								<div className="space-y-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-4">
											<h3 className="text-lg font-medium">Pricing Information</h3>

											<div className="space-y-2">
												<Label htmlFor="price">Plan Price *</Label>
												<div className="relative">
													<DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
													<Input id="price" type="number" placeholder="0.00" value={planData.price} onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)} className="pl-10" />
												</div>
											</div>

											<div className="p-4 bg-accent rounded-lg">
												<div className="text-sm text-muted-foreground mb-1">Billing Schedule</div>
												<div className="font-medium">
													${planData.price} per {planData.billingCycle}
												</div>
												<div className="text-sm text-muted-foreground mt-1">Plan duration: {planData.duration} months</div>
											</div>
										</div>

										<div className="space-y-4">
											<h3 className="text-lg font-medium">Cost Analysis</h3>

											<div className="space-y-3">
												<div className="flex justify-between">
													<span className="text-muted-foreground">Estimated Service Cost</span>
													<span className="font-medium">${calculateEstimatedCost()}</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">Plan Price</span>
													<span className="font-medium">${planData.price}</span>
												</div>
												<Separator />
												<div className="flex justify-between">
													<span className="font-medium">Customer Savings</span>
													<span className={`font-medium ${calculateEstimatedCost() > planData.price ? "text-success" : "text-destructive"}`}>${calculateEstimatedCost() > planData.price ? (calculateEstimatedCost() - planData.price).toFixed(2) : "0.00"}</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">Discount %</span>
													<span className="font-medium">{calculateEstimatedCost() > 0 ? (((calculateEstimatedCost() - planData.price) / calculateEstimatedCost()) * 100).toFixed(1) : 0}%</span>
												</div>
											</div>

											{calculateEstimatedCost() <= planData.price && (
												<div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
													<div className="flex items-start gap-2">
														<AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
														<div className="text-sm">
															<p className="font-medium text-warning">Price Warning</p>
															<p className="text-warning">Plan price should be lower than service cost to provide customer value</p>
														</div>
													</div>
												</div>
											)}
										</div>
									</div>
								</div>
							)}

							{/* Step 5: Review */}
							{currentStep === 5 && (
								<div className="space-y-6">
									<h3 className="text-lg font-medium">Review Plan Details</h3>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-4">
											<div>
												<h4 className="font-medium mb-2">Basic Information</h4>
												<div className="space-y-2 text-sm">
													<div className="flex justify-between">
														<span className="text-muted-foreground">Name</span>
														<span>{planData.name}</span>
													</div>
													<div className="flex justify-between">
														<span className="text-muted-foreground">Category</span>
														<span>{planData.category}</span>
													</div>
													<div className="flex justify-between">
														<span className="text-muted-foreground">Type</span>
														<span>{planData.type}</span>
													</div>
													<div className="flex justify-between">
														<span className="text-muted-foreground">Duration</span>
														<span>{planData.duration} months</span>
													</div>
												</div>
											</div>

											<div>
												<h4 className="font-medium mb-2">Pricing</h4>
												<div className="space-y-2 text-sm">
													<div className="flex justify-between">
														<span className="text-muted-foreground">Price</span>
														<span className="font-medium">${planData.price}</span>
													</div>
													<div className="flex justify-between">
														<span className="text-muted-foreground">Billing</span>
														<span>{planData.billingCycle}</span>
													</div>
													<div className="flex justify-between">
														<span className="text-muted-foreground">Total Revenue</span>
														<span className="font-medium text-success">${(planData.price * (billingCycles.find((c) => c.value === planData.billingCycle)?.multiplier || 1) * (parseInt(planData.duration) / 12)).toFixed(2)}</span>
													</div>
												</div>
											</div>
										</div>

										<div className="space-y-4">
											<div>
												<h4 className="font-medium mb-2">Services ({planData.services.length})</h4>
												<div className="space-y-1 text-sm">
													{planData.services.map((service, index) => (
														<div key={index} className="flex justify-between">
															<span className="text-muted-foreground">{service.serviceName}</span>
															<span>{service.frequency}</span>
														</div>
													))}
												</div>
											</div>

											<div>
												<h4 className="font-medium mb-2">Benefits ({planData.benefits.length})</h4>
												<div className="space-y-1 text-sm">
													{planData.benefits.map((benefit, index) => (
														<div key={index} className="flex items-start gap-2">
															<div className="w-1 h-1 bg-success rounded-full mt-2" />
															<span className="text-muted-foreground flex-1">{benefit}</span>
														</div>
													))}
												</div>
											</div>
										</div>
									</div>

									{planData.description && (
										<div>
											<h4 className="font-medium mb-2">Description</h4>
											<p className="text-sm text-muted-foreground">{planData.description}</p>
										</div>
									)}

									{planData.terms && (
										<div>
											<h4 className="font-medium mb-2">Terms & Conditions</h4>
											<p className="text-sm text-muted-foreground">{planData.terms}</p>
										</div>
									)}
								</div>
							)}

							{/* Navigation */}
							<div className="flex justify-between items-center mt-8 pt-6 border-t">
								<Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)} disabled={currentStep === 1}>
									Previous
								</Button>

								<div className="flex gap-2">
									<Button variant="outline" onClick={() => handleInputChange("status", "draft")}>
										<Save className="w-4 h-4 mr-2" />
										Save as Draft
									</Button>

									{currentStep === 5 ? (
										<Button onClick={handleSubmit}>
											<CheckCircle className="w-4 h-4 mr-2" />
											Create Plan
										</Button>
									) : (
										<Button onClick={() => setCurrentStep(currentStep + 1)} disabled={!canProceedToNext()}>
											Next
										</Button>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
