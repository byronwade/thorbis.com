"use client";

import React from "react";
import { Progress } from "@components/ui/progress";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Form } from "@components/ui/form";
import { CheckCircle, Loader2 } from "lucide-react";
import { useBusinessSubmission } from "@lib/hooks/business/submission/use-business-submission";
import { BasicInformationSection, ContactInformationSection, BusinessDetailsSection, BusinessImagesSection, OwnerInformationSection } from "./submission/sections";

const BusinessSubmissionForm = () => {
	const { form, errors, isValid, specialtyFields, addSpecialtyItem, removeSpecialtyItem, uploadedImages, handleImageUpload, removeImage, selectedAmenities, selectedPaymentMethods, toggleAmenity, togglePaymentMethod, isSubmitting, progress, validateSection, onSubmit, constants } = useBusinessSubmission();

	const getProgressColor = () => {
		if (progress < 25) return "bg-destructive";
		if (progress < 50) return "bg-muted-foreground";
		if (progress < 75) return "bg-accent";
		return "bg-primary";
	};

	const getProgressStatus = () => {
		if (progress < 25) return "Getting Started";
		if (progress < 50) return "Making Progress";
		if (progress < 75) return "Almost There";
		if (progress < 100) return "Nearly Complete";
		return "Complete";
	};

	return (
		<div className="max-w-4xl mx-auto p-6 space-y-8">
			<div className="text-center space-y-4">
				<h1 className="text-3xl font-bold">Submit Your Business</h1>
				<p className="text-muted-foreground text-lg">Join thousands of businesses on our platform. Fill out the form below to get started.</p>

				{/* Progress Indicator */}
				<Card className="w-full max-w-md mx-auto">
					<CardContent className="pt-6">
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span className="font-medium">{getProgressStatus()}</span>
								<span className="text-muted-foreground">{Math.round(progress)}%</span>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-2">
								<div className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`} style={{ width: `${progress}%` }} />
							</div>
							{progress === 100 && (
								<div className="flex items-center justify-center text-primary mt-2">
									<CheckCircle className="h-4 w-4 mr-1" />
									<span className="text-sm font-medium">Ready to submit!</span>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
					{/* Basic Information Section */}
					<BasicInformationSection form={form} constants={constants} specialtyFields={specialtyFields} addSpecialtyItem={addSpecialtyItem} removeSpecialtyItem={removeSpecialtyItem} />

					{/* Contact Information Section */}
					<ContactInformationSection form={form} />

					{/* Business Details Section */}
					<BusinessDetailsSection form={form} selectedAmenities={selectedAmenities} selectedPaymentMethods={selectedPaymentMethods} toggleAmenity={toggleAmenity} togglePaymentMethod={togglePaymentMethod} constants={constants} />

					{/* Business Images Section */}
					<BusinessImagesSection uploadedImages={uploadedImages} handleImageUpload={handleImageUpload} removeImage={removeImage} constants={constants} />

					{/* Owner Information Section */}
					<OwnerInformationSection form={form} />

					{/* Submit Section */}
					<Card>
						<CardHeader>
							<CardTitle>Submit Your Business</CardTitle>
							<CardDescription>Review your information and submit your business for approval.</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{/* Validation Summary */}
								{Object.keys(errors).length > 0 && (
									<div className="p-4 border-l-4 border-destructive bg-destructive/10">
										<h4 className="font-medium text-destructive">Please fix the following errors:</h4>
										<ul className="mt-2 text-sm text-destructive/80 list-disc list-inside">
											{Object.entries(errors).map(([field, error]) => (
												<li key={field}>
													{field}: {error?.message}
												</li>
											))}
										</ul>
									</div>
								)}

								{/* Submission Progress */}
								{isSubmitting && (
									<div className="space-y-2">
										<div className="flex items-center justify-center text-primary">
											<Loader2 className="h-5 w-5 animate-spin mr-2" />
											<span>Submitting your business...</span>
										</div>
										<Progress value={progress} className="w-full" />
									</div>
								)}

								{/* Submit Button */}
								<Button type="submit" className="w-full" size="lg" disabled={isSubmitting || !isValid}>
									{isSubmitting ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin mr-2" />
											Submitting...
										</>
									) : (
										"Submit Business for Review"
									)}
								</Button>

								<p className="text-xs text-muted-foreground text-center">By submitting, you agree to our Terms of Service and Privacy Policy. Your business will be reviewed within 24-48 hours.</p>
							</div>
						</CardContent>
					</Card>
				</form>
			</Form>
		</div>
	);
};

export default BusinessSubmissionForm;
