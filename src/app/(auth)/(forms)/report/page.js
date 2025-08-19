"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { VerifyAccount, ActiveUser, BusinessSearch, LoginPage } from "@features/auth";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { ArrowRight, ArrowLeft } from "react-feather";
import { Star, MapPin, Phone, Building2, AlertTriangle } from "lucide-react";
import useAuth from "@hooks/use-auth";
import WhatAreYouReporting from "@features/auth/report/what-are-you-reporting";
import { Progress } from "@components/ui/progress";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Define schema for report step
const reportSchema = z.object({
	reportType: z.string().nonempty({ message: "Please select a report type" }),
	reportDetails: z.string().min(10, { message: "Please provide more details (minimum 10 characters)" }),
});

const steps = [
	{ component: ActiveUser, name: "activeUser", title: "User Info", description: "Verify your account" },
	{ component: BusinessSearch, name: "businessSearch", title: "Find Business", description: "Search and select the business to report" },
	{ component: WhatAreYouReporting, name: "whatAreYouReporting", title: "Report Details", description: "Provide details about the issue" },
];

// Progress Indicator Component
const ProgressIndicator = ({ currentStep, totalSteps, steps }) => {
	const progress = ((currentStep + 1) / totalSteps) * 100;

	return (
		<div className="mb-8">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-lg font-semibold">Report Progress</h3>
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

// Business Card Component for displaying selected business
const SelectedBusinessCard = ({ business }) => {
	if (!business) return null;

	return (
		<div className="mb-6">
			<div className="text-center mb-4">
				<h3 className="text-lg font-semibold">Reporting Business</h3>
				<p className="text-sm text-muted-foreground">You are reporting an issue with this business</p>
			</div>

			<Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-destructive/20">
				<CardContent className="p-4">
					{/* Mobile-first layout */}
					<div className="space-y-3">
						{/* Header Row: Logo, Name, Rating */}
						<div className="flex items-start gap-3">
							{/* Business Logo/Image */}
							<div className="flex-shrink-0">
								{business.logo ? (
									<div className="relative w-14 h-14">
										<Image src={business.logo} alt={`${business.name} logo`} fill className="rounded-lg object-cover border border-border" />
									</div>
								) : (
									<div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center border border-border">
										<Building2 className="w-7 h-7 text-muted-foreground" />
									</div>
								)}
							</div>

							{/* Business Name and Rating */}
							<div className="flex-1 min-w-0">
								<div className="flex items-start justify-between">
									<h4 className="text-lg font-semibold text-foreground leading-tight">{business.name}</h4>
									{business.ratings?.overall && (
										<div className="flex items-center gap-1 ml-2 flex-shrink-0">
											<Star className="w-4 h-4 fill-yellow-400 text-warning" />
											<span className="text-sm font-medium">{business.ratings.overall}</span>
										</div>
									)}
								</div>

								{business.reviewCount && <p className="text-sm text-muted-foreground mt-1">{business.reviewCount} reviews</p>}
							</div>
						</div>

						{/* Contact Info Row */}
						<div className="flex flex-col gap-2">
							{business.address && (
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<MapPin className="w-4 h-4 flex-shrink-0" />
									<span className="truncate">{business.address.split(",")[0]}</span>
								</div>
							)}
							{business.phone && (
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<Phone className="w-4 h-4 flex-shrink-0" />
									<span>{business.phone}</span>
								</div>
							)}
						</div>

						{/* Status Badge Row */}
						<div className="flex justify-center pt-2">
							<Badge variant="secondary" className="bg-destructive/10 text-destructive border-red-200 dark:bg-destructive dark:text-destructive/80 dark:border-red-800">
								<AlertTriangle className="w-4 h-4 mr-2" />
								Selected for Reporting
							</Badge>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

const ReportBusiness = () => {
	const [currentStep, setCurrentStep] = useState(0);
	const [loading, setLoading] = useState(false);
	const [selectedBusinessData, setSelectedBusinessData] = useState(null);
	const { isInitialized, user, loading: authLoading } = useAuth();

	const formMethods = useForm({
		resolver: zodResolver(reportSchema),
		defaultValues: {
			reportType: "",
			reportDetails: "",
		},
	});

	useEffect(() => {
		// Reset to the first step when the component mounts
		setCurrentStep(0);
	}, []);

	// Listen for business selection event
	useEffect(() => {
		const handleBusinessSelected = (event) => {
			const { business } = event.detail;
			setSelectedBusinessData(business);

			// Automatically advance to the next step (report details)
			if (currentStep === 1) {
				// businessSearch step
				setTimeout(() => {
					setCurrentStep(2); // whatAreYouReporting step
				}, 100);
			}
		};

		window.addEventListener("businessSelected", handleBusinessSelected);

		return () => {
			window.removeEventListener("businessSelected", handleBusinessSelected);
		};
	}, [currentStep]);

	const nextStep = async () => {
		setLoading(true);
		const isStepValid = await formMethods.trigger(steps[currentStep].name);
		console.log("Next Step Triggered:", isStepValid, formMethods.getValues());
		if (!isStepValid) {
			console.log("Validation Errors:", formMethods.formState.errors);
		}
		setLoading(false);
		if (isStepValid) {
			setCurrentStep((prev) => prev + 1);
		}
	};

	const prevStep = () => {
		if (currentStep > 0) {
			setCurrentStep((prev) => prev - 1);
		}
	};

	const handleSubmit = async () => {
		const isValid = await formMethods.trigger();
		console.log("Form Submission Triggered:", isValid, formMethods.getValues());
		if (!isValid) {
			console.log("Validation Errors:", formMethods.formState.errors);
		}
		if (isValid) {
			const data = formMethods.getValues();
			console.log("Form Submitted:", data);
			setLoading(true);
			// Simulate an async operation, e.g., saving data to the database
			await new Promise((resolve) => setTimeout(resolve, 1000));
			setLoading(false);
			nextStep();
		} else {
			console.log("Validation failed");
		}
	};

	const CurrentComponent = steps[currentStep].component;

	if (authLoading || !isInitialized) {
		return (
			<div className="flex justify-center w-full">
				<Image src="/logos/ThorbisLogo.webp" alt="Thorbis Logo" width={200} height={100} className="w-[60px] h-[60px] animate-breathe" />
			</div>
		);
	}

	if (!user) {
		return <LoginPage />;
	}

	if (user.email_confirmed_at === "") {
		return <VerifyAccount />;
	}

	return (
		<FormProvider {...formMethods}>
			<form>
				{/* Progress Indicator */}
				{currentStep > 0 && currentStep < steps.length - 1 && <ProgressIndicator currentStep={currentStep} totalSteps={steps.length - 1} steps={steps} />}

				{/* Show selected business card if we have one and not on the first step */}
				{selectedBusinessData && currentStep > 0 && <SelectedBusinessCard business={selectedBusinessData} />}

				<CurrentComponent />
				{currentStep !== steps.findIndex((step) => step.name === "Report Submitted") && (
					<div className="flex justify-between mt-10">
						{currentStep > 0 && currentStep !== steps.findIndex((step) => step.name === "activeUser") && (
							<Button variant="outline" type="button" onClick={prevStep} className="mt-2 border-neutral-700 dark:border-neutral-800">
								<ArrowLeft className="w-4 h-4 mr-2" /> Back
							</Button>
						)}
						{currentStep < steps.length - 1 && currentStep !== steps.findIndex((step) => step.name === "whatAreYouReporting") && (
							<Button type="button" onClick={nextStep} className="mt-2" disabled={loading}>
								{loading ? "Processing..." : `Next: ${steps[currentStep + 1]?.title}`} <ArrowRight className="w-4 h-4 ml-2" />
							</Button>
						)}
						{currentStep === steps.findIndex((step) => step.name === "whatAreYouReporting") && (
							<Button type="button" onClick={handleSubmit} className="mt-2" disabled={loading}>
								{loading ? "Submitting..." : "Submit Report"} <AlertTriangle className="w-4 h-4 ml-2" />
							</Button>
						)}
					</div>
				)}
			</form>
		</FormProvider>
	);
};

export default ReportBusiness;
