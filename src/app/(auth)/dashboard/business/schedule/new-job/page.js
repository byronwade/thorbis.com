"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Checkbox } from "@components/ui/checkbox";
import { ArrowLeft, MapPin, Phone, Plus, Save, X, User, Mail, Wrench, Timer, Zap, Settings, CheckCircle, Building, Home } from "lucide-react";
import { format, addDays, addHours, startOfHour } from "date-fns";
import { toast } from "@components/ui/use-toast";

/**
 * New Job Creation Page
 * Comprehensive form for creating new service appointments with customer, technician, and service details
 */
export default function NewJob() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [currentStep, setCurrentStep] = useState(1);
	const [errors, setErrors] = useState({});

	const [jobData, setJobData] = useState({
		// Customer Information
		customerId: "",
		customerType: "existing", // existing, new
		customerName: "",
		customerEmail: "",
		customerPhone: "",
		customerAddress: "",
		customerNotes: "",

		// Job Details
		title: "",
		description: "",
		serviceType: "",
		priority: "normal",
		estimatedValue: "",
		estimatedDuration: "2",

		// Scheduling
		scheduledDate: format(addDays(new Date(), 1), "yyyy-MM-dd"),
		scheduledTime: format(addHours(startOfHour(new Date()), 1), "HH:mm"),
		assignedTechnician: "",

		// Additional Details
		equipment: [],
		partsNeeded: [],
		specialRequirements: "",
		accessInstructions: "",

		// Billing
		requiresEstimate: true,
		urgentJob: false,
		followUpRequired: false,
	});

	// Mock data
	const [customers, setCustomers] = useState([]);
	const [technicians, setTechnicians] = useState([]);
	const [services, setServices] = useState([]);

	const mockCustomers = [
		{
			id: "CUST001",
			name: "Sarah Johnson",
			email: "sarah.j@email.com",
			phone: "(555) 123-4567",
			address: "123 Main St, Downtown",
			type: "residential",
			jobHistory: 5,
		},
		{
			id: "CUST002",
			name: "Bob's Restaurant",
			email: "manager@bobsrestaurant.com",
			phone: "(555) 456-7890",
			address: "456 Business Ave, Business District",
			type: "commercial",
			jobHistory: 12,
		},
		{
			id: "CUST003",
			name: "Mountain View Apartments",
			email: "maintenance@mvapartments.com",
			phone: "(555) 789-0123",
			address: "789 Residential Rd, Residential Zone",
			type: "commercial",
			jobHistory: 8,
		},
	];

	const mockTechnicians = [
		{
			id: "TECH001",
			name: "Mike Wilson",
			skills: ["HVAC", "Plumbing", "Electrical"],
			rating: 4.9,
			availability: "available",
			todaysJobs: 4,
		},
		{
			id: "TECH002",
			name: "Lisa Chen",
			skills: ["Electrical", "Lighting", "Wiring"],
			rating: 4.7,
			availability: "busy",
			todaysJobs: 6,
		},
		{
			id: "TECH003",
			name: "David Brown",
			skills: ["Plumbing", "Drainage", "Water Systems"],
			rating: 4.8,
			availability: "available",
			todaysJobs: 3,
		},
	];

	const mockServices = [
		{ id: "hvac_maintenance", name: "HVAC Maintenance", category: "HVAC", duration: "2-3", price: "250-400" },
		{ id: "hvac_repair", name: "HVAC Repair", category: "HVAC", duration: "1-4", price: "150-600" },
		{ id: "hvac_installation", name: "HVAC Installation", category: "HVAC", duration: "4-8", price: "800-2500" },
		{ id: "electrical_repair", name: "Electrical Repair", category: "Electrical", duration: "1-3", price: "100-400" },
		{ id: "electrical_panel", name: "Panel Upgrade", category: "Electrical", duration: "4-6", price: "500-1200" },
		{ id: "plumbing_drain", name: "Drain Cleaning", category: "Plumbing", duration: "1-2", price: "100-250" },
		{ id: "plumbing_leak", name: "Leak Repair", category: "Plumbing", duration: "1-3", price: "150-400" },
		{ id: "plumbing_installation", name: "Fixture Installation", category: "Plumbing", duration: "2-4", price: "200-600" },
	];

	useEffect(() => {
		setCustomers(mockCustomers);
		setTechnicians(mockTechnicians);
		setServices(mockServices);
	}, []);

	// Validation
	const validateStep = (step) => {
		const newErrors = {};

		switch (step) {
			case 1: // Customer Information
				if (jobData.customerType === "new") {
					if (!jobData.customerName.trim()) newErrors.customerName = "Customer name is required";
					if (!jobData.customerPhone.trim()) newErrors.customerPhone = "Phone number is required";
					if (!jobData.customerAddress.trim()) newErrors.customerAddress = "Address is required";
				} else {
					if (!jobData.customerId) newErrors.customerId = "Please select a customer";
				}
				break;
			case 2: // Job Details
				if (!jobData.title.trim()) newErrors.title = "Job title is required";
				if (!jobData.serviceType) newErrors.serviceType = "Service type is required";
				if (!jobData.description.trim()) newErrors.description = "Description is required";
				break;
			case 3: // Scheduling
				if (!jobData.scheduledDate) newErrors.scheduledDate = "Date is required";
				if (!jobData.scheduledTime) newErrors.scheduledTime = "Time is required";
				if (!jobData.assignedTechnician) newErrors.assignedTechnician = "Please assign a technician";
				break;
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleNext = () => {
		if (validateStep(currentStep) && currentStep < 4) {
			setCurrentStep(currentStep + 1);
			setErrors({});
		}
	};

	const handleBack = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
			setErrors({});
		}
	};

	const handleSubmit = async () => {
		if (!validateStep(3)) return;

		setIsSubmitting(true);
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 2000));

			toast({
				title: "Job Created Successfully",
				description: "The new job has been scheduled and assigned to the technician.",
				action: (
					<Button variant="outline" size="sm" onClick={() => router.push("/dashboard/business/schedule/calendar")}>
						View Calendar
					</Button>
				),
			});

			router.push("/dashboard/business/schedule/calendar");
		} catch (error) {
			toast({
				title: "Error Creating Job",
				description: "Please try again or contact support if the problem persists.",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const updateJobData = (field, value) => {
		setJobData((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: null }));
		}
	};

	const getSelectedCustomer = () => {
		return customers.find((c) => c.id === jobData.customerId);
	};

	const getSelectedService = () => {
		return services.find((s) => s.id === jobData.serviceType);
	};

	const getSelectedTechnician = () => {
		return technicians.find((t) => t.id === jobData.assignedTechnician);
	};

	const getServiceIcon = (category) => {
		switch (category) {
			case "HVAC":
				return <Timer className="w-4 h-4" />;
			case "Electrical":
				return <Zap className="w-4 h-4" />;
			case "Plumbing":
				return <Wrench className="w-4 h-4" />;
			default:
				return <Settings className="w-4 h-4" />;
		}
	};

	const renderStepContent = () => {
		switch (currentStep) {
			case 1:
				return (
					<div className="space-y-6">
						<div>
							<Label className="text-base font-medium">Customer Type</Label>
							<div className="flex gap-4 mt-2">
								<Button variant={jobData.customerType === "existing" ? "default" : "outline"} onClick={() => updateJobData("customerType", "existing")} className="flex-1">
									<User className="w-4 h-4 mr-2" />
									Existing Customer
								</Button>
								<Button variant={jobData.customerType === "new" ? "default" : "outline"} onClick={() => updateJobData("customerType", "new")} className="flex-1">
									<Plus className="w-4 h-4 mr-2" />
									New Customer
								</Button>
							</div>
						</div>

						{jobData.customerType === "existing" ? (
							<div>
								<Label htmlFor="customer">Select Customer *</Label>
								<Select value={jobData.customerId} onValueChange={(value) => updateJobData("customerId", value)}>
									<SelectTrigger className={errors.customerId ? "border-red-500" : ""}>
										<SelectValue placeholder="Choose a customer" />
									</SelectTrigger>
									<SelectContent>
										{customers.map((customer) => (
											<SelectItem key={customer.id} value={customer.id}>
												<div className="flex items-center gap-3">
													{customer.type === "commercial" ? <Building className="w-4 h-4" /> : <Home className="w-4 h-4" />}
													<div>
														<p className="font-medium">{customer.name}</p>
														<p className="text-xs text-muted-foreground">
															{customer.phone} • {customer.jobHistory} jobs
														</p>
													</div>
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{errors.customerId && <p className="text-sm text-destructive mt-1">{errors.customerId}</p>}

								{getSelectedCustomer() && (
									<Card className="mt-4">
										<CardContent className="p-4">
											<div className="space-y-2">
												<div className="flex items-center gap-2">
													<Phone className="w-4 h-4 text-muted-foreground" />
													<span>{getSelectedCustomer().phone}</span>
												</div>
												<div className="flex items-center gap-2">
													<Mail className="w-4 h-4 text-muted-foreground" />
													<span>{getSelectedCustomer().email}</span>
												</div>
												<div className="flex items-center gap-2">
													<MapPin className="w-4 h-4 text-muted-foreground" />
													<span>{getSelectedCustomer().address}</span>
												</div>
											</div>
										</CardContent>
									</Card>
								)}
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="customerName">Customer Name *</Label>
									<Input id="customerName" value={jobData.customerName} onChange={(e) => updateJobData("customerName", e.target.value)} placeholder="Enter customer name" className={errors.customerName ? "border-red-500" : ""} />
									{errors.customerName && <p className="text-sm text-destructive mt-1">{errors.customerName}</p>}
								</div>
								<div>
									<Label htmlFor="customerPhone">Phone Number *</Label>
									<Input id="customerPhone" value={jobData.customerPhone} onChange={(e) => updateJobData("customerPhone", e.target.value)} placeholder="(555) 123-4567" className={errors.customerPhone ? "border-red-500" : ""} />
									{errors.customerPhone && <p className="text-sm text-destructive mt-1">{errors.customerPhone}</p>}
								</div>
								<div>
									<Label htmlFor="customerEmail">Email Address</Label>
									<Input id="customerEmail" type="email" value={jobData.customerEmail} onChange={(e) => updateJobData("customerEmail", e.target.value)} placeholder="customer@email.com" />
								</div>
								<div>
									<Label htmlFor="customerAddress">Address *</Label>
									<Input id="customerAddress" value={jobData.customerAddress} onChange={(e) => updateJobData("customerAddress", e.target.value)} placeholder="123 Main St, City, State" className={errors.customerAddress ? "border-red-500" : ""} />
									{errors.customerAddress && <p className="text-sm text-destructive mt-1">{errors.customerAddress}</p>}
								</div>
								<div className="md:col-span-2">
									<Label htmlFor="customerNotes">Customer Notes</Label>
									<Textarea id="customerNotes" value={jobData.customerNotes} onChange={(e) => updateJobData("customerNotes", e.target.value)} placeholder="Any special notes about the customer..." rows={3} />
								</div>
							</div>
						)}
					</div>
				);

			case 2:
				return (
					<div className="space-y-6">
						<div>
							<Label htmlFor="title">Job Title *</Label>
							<Input id="title" value={jobData.title} onChange={(e) => updateJobData("title", e.target.value)} placeholder="e.g., HVAC System Maintenance" className={errors.title ? "border-red-500" : ""} />
							{errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
						</div>

						<div>
							<Label htmlFor="serviceType">Service Type *</Label>
							<Select value={jobData.serviceType} onValueChange={(value) => updateJobData("serviceType", value)}>
								<SelectTrigger className={errors.serviceType ? "border-red-500" : ""}>
									<SelectValue placeholder="Select service type" />
								</SelectTrigger>
								<SelectContent>
									{["HVAC", "Electrical", "Plumbing"].map((category) => (
										<div key={category}>
											<div className="px-2 py-1.5 text-sm font-medium text-muted-foreground bg-muted">{category}</div>
											{services
												.filter((s) => s.category === category)
												.map((service) => (
													<SelectItem key={service.id} value={service.id}>
														<div className="flex items-center gap-3">
															{getServiceIcon(service.category)}
															<div>
																<p className="font-medium">{service.name}</p>
																<p className="text-xs text-muted-foreground">
																	{service.duration}h • ${service.price}
																</p>
															</div>
														</div>
													</SelectItem>
												))}
										</div>
									))}
								</SelectContent>
							</Select>
							{errors.serviceType && <p className="text-sm text-destructive mt-1">{errors.serviceType}</p>}
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="priority">Priority</Label>
								<Select value={jobData.priority} onValueChange={(value) => updateJobData("priority", value)}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="low">Low Priority</SelectItem>
										<SelectItem value="normal">Normal Priority</SelectItem>
										<SelectItem value="high">High Priority</SelectItem>
										<SelectItem value="urgent">Urgent</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="estimatedValue">Estimated Value ($)</Label>
								<Input id="estimatedValue" type="number" value={jobData.estimatedValue} onChange={(e) => updateJobData("estimatedValue", e.target.value)} placeholder="0" />
							</div>
						</div>

						<div>
							<Label htmlFor="description">Job Description *</Label>
							<Textarea id="description" value={jobData.description} onChange={(e) => updateJobData("description", e.target.value)} placeholder="Describe what needs to be done..." rows={4} className={errors.description ? "border-red-500" : ""} />
							{errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
						</div>

						<div>
							<Label htmlFor="specialRequirements">Special Requirements</Label>
							<Textarea id="specialRequirements" value={jobData.specialRequirements} onChange={(e) => updateJobData("specialRequirements", e.target.value)} placeholder="Any special tools, parts, or considerations..." rows={3} />
						</div>
					</div>
				);

			case 3:
				return (
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="scheduledDate">Date *</Label>
								<Input id="scheduledDate" type="date" value={jobData.scheduledDate} onChange={(e) => updateJobData("scheduledDate", e.target.value)} className={errors.scheduledDate ? "border-red-500" : ""} />
								{errors.scheduledDate && <p className="text-sm text-destructive mt-1">{errors.scheduledDate}</p>}
							</div>
							<div>
								<Label htmlFor="scheduledTime">Time *</Label>
								<Input id="scheduledTime" type="time" value={jobData.scheduledTime} onChange={(e) => updateJobData("scheduledTime", e.target.value)} className={errors.scheduledTime ? "border-red-500" : ""} />
								{errors.scheduledTime && <p className="text-sm text-destructive mt-1">{errors.scheduledTime}</p>}
							</div>
						</div>

						<div>
							<Label htmlFor="estimatedDuration">Estimated Duration (hours)</Label>
							<Select value={jobData.estimatedDuration} onValueChange={(value) => updateJobData("estimatedDuration", value)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="0.5">30 minutes</SelectItem>
									<SelectItem value="1">1 hour</SelectItem>
									<SelectItem value="1.5">1.5 hours</SelectItem>
									<SelectItem value="2">2 hours</SelectItem>
									<SelectItem value="3">3 hours</SelectItem>
									<SelectItem value="4">4 hours</SelectItem>
									<SelectItem value="6">6 hours</SelectItem>
									<SelectItem value="8">8 hours</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label htmlFor="assignedTechnician">Assign Technician *</Label>
							<Select value={jobData.assignedTechnician} onValueChange={(value) => updateJobData("assignedTechnician", value)}>
								<SelectTrigger className={errors.assignedTechnician ? "border-red-500" : ""}>
									<SelectValue placeholder="Select technician" />
								</SelectTrigger>
								<SelectContent>
									{technicians.map((tech) => (
										<SelectItem key={tech.id} value={tech.id}>
											<div className="flex items-center gap-3">
												<div className={`w-3 h-3 rounded-full ${tech.availability === "available" ? "bg-success" : tech.availability === "busy" ? "bg-warning" : "bg-destructive"}`}></div>
												<div>
													<p className="font-medium">{tech.name}</p>
													<p className="text-xs text-muted-foreground">
														{tech.skills.join(", ")} • {tech.todaysJobs} jobs today
													</p>
												</div>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errors.assignedTechnician && <p className="text-sm text-destructive mt-1">{errors.assignedTechnician}</p>}
						</div>

						<div>
							<Label htmlFor="accessInstructions">Access Instructions</Label>
							<Textarea id="accessInstructions" value={jobData.accessInstructions} onChange={(e) => updateJobData("accessInstructions", e.target.value)} placeholder="Gate codes, key locations, parking instructions..." rows={3} />
						</div>

						<div className="space-y-3">
							<div className="flex items-center space-x-2">
								<Checkbox id="requiresEstimate" checked={jobData.requiresEstimate} onCheckedChange={(checked) => updateJobData("requiresEstimate", checked)} />
								<Label htmlFor="requiresEstimate">Requires estimate before work</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox id="urgentJob" checked={jobData.urgentJob} onCheckedChange={(checked) => updateJobData("urgentJob", checked)} />
								<Label htmlFor="urgentJob">Urgent job (same day)</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox id="followUpRequired" checked={jobData.followUpRequired} onCheckedChange={(checked) => updateJobData("followUpRequired", checked)} />
								<Label htmlFor="followUpRequired">Follow-up required</Label>
							</div>
						</div>
					</div>
				);

			case 4:
				const selectedCustomer = getSelectedCustomer() || {
					name: jobData.customerName,
					phone: jobData.customerPhone,
					email: jobData.customerEmail,
					address: jobData.customerAddress,
				};
				const selectedService = getSelectedService();
				const selectedTechnician = getSelectedTechnician();

				return (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CheckCircle className="w-5 h-5 text-success" />
									Review Job Details
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<h4 className="font-medium text-sm text-muted-foreground mb-2">Customer</h4>
									<div className="space-y-1">
										<p className="font-medium">{selectedCustomer.name}</p>
										<p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
										<p className="text-sm text-muted-foreground">{selectedCustomer.address}</p>
									</div>
								</div>

								<div>
									<h4 className="font-medium text-sm text-muted-foreground mb-2">Service</h4>
									<div className="space-y-1">
										<p className="font-medium">{jobData.title}</p>
										<p className="text-sm text-muted-foreground">{selectedService?.name}</p>
										<p className="text-sm text-muted-foreground">{jobData.description}</p>
									</div>
								</div>

								<div>
									<h4 className="font-medium text-sm text-muted-foreground mb-2">Schedule</h4>
									<div className="space-y-1">
										<p className="font-medium">
											{format(new Date(jobData.scheduledDate), "EEEE, MMMM d, yyyy")} at {jobData.scheduledTime}
										</p>
										<p className="text-sm text-muted-foreground">Estimated duration: {jobData.estimatedDuration} hours</p>
										<p className="text-sm text-muted-foreground">Assigned to: {selectedTechnician?.name}</p>
									</div>
								</div>

								{jobData.estimatedValue && (
									<div>
										<h4 className="font-medium text-sm text-muted-foreground mb-2">Pricing</h4>
										<p className="font-medium">${jobData.estimatedValue}</p>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				);
		}
	};

	const steps = [
		{ number: 1, title: "Customer", completed: currentStep > 1 },
		{ number: 2, title: "Job Details", completed: currentStep > 2 },
		{ number: 3, title: "Schedule", completed: currentStep > 3 },
		{ number: 4, title: "Review", completed: false },
	];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/business/schedule/calendar")}>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back to Calendar
				</Button>
				<div>
					<h1 className="text-3xl font-bold tracking-tight">New Job</h1>
					<p className="text-muted-foreground">Create a new service appointment</p>
				</div>
			</div>

			{/* Progress Steps */}
			<Card>
				<CardContent className="p-6">
					<div className="flex items-center justify-between">
						{steps.map((step, index) => (
							<div key={step.number} className="flex items-center">
								<div className="flex items-center">
									<div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 ${step.completed ? "bg-success border-green-600 text-white" : currentStep === step.number ? "bg-primary border-primary text-white" : "border-muted-foreground text-muted-foreground"}`}>{step.completed ? <CheckCircle className="w-5 h-5" /> : <span className="text-sm font-medium">{step.number}</span>}</div>
									<div className="ml-3">
										<p className={`text-sm font-medium ${currentStep >= step.number ? "text-foreground" : "text-muted-foreground"}`}>{step.title}</p>
									</div>
								</div>
								{index < steps.length - 1 && <div className={`flex-1 h-0.5 mx-4 transition-all duration-500 ${step.completed ? "bg-success" : "bg-muted-foreground"}`} />}
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Step Content */}
			<Card>
				<CardHeader>
					<CardTitle>{steps[currentStep - 1].title}</CardTitle>
				</CardHeader>
				<CardContent>{renderStepContent()}</CardContent>
			</Card>

			{/* Navigation */}
			<div className="flex items-center justify-between">
				<Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
					Back
				</Button>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => router.push("/dashboard/business/schedule/calendar")}>
						<X className="w-4 h-4 mr-2" />
						Cancel
					</Button>
					{currentStep < 4 ? (
						<Button onClick={handleNext}>Next</Button>
					) : (
						<Button onClick={handleSubmit} disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
									Creating...
								</>
							) : (
								<>
									<Save className="w-4 h-4 mr-2" />
									Create Job
								</>
							)}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
