/**
 * Ads Edit Page - Refactored
 * Reduced from 804 lines to clean, modular implementation
 * Uses extracted sections and custom hooks for enterprise-level architecture
 * Handles editing of existing campaigns with data loading and updates
 */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { Progress } from "@components/ui/progress";
import { Badge } from "@components/ui/badge";
import { Alert, AlertDescription } from "@components/ui/alert";
import { ArrowLeft, Loader2, AlertCircle, Save } from "lucide-react";
import { toast } from "@components/ui/use-toast";

// Import custom hooks and sections
import { useAdsForm } from "@lib/hooks/business/ads/use-ads-form";
import { CampaignDetailsSection, AdContentSection, TargetingSection, BudgetScheduleSection, ReviewSubmitSection } from "./sections";

// Step configuration (same as create page)
const STEPS = [
	{
		id: 1,
		title: "Campaign Details",
		description: "Update campaign basics",
		icon: "Target",
	},
	{
		id: 2,
		title: "Ad Content",
		description: "Edit ad creative",
		icon: "Edit",
	},
	{
		id: 3,
		title: "Targeting",
		description: "Adjust audience targeting",
		icon: "Users",
	},
	{
		id: 4,
		title: "Budget & Schedule",
		description: "Update budget and timing",
		icon: "Calendar",
	},
	{
		id: 5,
		title: "Review & Submit",
		description: "Review and save changes",
		icon: "CheckCircle",
	},
];

// Mock campaign data - in real app, this would come from API
const getMockCampaignData = (id) => ({
	id,
	name: "Summer Plumbing Special",
	type: "search",
	location: "San Francisco, CA",
	radius: "25",
	headline: "Professional Plumbing Services",
	description: "Fast, reliable plumbing services with 24/7 emergency response.",
	cta: "Call Now",
	keywords: "plumber, emergency plumbing, drain cleaning, pipe repair",
	demographics: ["25-34", "35-44", "45-54"],
	interests: ["home-improvement"],
	excludedKeywords: "free, cheap, DIY",
	budget: 75,
	duration: 30,
	schedule: {
		startDate: "2024-01-15",
		endDate: "2024-02-14",
		timeOfDay: "business",
		daysOfWeek: ["monday", "tuesday", "wednesday", "thursday", "friday"],
	},
	status: "active",
	termsAccepted: true,
	billingAccepted: true,
});

// Step progress component
const StepProgress = ({ currentStep, totalSteps, steps, onStepClick }) => (
	<div className="w-full mb-8">
		<div className="flex items-center justify-between mb-4">
			<h2 className="text-lg font-semibold">Edit Campaign</h2>
			<Badge variant="outline">
				Step {currentStep} of {totalSteps}
			</Badge>
		</div>

		<Progress value={(currentStep / totalSteps) * 100} className="mb-4" />

		<div className="hidden md:flex justify-between">
			{steps.map((step, index) => (
				<button key={step.id} onClick={() => onStepClick(step.id)} className={`text-center cursor-pointer transition-colors ${step.id === currentStep ? "text-primary" : step.id < currentStep ? "text-success" : "text-muted-foreground"}`}>
					<div className={`w-8 h-8 rounded-full border-2 mx-auto mb-2 flex items-center justify-center text-sm font-medium ${step.id === currentStep ? "border-primary bg-primary text-primary-foreground" : step.id < currentStep ? "border-green-600 bg-success text-white" : "border-muted"}`}>{step.id}</div>
					<div className="text-xs font-medium">{step.title}</div>
				</button>
			))}
		</div>
	</div>
);

export default function AdsEditPage({ businessType = "plumbing" }) {
	const params = useParams();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [campaignData, setCampaignData] = useState(null);
	const [loadingError, setLoadingError] = useState(null);

	// Load campaign data
	useEffect(() => {
		const loadCampaignData = async () => {
			try {
				setIsLoading(true);

				// Mock API call - in real app, this would fetch from your API
				await new Promise((resolve) => setTimeout(resolve, 1000));

				const data = getMockCampaignData(params.id);
				setCampaignData(data);
			} catch (error) {
				setLoadingError("Failed to load campaign data");
				console.error("Error loading campaign:", error);
			} finally {
				setIsLoading(false);
			}
		};

		if (params.id) {
			loadCampaignData();
		}
	}, [params.id]);

	// Initialize the ads form hook with existing data
	const { formData, errors, currentStep, isSubmitting, completionPercentage, updateField, updateFields, validateField, validateForm, goToStep, nextStep, previousStep, submitForm, saveDraft, estimatedMetrics, isValid, isDirty } = useAdsForm({
		isEditMode: true,
		existingData: campaignData,
		businessType,
		onSubmit: async (data) => {
			// Handle campaign update
			console.log("Updating campaign:", data);

			// Mock API call
			await new Promise((resolve) => setTimeout(resolve, 2000));

			toast({
				title: "Campaign Updated!",
				description: "Your campaign changes have been saved successfully.",
			});

			// Redirect back to campaigns list
			router.push("/dashboard/business/ads");
		},
		onSaveDraft: async (data) => {
			// Handle draft saving
			console.log("Saving changes:", data);

			// Mock API call
			await new Promise((resolve) => setTimeout(resolve, 500));

			toast({
				title: "Changes Saved",
				description: "Your campaign changes have been saved as draft.",
			});
		},
		autoSave: true,
	});

	// Handle field validation
	const handleFieldValidation = (field, value) => {
		const error = validateField(field, value);
		if (error) {
			console.warn(`Validation error for ${field}:`, error);
		}
	};

	// Show loading state
	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8 max-w-4xl">
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="text-center">
						<Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
						<p className="text-muted-foreground">Loading campaign data...</p>
					</div>
				</div>
			</div>
		);
	}

	// Show error state
	if (loadingError) {
		return (
			<div className="container mx-auto px-4 py-8 max-w-4xl">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{loadingError}. Please try again or contact support if the problem persists.</AlertDescription>
				</Alert>
				<div className="mt-4">
					<Link href="/dashboard/business/ads">
						<Button variant="outline">
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back to Campaigns
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	// Render current step content
	const renderStepContent = () => {
		switch (currentStep) {
			case 1:
				return (
					<CampaignDetailsSection
						campaignData={{
							name: formData.name,
							type: formData.type,
							location: formData.location,
							radius: formData.radius,
						}}
						errors={errors}
						onUpdateField={updateField}
						onValidation={handleFieldValidation}
						showLocationMap={true}
						showHelpText={true}
					/>
				);

			case 2:
				return (
					<AdContentSection
						contentData={{
							headline: formData.headline,
							description: formData.description,
							cta: formData.cta,
							type: formData.type,
						}}
						errors={errors}
						onUpdateField={updateField}
						onValidation={handleFieldValidation}
						showPreview={true}
						showSuggestions={true}
						businessName="Your Business"
					/>
				);

			case 3:
				return (
					<TargetingSection
						targetingData={{
							keywords: formData.keywords,
							demographics: formData.demographics,
							interests: formData.interests,
							excludedKeywords: formData.excludedKeywords,
							location: formData.location,
						}}
						errors={errors}
						businessType={businessType}
						onUpdateField={updateField}
						onValidation={handleFieldValidation}
						showAudienceEstimation={true}
						showKeywordSuggestions={true}
					/>
				);

			case 4:
				return (
					<BudgetScheduleSection
						budgetData={{
							budget: formData.budget,
							duration: formData.duration,
						}}
						scheduleData={formData.schedule}
						errors={errors}
						businessType={businessType}
						keywords={formData.keywords}
						location={formData.location}
						onUpdateBudget={(field, value) => updateField(field, value)}
						onUpdateSchedule={(field, value) => updateField(`schedule.${field}`, value)}
						onValidation={handleFieldValidation}
						showPerformanceEstimation={true}
						showBudgetRecommendations={true}
					/>
				);

			case 5:
				return <ReviewSubmitSection campaignData={formData} validationErrors={errors} isSubmitting={isSubmitting} onEditSection={goToStep} onSubmit={submitForm} onSaveDraft={saveDraft} isEditMode={true} showValidationChecklist={true} />;

			default:
				return null;
		}
	};

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			{/* Header */}
			<div className="flex items-center gap-4 mb-6">
				<Link href="/dashboard/business/ads">
					<Button variant="outline" size="sm">
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Campaigns
					</Button>
				</Link>

				<div className="flex-1">
					<h1 className="text-2xl font-bold">Edit Campaign</h1>
					<p className="text-muted-foreground">
						{campaignData?.name} • Status: {campaignData?.status}
					</p>
				</div>

				{/* Quick actions */}
				<div className="flex gap-2">
					{isDirty && (
						<Badge variant="outline" className="text-warning">
							Unsaved Changes
						</Badge>
					)}

					<Button variant="outline" size="sm" onClick={saveDraft} disabled={isSubmitting}>
						<Save className="w-4 h-4 mr-2" />
						Save Changes
					</Button>

					{currentStep < STEPS.length && (
						<Button onClick={nextStep} disabled={!isValid && currentStep !== 5} size="sm">
							Continue
						</Button>
					)}
				</div>
			</div>

			{/* Warning for active campaigns */}
			{campaignData?.status === "active" && (
				<Alert className="mb-6">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>This campaign is currently active. Changes will take effect immediately after saving.</AlertDescription>
				</Alert>
			)}

			{/* Step Progress */}
			<StepProgress currentStep={currentStep} totalSteps={STEPS.length} steps={STEPS} onStepClick={goToStep} />

			{/* Completion indicator */}
			<div className="mb-6 p-4 bg-muted/30 rounded-lg">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium">Campaign Completion</p>
						<p className="text-xs text-muted-foreground">Review all sections before saving changes</p>
					</div>
					<div className="text-right">
						<p className="text-lg font-bold">{completionPercentage}%</p>
						<Progress value={completionPercentage} className="w-24" />
					</div>
				</div>
			</div>

			{/* Step Content */}
			<div className="mb-8">{renderStepContent()}</div>

			{/* Navigation */}
			<div className="flex justify-between items-center pt-6 border-t">
				<div>
					{currentStep > 1 && (
						<Button variant="outline" onClick={previousStep} disabled={isSubmitting}>
							Previous
						</Button>
					)}
				</div>

				<div className="flex gap-2">
					{/* Estimated performance preview */}
					{estimatedMetrics && currentStep >= 3 && currentStep < 5 && (
						<div className="text-right mr-4">
							<p className="text-xs text-muted-foreground">Updated Performance</p>
							<p className="text-sm font-medium">
								{estimatedMetrics.clicks} clicks • ${estimatedMetrics.cpc} CPC
							</p>
						</div>
					)}

					{currentStep < STEPS.length && (
						<Button onClick={nextStep} disabled={isSubmitting}>
							{currentStep === STEPS.length - 1 ? "Review Changes" : "Continue"}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
