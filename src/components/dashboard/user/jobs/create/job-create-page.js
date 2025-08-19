/**
 * JobCreatePage Component
 * Clean, focused job creation page using extracted sections and hooks
 * Reduced from 938 lines to clean, modular implementation
 * Following Next.js best practices for large-scale applications
 */

"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { Button } from "@components/ui/button";
import { Progress } from "@components/ui/progress";
import { ArrowLeft, Save, Send } from "lucide-react";
import { ALL_CATEGORIES } from "@components/site/categories/all-categories-page";

// Import custom hooks and sections
import { useJobForm } from "@lib/hooks/user/jobs/use-job-form.ts";
import { JobDetailsSection, LocationSection, BudgetTimelineSection, ProjectRequirementsSection, PhotoGallerySection } from "./sections";

export default function JobCreatePage() {
	// CRITICAL: Removed all console.log statements as they can cause infinite re-renders

	// SAFE APPROACH: Don't destructure everything at once to prevent infinite re-renders
	const jobForm = useJobForm();

	// Only destructure what we immediately need to prevent circular dependencies
	const { currentStep, completionPercentage, isSubmitting } = jobForm;

	// Helper function to add requirements (original format compatibility)
	// CRITICAL: Wrapped in useCallback to prevent infinite re-renders
	const addRequirementFn = useCallback(() => {
		jobForm.addRequirement("");
	}, [jobForm.addRequirement]);

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white border-b">
				<div className="max-w-4xl mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<Link href="/dashboard/user/jobs">
								<Button variant="ghost" size="sm">
									<ArrowLeft className="w-4 h-4 mr-2" />
									Back to Jobs
								</Button>
							</Link>
							<div>
								<h1 className="text-2xl font-bold">Post a New Job</h1>
								<p className="text-muted-foreground">Connect with qualified professionals for your project</p>
							</div>
						</div>

						{/* Progress Indicator */}
						<div className="hidden md:flex items-center space-x-4">
							<div className="text-sm text-muted-foreground">{completionPercentage}% Complete</div>
							<Progress value={completionPercentage} className="w-32" />
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-4xl mx-auto px-4 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Main Form */}
					<div className="lg:col-span-2">
						<form
							onSubmit={(e) => {
								e.preventDefault();
								jobForm.submitForm();
							}}
							className="space-y-6"
						>
							{/* Job Details */}
							<JobDetailsSection formData={jobForm.formData} onInputChange={jobForm.handleInputChange} errors={jobForm.errors} allCategories={ALL_CATEGORIES} />

							{/* Location */}
							<LocationSection formData={jobForm.formData} onInputChange={jobForm.handleInputChange} errors={jobForm.errors} />

							{/* Budget & Timeline */}
							<BudgetTimelineSection formData={jobForm.formData} onInputChange={jobForm.handleInputChange} errors={jobForm.errors} />

							{/* Project Requirements */}
							<ProjectRequirementsSection formData={jobForm.formData} onInputChange={jobForm.handleInputChange} addRequirement={addRequirementFn} removeRequirement={jobForm.removeRequirement} updateRequirement={jobForm.updateRequirement} errors={jobForm.errors} />

							{/* Photo Gallery */}
							<PhotoGallerySection formData={jobForm.formData} onPhotoUpload={jobForm.handlePhotoUpload} onPhotoRemove={jobForm.removePhoto} errors={jobForm.errors} />

							{/* Submit Actions */}
							<div className="flex justify-between items-center pt-6 border-t">
								<Button type="button" variant="outline" onClick={jobForm.saveDraft} className="flex items-center space-x-2">
									<Save className="w-4 h-4" />
									<span>Save Draft</span>
								</Button>

								<Button type="submit" disabled={isSubmitting} className="flex items-center space-x-2">
									{isSubmitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
									<span>{isSubmitting ? "Posting..." : "Post Job"}</span>
								</Button>
							</div>
						</form>
					</div>

					{/* Sidebar */}
					<div className="lg:col-span-1">
						<div className="sticky top-8 space-y-6">
							{/* How It Works */}
							<div className="bg-white rounded-lg border p-6">
								<h3 className="font-semibold text-lg mb-4">How It Works</h3>
								<div className="space-y-4">
									<div className="flex items-start space-x-3">
										<div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">1</div>
										<div>
											<h4 className="font-medium">Post Your Job</h4>
											<p className="text-sm text-muted-foreground">Tell us about your project and requirements</p>
										</div>
									</div>
									<div className="flex items-start space-x-3">
										<div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">2</div>
										<div>
											<h4 className="font-medium">Get Proposals</h4>
											<p className="text-sm text-muted-foreground">Qualified professionals will send you proposals</p>
										</div>
									</div>
									<div className="flex items-start space-x-3">
										<div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">3</div>
										<div>
											<h4 className="font-medium">Choose & Connect</h4>
											<p className="text-sm text-muted-foreground">Review profiles and hire the best fit</p>
										</div>
									</div>
								</div>
							</div>

							{/* Pricing Summary */}
							<div className="bg-white rounded-lg border p-6">
								<h3 className="font-semibold text-lg mb-4">Pricing</h3>
								<div className="space-y-3">
									<div className="flex justify-between">
										<span>Job Posting</span>
										<span className="font-medium text-success">Free</span>
									</div>
									<div className="border-t pt-3">
										<p className="text-sm text-muted-foreground">No upfront costs. Only pay if you hire someone through our platform.</p>
									</div>
								</div>
							</div>

							{/* Tips */}
							<div className="bg-blue-50 rounded-lg border border-primary/30 p-6">
								<h3 className="font-semibold text-lg mb-4 text-primary">💡 Pro Tips</h3>
								<div className="space-y-3 text-sm text-primary">
									<p>• Be specific about your requirements</p>
									<p>• Include photos when relevant</p>
									<p>• Set a realistic budget and timeline</p>
									<p>• Respond quickly to interested professionals</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
