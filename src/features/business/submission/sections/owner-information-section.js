/**
 * OwnerInformationSection Component
 * Handles business owner information and legal confirmations
 * Extracted from BusinessSubmissionForm for better modularity
 */

"use client";

import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Checkbox } from "@components/ui/checkbox";
import { Alert, AlertDescription } from "@components/ui/alert";
import { User, Shield, AlertCircle } from "lucide-react";

const OwnerInformationSection = ({ form }) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<User className="h-5 w-5" />
					Owner Information
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Owner Contact Info */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormField
						control={form.control}
						name="ownerName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Owner/Manager Name *</FormLabel>
								<FormControl>
									<Input {...field} placeholder="John Doe" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="ownerEmail"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Owner Email *</FormLabel>
								<FormControl>
									<Input {...field} type="email" placeholder="owner@business.com" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<FormField
					control={form.control}
					name="ownerPhone"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Owner Phone (Optional)</FormLabel>
							<FormControl>
								<Input {...field} type="tel" placeholder="(555) 123-4567" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Business Legal Information */}
				<div className="space-y-4 pt-4 border-t">
					<h4 className="font-medium text-foreground">Business Legal Information (Optional)</h4>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="businessLicenseNumber"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Business License Number</FormLabel>
									<FormControl>
										<Input {...field} placeholder="License #123456" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="taxId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Tax ID / EIN</FormLabel>
									<FormControl>
										<Input {...field} placeholder="12-3456789" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</div>

				{/* Legal Confirmation */}
				<div className="space-y-4 pt-4 border-t">
					<Alert>
						<Shield className="h-4 w-4" />
						<AlertDescription>By submitting this information, you confirm that you are authorized to represent this business and that all information provided is accurate and up-to-date.</AlertDescription>
					</Alert>

					<FormField
						control={form.control}
						name="legalConfirmation"
						render={({ field }) => (
							<FormItem className="flex flex-row items-start space-x-3 space-y-0">
								<FormControl>
									<Checkbox checked={field.value} onCheckedChange={field.onChange} />
								</FormControl>
								<div className="space-y-1 leading-none">
									<FormLabel className="text-sm font-normal">I confirm that I am authorized to submit this business information and that all details provided are accurate. *</FormLabel>
									<FormMessage />
								</div>
							</FormItem>
						)}
					/>
				</div>

				{/* Privacy Notice */}
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription className="text-xs">
						<strong>Privacy Notice:</strong> Your personal information will be kept confidential and used only for business verification purposes. We will not share your contact details publicly without your consent.
					</AlertDescription>
				</Alert>
			</CardContent>
		</Card>
	);
};

export default OwnerInformationSection;
