"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { VerifyAccount, ActiveUser, BusinessSearch, BusinessSuccess, BusinessVerification } from "@features/auth";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Progress } from "@components/ui/progress";
import { ArrowRight, ArrowLeft } from "react-feather";
import { Star, MapPin, Phone, Building2, CheckCircle, Shield } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useAuth from "@hooks/use-auth";
import { LoginPage } from "@features/auth";

// Define schema for business verification step
const businessVerificationSchema = z.object({
	ein: z.string().regex(/^\d{2}-\d{7}$/, { message: "Invalid EIN format. Must be XX-XXXXXXX." }),
	registrationDocument: z.array(z.any()).refine((files) => files.length > 0, { message: "Business registration document is required" }),
	businessLicense: z.array(z.any()).refine((files) => files.length > 0, { message: "Business license is required" }),
	proofOfOwnership: z.array(z.any()).refine((files) => files.length > 0, { message: "Proof of company ownership is required" }),
	ownerID: z.array(z.any()).refine((files) => files.length > 0, { message: "Owner's government-issued ID is required" }),
});

const steps = [
	{ component: ActiveUser, name: "activeUser", title: "User Info", description: "Verify your account" },
	{ component: BusinessSearch, name: "businessSearch", title: "Find Business", description: "Search and select your business" },
	{ component: BusinessVerification, name: "businessVerification", title: "Verify Ownership", description: "Upload verification documents" },
	{ component: BusinessSuccess, name: "businessSuccess", title: "Complete", description: "Claim process finished" },
];

// Progress Indicator Component
const ProgressIndicator = ({ currentStep, totalSteps, steps }) => {
	const progress = ((currentStep + 1) / totalSteps) * 100;

	return (
		<div className="mb-8">
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-lg font-semibold">Claim Progress</h3>
				<Badge variant="secondary">
					{currentStep + 1} of {totalSteps}
				</Badge>
			</div>

			<Progress value={progress} className="mb-4" />

			<div className="flex justify-between items-center text-sm text-muted-foreground">
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
			<div className="mb-4 text-center">
				<h3 className="text-lg font-semibold">Claiming Business</h3>
				<p className="text-sm text-muted-foreground">You are claiming ownership of this business</p>
			</div>

			<Card className="border-primary/20 bg-primary/5">
				<CardContent className="p-4">
					{/* Mobile-first layout */}
					<div className="space-y-3">
						{/* Header Row: Logo, Name, Rating */}
						<div className="flex gap-3 items-start">
							{/* Business Logo/Image */}
							<div className="flex-shrink-0">
								{business.logo ? (
									<div className="relative w-14 h-14">
										<Image src={business.logo} alt={`${business.name} logo`} fill className="object-cover rounded-lg border border-border" />
									</div>
								) : (
									<div className="flex justify-center items-center w-14 h-14 rounded-lg border bg-muted border-border">
										<Building2 className="w-7 h-7 text-muted-foreground" />
									</div>
								)}
							</div>

							{/* Business Name and Rating */}
							<div className="flex-1 min-w-0">
								<div className="flex justify-between items-start">
									<h4 className="text-lg font-semibold leading-tight text-foreground">{business.name}</h4>
									{business.ratings?.overall && (
										<div className="flex flex-shrink-0 gap-1 items-center ml-2">
											<Star className="w-4 h-4 text-warning fill-yellow-400" />
											<span className="text-sm font-medium">{business.ratings.overall}</span>
										</div>
									)}
								</div>

								{business.reviewCount && <p className="mt-1 text-sm text-muted-foreground">{business.reviewCount} reviews</p>}
							</div>
						</div>

						{/* Contact Info Row */}
						<div className="flex flex-col gap-2">
							{business.address && (
								<div className="flex gap-2 items-center text-sm text-muted-foreground">
									<MapPin className="flex-shrink-0 w-4 h-4" />
									<span className="truncate">{business.address.split(",")[0]}</span>
								</div>
							)}
							{business.phone && (
								<div className="flex gap-2 items-center text-sm text-muted-foreground">
									<Phone className="flex-shrink-0 w-4 h-4" />
									<span>{business.phone}</span>
								</div>
							)}
						</div>

						{/* Status Badge Row */}
						<div className="flex justify-center pt-2">
							<Badge variant="secondary" className="text-success bg-success/10 border-green-200 dark:bg-success dark:text-success/80 dark:border-green-800">
								<CheckCircle className="mr-2 w-4 h-4" />
								Selected for Claiming
							</Badge>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

const ClaimBusiness = () => {
	const [currentStep, setCurrentStep] = useState(0);
	const [loading, setLoading] = useState(false);
	const [selectedBusinessData, setSelectedBusinessData] = useState(null);
	const { isInitialized, user, loading: authLoading } = useAuth();

	const formMethods = useForm({
		resolver: zodResolver(businessVerificationSchema),
		defaultValues: {
			ein: "",
			registrationDocument: [],
			businessLicense: [],
			proofOfOwnership: [],
			ownerID: [],
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

			// Automatically advance to the next step (business verification)
			if (currentStep === 1) {
				// businessSearch step
				setTimeout(() => {
					setCurrentStep(2); // businessVerification step
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
				{currentStep !== steps.findIndex((step) => step.name === "businessSuccess") && (
					<div className="flex justify-between mt-10">
						{currentStep > 0 && currentStep !== steps.findIndex((step) => step.name === "activeUser") && (
							<Button variant="outline" type="button" onClick={prevStep} className="mt-2 border-neutral-700 dark:border-neutral-800">
								<ArrowLeft className="mr-2 w-4 h-4" /> Back
							</Button>
						)}
						{currentStep < steps.length - 1 && currentStep !== steps.findIndex((step) => step.name === "businessVerification") && (
							<Button type="button" onClick={nextStep} className="mt-2" disabled={loading}>
								{loading ? "Processing..." : `Next: ${steps[currentStep + 1]?.title}`} <ArrowRight className="ml-2 w-4 h-4" />
							</Button>
						)}
						{currentStep === steps.findIndex((step) => step.name === "businessVerification") && (
							<Button type="button" onClick={handleSubmit} className="mt-2" disabled={loading}>
								{loading ? "Verifying..." : "Verify Ownership"} <Shield className="ml-2 w-4 h-4" />
							</Button>
						)}
					</div>
				)}
				{currentStep === steps.findIndex((step) => step.name === "businessSuccess") && (
					<div className="flex flex-row justify-between mt-4 w-full">
						<Link href="/claim-a-business" passHref>
							<Button variant="outline" type="submit">
								Continue to verify ownership <ArrowRight className="ml-2 w-4 h-4" />
							</Button>
						</Link>
					</div>
				)}
			</form>
		</FormProvider>
	);
};

export default ClaimBusiness;
