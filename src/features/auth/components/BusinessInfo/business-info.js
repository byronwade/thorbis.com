import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@components/ui/form";
import { Input } from "@components/ui/input";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Badge } from "@components/ui/badge";
import { CheckCircle, AlertCircle, Building2, Phone, Mail, Save } from "lucide-react";

export default function BusinessInfo() {
	const {
		control,
		watch,
		setValue,
		formState: { errors, isDirty },
	} = useFormContext();
	const [autoSaveStatus, setAutoSaveStatus] = useState("idle");
	const [validationTips, setValidationTips] = useState({});

	// Watch form values for real-time validation
	const businessName = watch("businessInfo.businessName");
	const phoneNumber = watch("businessInfo.businessPhoneNumber");
	const email = watch("businessInfo.email");

	// Auto-save functionality
	useEffect(() => {
		if (isDirty && businessName && phoneNumber && email) {
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
	}, [businessName, phoneNumber, email, isDirty]);

	// Real-time validation tips
	useEffect(() => {
		const tips = {};

		if (businessName) {
			if (businessName.length < 3) {
				tips.businessName = "Business name should be at least 3 characters";
			} else if (businessName.length > 50) {
				tips.businessName = "Business name should be less than 50 characters";
			} else {
				tips.businessName = "✓ Good business name";
			}
		}

		if (phoneNumber) {
			const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
			if (!phoneRegex.test(phoneNumber.replace(/[\s\-\(\)]/g, ""))) {
				tips.phoneNumber = "Please enter a valid phone number";
			} else {
				tips.phoneNumber = "✓ Valid phone number";
			}
		}

		if (email) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				tips.email = "Please enter a valid email address";
			} else {
				tips.email = "✓ Valid email address";
			}
		}

		setValidationTips(tips);
	}, [businessName, phoneNumber, email]);

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
						<h2 className="text-2xl font-bold leading-9 text-left">Business Information</h2>
						<p className="text-sm leading-6 text-left text-muted-foreground">Complete the form below to provide your business information.</p>
					</div>
					{autoSaveStatus === "saving" && (
						<Badge variant="secondary" className="flex items-center gap-1">
							<Save className="w-3 h-3 animate-spin" />
							Saving...
						</Badge>
					)}
					{autoSaveStatus === "saved" && (
						<Badge variant="secondary" className="flex items-center gap-1 bg-success/10 text-success">
							<CheckCircle className="w-3 h-3" />
							Saved
						</Badge>
					)}
				</div>

				{/* Helpful Tips Alert */}
				<Alert>
					<Building2 className="h-4 w-4" />
					<AlertDescription>
						<strong>Pro tip:</strong> Use your business&apos;s public-facing name, not the legal entity name. This is what customers will see when searching for your business.
					</AlertDescription>
				</Alert>

				<div className="flex flex-col space-y-6">
					<FormField
						control={control}
						name="businessInfo.businessName"
						render={({ field, fieldState }) => (
							<FormItem>
								<FormLabel className="flex items-center gap-2">
									<Building2 className="w-4 h-4" />
									Business Name <span className="text-destructive">*</span>
								</FormLabel>
								<FormDescription>Please provide the company display name not legal entity name.</FormDescription>
								<FormControl>
									<Input {...field} placeholder="e.g., Joe's Pizza & Pasta" className={fieldState.error ? "border-red-500" : ""} />
								</FormControl>
								{validationTips.businessName && (
									<div className={`flex items-center gap-1 text-sm ${validationTips.businessName.startsWith("✓") ? "text-success" : "text-amber-600"}`}>
										{validationTips.businessName.startsWith("✓") ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
										{validationTips.businessName.replace("✓ ", "")}
									</div>
								)}
								<FormMessage>{fieldState.error?.message}</FormMessage>
							</FormItem>
						)}
					/>

					<FormField
						control={control}
						name="businessInfo.businessPhoneNumber"
						render={({ field, fieldState }) => (
							<FormItem>
								<FormLabel className="flex items-center gap-2">
									<Phone className="w-4 h-4" />
									Business Phone Number <span className="text-destructive">*</span>
								</FormLabel>
								<FormDescription>This will be the number that users on the website will call.</FormDescription>
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
								{validationTips.phoneNumber && (
									<div className={`flex items-center gap-1 text-sm ${validationTips.phoneNumber.startsWith("✓") ? "text-success" : "text-amber-600"}`}>
										{validationTips.phoneNumber.startsWith("✓") ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
										{validationTips.phoneNumber.replace("✓ ", "")}
									</div>
								)}
								<FormMessage>{fieldState.error?.message}</FormMessage>
							</FormItem>
						)}
					/>

					<FormField
						control={control}
						name="businessInfo.email"
						render={({ field, fieldState }) => (
							<FormItem>
								<FormLabel className="flex items-center gap-2">
									<Mail className="w-4 h-4" />
									Email <span className="text-destructive">*</span>
								</FormLabel>
								<FormDescription>We don&apos;t use your email for marketing.</FormDescription>
								<FormControl>
									<Input {...field} type="email" placeholder="contact@yourbusiness.com" className={fieldState.error ? "border-red-500" : ""} />
								</FormControl>
								{validationTips.email && (
									<div className={`flex items-center gap-1 text-sm ${validationTips.email.startsWith("✓") ? "text-success" : "text-amber-600"}`}>
										{validationTips.email.startsWith("✓") ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
										{validationTips.email.replace("✓ ", "")}
									</div>
								)}
								<FormMessage>{fieldState.error?.message}</FormMessage>
							</FormItem>
						)}
					/>
				</div>
			</div>
		</>
	);
}
