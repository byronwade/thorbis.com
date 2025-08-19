"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Badge } from "@components/ui/badge";
import { Label } from "@components/ui/label";
import { CheckCircle, Upload, Plus, X, Save, AlertTriangle } from "lucide-react";
import { toast } from "@components/ui/use-toast";

const businessCategories = ["Restaurant", "Retail", "Services", "Health & Wellness", "Automotive"];
const subscriptionTiers = [
	{ name: "Basic", value: "basic", price: 29, features: ["Basic Listing", "Contact Info", "Customer Reviews"], popular: false },
	{ name: "Pro", value: "pro", price: 59, features: ["Enhanced Listing", "Photo Gallery", "Respond to Reviews", "Analytics"], popular: true },
	{ name: "Premium", value: "premium", price: 99, features: ["Featured Listing", "Video Uploads", "Deals & Offers", "Premium Support"], popular: false },
];

export function BusinessForm({ formType }) {
	const [currentStep, setCurrentStep] = useState(1);
	const [selectedTier, setSelectedTier] = useState("pro");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [autoSaveStatus, setAutoSaveStatus] = useState("saved");
	const [validationErrors, setValidationErrors] = useState({});
	const [businessData, setBusinessData] = useState({
		name: "",
		category: "",
		description: "",
		address: "",
		city: "",
		state: "",
		zipCode: "",
		phone: "",
		email: "",
		website: "",
		hours: {},
		services: [],
		photos: [],
	});
	const [newService, setNewService] = useState("");

	// Auto-save functionality
	useEffect(() => {
		const autoSaveTimer = setTimeout(() => {
			if (businessData.name || businessData.category || businessData.description) {
				setAutoSaveStatus("saving");
				// Simulate auto-save
				setTimeout(() => {
					setAutoSaveStatus("saved");
					toast({
						title: "Progress saved",
						description: "Your business information has been automatically saved.",
					});
				}, 1000);
			}
		}, 2000);

		return () => clearTimeout(autoSaveTimer);
	}, [businessData]);

	const validateStep = (step) => {
		const errors = {};

		switch (step) {
			case 1:
				if (!businessData.name.trim()) errors.name = "Business name is required";
				if (!businessData.category) errors.category = "Category is required";
				break;
			case 2:
				if (!businessData.address.trim()) errors.address = "Address is required";
				if (!businessData.city.trim()) errors.city = "City is required";
				if (!businessData.phone.trim()) errors.phone = "Phone number is required";
				if (businessData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessData.email)) {
					errors.email = "Please enter a valid email address";
				}
				break;
			case 3:
				if (!selectedTier) errors.tier = "Please select a subscription tier";
				break;
			case 4:
				if (businessData.services.length === 0) errors.services = "At least one service is required";
				break;
		}

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleInputChange = (field, value) => {
		setBusinessData((prev) => ({
			...prev,
			[field]: value,
		}));

		if (validationErrors[field]) {
			setValidationErrors((prev) => ({ ...prev, [field]: null }));
		}
	};

	const addService = () => {
		if (newService.trim()) {
			setBusinessData((prev) => ({
				...prev,
				services: [...prev.services, newService.trim()],
			}));
			setNewService("");
			setValidationErrors((prev) => ({ ...prev, services: null }));
		}
	};

	const removeService = (index) => {
		setBusinessData((prev) => ({
			...prev,
			services: prev.services.filter((_, i) => i !== index),
		}));
	};

	const handleNext = () => {
		if (validateStep(currentStep) && currentStep < 4) {
			setCurrentStep(currentStep + 1);
		} else if (!validateStep(currentStep)) {
			toast({
				title: "Please fix the errors",
				description: "Please complete all required fields before continuing.",
				variant: "destructive",
			});
		}
	};

	const handlePrevious = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleSubmit = async () => {
		if (!validateStep(4)) {
			toast({
				title: "Please fix the errors",
				description: "Please complete all required fields before submitting.",
				variant: "destructive",
			});
			return;
		}

		setIsSubmitting(true);
		try {
			await new Promise((resolve) => setTimeout(resolve, 2000));
			toast({
				title: "Setup Complete!",
				description: "Your business profile has been created successfully.",
			});
		} catch (error) {
			toast({
				title: "Error",
				description: "There was an error setting up your business. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const renderStepContent = () => {
		switch (currentStep) {
			case 1:
				return (
					<div className="space-y-6">
						<div className="text-center space-y-2">
							<h2 className="text-2xl font-bold">Welcome to the Directory!</h2>
							<p className="text-muted-foreground">Let&apos;s get your business set up.</p>
						</div>

						<div className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="business-name">Business Name *</Label>
									<Input id="business-name" value={businessData.name} onChange={(e) => handleInputChange("name", e.target.value)} placeholder="Your Business Name" className={validationErrors.name ? "border-destructive" : ""} />
									{validationErrors.name && <p className="text-sm text-destructive mt-1">{validationErrors.name}</p>}
								</div>
								<div>
									<Label htmlFor="category">Category *</Label>
									<Select value={businessData.category} onValueChange={(value) => handleInputChange("category", value)}>
										<SelectTrigger className={validationErrors.category ? "border-destructive" : ""}>
											<SelectValue placeholder="Select category" />
										</SelectTrigger>
										<SelectContent>
											{businessCategories.map((category) => (
												<SelectItem key={category} value={category}>
													{category}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{validationErrors.category && <p className="text-sm text-destructive mt-1">{validationErrors.category}</p>}
								</div>
							</div>

							<div>
								<Label htmlFor="description">Business Description</Label>
								<Textarea id="description" value={businessData.description} onChange={(e) => handleInputChange("description", e.target.value)} placeholder="Describe your business, services, and what makes you special..." rows={4} />
							</div>
						</div>
					</div>
				);

			case 2:
				return (
					<div className="space-y-6">
						<div className="text-center space-y-2">
							<h2 className="text-2xl font-bold">Contact Information</h2>
							<p className="text-muted-foreground">Help customers find and contact your business.</p>
						</div>

						<div className="space-y-4">
							<div>
								<Label htmlFor="address">Street Address *</Label>
								<Input id="address" value={businessData.address} onChange={(e) => handleInputChange("address", e.target.value)} placeholder="123 Main Street" className={validationErrors.address ? "border-destructive" : ""} />
								{validationErrors.address && <p className="text-sm text-destructive mt-1">{validationErrors.address}</p>}
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<Label htmlFor="city">City *</Label>
									<Input id="city" value={businessData.city} onChange={(e) => handleInputChange("city", e.target.value)} placeholder="Portland" className={validationErrors.city ? "border-destructive" : ""} />
									{validationErrors.city && <p className="text-sm text-destructive mt-1">{validationErrors.city}</p>}
								</div>
								<div>
									<Label htmlFor="state">State</Label>
									<Input id="state" value={businessData.state} onChange={(e) => handleInputChange("state", e.target.value)} placeholder="OR" />
								</div>
								<div>
									<Label htmlFor="zip">ZIP Code</Label>
									<Input id="zip" value={businessData.zipCode} onChange={(e) => handleInputChange("zipCode", e.target.value)} placeholder="97201" />
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="phone">Phone Number *</Label>
									<Input id="phone" value={businessData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} placeholder="(503) 555-0123" className={validationErrors.phone ? "border-destructive" : ""} />
									{validationErrors.phone && <p className="text-sm text-destructive mt-1">{validationErrors.phone}</p>}
								</div>
								<div>
									<Label htmlFor="email">Email Address *</Label>
									<Input id="email" type="email" value={businessData.email} onChange={(e) => handleInputChange("email", e.target.value)} placeholder="info@yourbusiness.com" className={validationErrors.email ? "border-destructive" : ""} />
									{validationErrors.email && <p className="text-sm text-destructive mt-1">{validationErrors.email}</p>}
								</div>
							</div>

							<div>
								<Label htmlFor="website">Website</Label>
								<Input id="website" value={businessData.website} onChange={(e) => handleInputChange("website", e.target.value)} placeholder="https://www.yourbusiness.com" />
							</div>
						</div>
					</div>
				);

			case 3:
				return (
					<div className="space-y-6">
						<div className="text-center space-y-2">
							<h2 className="text-2xl font-bold">Choose Your Plan</h2>
							<p className="text-muted-foreground">Select the subscription tier that best fits your business needs.</p>
						</div>

						<div className="grid gap-6 md:grid-cols-3">
							{subscriptionTiers.map((tier) => (
								<Card key={tier.value} className={`cursor-pointer transition-all ${selectedTier === tier.value ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"} ${tier.popular ? "relative" : ""}`} onClick={() => setSelectedTier(tier.value)}>
									{tier.popular && (
										<div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
											<Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
										</div>
									)}
									<CardHeader className="text-center">
										<CardTitle className="text-xl">{tier.name}</CardTitle>
										<div className="text-3xl font-bold">
											${tier.price}
											<span className="text-sm font-normal text-muted-foreground">/month</span>
										</div>
									</CardHeader>
									<CardContent>
										<ul className="space-y-2">
											{tier.features.map((feature, index) => (
												<li key={index} className="flex items-center text-sm">
													<CheckCircle className="w-4 h-4 text-success mr-2 flex-shrink-0" />
													{feature}
												</li>
											))}
										</ul>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				);

			case 4:
				return (
					<div className="space-y-6">
						<div className="text-center space-y-2">
							<h2 className="text-2xl font-bold">Services & Details</h2>
							<p className="text-muted-foreground">Add your services and any additional details about your business.</p>
						</div>

						<div className="space-y-4">
							<div>
								<Label>Services Offered</Label>
								<div className="flex space-x-2 mt-1">
									<Input value={newService} onChange={(e) => setNewService(e.target.value)} placeholder="Add a service..." onKeyPress={(e) => e.key === "Enter" && addService()} />
									<Button type="button" onClick={addService}>
										<Plus className="w-4 h-4" />
									</Button>
								</div>
								{businessData.services.length > 0 && (
									<div className="flex flex-wrap gap-2 mt-2">
										{businessData.services.map((service, index) => (
											<Badge key={index} variant="secondary" className="flex items-center gap-1">
												{service}
												<X className="w-3 h-3 cursor-pointer" onClick={() => removeService(index)} />
											</Badge>
										))}
									</div>
								)}
							</div>

							<div>
								<Label>Business Photos</Label>
								<div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
									<Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
									<p className="text-sm text-muted-foreground">Drag & drop photos here or click to upload</p>
									<Button variant="outline" className="mt-2">
										Choose Files
									</Button>
								</div>
							</div>
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<div className="w-full max-w-4xl">
			<div className="mb-8">
				<div className="flex items-center justify-between mb-2">
					<span className="text-sm font-medium">Step {currentStep} of 4</span>
					<div className="flex items-center space-x-2">
						<span className="text-sm text-muted-foreground">{Math.round((currentStep / 4) * 100)}% Complete</span>
						{autoSaveStatus === "saving" && (
							<div className="flex items-center space-x-1 text-sm text-primary">
								<Save className="w-3 h-3 animate-spin" />
								<span>Saving...</span>
							</div>
						)}
						{autoSaveStatus === "saved" && (
							<div className="flex items-center space-x-1 text-sm text-success">
								<CheckCircle className="w-3 h-3" />
								<span>Saved</span>
							</div>
						)}
					</div>
				</div>
				<div className="w-full bg-muted rounded-full h-2">
					<div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${(currentStep / 4) * 100}%` }} />
				</div>
			</div>

			{Object.keys(validationErrors).length > 0 && (
				<Alert variant="destructive" className="mb-6">
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>Please fix the following errors before continuing: {Object.values(validationErrors).filter(Boolean).join(", ")}</AlertDescription>
				</Alert>
			)}

			<Card>
				<CardContent className="p-8">
					{renderStepContent()}
					<div className="flex justify-between pt-8 border-t">
						<Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1 || isSubmitting}>
							Previous
						</Button>
						{currentStep < 4 ? (
							<Button onClick={handleNext} disabled={isSubmitting}>
								Next
							</Button>
						) : (
							<Button onClick={handleSubmit} disabled={isSubmitting}>
								{isSubmitting ? "Setting up..." : "Complete Setup"}
							</Button>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
