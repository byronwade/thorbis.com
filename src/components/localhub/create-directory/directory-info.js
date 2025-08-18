import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@components/ui/form";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Badge } from "@components/ui/badge";
import { CheckCircle, AlertCircle, MapPin, Phone, Mail, Save, FileText, Globe } from "lucide-react";

export default function DirectoryInfo() {
	const {
		control,
		watch,
		setValue,
		formState: { errors, isDirty },
	} = useFormContext();
	const [autoSaveStatus, setAutoSaveStatus] = useState("idle");
	const [validationTips, setValidationTips] = useState({});

	// Watch form values for real-time validation
	const directoryName = watch("directoryInfo.directoryName");
	const description = watch("directoryInfo.description");
	const contactPhone = watch("directoryInfo.contactPhone");
	const contactEmail = watch("directoryInfo.contactEmail");

	// Auto-save functionality
	useEffect(() => {
		if (isDirty && directoryName && description && contactPhone && contactEmail) {
			const timer = setTimeout(() => {
				setAutoSaveStatus("saving");
				// Simulate auto-save
				setTimeout(() => {
					setAutoSaveStatus("saved");
					setTimeout(() => setAutoSaveStatus("idle"), 2000);
				}, 500);
			}, 1000);

			return () => clearTimeout(timer);
		}
	}, [directoryName, description, contactPhone, contactEmail, isDirty]);

	// Real-time validation tips
	useEffect(() => {
		const tips = {};

		if (directoryName) {
			if (directoryName.length < 3) {
				tips.directoryName = "Directory name should be at least 3 characters";
			} else if (directoryName.length > 50) {
				tips.directoryName = "Directory name should be less than 50 characters";
			} else {
				tips.directoryName = "✓ Good directory name";
			}
		}

		if (description) {
			if (description.length < 10) {
				tips.description = "Description should be at least 10 characters";
			} else if (description.length > 500) {
				tips.description = "Description should be less than 500 characters";
			} else {
				tips.description = "✓ Good description";
			}
		}

		if (contactPhone) {
			const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
			if (!phoneRegex.test(contactPhone.replace(/[\s\-\(\)]/g, ""))) {
				tips.contactPhone = "Please enter a valid phone number";
			} else {
				tips.contactPhone = "✓ Valid phone number";
			}
		}

		if (contactEmail) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(contactEmail)) {
				tips.contactEmail = "Please enter a valid email address";
			} else {
				tips.contactEmail = "✓ Valid email address";
			}
		}

		setValidationTips(tips);
	}, [directoryName, description, contactPhone, contactEmail]);

	const formatPhoneNumber = (value) => {
		// Remove all non-digits
		const phoneNumber = value.replace(/\D/g, "");

		// Format as (XXX) XXX-XXXX
		if (phoneNumber.length <= 3) {
			return phoneNumber;
		} else if (phoneNumber.length <= 6) {
			return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
		} else {
			return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
		}
	};

	return (
		<>
			<div className="space-y-6">
				{/* Header with Auto-save Status */}
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-2xl font-bold leading-9 text-left">Directory Information</h2>
						<p className="text-sm leading-6 text-left text-muted-foreground">Set up the basic details for your LocalHub directory.</p>
					</div>
					{autoSaveStatus === "saving" && (
						<Badge variant="secondary" className="flex items-center gap-1">
							<Save className="w-3 h-3 animate-spin" />
							Saving...
						</Badge>
					)}
					{autoSaveStatus === "saved" && (
						<Badge variant="secondary" className="flex items-center gap-1 bg-primary/20 text-primary">
							<CheckCircle className="w-3 h-3" />
							Saved
						</Badge>
					)}
				</div>

				{/* Helpful Tips Alert */}
				<Alert>
					<Globe className="h-4 w-4" />
					<AlertDescription>
						<strong>Pro tip:</strong> Choose a directory name that reflects your local area or community. This will help businesses and customers easily identify your directory.
					</AlertDescription>
				</Alert>

				<div className="flex flex-col space-y-6">
					<FormField
						control={control}
						name="directoryInfo.directoryName"
						render={({ field, fieldState }) => (
							<FormItem>
								<FormLabel className="flex items-center gap-2">
									<MapPin className="w-4 h-4" />
									Directory Name <span className="text-destructive">*</span>
								</FormLabel>
								<FormDescription>This will be the public name of your business directory (e.g., &quot;Raleigh LocalHub&quot;, &quot;Downtown Dallas Directory&quot;).</FormDescription>
								<FormControl>
									<Input {...field} placeholder="e.g., Raleigh LocalHub" className={fieldState.error ? "border-red-500" : ""} />
								</FormControl>
								{validationTips.directoryName && (
									<div className={`flex items-center gap-1 text-sm ${validationTips.directoryName.startsWith("✓") ? "text-primary" : "text-muted-foreground"}`}>
										{validationTips.directoryName.startsWith("✓") ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
										{validationTips.directoryName.replace("✓ ", "")}
									</div>
								)}
								<FormMessage>{fieldState.error?.message}</FormMessage>
							</FormItem>
						)}
					/>

					<FormField
						control={control}
						name="directoryInfo.description"
						render={({ field, fieldState }) => (
							<FormItem>
								<FormLabel className="flex items-center gap-2">
									<FileText className="w-4 h-4" />
									Description <span className="text-destructive">*</span>
								</FormLabel>
								<FormDescription>Describe what makes your directory special and what area/community it serves.</FormDescription>
								<FormControl>
									<Textarea {...field} placeholder="e.g., The premier business directory for Raleigh, NC. Connecting local customers with trusted businesses since 2024." rows={4} className={fieldState.error ? "border-red-500" : ""} />
								</FormControl>
								{validationTips.description && (
									<div className={`flex items-center gap-1 text-sm ${validationTips.description.startsWith("✓") ? "text-primary" : "text-muted-foreground"}`}>
										{validationTips.description.startsWith("✓") ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
										{validationTips.description.replace("✓ ", "")}
									</div>
								)}
								<FormMessage>{fieldState.error?.message}</FormMessage>
							</FormItem>
						)}
					/>

					<FormField
						control={control}
						name="directoryInfo.contactEmail"
						render={({ field, fieldState }) => (
							<FormItem>
								<FormLabel className="flex items-center gap-2">
									<Mail className="w-4 h-4" />
									Contact Email <span className="text-destructive">*</span>
								</FormLabel>
								<FormDescription>This email will be used for business inquiries and directory management.</FormDescription>
								<FormControl>
									<Input {...field} type="email" placeholder="contact@raleighlocalhub.com" className={fieldState.error ? "border-red-500" : ""} />
								</FormControl>
								{validationTips.contactEmail && (
									<div className={`flex items-center gap-1 text-sm ${validationTips.contactEmail.startsWith("✓") ? "text-primary" : "text-muted-foreground"}`}>
										{validationTips.contactEmail.startsWith("✓") ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
										{validationTips.contactEmail.replace("✓ ", "")}
									</div>
								)}
								<FormMessage>{fieldState.error?.message}</FormMessage>
							</FormItem>
						)}
					/>

					<FormField
						control={control}
						name="directoryInfo.contactPhone"
						render={({ field, fieldState }) => (
							<FormItem>
								<FormLabel className="flex items-center gap-2">
									<Phone className="w-4 h-4" />
									Contact Phone Number <span className="text-destructive">*</span>
								</FormLabel>
								<FormDescription>A phone number where businesses and customers can reach you for support.</FormDescription>
								<FormControl>
									<Input
										{...field}
										placeholder="(555) 123-4567"
										onChange={(e) => {
											const formatted = formatPhoneNumber(e.target.value);
											field.onChange(formatted);
										}}
										className={fieldState.error ? "border-red-500" : ""}
									/>
								</FormControl>
								{validationTips.contactPhone && (
									<div className={`flex items-center gap-1 text-sm ${validationTips.contactPhone.startsWith("✓") ? "text-primary" : "text-muted-foreground"}`}>
										{validationTips.contactPhone.startsWith("✓") ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
										{validationTips.contactPhone.replace("✓ ", "")}
									</div>
								)}
								<FormMessage>{fieldState.error?.message}</FormMessage>
							</FormItem>
						)}
					/>
				</div>

				{/* Additional Info Alert */}
									<Alert className="border-primary/20 bg-primary/10 dark:border-primary/20 dark:bg-primary/10">
						<AlertCircle className="h-4 w-4 text-primary" />
						<AlertDescription className="text-primary dark:text-primary">Your contact information will be displayed publicly on your directory for businesses and customers to reach out for support or partnership opportunities.</AlertDescription>
				</Alert>
			</div>
		</>
	);
}
