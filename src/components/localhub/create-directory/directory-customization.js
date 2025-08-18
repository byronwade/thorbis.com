import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@components/ui/form";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Badge } from "@components/ui/badge";
import { Checkbox } from "@components/ui/checkbox";
import { CheckCircle, AlertCircle, Upload, Palette, Globe, Tags, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";

// Common business categories
const businessCategories = ["Restaurants & Food", "Healthcare & Medical", "Home & Garden", "Automotive", "Professional Services", "Retail & Shopping", "Beauty & Wellness", "Education & Training", "Real Estate", "Entertainment & Recreation", "Financial Services", "Technology", "Construction & Contractors", "Travel & Hospitality", "Pet Services", "Legal Services", "Fitness & Sports", "Arts & Culture", "Non-Profit", "Other Services"];

// Color options - Updated to Thorbis theme (Blue + Neutral variations)
const colorOptions = [
	{ name: "Thorbis Blue", value: "#3B82F6", class: "bg-primary" },
	{ name: "Dark Blue", value: "#1E40AF", class: "bg-primary/80" },
	{ name: "Light Blue", value: "#60A5FA", class: "bg-primary/60" },
	{ name: "Neutral Gray", value: "#6B7280", class: "bg-muted-foreground" },
	{ name: "Dark Gray", value: "#374151", class: "bg-muted-foreground/80" },
	{ name: "Light Gray", value: "#9CA3AF", class: "bg-muted-foreground/60" },
	{ name: "White", value: "#FFFFFF", class: "bg-background" },
	{ name: "Black", value: "#000000", class: "bg-foreground" },
];

export default function DirectoryCustomization() {
	const {
		control,
		watch,
		setValue,
		formState: { errors },
	} = useFormContext();
	const [validationTips, setValidationTips] = useState({});
	const [selectedCategories, setSelectedCategories] = useState([]);

	// Watch form values
	const subdomain = watch("directoryCustomization.subdomain");
	const primaryColor = watch("directoryCustomization.primaryColor");
	const businessCategoriesValue = watch("directoryCustomization.businessCategories");

	// Initialize selected categories
	useEffect(() => {
		if (businessCategoriesValue) {
			setSelectedCategories(businessCategoriesValue);
		}
	}, [businessCategoriesValue]);

	// Real-time validation tips
	useEffect(() => {
		const tips = {};

		if (subdomain) {
			const subdomainRegex = /^[a-z0-9-]+$/;
			if (subdomain.length < 3) {
				tips.subdomain = "Subdomain should be at least 3 characters";
			} else if (subdomain.length > 30) {
				tips.subdomain = "Subdomain should be less than 30 characters";
			} else if (!subdomainRegex.test(subdomain)) {
				tips.subdomain = "Only lowercase letters, numbers, and hyphens allowed";
			} else if (subdomain.startsWith("-") || subdomain.endsWith("-")) {
				tips.subdomain = "Cannot start or end with hyphen";
			} else {
				tips.subdomain = "✓ Valid subdomain";
			}
		}

		setValidationTips(tips);
	}, [subdomain]);

	const formatSubdomain = (value) => {
		return value.toLowerCase().replace(/[^a-z0-9-]/g, "");
	};

	const handleCategoryToggle = (category) => {
		const newSelected = selectedCategories.includes(category) ? selectedCategories.filter((c) => c !== category) : [...selectedCategories, category];

		setSelectedCategories(newSelected);
		setValue("directoryCustomization.businessCategories", newSelected);
	};

	const handleLogoUpload = (event) => {
		const file = event.target.files[0];
		if (file) {
			setValue("directoryCustomization.logo", file);
		}
	};

	return (
		<>
			<div className="space-y-6">
				<div>
					<h2 className="text-2xl font-bold leading-9 text-left">Directory Customization</h2>
					<p className="text-sm leading-6 text-left text-muted-foreground">Customize your directory&apos;s appearance and set up business categories.</p>
				</div>

				{/* Branding Alert */}
				<Alert>
					<Palette className="h-4 w-4" />
					<AlertDescription>
						<strong>Make it yours:</strong> Customize your directory&apos;s look and feel to match your brand and local community identity.
					</AlertDescription>
				</Alert>

				<div className="flex flex-col space-y-6">
					{/* Logo Upload */}
					<FormField
						control={control}
						name="directoryCustomization.logo"
						render={({ field, fieldState }) => (
							<FormItem>
								<FormLabel className="flex items-center gap-2">
									<Upload className="w-4 h-4" />
									Directory Logo (Optional)
								</FormLabel>
								<FormDescription>Upload a logo for your directory. Recommended size: 200x80px or similar ratio.</FormDescription>
								<FormControl>
									<div className="flex items-center gap-4">
										<Button type="button" variant="outline" onClick={() => document.getElementById("logo-upload").click()} className="flex items-center gap-2">
											<Upload className="w-4 h-4" />
											Choose Logo
										</Button>
										<input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
										{field.value && (
											<Badge variant="secondary" className="flex items-center gap-1">
												<CheckCircle className="w-3 h-3" />
												Logo selected
											</Badge>
										)}
									</div>
								</FormControl>
								<FormMessage>{fieldState.error?.message}</FormMessage>
							</FormItem>
						)}
					/>

					{/* Subdomain */}
					<FormField
						control={control}
						name="directoryCustomization.subdomain"
						render={({ field, fieldState }) => (
							<FormItem>
								<FormLabel className="flex items-center gap-2">
									<Globe className="w-4 h-4" />
									Subdomain <span className="text-destructive">*</span>
								</FormLabel>
								<FormDescription>Your directory will be accessible at this URL. Choose something memorable and relevant to your location.</FormDescription>
								<FormControl>
									<div className="flex items-center">
										<Input
											{...field}
											placeholder="raleigh-directory"
											onChange={(e) => {
												const formatted = formatSubdomain(e.target.value);
												field.onChange(formatted);
											}}
											className={`rounded-r-none ${fieldState.error ? "border-red-500" : ""}`}
										/>
										<div className="px-3 py-2 bg-muted border border-l-0 rounded-r text-sm text-muted-foreground">.localhub.com</div>
									</div>
								</FormControl>
								{validationTips.subdomain && (
									<div className={`flex items-center gap-1 text-sm ${validationTips.subdomain.startsWith("✓") ? "text-primary" : "text-muted-foreground"}`}>
										{validationTips.subdomain.startsWith("✓") ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
										{validationTips.subdomain.replace("✓ ", "")}
									</div>
								)}
								<FormMessage>{fieldState.error?.message}</FormMessage>
							</FormItem>
						)}
					/>

					{/* Primary Color */}
					<FormField
						control={control}
						name="directoryCustomization.primaryColor"
						render={({ field, fieldState }) => (
							<FormItem>
								<FormLabel className="flex items-center gap-2">
									<Palette className="w-4 h-4" />
									Primary Color
								</FormLabel>
								<FormDescription>Choose a primary color for your directory&apos;s theme and branding.</FormDescription>
								<FormControl>
									<div className="grid grid-cols-4 md:grid-cols-8 gap-3">
										{colorOptions.map((color) => (
											<button key={color.value} type="button" onClick={() => field.onChange(color.value)} className={`w-12 h-12 rounded-lg ${color.class} border-2 transition-transform hover:scale-105 ${field.value === color.value ? "border-foreground scale-105" : "border-transparent"}`} title={color.name}>
												{field.value === color.value && <CheckCircle className="w-6 h-6 text-white mx-auto" />}
											</button>
										))}
									</div>
								</FormControl>
								<FormMessage>{fieldState.error?.message}</FormMessage>
							</FormItem>
						)}
					/>

					{/* Business Categories */}
					<FormField
						control={control}
						name="directoryCustomization.businessCategories"
						render={({ field, fieldState }) => (
							<FormItem>
								<FormLabel className="flex items-center gap-2">
									<Tags className="w-4 h-4" />
									Business Categories <span className="text-destructive">*</span>
								</FormLabel>
								<FormDescription>Select the types of businesses you want in your directory. You can add more categories later.</FormDescription>
								<FormControl>
									<Card>
										<CardHeader className="pb-3">
											<CardTitle className="text-sm flex items-center justify-between">
												Select Categories
												<Badge variant="secondary">{selectedCategories.length} selected</Badge>
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-3">
											<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
												{businessCategories.map((category) => (
													<div key={category} className="flex items-center space-x-2">
														<Checkbox id={category} checked={selectedCategories.includes(category)} onCheckedChange={() => handleCategoryToggle(category)} />
														<label htmlFor={category} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
															{category}
														</label>
													</div>
												))}
											</div>

											{selectedCategories.length > 0 && (
												<div className="pt-3 border-t">
													<p className="text-sm font-medium mb-2">Selected Categories:</p>
													<div className="flex flex-wrap gap-2">
														{selectedCategories.map((category) => (
															<Badge key={category} variant="secondary" className="flex items-center gap-1">
																{category}
																<button type="button" onClick={() => handleCategoryToggle(category)} className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full">
																	<X className="w-3 h-3" />
																</button>
															</Badge>
														))}
													</div>
												</div>
											)}
										</CardContent>
									</Card>
								</FormControl>
								<FormMessage>{fieldState.error?.message}</FormMessage>
							</FormItem>
						)}
					/>
				</div>

				{/* Preview Alert */}
									<Alert className="border-primary/20 bg-primary/10 dark:border-primary/20 dark:bg-primary/10">
						<AlertCircle className="h-4 w-4 text-primary" />
						<AlertDescription className="text-primary dark:text-primary">
							<strong>Preview:</strong> Your directory will be available at <code className="bg-primary/20 dark:bg-primary/20 px-1 rounded text-xs">{subdomain || "your-subdomain"}.localhub.com</code> with your chosen color scheme and categories.
					</AlertDescription>
				</Alert>
			</div>
		</>
	);
}
