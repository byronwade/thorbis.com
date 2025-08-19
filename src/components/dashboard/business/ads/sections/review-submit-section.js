/**
 * Review & Submit Section
 * Extracted from ads create/edit pages (678/804 lines)
 * Final review step with campaign summary and submission
 * Enterprise-level component with comprehensive validation and preview
 */

"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Checkbox } from "@components/ui/checkbox";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Label } from "@components/ui/label";
import { CheckCircle, AlertCircle, CreditCard, Target, MapPin, Edit2, Send, Loader2, Info, FileText, Shield } from "lucide-react";

// Campaign summary component
const CampaignSummary = ({ campaignData, onEditSection }) => {
	const { name, type, location, radius, headline, description, cta, keywords, demographics, interests, budget, duration, schedule } = campaignData;

	const totalBudget = budget * duration;
	const keywordArray =
		keywords
			?.split(",")
			.map((k) => k.trim())
			.filter((k) => k) || [];

	return (
		<div className="space-y-6">
			{/* Campaign Overview */}
			<Card>
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<FileText className="w-5 h-5 text-primary" />
							Campaign Overview
						</CardTitle>
						<Button variant="outline" size="sm" onClick={() => onEditSection(1)}>
							<Edit2 className="w-3 h-3 mr-1" />
							Edit
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<p className="text-sm text-muted-foreground">Campaign Name</p>
							<p className="font-medium">{name || "Untitled Campaign"}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Ad Type</p>
							<Badge variant="secondary" className="capitalize">
								{type || "search"}
							</Badge>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Target Location</p>
							<div className="flex items-center gap-1">
								<MapPin className="w-3 h-3 text-muted-foreground" />
								<p className="text-sm">{location || "Not specified"}</p>
								{radius && <span className="text-xs text-muted-foreground">({radius}km radius)</span>}
							</div>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Status</p>
							<Badge variant="outline" className="text-warning border-yellow-600">
								Draft
							</Badge>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Ad Creative */}
			<Card>
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<Edit2 className="w-5 h-5 text-primary" />
							Ad Creative
						</CardTitle>
						<Button variant="outline" size="sm" onClick={() => onEditSection(2)}>
							<Edit2 className="w-3 h-3 mr-1" />
							Edit
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-3">
					<div>
						<p className="text-sm text-muted-foreground">Headline</p>
						<p className="font-medium">{headline || "No headline set"}</p>
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Description</p>
						<p className="text-sm">{description || "No description set"}</p>
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Call to Action</p>
						<Badge variant="secondary">{cta || "Learn More"}</Badge>
					</div>
				</CardContent>
			</Card>

			{/* Targeting */}
			<Card>
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<Target className="w-5 h-5 text-primary" />
							Audience Targeting
						</CardTitle>
						<Button variant="outline" size="sm" onClick={() => onEditSection(3)}>
							<Edit2 className="w-3 h-3 mr-1" />
							Edit
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-3">
					<div>
						<p className="text-sm text-muted-foreground">Keywords ({keywordArray.length})</p>
						<div className="flex flex-wrap gap-1 mt-1">
							{keywordArray.slice(0, 5).map((keyword, index) => (
								<Badge key={index} variant="outline" className="text-xs">
									{keyword}
								</Badge>
							))}
							{keywordArray.length > 5 && (
								<Badge variant="outline" className="text-xs">
									+{keywordArray.length - 5} more
								</Badge>
							)}
						</div>
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Demographics</p>
						<p className="text-sm">{demographics?.length > 0 ? `${demographics.length} age group${demographics.length > 1 ? "s" : ""} selected` : "All ages"}</p>
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Interests</p>
						<p className="text-sm">{interests?.length > 0 ? `${interests.length} interest${interests.length > 1 ? "s" : ""} selected` : "All interests"}</p>
					</div>
				</CardContent>
			</Card>

			{/* Budget & Schedule */}
			<Card>
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<CreditCard className="w-5 h-5 text-primary" />
							Budget & Schedule
						</CardTitle>
						<Button variant="outline" size="sm" onClick={() => onEditSection(4)}>
							<Edit2 className="w-3 h-3 mr-1" />
							Edit
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<p className="text-sm text-muted-foreground">Daily Budget</p>
							<p className="font-medium text-lg">${budget}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Duration</p>
							<p className="font-medium">{duration} days</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Total Budget</p>
							<p className="font-bold text-xl text-success">${totalBudget}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Schedule</p>
							<div className="text-sm">
								<p>
									{schedule?.startDate} to {schedule?.endDate}
								</p>
								<p className="text-muted-foreground capitalize">{schedule?.timeOfDay || "all day"}</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

// Validation checklist component
const ValidationChecklist = ({ campaignData, validationErrors }) => {
	const checklistItems = [
		{
			id: "name",
			label: "Campaign name is set",
			isValid: !!campaignData.name?.trim(),
			error: validationErrors.name,
		},
		{
			id: "location",
			label: "Target location is specified",
			isValid: !!campaignData.location?.trim(),
			error: validationErrors.location,
		},
		{
			id: "headline",
			label: "Ad headline is written",
			isValid: !!campaignData.headline?.trim(),
			error: validationErrors.headline,
		},
		{
			id: "description",
			label: "Ad description is written",
			isValid: !!campaignData.description?.trim(),
			error: validationErrors.description,
		},
		{
			id: "keywords",
			label: "Keywords are added",
			isValid: !!campaignData.keywords?.trim(),
			error: validationErrors.keywords,
		},
		{
			id: "budget",
			label: "Budget is set",
			isValid: campaignData.budget > 0,
			error: validationErrors.budget,
		},
		{
			id: "schedule",
			label: "Campaign schedule is configured",
			isValid: !!campaignData.schedule?.startDate && !!campaignData.schedule?.endDate,
			error: validationErrors.startDate || validationErrors.endDate,
		},
	];

	const validItems = checklistItems.filter((item) => item.isValid).length;
	const totalItems = checklistItems.length;
	const isComplete = validItems === totalItems;

	return (
		<Card className={isComplete ? "border-green-200 bg-green-50/50" : "border-yellow-200 bg-yellow-50/50"}>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2">
					{isComplete ? <CheckCircle className="w-5 h-5 text-success" /> : <AlertCircle className="w-5 h-5 text-warning" />}
					Campaign Validation
					<Badge variant={isComplete ? "default" : "secondary"} className="ml-2">
						{validItems}/{totalItems}
					</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{checklistItems.map((item) => (
					<div key={item.id} className="flex items-start gap-3">
						{item.isValid ? <CheckCircle className="w-4 h-4 text-success mt-0.5" /> : <AlertCircle className="w-4 h-4 text-warning mt-0.5" />}
						<div className="flex-1">
							<p className={`text-sm ${item.isValid ? "text-success" : "text-warning"}`}>{item.label}</p>
							{item.error && <p className="text-xs text-destructive mt-1">{item.error}</p>}
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
};

export const ReviewSubmitSection = ({
	// Data props
	campaignData,
	validationErrors = {},
	isSubmitting = false,

	// Event handlers
	onEditSection,
	onSubmit,
	onSaveDraft,

	// Configuration
	isEditMode = false,
	showValidationChecklist = true,
	className = "",
}) => {
	const [termsAccepted, setTermsAccepted] = useState(campaignData.termsAccepted || false);
	const [billingAccepted, setBillingAccepted] = useState(campaignData.billingAccepted || false);

	// Check if campaign is ready to submit
	const hasValidationErrors = Object.keys(validationErrors).length > 0;
	const isReadyToSubmit = !hasValidationErrors && termsAccepted && billingAccepted;

	// Handle submission
	const handleSubmit = () => {
		if (isReadyToSubmit) {
			onSubmit({
				...campaignData,
				termsAccepted,
				billingAccepted,
			});
		}
	};

	// Handle save draft
	const handleSaveDraft = () => {
		if (onSaveDraft) {
			onSaveDraft({
				...campaignData,
				termsAccepted,
				billingAccepted,
			});
		}
	};

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Validation Checklist */}
			{showValidationChecklist && <ValidationChecklist campaignData={campaignData} validationErrors={validationErrors} />}

			{/* Campaign Summary */}
			<CampaignSummary campaignData={campaignData} onEditSection={onEditSection} />

			{/* Terms and Conditions */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Shield className="w-5 h-5 text-primary" />
						Terms & Conditions
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-start space-x-3">
						<Checkbox id="terms" checked={termsAccepted} onCheckedChange={setTermsAccepted} />
						<Label htmlFor="terms" className="text-sm cursor-pointer">
							I agree to the{" "}
							<a href="/terms" className="text-primary hover:underline" target="_blank">
								Terms of Service
							</a>{" "}
							and{" "}
							<a href="/privacy" className="text-primary hover:underline" target="_blank">
								Privacy Policy
							</a>
						</Label>
					</div>

					<div className="flex items-start space-x-3">
						<Checkbox id="billing" checked={billingAccepted} onCheckedChange={setBillingAccepted} />
						<Label htmlFor="billing" className="text-sm cursor-pointer">
							I authorize charging my payment method for the campaign budget of <strong>${campaignData.budget * campaignData.duration}</strong> over <strong>{campaignData.duration} days</strong>
						</Label>
					</div>

					{(!termsAccepted || !billingAccepted) && (
						<Alert>
							<Info className="h-4 w-4" />
							<AlertDescription>Please accept the terms and billing authorization to continue.</AlertDescription>
						</Alert>
					)}
				</CardContent>
			</Card>

			{/* Final validation errors */}
			{hasValidationErrors && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>Please fix all validation errors before submitting your campaign.</AlertDescription>
				</Alert>
			)}

			{/* Action Buttons */}
			<div className="flex flex-col sm:flex-row gap-3 justify-between">
				<Button variant="outline" onClick={handleSaveDraft} disabled={isSubmitting}>
					Save as Draft
				</Button>

				<div className="flex gap-3">
					<Button variant="outline" onClick={() => onEditSection(4)} disabled={isSubmitting}>
						<Edit2 className="w-4 h-4 mr-2" />
						Back to Edit
					</Button>

					<Button onClick={handleSubmit} disabled={!isReadyToSubmit || isSubmitting} className="min-w-[140px]">
						{isSubmitting ? (
							<>
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								{isEditMode ? "Updating..." : "Creating..."}
							</>
						) : (
							<>
								<Send className="w-4 h-4 mr-2" />
								{isEditMode ? "Update Campaign" : "Launch Campaign"}
							</>
						)}
					</Button>
				</div>
			</div>

			{/* Billing notice */}
			<Alert>
				<CreditCard className="h-4 w-4" />
				<AlertDescription>
					<strong>Billing Notice:</strong> Your campaign will start immediately after approval. You'll be charged daily based on your budget and actual ad performance.
				</AlertDescription>
			</Alert>
		</div>
	);
};

export default ReviewSubmitSection;
