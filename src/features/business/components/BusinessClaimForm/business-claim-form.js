"use client";

import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Separator } from "@components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@context/auth-context";
import { Building, MapPin, Phone, Globe, Clock, Star, AlertCircle, CheckCircle, Upload, X, Loader2 } from "lucide-react";
import { SecureStorage } from "@utils/secure-storage";
import logger from "@lib/utils/logger";

// Business claim form validation schema
const businessClaimSchema = z.object({
	// Claimant information
	claimantName: z.string().min(2, { message: "Name must be at least 2 characters" }),
	claimantEmail: z.string().email({ message: "Invalid email address" }),
	claimantPhone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),

	// Relationship to business
	relationship: z.enum(["owner", "manager", "employee", "authorized_representative"], {
		errorMap: () => ({ message: "Please select your relationship to the business" }),
	}),

	// Verification information
	businessRole: z.string().min(2, { message: "Please describe your role" }),
	yearsAssociated: z.string().min(1, { message: "Please specify how long you've been associated" }),

	// Supporting information
	verificationDetails: z.string().min(20, { message: "Please provide detailed verification information (minimum 20 characters)" }),

	// Optional corrections
	proposedChanges: z.string().optional(),

	// Legal confirmation
	legalConfirmation: z.boolean().refine((val) => val === true, {
		message: "You must confirm the legal statement",
	}),
});

export default function BusinessClaimForm({ business, onSuccess, onCancel }) {
	const { user, isAuthenticated } = useAuth();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [uploadedFiles, setUploadedFiles] = useState([]);
	const [claimStatus, setClaimStatus] = useState(null);

	// Form setup
	const form = useForm({
		resolver: zodResolver(businessClaimSchema),
		defaultValues: {
			claimantName: user?.name || "",
			claimantEmail: user?.email || "",
			claimantPhone: "",
			relationship: "",
			businessRole: "",
			yearsAssociated: "",
			verificationDetails: "",
			proposedChanges: "",
			legalConfirmation: false,
		},
	});

	const {
		handleSubmit,
		formState: { errors, isValid },
	} = form;

	// Check if user has already claimed this business
	useEffect(() => {
		if (business?.id && user?.id) {
			checkExistingClaim();
		}
	}, [business?.id, user?.id]);

	const checkExistingClaim = async () => {
		try {
			const response = await fetch(`/api/business/claim/status?businessId=${business.id}&userId=${user.id}`);
			if (response.ok) {
				const data = await response.json();
				setClaimStatus(data.status);
			}
		} catch (error) {
			logger.error("Failed to check existing claim:", error);
		}
	};

	// Handle file upload for verification documents
	const handleFileUpload = (event) => {
		const files = Array.from(event.target.files);
		const maxSize = 5 * 1024 * 1024; // 5MB
		const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

		const validFiles = files.filter((file) => {
			if (file.size > maxSize) {
				toast.error(`${file.name} is too large. Maximum size is 5MB.`);
				return false;
			}
			if (!allowedTypes.includes(file.type)) {
				toast.error(`${file.name} is not a supported file type. Please upload JPEG, PNG, or PDF files.`);
				return false;
			}
			return true;
		});

		setUploadedFiles((prev) => [...prev, ...validFiles].slice(0, 3)); // Max 3 files
	};

	const removeFile = (indexToRemove) => {
		setUploadedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
	};

	// Submit claim form
	const onSubmit = async (data) => {
		if (!isAuthenticated) {
			toast.error("You must be logged in to claim a business");
			return;
		}

		setIsSubmitting(true);

		try {
			// Prepare form data for submission
			const formData = new FormData();

			// Add form fields
			Object.keys(data).forEach((key) => {
				formData.append(key, data[key]);
			});

			// Add business and user information
			formData.append("businessId", business.id);
			formData.append("businessName", business.name);
			formData.append("userId", user.id);

			// Add uploaded files
			uploadedFiles.forEach((file, index) => {
				formData.append(`verification_document_${index}`, file);
			});

			// Add metadata
			formData.append("claimDate", new Date().toISOString());
			formData.append("userAgent", navigator.userAgent);

			const response = await fetch("/api/business/claim", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to submit claim");
			}

			const result = await response.json();

			// Store claim ID for reference
			SecureStorage.setItem(
				`business_claim_${business.id}`,
				{
					claimId: result.claimId,
					status: "pending",
					submittedAt: Date.now(),
				},
				{ expiry: 30 * 24 * 60 * 60 * 1000 }
			); // 30 days

			toast.success("Business claim submitted successfully! You'll receive an email confirmation.");

			// Log successful claim submission
			logger.info("Business claim submitted", {
				businessId: business.id,
				businessName: business.name,
				claimId: result.claimId,
				userId: user.id,
			});

			if (onSuccess) {
				onSuccess(result);
			}
		} catch (error) {
			logger.error("Business claim submission failed:", error);
			toast.error(error.message || "Failed to submit business claim. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Show claim status if user has already claimed
	if (claimStatus) {
		return (
			<Card className="max-w-2xl mx-auto">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						{claimStatus === "approved" ? <CheckCircle className="h-5 w-5 text-primary" /> : claimStatus === "pending" ? <Clock className="h-5 w-5 text-muted-foreground" /> : <AlertCircle className="h-5 w-5 text-destructive" />}
						Claim Status: {claimStatus.charAt(0).toUpperCase() + claimStatus.slice(1)}
					</CardTitle>
					<CardDescription>
						{claimStatus === "approved" && "Your claim has been approved. You now have management access to this business."}
						{claimStatus === "pending" && "Your claim is being reviewed. We'll notify you via email once it's processed."}
						{claimStatus === "rejected" && "Your claim was not approved. Please contact support if you believe this was an error."}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<Button variant="outline" onClick={onCancel} className="w-full">
						Back to Business
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			{/* Business Information Card */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Building className="h-5 w-5" />
						Claiming: {business.name}
					</CardTitle>
					<CardDescription>Review the business information below and provide verification details to claim this listing.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<MapPin className="h-4 w-4" />
								{business.address}
							</div>
							{business.phone && (
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<Phone className="h-4 w-4" />
									{business.phone}
								</div>
							)}
							{business.website && (
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<Globe className="h-4 w-4" />
									<a href={business.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
										{business.website}
									</a>
								</div>
							)}
						</div>
						<div className="space-y-2">
							{business.rating && (
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<Star className="h-4 w-4 fill-muted-foreground text-muted-foreground" />
									{business.rating} ({business.reviewCount} reviews)
								</div>
							)}
							{business.categories && business.categories.length > 0 && (
								<div className="flex flex-wrap gap-1">
									{business.categories.slice(0, 3).map((category, index) => (
										<Badge key={index} variant="secondary" className="text-xs">
											{category}
										</Badge>
									))}
								</div>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Claim Form */}
			<Card>
				<CardHeader>
					<CardTitle>Business Claim Form</CardTitle>
					<CardDescription>Please provide accurate information to verify your relationship with this business.</CardDescription>
				</CardHeader>
				<CardContent>
					<FormProvider {...form}>
						<Form {...form}>
							<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
								{/* Claimant Information */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold">Your Information</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="claimantName"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Full Name</FormLabel>
													<FormControl>
														<Input {...field} placeholder="Your full name" />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="claimantEmail"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Email Address</FormLabel>
													<FormControl>
														<Input {...field} type="email" placeholder="your@email.com" />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
									<FormField
										control={form.control}
										name="claimantPhone"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Phone Number</FormLabel>
												<FormControl>
													<Input {...field} type="tel" placeholder="(555) 123-4567" />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<Separator />

								{/* Business Relationship */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold">Relationship to Business</h3>
									<FormField
										control={form.control}
										name="relationship"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Your relationship to this business</FormLabel>
												<FormControl>
													<select {...field} className="w-full p-2 border rounded-md">
														<option value="">Select your relationship</option>
														<option value="owner">Business Owner</option>
														<option value="manager">Manager</option>
														<option value="employee">Employee</option>
														<option value="authorized_representative">Authorized Representative</option>
													</select>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="businessRole"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Your role/title at the business</FormLabel>
													<FormControl>
														<Input {...field} placeholder="e.g., Owner, General Manager, etc." />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="yearsAssociated"
											render={({ field }) => (
												<FormItem>
													<FormLabel>How long have you been associated?</FormLabel>
													<FormControl>
														<Input {...field} placeholder="e.g., 5 years, Since 2020, etc." />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>

								<Separator />

								{/* Verification Details */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold">Verification Information</h3>
									<FormField
										control={form.control}
										name="verificationDetails"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Verification Details</FormLabel>
												<FormControl>
													<Textarea {...field} placeholder="Please provide specific details that verify your relationship to this business. Include any relevant business license numbers, tax ID information, or other identifying details that prove your authorization to manage this listing." rows={4} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* File Upload for Verification Documents */}
									<div className="space-y-2">
										<label className="text-sm font-medium">Supporting Documents (Optional)</label>
										<div className="border-2 border-dashed border-border rounded-md p-4">
											<input type="file" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileUpload} className="hidden" id="file-upload" />
											<label htmlFor="file-upload" className="cursor-pointer">
												<div className="text-center">
													<Upload className="mx-auto h-8 w-8 text-muted-foreground" />
													<p className="mt-2 text-sm text-muted-foreground">Click to upload verification documents</p>
													<p className="text-xs text-muted-foreground">JPEG, PNG, PDF up to 5MB each (max 3 files)</p>
												</div>
											</label>
										</div>

										{/* Display uploaded files */}
										{uploadedFiles.length > 0 && (
											<div className="space-y-2">
												{uploadedFiles.map((file, index) => (
													<div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
														<span className="text-sm truncate">{file.name}</span>
														<Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
															<X className="h-4 w-4" />
														</Button>
													</div>
												))}
											</div>
										)}
									</div>
								</div>

								<Separator />

								{/* Proposed Changes */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold">Proposed Changes (Optional)</h3>
									<FormField
										control={form.control}
										name="proposedChanges"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Corrections or updates you'd like to make</FormLabel>
												<FormControl>
													<Textarea {...field} placeholder="If there are any inaccuracies in the current listing, please describe the corrections you'd like to make..." rows={3} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<Separator />

								{/* Legal Confirmation */}
								<div className="space-y-4">
									<FormField
										control={form.control}
										name="legalConfirmation"
										render={({ field }) => (
											<FormItem className="flex flex-row items-start space-x-3 space-y-0">
												<FormControl>
													<input type="checkbox" checked={field.value} onChange={field.onChange} className="mt-1" />
												</FormControl>
												<div className="space-y-1 leading-none">
													<FormLabel className="text-sm">I confirm that I am authorized to claim and manage this business listing</FormLabel>
													<p className="text-xs text-muted-foreground">By checking this box, you certify that you have the legal authority to claim this business listing and that all information provided is accurate. Submitting false information may result in account suspension.</p>
												</div>
											</FormItem>
										)}
									/>
									<FormMessage />
								</div>

								{/* Important Notice */}
								<Alert>
									<AlertCircle className="h-4 w-4" />
									<AlertDescription>
										<strong>Important:</strong> Claims are reviewed manually by our team. You'll receive an email confirmation once submitted, and a decision within 2-3 business days. If approved, you'll gain full management access to this business listing.
									</AlertDescription>
								</Alert>

								{/* Form Actions */}
								<div className="flex gap-4 pt-4">
									<Button type="submit" disabled={!isValid || isSubmitting} className="flex-1">
										{isSubmitting ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Submitting Claim...
											</>
										) : (
											"Submit Business Claim"
										)}
									</Button>
									<Button type="button" variant="outline" onClick={onCancel}>
										Cancel
									</Button>
								</div>
							</form>
						</Form>
					</FormProvider>
				</CardContent>
			</Card>
		</div>
	);
}
