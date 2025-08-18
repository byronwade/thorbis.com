import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useFormContext } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@components/ui/form";
import { Slider } from "@components/ui/slider";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Alert, AlertDescription } from "@components/ui/alert";
import { CheckCircle, AlertCircle, MapPin, Clock, Wrench, Camera, X } from "lucide-react";

const servicesOptions = [
	{ value: "plumbing", label: "Plumbing", icon: "🔧", description: "Pipe repair, installation, maintenance" },
	{ value: "electrical", label: "Electrical", icon: "⚡", description: "Wiring, repairs, installations" },
	{ value: "hvac", label: "HVAC", icon: "❄️", description: "Heating, ventilation, air conditioning" },
	{ value: "landscaping", label: "Landscaping", icon: "🌿", description: "Lawn care, gardening, design" },
	{ value: "cleaning", label: "Cleaning", icon: "🧹", description: "House cleaning, commercial cleaning" },
	{ value: "pestControl", label: "Pest Control", icon: "🐜", description: "Pest elimination, prevention" },
	{ value: "automotive", label: "Automotive", icon: "🚗", description: "Car repair, maintenance" },
	{ value: "construction", label: "Construction", icon: "🏗️", description: "Building, remodeling" },
];

export default function BusinessProfile() {
	const {
		control,
		setValue,
		watch,
		formState: { isDirty },
	} = useFormContext();
	const [logoUrl, setLogoUrl] = useState(null);
	const [loading, setLoading] = useState(false);
	const [completionTime, setCompletionTime] = useState(0);
	const [selectedServices, setSelectedServices] = useState([]);

	// Watch form values
	const services = watch("businessProfile.services");
	const serviceArea = watch("businessProfile.serviceArea");
	const logo = watch("businessProfile.logo");

	// Calculate completion time based on form progress
	useEffect(() => {
		let time = 0;
		if (logo) time += 30;
		if (services) time += 45;
		if (serviceArea) time += 15;
		setCompletionTime(time);
	}, [logo, services, serviceArea]);

	const handleImageUpload = (e) => {
		const file = e.target.files[0];
		if (file) {
			setLoading(true);
			const reader = new FileReader();
			reader.onloadend = () => {
				setLogoUrl(reader.result);
				setValue("businessProfile.logo", file);
				setLoading(false);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleServiceToggle = (serviceValue) => {
		const newServices = selectedServices.includes(serviceValue) ? selectedServices.filter((s) => s !== serviceValue) : [...selectedServices, serviceValue];

		setSelectedServices(newServices);
		setValue("businessProfile.services", newServices.join(", "));
	};

	if (loading) {
		return (
			<div className="flex justify-center w-full">
				<Image src="/logos/ThorbisLogo.webp" alt="Thorbis Logo" width={100} height={100} className="w-[60px] h-[60px] animate-breathe" />
			</div>
		);
	}

	return (
		<>
			<div className="space-y-6">
				<div>
					<h2 className="text-2xl font-bold leading-9 text-left">Business Profile</h2>
					<p className="text-sm leading-6 text-left text-muted-foreground">Complete the form below to provide your business information.</p>
				</div>

				{/* Completion Time Estimate */}
				{completionTime > 0 && (
					<Card className="border-primary/20 bg-primary/10 dark:border-primary/20 dark:bg-primary/10">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Clock className="w-4 h-4 text-primary" />
									<span className="text-sm font-medium">Estimated completion time</span>
								</div>
								<Badge variant="secondary" className="bg-primary/20 text-primary">
									~{completionTime} seconds
								</Badge>
							</div>
						</CardContent>
					</Card>
				)}

				<div className="flex flex-col space-y-6">
					<FormField
						control={control}
						name="businessProfile.logo"
						render={({ field, fieldState }) => (
							<FormItem>
								<FormLabel className="flex items-center gap-2">
									<Camera className="w-4 h-4" />
									Business Logo <span className="text-xs font-normal">(Optional)</span>
								</FormLabel>
								<FormDescription>Upload your business logo. This will appear on your business profile.</FormDescription>
								<FormControl>
									<div className="flex items-center space-x-4">
										<Avatar className="w-16 h-16 bg-white border border-gray-300 rounded-md cursor-pointer dark:border-neutral-800 dark:bg-neutral-900 focus-within:border-primary focus:border-primary dark:focus:border-primary dark:focus-within:border-primary">
											<AvatarImage src={logoUrl || "https://github.com/shadcn.png"} alt="Business Logo" />
											<AvatarFallback className="rounded-md">Logo</AvatarFallback>
										</Avatar>
										<div className="flex flex-col space-y-2">
											<label htmlFor="logo-upload" className="p-2 text-sm bg-white border border-gray-300 rounded-md cursor-pointer dark:border-neutral-800 dark:bg-neutral-900 focus-within:border-primary focus:border-primary dark:focus:border-primary dark:focus-within:border-primary hover:bg-muted/50">
												<span className="text-primary">Click here to add image</span>
												<input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
											</label>
											{logoUrl && (
												<Button
													variant="ghost"
													size="sm"
													onClick={() => {
														setLogoUrl(null);
														setValue("businessProfile.logo", null);
													}}
													className="text-destructive hover:text-destructive"
												>
													<X className="w-3 h-3 mr-1" />
													Remove
												</Button>
											)}
										</div>
									</div>
								</FormControl>
								<FormMessage>{fieldState.error?.message}</FormMessage>
							</FormItem>
						)}
					/>

					<FormField
						control={control}
						name="businessProfile.services"
						render={({ field, fieldState }) => (
							<FormItem>
								<FormLabel className="flex items-center gap-2">
									<Wrench className="w-4 h-4" />
									Services <span className="text-destructive">*</span>
								</FormLabel>
								<FormDescription>Select the services your business offers. You can select multiple services.</FormDescription>

								{/* Service Selection Grid */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									{servicesOptions.map((service) => (
										<Card key={service.value} className={`cursor-pointer transition-all ${selectedServices.includes(service.value) ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"}`} onClick={() => handleServiceToggle(service.value)}>
											<CardContent className="p-4">
												<div className="flex items-center space-x-3">
													<span className="text-2xl">{service.icon}</span>
													<div className="flex-1">
														<h4 className="font-medium">{service.label}</h4>
														<p className="text-sm text-muted-foreground">{service.description}</p>
													</div>
													{selectedServices.includes(service.value) && <CheckCircle className="w-5 h-5 text-primary" />}
												</div>
											</CardContent>
										</Card>
									))}
								</div>

								<FormMessage>{fieldState.error?.message}</FormMessage>
							</FormItem>
						)}
					/>

					<FormField
						control={control}
						name="businessProfile.serviceArea"
						render={({ field, fieldState }) => (
							<FormItem>
								<FormLabel className="flex items-center gap-2">
									<MapPin className="w-4 h-4" />
									Service Area (miles) <span className="text-destructive">*</span>
								</FormLabel>
								<FormDescription>Specify the radius within which your business operates.</FormDescription>
								<FormControl>
									<div className="space-y-4">
										<Slider defaultValue={[50]} min={1} max={100} step={1} onValueChange={(val) => setValue("businessProfile.serviceArea", val[0])} className="w-full" />
										<div className="flex justify-between text-sm text-muted-foreground">
											<span>1 mile</span>
											<span className="font-medium">{serviceArea || 50} miles</span>
											<span>100 miles</span>
										</div>
									</div>
								</FormControl>
								<FormMessage>{fieldState.error?.message}</FormMessage>
							</FormItem>
						)}
					/>
				</div>

				{/* Pro Tips */}
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						<strong>Pro tip:</strong> Adding a logo and selecting multiple services helps customers find your business more easily. The service area determines how far customers can search to find your business.
					</AlertDescription>
				</Alert>
			</div>
		</>
	);
}
