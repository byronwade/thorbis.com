import React, { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@components/ui/form";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { CheckCircle, AlertCircle, MapPin, Search, Loader2 } from "lucide-react";
import { Card, CardContent } from "@components/ui/card";

export default function BusinessAddress() {
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
	const street = watch("businessAddress.street");
	const city = watch("businessAddress.city");
	const state = watch("businessAddress.state");
	const zip = watch("businessAddress.zip");

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
		const mockSuggestions = [`${query} Street, San Francisco, CA 94102`, `${query} Avenue, San Francisco, CA 94103`, `${query} Boulevard, San Francisco, CA 94104`];

		setSuggestions(mockSuggestions);
		setIsSearching(false);
	};

	const handleAddressSelect = (suggestion) => {
		const parts = suggestion.split(", ");
		if (parts.length >= 3) {
			setValue("businessAddress.street", parts[0]);
			setValue("businessAddress.city", parts[1]);
			const stateZip = parts[2].split(" ");
			setValue("businessAddress.state", stateZip[0]);
			setValue("businessAddress.zip", stateZip[1]);
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
					<h2 className="text-2xl font-bold leading-9 text-left">Business Address</h2>
					<p className="text-sm leading-6 text-left text-muted-foreground">Complete the form below to provide your business address.</p>
				</div>

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
									placeholder="Start typing your address..."
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
						name="businessAddress.street"
						render={({ field, fieldState }) => (
							<FormItem>
								<FormLabel className="flex items-center gap-2">
									<MapPin className="w-4 h-4" />
									Street <span className="text-destructive">*</span>
								</FormLabel>
								<FormDescription>Enter the complete street address including number and street name.</FormDescription>
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
							name="businessAddress.city"
							render={({ field, fieldState }) => (
								<FormItem>
									<FormLabel>
										City <span className="text-destructive">*</span>
									</FormLabel>
									<FormControl>
										<Input {...field} placeholder="San Francisco" className={fieldState.error ? "border-red-500" : ""} />
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
							name="businessAddress.state"
							render={({ field, fieldState }) => (
								<FormItem>
									<FormLabel>
										State <span className="text-destructive">*</span>
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											placeholder="CA"
											maxLength={2}
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
							name="businessAddress.zip"
							render={({ field, fieldState }) => (
								<FormItem>
									<FormLabel>
										ZIP Code <span className="text-destructive">*</span>
									</FormLabel>
									<FormControl>
										<Input {...field} placeholder="94102" maxLength={5} className={fieldState.error ? "border-red-500" : ""} />
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
				</div>
			</div>
		</>
	);
}
