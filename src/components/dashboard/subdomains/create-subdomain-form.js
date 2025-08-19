// REQUIRED: Create Subdomain Form Component
// Comprehensive form for creating new LocalHub subdomains with real-time validation

"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { debounce } from "lodash";
import { toast } from "sonner";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Badge } from "@components/ui/badge";
import { Separator } from "@components/ui/separator";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form";

// Icons
import { Globe, MapPin, Palette, CheckCircle, XCircle, AlertCircle, Loader2, Eye, Lightbulb } from "lucide-react";

// Validation schema
const createSubdomainSchema = z.object({
	subdomain: z
		.string()
		.min(3, "Subdomain must be at least 3 characters")
		.max(63, "Subdomain cannot exceed 63 characters")
		.regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens allowed")
		.refine((val) => !val.startsWith("-") && !val.endsWith("-"), "Cannot start or end with hyphen")
		.refine((val) => !val.includes("--"), "Cannot contain consecutive hyphens"),
	name: z.string().min(3, "Name must be at least 3 characters").max(100, "Name too long"),
	description: z.string().max(500, "Description too long").optional(),
	tagline: z.string().max(200, "Tagline too long").optional(),
	city: z.string().min(2, "City required").max(100, "City name too long"),
	state: z.string().min(2, "State required").max(100, "State name too long"),
	country: z.string().default("US"),
	hubType: z.enum(["city", "region", "neighborhood", "custom"]),
	radiusKm: z.coerce.number().min(1).max(200),
	primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
	secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
});

export default function CreateSubdomainForm({ onSuccess }) {
	const [subdomainValidation, setSubdomainValidation] = useState(null);
	const [isValidating, setIsValidating] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [previewMode, setPreviewMode] = useState(false);

	const form = useForm({
		resolver: zodResolver(createSubdomainSchema),
		defaultValues: {
			subdomain: "",
			name: "",
			description: "",
			tagline: "",
			city: "",
			state: "",
			country: "US",
			hubType: "city",
			radiusKm: 50,
			primaryColor: "hsl(var(--primary))",
secondaryColor: "hsl(var(--primary))",
		},
	});

	const watchedValues = form.watch();

	// Debounced subdomain validation
	const debouncedValidateSubdomain = useCallback(
		debounce(async (subdomain) => {
			if (!subdomain || subdomain.length < 3) {
				setSubdomainValidation(null);
				return;
			}

			setIsValidating(true);
			try {
				const response = await fetch("/api/v2/subdomains/validate", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ subdomain }),
				});

				const result = await response.json();
				setSubdomainValidation(result.success ? result.data : null);
			} catch (error) {
				console.error("Validation error:", error);
				setSubdomainValidation(null);
			} finally {
				setIsValidating(false);
			}
		}, 500),
		[]
	);

	// Watch subdomain field for real-time validation
	useEffect(() => {
		const subdomain = watchedValues.subdomain;
		if (subdomain) {
			debouncedValidateSubdomain(subdomain);
		}
	}, [watchedValues.subdomain, debouncedValidateSubdomain]);

	// Auto-generate subdomain from city name
	useEffect(() => {
		if (watchedValues.city && !watchedValues.subdomain) {
			const generatedSubdomain = watchedValues.city
				.toLowerCase()
				.replace(/[^a-z0-9]/g, "-")
				.replace(/-+/g, "-")
				.replace(/^-|-$/g, "");

			if (generatedSubdomain.length >= 3) {
				form.setValue("subdomain", generatedSubdomain);
			}
		}
	}, [watchedValues.city, watchedValues.subdomain, form]);

	// Auto-generate name from city and state
	useEffect(() => {
		if (watchedValues.city && watchedValues.state && !watchedValues.name) {
			form.setValue("name", `${watchedValues.city} Local Hub`);
		}
	}, [watchedValues.city, watchedValues.state, watchedValues.name, form]);

	const onSubmit = async (data) => {
		setIsSubmitting(true);

		// Show initial progress
		const progressToast = toast.loading("Creating your subdomain...", {
			description: "Setting up DNS, SSL certificates, and routing with Vercel",
		});

		try {
			const response = await fetch("/api/v2/subdomains", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
				},
				body: JSON.stringify(data),
			});

			const result = await response.json();

			// Dismiss progress toast
			toast.dismiss(progressToast);

			if (result.success) {
				const isVercelProvisioned = result.performance?.vercelProvisioned;
				const domain = result.data.localHub.domain;
				const accessUrl = result.data.localHub.accessUrl;

				toast.success("Subdomain created successfully!", {
					description: isVercelProvisioned ? `🚀 ${domain} is live with automatic SSL! Visit: ${accessUrl}` : `📋 ${domain} has been created and will be live shortly.`,
					duration: 8000,
				});

				// Add Vercel provisioning details to success callback
				if (onSuccess) {
					onSuccess({
						...result.data.localHub,
						vercelProvisioned: isVercelProvisioned,
						provisioningTime: result.performance?.creationTime,
					});
				}
			} else {
				const isVercelError = result.error?.includes("Vercel") || result.error?.includes("subdomain");

				toast.error("Failed to create subdomain", {
					description: isVercelError ? "🔧 Infrastructure provisioning failed. Our team has been notified." : result.error || "Please try again later.",
					duration: 10000,
				});
			}
		} catch (error) {
			console.error("Submit error:", error);

			// Dismiss progress toast
			toast.dismiss(progressToast);

			toast.error("An error occurred", {
				description: "🌐 Network error. Please check your connection and try again.",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const renderSubdomainValidation = () => {
		if (isValidating) {
			return (
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<Loader2 className="w-4 h-4 animate-spin" />
					Checking availability...
				</div>
			);
		}

		if (!subdomainValidation) return null;

		const { available, valid, errors, warnings, suggestions } = subdomainValidation;

		return (
			<div className="space-y-2">
				{/* Availability Status */}
				<div className="flex items-center gap-2">
					{available && valid ? (
						<>
							<CheckCircle className="w-4 h-4 text-success" />
							<span className="text-sm text-success font-medium">{watchedValues.subdomain}.localhub.com is available!</span>
						</>
					) : (
						<>
							<XCircle className="w-4 h-4 text-destructive" />
							<span className="text-sm text-destructive font-medium">Not available</span>
						</>
					)}
				</div>

				{/* Errors */}
				{errors && errors.length > 0 && (
					<Alert className="border-red-200 bg-red-50">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							<ul className="list-disc list-inside space-y-1">
								{errors.map((error, index) => (
									<li key={index} className="text-sm">
										{error}
									</li>
								))}
							</ul>
						</AlertDescription>
					</Alert>
				)}

				{/* Warnings */}
				{warnings && warnings.length > 0 && (
					<Alert className="border-yellow-200 bg-yellow-50">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							<ul className="list-disc list-inside space-y-1">
								{warnings.map((warning, index) => (
									<li key={index} className="text-sm">
										{warning}
									</li>
								))}
							</ul>
						</AlertDescription>
					</Alert>
				)}

				{/* Suggestions */}
				{suggestions && suggestions.length > 0 && (
					<div className="space-y-2">
						<div className="flex items-center gap-2 text-sm text-primary">
							<Lightbulb className="w-4 h-4" />
							<span className="font-medium">Suggestions:</span>
						</div>
						<div className="flex flex-wrap gap-2">
							{suggestions.slice(0, 5).map((suggestion, index) => (
								<Badge key={index} variant="outline" className="cursor-pointer hover:bg-blue-50" onClick={() => form.setValue("subdomain", suggestion)}>
									{suggestion}
								</Badge>
							))}
						</div>
					</div>
				)}
			</div>
		);
	};

	return (
		<Card className="w-full max-w-4xl mx-auto">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Globe className="w-5 h-5" />
					Create Your Local Hub
				</CardTitle>
				<CardDescription>Set up your own local business directory with a custom subdomain on localhub.com</CardDescription>
			</CardHeader>

			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
						{/* Subdomain Section */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="text-lg font-semibold">Subdomain & Basic Info</h3>
								<Button type="button" variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
									<Eye className="w-4 h-4 mr-2" />
									{previewMode ? "Hide" : "Show"} Preview
								</Button>
							</div>

							<div className="grid gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="subdomain"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Subdomain *</FormLabel>
											<FormControl>
												<div className="flex items-center">
													<Input
														{...field}
														placeholder="santacruz"
														className="rounded-r-none"
														onChange={(e) => {
															const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
															field.onChange(value);
														}}
													/>
													<div className="px-3 py-2 bg-muted border border-l-0 rounded-r text-sm text-muted-foreground whitespace-nowrap">.localhub.com</div>
												</div>
											</FormControl>
											<FormDescription>Your directory will be accessible at this URL</FormDescription>
											<FormMessage />
											{renderSubdomainValidation()}
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Hub Name *</FormLabel>
											<FormControl>
												<Input {...field} placeholder="Santa Cruz Local Hub" />
											</FormControl>
											<FormDescription>The display name for your local hub</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="tagline"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tagline</FormLabel>
										<FormControl>
											<Input {...field} placeholder="Discover the best local businesses in Santa Cruz" />
										</FormControl>
										<FormDescription>A short, catchy description (optional)</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea {...field} placeholder="Tell people about your local business community..." rows={3} />
										</FormControl>
										<FormDescription>Detailed description for SEO and user information (optional)</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<Separator />

						{/* Location Section */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold flex items-center gap-2">
								<MapPin className="w-5 h-5" />
								Location & Coverage
							</h3>

							<div className="grid gap-4 md:grid-cols-3">
								<FormField
									control={form.control}
									name="city"
									render={({ field }) => (
										<FormItem>
											<FormLabel>City *</FormLabel>
											<FormControl>
												<Input {...field} placeholder="Santa Cruz" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="state"
									render={({ field }) => (
										<FormItem>
											<FormLabel>State *</FormLabel>
											<FormControl>
												<Input {...field} placeholder="CA" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="hubType"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Hub Type</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select type" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="city">City</SelectItem>
													<SelectItem value="region">Region</SelectItem>
													<SelectItem value="neighborhood">Neighborhood</SelectItem>
													<SelectItem value="custom">Custom Area</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="radiusKm"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Coverage Radius (km)</FormLabel>
										<FormControl>
											<Input {...field} type="number" min="1" max="200" placeholder="50" />
										</FormControl>
										<FormDescription>How far from your city center to include businesses (1-200 km)</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<Separator />

						{/* Branding Section */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold flex items-center gap-2">
								<Palette className="w-5 h-5" />
								Branding & Colors
							</h3>

							<div className="grid gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="primaryColor"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Primary Color</FormLabel>
											<FormControl>
												<div className="flex items-center gap-2">
													<Input {...field} type="color" className="w-16 h-10 p-1 rounded" />
													<Input value={field.value} onChange={field.onChange} placeholder="hsl(var(--primary))" />
												</div>
											</FormControl>
											<FormDescription>Main color for your hub's branding</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="secondaryColor"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Secondary Color</FormLabel>
											<FormControl>
												<div className="flex items-center gap-2">
													<Input {...field} type="color" className="w-16 h-10 p-1 rounded" />
													<Input value={field.value} onChange={field.onChange} placeholder="hsl(var(--primary))" />
												</div>
											</FormControl>
											<FormDescription>Accent color for buttons and highlights</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						{/* Preview Section */}
						{previewMode && (
							<>
								<Separator />
								<div className="space-y-4">
									<h3 className="text-lg font-semibold">Preview</h3>
									<div
										className="p-6 rounded-lg border"
										style={{
											borderColor: watchedValues.primaryColor,
											background: `linear-gradient(135deg, ${watchedValues.primaryColor}10, ${watchedValues.secondaryColor}10)`,
										}}
									>
										<div className="space-y-2">
											<h4 className="text-2xl font-bold" style={{ color: watchedValues.primaryColor }}>
												{watchedValues.name || "Your Hub Name"}
											</h4>
											<p className="text-muted-foreground">{watchedValues.tagline || "Your tagline will appear here"}</p>
											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<Globe className="w-4 h-4" />
												<span>{watchedValues.subdomain ? `${watchedValues.subdomain}.localhub.com` : "subdomain.localhub.com"}</span>
											</div>
											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<MapPin className="w-4 h-4" />
												<span>{watchedValues.city && watchedValues.state ? `${watchedValues.city}, ${watchedValues.state}` : "City, State"}</span>
											</div>
										</div>
									</div>
								</div>
							</>
						)}

						{/* Submit Section */}
						<div className="flex items-center justify-between pt-6 border-t">
							<div className="text-sm text-muted-foreground">Your subdomain will be reviewed and activated within 24 hours</div>
							<Button type="submit" disabled={isSubmitting || !subdomainValidation?.available} className="min-w-[120px]">
								{isSubmitting ? (
									<>
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										Creating...
									</>
								) : (
									"Create Hub"
								)}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
