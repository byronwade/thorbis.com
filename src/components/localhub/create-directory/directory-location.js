import React, { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@components/ui/form";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Badge } from "@components/ui/badge";
import { Slider } from "@components/ui/slider";
import { CheckCircle, AlertCircle, MapPin, Search, Loader2, Navigation } from "lucide-react";
import { Card, CardContent } from "@components/ui/card";

export default function DirectoryLocation() {
	const {
		control,
		watch,
		setValue,
		formState: { errors },
	} = useFormContext();
	const [isSearching, setIsSearching] = useState(false);
	const [suggestions, setSuggestions] = useState([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [validationTips, setValidationTips] = useState({});

	// Watch form values
	const street = watch("directoryLocation.street");
	const city = watch("directoryLocation.city");
	const state = watch("directoryLocation.state");
	const zip = watch("directoryLocation.zip");
	const serviceRadius = watch("directoryLocation.serviceRadius");

	// Address validation tips
	useEffect(() => {
		const tips = {};

		if (street) {
			if (street.length < 5) {
				tips.street = "Please enter a complete street address";
			} else {
				tips.street = "✓ Valid street address";
			}
		}

		if (city) {
			if (city.length < 2) {
				tips.city = "Please enter a valid city name";
			} else {
				tips.city = "✓ Valid city name";
			}
		}

		if (state) {
			if (state.length !== 2) {
				tips.state = "Please use 2-letter state abbreviation (e.g., CA, NY)";
			} else {
				tips.state = "✓ Valid state abbreviation";
			}
		}

		if (zip) {
			const zipRegex = /^\d{5}$/;
			if (!zipRegex.test(zip)) {
				tips.zip = "Please enter a valid 5-digit ZIP code";
			} else {
				tips.zip = "✓ Valid ZIP code";
			}
		}

		setValidationTips(tips);
	}, [street, city, state, zip]);

	// Mock address autocomplete
	const searchAddress = async (query) => {
		if (!query || query.length < 3) {
			setSuggestions([]);
			return;
		}

		setIsSearching(true);

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 500));

		// Mock suggestions
		const mockSuggestions = [`${query} Street, Raleigh, NC 27601`, `${query} Avenue, Raleigh, NC 27602`, `${query} Boulevard, Raleigh, NC 27603`];

		setSuggestions(mockSuggestions);
		setIsSearching(false);
	};

	const handleAddressSelect = (suggestion) => {
		const parts = suggestion.split(", ");
		if (parts.length >= 3) {
			setValue("directoryLocation.street", parts[0]);
			setValue("directoryLocation.city", parts[1]);
			const stateZip = parts[2].split(" ");
			setValue("directoryLocation.state", stateZip[0]);
			setValue("directoryLocation.zip", stateZip[1]);
		}
		setShowSuggestions(false);
	};

	const formatState = (value) => {
		return value.toUpperCase().slice(0, 2);
	};

	return (
		<>
			<div className="space-y-6">
				<div>
					<h2 className="text-2xl font-bold leading-9 text-left">Directory Location</h2>
					<p className="text-sm leading-6 text-left text-muted-foreground">Set the central location and coverage area for your directory.</p>
				</div>

				{/* Location Tips Alert */}
				<Alert>
					<Navigation className="h-4 w-4" />
					<AlertDescription>
						<strong>Location matters:</strong> Choose a central location within your target area. This will be used to determine which businesses can join your directory and help with local SEO.
					</AlertDescription>
				</Alert>

				{/* Address Autocomplete */}
				<Card className="border-primary/20 bg-primary/10 dark:border-primary/20 dark:bg-primary/10">
					<CardContent className="p-4">
						<div className="space-y-3">
							<div className="flex items-center gap-2">
								<Search className="w-4 h-4 text-primary" />
								<h3 className="text-sm font-medium">Quick Address Lookup</h3>
							</div>
							<div className="relative">
								<Input
									placeholder="Start typing your directory's central address..."
									onChange={(e) => {
										searchAddress(e.target.value);
										setShowSuggestions(true);
									}}
									className="pr-10"
								/>
								{isSearching && <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />}
							</div>

							{showSuggestions && suggestions.length > 0 && (
								<div className="space-y-1">
									{suggestions.map((suggestion, index) => (
										<Button key={index} variant="ghost" className="w-full justify-start text-left h-auto p-2" onClick={() => handleAddressSelect(suggestion)}>
											<MapPin className="w-3 h-3 mr-2 text-muted-foreground" />
											{suggestion}
										</Button>
									))}
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				<div className="flex flex-col mt-6 space-y-6">
					<FormField
						control={control}
						name="directoryLocation.street"
						render={({ field, fieldState }) => (
							<FormItem>
								<FormLabel className="flex items-center gap-2">
									<MapPin className="w-4 h-4" />
									Street Address <span className="text-destructive">*</span>
								</FormLabel>
								<FormDescription>The central address for your directory (this can be your office or a central location in your coverage area).</FormDescription>
								<FormControl>
									<Input {...field} placeholder="123 Main Street" className={fieldState.error ? "border-red-500" : ""} />
								</FormControl>
								{validationTips.street && (
									<div className={`flex items-center gap-1 text-sm ${validationTips.street.startsWith("✓") ? "text-primary" : "text-muted-foreground"}`}>
										{validationTips.street.startsWith("✓") ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
										{validationTips.street.replace("✓ ", "")}
									</div>
								)}
								<FormMessage>{fieldState.error?.message}</FormMessage>
							</FormItem>
						)}
					/>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<FormField
							control={control}
							name="directoryLocation.city"
							render={({ field, fieldState }) => (
								<FormItem>
									<FormLabel>
										City <span className="text-destructive">*</span>
									</FormLabel>
									<FormControl>
										<Input {...field} placeholder="Raleigh" className={fieldState.error ? "border-red-500" : ""} />
									</FormControl>
									{validationTips.city && (
										<div className={`flex items-center gap-1 text-sm ${validationTips.city.startsWith("✓") ? "text-primary" : "text-muted-foreground"}`}>
											{validationTips.city.startsWith("✓") ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
											{validationTips.city.replace("✓ ", "")}
										</div>
									)}
									<FormMessage>{fieldState.error?.message}</FormMessage>
								</FormItem>
							)}
						/>

						<FormField
							control={control}
							name="directoryLocation.state"
							render={({ field, fieldState }) => (
								<FormItem>
									<FormLabel>
										State <span className="text-destructive">*</span>
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											placeholder="NC"
											onChange={(e) => {
												const formatted = formatState(e.target.value);
												field.onChange(formatted);
											}}
											className={fieldState.error ? "border-red-500" : ""}
										/>
									</FormControl>
									{validationTips.state && (
										<div className={`flex items-center gap-1 text-sm ${validationTips.state.startsWith("✓") ? "text-primary" : "text-muted-foreground"}`}>
											{validationTips.state.startsWith("✓") ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
											{validationTips.state.replace("✓ ", "")}
										</div>
									)}
									<FormMessage>{fieldState.error?.message}</FormMessage>
								</FormItem>
							)}
						/>

						<FormField
							control={control}
							name="directoryLocation.zip"
							render={({ field, fieldState }) => (
								<FormItem>
									<FormLabel>
										ZIP Code <span className="text-destructive">*</span>
									</FormLabel>
									<FormControl>
										<Input {...field} placeholder="27601" className={fieldState.error ? "border-red-500" : ""} />
									</FormControl>
									{validationTips.zip && (
										<div className={`flex items-center gap-1 text-sm ${validationTips.zip.startsWith("✓") ? "text-primary" : "text-muted-foreground"}`}>
											{validationTips.zip.startsWith("✓") ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
											{validationTips.zip.replace("✓ ", "")}
										</div>
									)}
									<FormMessage>{fieldState.error?.message}</FormMessage>
								</FormItem>
							)}
						/>
					</div>

					<FormField
						control={control}
						name="directoryLocation.serviceRadius"
						render={({ field, fieldState }) => (
							<FormItem>
								<FormLabel className="flex items-center justify-between">
									<span className="flex items-center gap-2">
										<Navigation className="w-4 h-4" />
										Service Radius <span className="text-destructive">*</span>
									</span>
									<Badge variant={serviceRadius <= 10 ? "secondary" : serviceRadius <= 25 ? "default" : "destructive"}>{serviceRadius} miles</Badge>
								</FormLabel>
								<FormDescription>How far from your central location should businesses be able to join? This defines your directory&apos;s coverage area.</FormDescription>
								<FormControl>
									<div className="px-3">
										<Slider min={1} max={100} step={1} value={[serviceRadius]} onValueChange={(value) => field.onChange(value[0])} className="w-full" />
										<div className="flex justify-between text-xs text-muted-foreground mt-1">
											<span>1 mile</span>
											<span>25 miles</span>
											<span>50 miles</span>
											<span>100 miles</span>
										</div>
									</div>
								</FormControl>
								<FormMessage>{fieldState.error?.message}</FormMessage>
							</FormItem>
						)}
					/>
				</div>

				{/* Service Radius Info */}
									<Alert className="border-primary/20 bg-primary/10 dark:border-primary/20 dark:bg-primary/10">
						<AlertCircle className="h-4 w-4 text-primary" />
						<AlertDescription className="text-primary dark:text-primary">
						<strong>Service Radius Guide:</strong>
						<br />• 1-10 miles: Neighborhood or small city
						<br />• 11-25 miles: Metropolitan area
						<br />• 26-50 miles: Regional directory
						<br />• 51+ miles: Large regional or multi-city directory
					</AlertDescription>
				</Alert>
			</div>
		</>
	);
}
