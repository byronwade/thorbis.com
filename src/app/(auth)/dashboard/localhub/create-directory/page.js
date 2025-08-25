"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@components/ui/button";
import { Progress } from "@components/ui/progress";
import { Badge } from "@components/ui/badge";
import { ArrowRight, ArrowLeft, CheckCircle } from "react-feather";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@components/ui/use-toast";
import { Alert, AlertDescription } from "@components/ui/alert";
import { AlertTriangle, ArrowLeft as ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@store/auth";

// Import the step components
import DirectoryInfo from "@components/localhub/create-directory/directory-info";
import DirectoryLocation from "@components/localhub/create-directory/directory-location";
import DirectoryCustomization from "@components/localhub/create-directory/directory-customization";
import DirectorySuccess from "@components/localhub/create-directory/directory-success";

// Define schema for all directory steps combined
const combinedDirectorySchema = z.object({
	directoryInfo: z.object({
		directoryName: z.string().nonempty({ message: "Directory name is required" }),
		description: z.string().nonempty({ message: "Description is required" }),
		contactEmail: z.string().email({ message: "Invalid email address" }).nonempty({ message: "Email is required" }),
		contactPhone: z.string().nonempty({ message: "Phone number is required" }),
	}),
	directoryLocation: z.object({
		street: z.string().nonempty({ message: "Street is required" }),
		city: z.string().nonempty({ message: "City is required" }),
		state: z.string().nonempty({ message: "State is required" }),
		zip: z.string().regex(/^\d{5}$/, { message: "Invalid ZIP code. Must be 5 digits." }),
		serviceRadius: z.number().min(1, { message: "Service radius must be at least 1 mile" }).max(100, { message: "Service radius can't exceed 100 miles" }),
	}),
	directoryCustomization: z.object({
		logo: z.any().optional(),
		primaryColor: z.string().optional(),
		subdomain: z.string().nonempty({ message: "Subdomain is required" }),
		businessCategories: z.array(z.string()).min(1, { message: "At least one category is required" }),
	}),
});

const steps = [
	{ component: DirectoryInfo, name: "directoryInfo", title: "Directory Info", description: "Basic directory details" },
	{ component: DirectoryLocation, name: "directoryLocation", title: "Location", description: "Directory coverage area" },
	{ component: DirectoryCustomization, name: "directoryCustomization", title: "Customization", description: "Branding & features" },
	{ component: DirectorySuccess, name: "directorySuccess", title: "Complete", description: "Setup finished" },
];

// Progress Indicator Component
const ProgressIndicator = ({ currentStep, totalSteps, steps }) => {
	const progress = ((currentStep + 1) / totalSteps) * 100;

	return (
		<div className="mb-8">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-lg font-semibold">Directory Setup Progress</h3>
				<Badge variant="secondary">
					{currentStep + 1} of {totalSteps}
				</Badge>
			</div>

			<Progress value={progress} className="mb-4" />

			<div className="flex items-center justify-between text-sm text-muted-foreground">
				<span>{steps[currentStep]?.title}</span>
				<span>{Math.round(progress)}% complete</span>
			</div>
		</div>
	);
};

export default function CreateDirectoryPage() {
	const [currentStep, setCurrentStep] = useState(0);
	const [loading, setLoading] = useState(false);
	const [formErrors, setFormErrors] = useState({});
	const { user } = useAuthStore();
	const { toast } = useToast();
	const router = useRouter();

	useEffect(() => {
		document.title = "Create Directory - LocalHub - Thorbis";
	}, []);

	useEffect(() => {
		// Reset to the first step when the component mounts
		setCurrentStep(0);
	}, []);

	const formMethods = useForm({
		resolver: zodResolver(combinedDirectorySchema),
		defaultValues: {
			directoryInfo: {
				directoryName: "",
				description: "",
				contactEmail: user?.email || "",
				contactPhone: "",
			},
			directoryLocation: {
				street: "",
				city: "",
				state: "",
				zip: "",
				serviceRadius: 25,
			},
			directoryCustomization: {
				logo: null,
				primaryColor: "hsl(var(--primary))",
				subdomain: "",
				businessCategories: [],
			},
		},
	});

	const nextStep = async () => {
		setLoading(true);
		setFormErrors({});

		try {
			const isStepValid = await formMethods.trigger(steps[currentStep].name);
			console.log("Next Step Triggered:", isStepValid, formMethods.getValues());

			if (!isStepValid) {
				const errors = formMethods.formState.errors;
				console.log("Validation Errors:", errors);

				// Show toast for validation errors
				const errorMessages = Object.values(errors)
					.map((error) => error?.message)
					.filter(Boolean);
				if (errorMessages.length > 0) {
					toast({
						title: "Please fix the following errors:",
						description: errorMessages.join(", "),
						variant: "destructive",
					});
				}

				setFormErrors(errors);
				return;
			}

			if (currentStep < steps.length - 1) {
				setCurrentStep((prev) => prev + 1);
				toast({
					title: "Step completed",
					description: `Moving to ${steps[currentStep + 1].title}`,
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "An unexpected error occurred. Please try again.",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const prevStep = () => {
		if (currentStep > 0) {
			setCurrentStep((prev) => prev - 1);
			setFormErrors({});
		}
	};

	const handleSubmit = async () => {
		setLoading(true);
		setFormErrors({});

		try {
			const isValid = await formMethods.trigger();
			console.log("Form Submission Triggered:", isValid, formMethods.getValues());

			if (!isValid) {
				const errors = formMethods.formState.errors;
				console.log("Validation Errors:", errors);

				const errorMessages = Object.values(errors)
					.map((error) => error?.message)
					.filter(Boolean);
				if (errorMessages.length > 0) {
					toast({
						title: "Please fix the following errors:",
						description: errorMessages.join(", "),
						variant: "destructive",
					});
				}

				setFormErrors(errors);
				return;
			}

			const data = formMethods.getValues();
			console.log("Directory Created:", data);

			// Simulate an async operation, e.g., saving data to the database
			await new Promise((resolve) => setTimeout(resolve, 2000));

			toast({
				title: "Directory Created Successfully!",
				description: "Your LocalHub directory has been created and is now live. You can manage it from your dashboard.",
			});

			// Move to success step
			setCurrentStep(steps.length - 1);
		} catch (error) {
			console.error("Error creating directory:", error);
			toast({
				title: "Error",
				description: "Failed to create directory. Please try again.",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const CurrentStepComponent = steps[currentStep].component;

	return (
		<div className="min-h-screen bg-background">
			<div className="w-full px-4 py-8 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center gap-4 mb-6">
						<Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/localhub")} className="flex items-center gap-2">
							<ArrowLeftIcon className="w-4 h-4" />
							Back to Dashboard
						</Button>
					</div>

					<div className="text-center">
						<h1 className="text-3xl font-bold mb-2">Create New LocalHub Directory</h1>
						<p className="text-muted-foreground">Set up your local business directory in just a few steps</p>
					</div>
				</div>

				<div className="w-full max-w-4xl">
					<FormProvider {...formMethods}>
						<form className="space-y-8">
							{/* Progress Indicator */}
							<ProgressIndicator currentStep={currentStep} totalSteps={steps.length} steps={steps} />

							{/* Error Alert */}
							{Object.keys(formErrors).length > 0 && (
								<Alert variant="destructive">
									<AlertTriangle className="h-4 w-4" />
									<AlertDescription>Please fix the errors below to continue.</AlertDescription>
								</Alert>
							)}

							{/* Current Step Component */}
							<div className="bg-card rounded-lg border p-6">
								<CurrentStepComponent />
							</div>

							{/* Navigation Buttons */}
							<div className="flex justify-between">
								<Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0 || loading} className="flex items-center gap-2">
									<ArrowLeft className="w-4 h-4" />
									Previous
								</Button>

								{currentStep === steps.length - 1 ? (
									<Button type="button" onClick={() => router.push("/dashboard/localhub")} className="flex items-center gap-2">
										Go to Dashboard
										<ArrowRight className="w-4 h-4" />
									</Button>
								) : currentStep === steps.length - 2 ? (
									<Button type="button" onClick={handleSubmit} disabled={loading} className="flex items-center gap-2">
										{loading ? "Creating..." : "Create Directory"}
										<CheckCircle className="w-4 h-4" />
									</Button>
								) : (
									<Button type="button" onClick={nextStep} disabled={loading} className="flex items-center gap-2">
										Next
										<ArrowRight className="w-4 h-4" />
									</Button>
								)}
							</div>
						</form>
					</FormProvider>
				</div>
			</div>
		</div>
	);
}
