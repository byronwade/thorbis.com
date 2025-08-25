"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Separator } from "@components/ui/separator";
import { Checkbox } from "@components/ui/checkbox";
import { Alert, AlertDescription } from "@components/ui/alert";
import { ArrowLeft, Target, MapPin, Users, Eye, Zap, Search, Globe, Smartphone, Monitor, Info, CheckCircle, DollarSign, Edit, Save, HelpCircle, Sparkles } from "lucide-react";
import { toast } from "@components/ui/use-toast";

// Enhanced Map Placeholder with better visual design
function MapPlaceholder({ location, radius, isValid }) {
	return (
		<div className={`w-full h-32 rounded-lg bg-gradient-to-r from-gray-900/40 dark:to-gray-800/30 border-neutral-800 dark:border-neutral-700"} flex items-center justify-center mb-6`}>
			<div className="text-center">
				<MapPin className={`w-12 h-12 mx-auto mb-3 ${isValid ? "text-success dark:text-success" : "text-muted-foreground"}`} />
				<p className="font-semibold text-lg text-foreground mb-1">Target Area Preview</p>
				<p className="text-sm text-muted-foreground">
					{location ? (
						<>
							<span className="font-medium text-foreground">{location}</span>
							<br />
							<span className="text-xs">({radius} mile radius)</span>
						</>
					) : (
						"Set a location to preview your target area"
					)}
				</p>
				{isValid && (
					<div className="mt-2 flex items-center justify-center gap-1 text-success dark:text-success">
						<CheckCircle className="w-4 h-4" />
						<span className="text-xs font-medium">Valid location</span>
					</div>
				)}
			</div>
		</div>
	);
}

// Enhanced Progress Indicator
function StepProgress({ currentStep, totalSteps, steps }) {
	return (
					<div className="w-full">
			<div className="flex items-center justify-between">
				{steps.map((stepItem, index) => (
					<div key={stepItem.id} className="flex items-center flex-1">
						<div className="flex flex-col items-center">
							<div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 ${currentStep > stepItem.id ? "bg-primary/5 border-primary text-primary shadow-lg" : currentStep === stepItem.id ? "bg-primary/5 border-primary text-primary shadow-md" : "border-muted-foreground/30 text-muted-foreground/50"}`}>{currentStep > stepItem.id ? <CheckCircle className="w-5 h-5" /> : React.createElement(stepItem.icon, { className: "w-5 h-5" })}</div>
							<div className="mt-2 text-center">
								<p className={`text-xs font-medium transition-colors ${currentStep >= stepItem.id ? "text-foreground" : "text-muted-foreground/60"}`}>{stepItem.title}</p>
							</div>
						</div>
						{index < steps.length - 1 && <div className={`flex-1 h-0.5 mx-4 transition-all duration-500 ${currentStep > stepItem.id ? "bg-primary" : "bg-muted/30"}`} />}
					</div>
				))}
			</div>
		</div>
	);
}

export default function CreateAdPage() {
	const [step, setStep] = useState(1);
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isHydrated, setIsHydrated] = useState(false);
	const [adData, setAdData] = useState({
		name: "",
		type: "search",
		headline: "",
		description: "",
		cta: "Learn More",
		budget: 50,
		duration: 30,
		location: "",
		radius: "10",
		keywords: "",
		demographics: [],
		interests: [],
		excludedKeywords: "",
		schedule: {
			startDate: new Date().toISOString().split("T")[0],
			endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
			timeOfDay: "all",
			daysOfWeek: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
		},
		termsAccepted: false,
		billingAccepted: false,
	});

	const [estimatedMetrics, setEstimatedMetrics] = useState({
		impressions: 0,
		clicks: 0,
		ctr: 0,
		cpc: 0,
		totalCost: 0,
	});

	// Handle hydration
	useEffect(() => {
		setIsHydrated(true);
	}, []);

	// Enhanced validation
	const validateStep = (stepNumber) => {
		const newErrors = {};

		switch (stepNumber) {
			case 1:
				if (!adData.name.trim()) newErrors.name = "Campaign name is required";
				if (!adData.location.trim()) newErrors.location = "Location is required";
				if (adData.name.length > 50) newErrors.name = "Campaign name must be under 50 characters";
				break;
			case 2:
				if (!adData.headline.trim()) newErrors.headline = "Headline is required";
				if (!adData.description.trim()) newErrors.description = "Description is required";
				if (adData.headline.length > 60) newErrors.headline = "Headline must be under 60 characters";
				if (adData.description.length > 150) newErrors.description = "Description must be under 150 characters";
				break;
			case 5:
				if (!adData.termsAccepted) newErrors.terms = "You must accept the terms and conditions";
				if (!adData.billingAccepted) newErrors.billing = "You must accept the billing terms";
				break;
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	useEffect(() => {
		const baseImpressions = parseInt(adData.radius) * 1000;
		const baseCTR = adData.type === "search" ? 0.05 : 0.02;
		const baseCPC = adData.type === "search" ? 1.5 : 0.75;
		const impressions = Math.floor(baseImpressions * (adData.budget / 50));
		const clicks = Math.floor(impressions * baseCTR);
		const ctr = (baseCTR * 100).toFixed(2);
		const cpc = baseCPC;
		const totalCost = Math.min(clicks * cpc, adData.budget);
		setEstimatedMetrics({ impressions, clicks, ctr, cpc, totalCost });
	}, [adData.budget, adData.radius, adData.type]);

	const steps = [
		{ id: 1, title: "Campaign Details", icon: Info },
		{ id: 2, title: "Ad Creative", icon: Edit },
		{ id: 3, title: "Targeting", icon: Target },
		{ id: 4, title: "Budget & Schedule", icon: DollarSign },
		{ id: 5, title: "Review & Launch", icon: CheckCircle },
	];

	const handleNext = () => {
		if (validateStep(step) && step < 5) {
			setStep(step + 1);
			setErrors({});
		}
	};

	const handleBack = () => {
		if (step > 1) {
			setStep(step - 1);
			setErrors({});
		}
	};

	const handleSave = async () => {
		if (!validateStep(5)) return;

		setIsSubmitting(true);
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 2000));
			toast({
				title: "Campaign Created Successfully",
				description: "Your ad campaign is now live and will start appearing in search results.",
				action: (
					<Button variant="outline" size="sm" onClick={() => (window.location.href = "/dashboard/business/ads")}>
						View Campaigns
					</Button>
				),
			});
		} catch (error) {
			toast({
				title: "Error Creating Campaign",
				description: "Please try again or contact support if the problem persists.",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const updateAdData = (field, value) => {
		setAdData((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: null }));
		}
	};

	const updateSchedule = (field, value) => setAdData((prev) => ({ ...prev, schedule: { ...prev.schedule, [field]: value } }));

	const renderStepContent = () => {
		return (
			<Card className="bg-card/90 dark:bg-card/80 shadow-lg border border-border">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						{React.createElement(steps[step - 1].icon, { className: "w-5 h-5 text-primary" })}
						{steps[step - 1].title}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					{step === 1 && (
						<>
							<MapPlaceholder location={adData.location} radius={adData.radius} isValid={!!adData.location.trim()} />
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<Label htmlFor="campaignName" className="flex items-center gap-2">
										Campaign Name *
										<HelpCircle className="w-4 h-4 text-muted-foreground" />
									</Label>
									<Input id="campaignName" placeholder="e.g., Summer Plumbing Special" value={adData.name} onChange={(e) => updateAdData("name", e.target.value)} className={errors.name ? "border-red-500 focus:border-red-500" : ""} {...(!isHydrated && { suppressHydrationWarning: true })} />
									{errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
									<p className="text-xs text-muted-foreground mt-1">{adData.name.length}/50 characters</p>
								</div>
								<div>
									<Label htmlFor="adType">Ad Type</Label>
									<Select value={adData.type} onValueChange={(value) => updateAdData("type", value)}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="search">Search Ads</SelectItem>
											<SelectItem value="display">Display Ads</SelectItem>
											<SelectItem value="social">Social Media</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="md:col-span-2">
									<Label htmlFor="location" className="flex items-center gap-2">
										Primary Location *
										<HelpCircle className="w-4 h-4 text-muted-foreground" />
									</Label>
									<Input id="location" placeholder="e.g., San Francisco, CA" value={adData.location} onChange={(e) => updateAdData("location", e.target.value)} className={errors.location ? "border-red-500 focus:border-red-500" : ""} {...(!isHydrated && { suppressHydrationWarning: true })} />
									{errors.location && <p className="text-sm text-destructive mt-1">{errors.location}</p>}
								</div>
								<div>
									<Label htmlFor="radius">Target Radius (miles)</Label>
									<Select value={adData.radius} onValueChange={(value) => updateAdData("radius", value)}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="5">5 miles</SelectItem>
											<SelectItem value="10">10 miles</SelectItem>
											<SelectItem value="25">25 miles</SelectItem>
											<SelectItem value="50">50 miles</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</>
					)}
					{step === 2 && (
						<div className="space-y-6">
							<div>
								<Label htmlFor="headline" className="flex items-center gap-2">
									Headline *
									<HelpCircle className="w-4 h-4 text-muted-foreground" />
								</Label>
								<Input id="headline" placeholder="e.g., 24/7 Emergency Plumbing Services" value={adData.headline} onChange={(e) => updateAdData("headline", e.target.value)} maxLength={60} className={errors.headline ? "border-red-500 focus:border-red-500" : ""} {...(!isHydrated && { suppressHydrationWarning: true })} />
								{errors.headline && <p className="text-sm text-destructive mt-1">{errors.headline}</p>}
								<p className="text-xs text-muted-foreground mt-1">{adData.headline.length}/60 characters</p>
							</div>
							<div>
								<Label htmlFor="description" className="flex items-center gap-2">
									Description *
									<HelpCircle className="w-4 h-4 text-muted-foreground" />
								</Label>
								<Textarea id="description" placeholder="Describe your service or offer..." value={adData.description} onChange={(e) => updateAdData("description", e.target.value)} maxLength={150} rows={3} className={errors.description ? "border-red-500 focus:border-red-500" : ""} {...(!isHydrated && { suppressHydrationWarning: true })} />
								{errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
								<p className="text-xs text-muted-foreground mt-1">{adData.description.length}/150 characters</p>
							</div>
							<div>
								<Label htmlFor="cta">Call to Action</Label>
								<Select value={adData.cta} onValueChange={(value) => updateAdData("cta", value)}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Learn More">Learn More</SelectItem>
										<SelectItem value="Call Now">Call Now</SelectItem>
										<SelectItem value="Get Quote">Get Quote</SelectItem>
										<SelectItem value="Book Now">Book Now</SelectItem>
										<SelectItem value="Visit Website">Visit Website</SelectItem>
										<SelectItem value="Download">Download</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="keywords">Keywords (comma-separated)</Label>
								<Input id="keywords" placeholder="e.g., plumbing, emergency, drain cleaning" value={adData.keywords} onChange={(e) => updateAdData("keywords", e.target.value)} {...(!isHydrated && { suppressHydrationWarning: true })} />
							</div>
						</div>
					)}
					{step === 3 && (
						<div className="space-y-6">
							<div>
								<Label>Demographics</Label>
								<div className="grid grid-cols-2 gap-3 mt-2">
									{["Homeowners", "Renters", "Property Managers", "Business Owners", "Young Professionals", "Families", "Seniors"].map((demo) => (
										<Button
											key={demo}
											variant={adData.demographics.includes(demo.toLowerCase()) ? "default" : "outline"}
											size="sm"
											onClick={() => {
												const newDemos = adData.demographics.includes(demo.toLowerCase()) ? adData.demographics.filter((d) => d !== demo.toLowerCase()) : [...adData.demographics, demo.toLowerCase()];
												updateAdData("demographics", newDemos);
											}}
										>
											{demo}
										</Button>
									))}
								</div>
							</div>
							<div>
								<Label>Interests</Label>
								<div className="grid grid-cols-2 gap-3 mt-2">
									{["Home Improvement", "DIY Projects", "Professional Services", "Local Business", "Emergency Services", "Maintenance", "Technology", "Health & Wellness"].map((interest) => (
										<Button
											key={interest}
											variant={adData.interests.includes(interest.toLowerCase()) ? "default" : "outline"}
											size="sm"
											onClick={() => {
												const newInterests = adData.interests.includes(interest.toLowerCase()) ? adData.interests.filter((i) => i !== interest.toLowerCase()) : [...adData.interests, interest.toLowerCase()];
												updateAdData("interests", newInterests);
											}}
										>
											{interest}
										</Button>
									))}
								</div>
							</div>
							<div>
								<Label htmlFor="excludedKeywords">Excluded Keywords</Label>
								<Input id="excludedKeywords" placeholder="e.g., free, cheap, discount" value={adData.excludedKeywords} onChange={(e) => updateAdData("excludedKeywords", e.target.value)} {...(!isHydrated && { suppressHydrationWarning: true })} />
							</div>
						</div>
					)}
					{step === 4 && (
						<div className="space-y-6">
							<div>
								<Label htmlFor="budget">Monthly Budget ($)</Label>
								<Input id="budget" type="number" value={adData.budget} onChange={(e) => updateAdData("budget", parseInt(e.target.value))} {...(!isHydrated && { suppressHydrationWarning: true })} />
							</div>
							<div>
								<Label htmlFor="duration">Campaign Duration (days)</Label>
								<Select value={adData.duration.toString()} onValueChange={(value) => updateAdData("duration", parseInt(value))}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="7">7 days</SelectItem>
										<SelectItem value="14">14 days</SelectItem>
										<SelectItem value="30">30 days</SelectItem>
										<SelectItem value="60">60 days</SelectItem>
										<SelectItem value="90">90 days</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label>Time of Day</Label>
								<Select value={adData.schedule.timeOfDay} onValueChange={(value) => updateSchedule("timeOfDay", value)}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All day</SelectItem>
										<SelectItem value="business">Business hours (9 AM - 5 PM)</SelectItem>
										<SelectItem value="evening">Evening hours (5 PM - 9 PM)</SelectItem>
										<SelectItem value="weekend">Weekends only</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					)}
					{step === 5 && (
						<div className="space-y-6">
							<Alert>
								<CheckCircle className="h-4 w-4" />
								<AlertDescription>Review your campaign details below. Once launched, your ads will start appearing within 24 hours.</AlertDescription>
							</Alert>
							<div className="bg-muted p-4 rounded-lg">
								<h3 className="font-semibold mb-2">Campaign Summary</h3>
								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span>Campaign Name:</span>
										<span className="font-medium">{adData.name}</span>
									</div>
									<div className="flex justify-between">
										<span>Ad Type:</span>
										<span className="font-medium capitalize">{adData.type}</span>
									</div>
									<div className="flex justify-between">
										<span>Location:</span>
										<span className="font-medium">{adData.location}</span>
									</div>
									<div className="flex justify-between">
										<span>Budget:</span>
										<span className="font-medium">${adData.budget}/month</span>
									</div>
									<div className="flex justify-between">
										<span>Duration:</span>
										<span className="font-medium">{adData.duration} days</span>
									</div>
								</div>
							</div>
							<div>
								<Label>Terms and Conditions</Label>
								<div className="mt-2 space-y-3">
									<div className="flex items-start space-x-2">
										<Checkbox id="terms" checked={adData.termsAccepted} onCheckedChange={(checked) => updateAdData("termsAccepted", checked)} />
										<label htmlFor="terms" className="text-sm leading-relaxed">
											I agree to the advertising terms and conditions
										</label>
									</div>
									{errors.terms && <p className="text-sm text-destructive">{errors.terms}</p>}
									<div className="flex items-start space-x-2">
										<Checkbox id="billing" checked={adData.billingAccepted} onCheckedChange={(checked) => updateAdData("billingAccepted", checked)} />
										<label htmlFor="billing" className="text-sm leading-relaxed">
											I understand that ads will be charged based on clicks or impressions
										</label>
									</div>
									{errors.billing && <p className="text-sm text-destructive">{errors.billing}</p>}
								</div>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		);
	};

	const renderAdPreview = () => (
		<Card className="bg-card/80 dark:bg-card/60 border border-border">
			<CardHeader>
				<CardTitle className="text-base font-semibold flex items-center gap-2">
					<Eye className="w-4 h-4" />
					Ad Preview
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Search Results Preview */}
				<div className="rounded-lg border border-primary/30 dark:border-primary bg-blue-50/60 dark:bg-primary/30 p-4">
					<div className="flex items-start gap-3">
						<div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0"></div>
						<div className="flex-1">
							<div className="flex items-center gap-2 mb-1">
								<h4 className="font-medium text-primary dark:text-primary/90">{adData.headline || "Your Ad Headline"}</h4>
								<Badge variant="secondary" className="text-xs">
									Ad
								</Badge>
							</div>
							<p className="text-sm text-muted-foreground mb-1">{adData.description || "Your ad description will appear here..."}</p>
							<div className="flex items-center gap-4 text-xs text-muted-foreground">
								<span>{adData.location || "Location"}</span>
								<span>•</span>
								<span>{adData.cta || "Learn More"}</span>
							</div>
						</div>
					</div>
				</div>
				{/* Business Card Preview */}
				<div className="rounded-lg border border-border bg-background/80 dark:bg-background/40 p-4">
					<div className="flex items-start gap-3">
						<div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0"></div>
						<div className="flex-1">
							<h4 className="font-semibold">{adData.headline || "Your Business Name"}</h4>
							<p className="text-sm text-muted-foreground mb-2">{adData.description || "Your business description..."}</p>
							<div className="flex items-center gap-2 text-sm">
								<MapPin className="w-4 h-4 text-muted-foreground" />
								<span>{adData.location || "Location"}</span>
							</div>
							<div className="flex items-center gap-2 mt-2">
								<Button size="sm" className="text-xs">
									{adData.cta || "Learn More"}
								</Button>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);

	const renderWhereAdsShow = () => (
		<Card className="bg-card/80 dark:bg-card/60 border border-border">
			<CardHeader>
				<CardTitle className="text-base font-semibold flex items-center gap-2">
					<Globe className="w-4 h-4" />
					Where Your Ads Will Appear
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="flex items-center gap-3 p-3 bg-muted dark:bg-muted/40 rounded-lg">
					<Search className="w-5 h-5 text-primary dark:text-primary/90" />
					<div>
						<h4 className="font-medium">Search Results</h4>
						<p className="text-sm text-muted-foreground">When people search for your keywords</p>
					</div>
				</div>
				<div className="flex items-center gap-3 p-3 bg-muted dark:bg-muted/40 rounded-lg">
					<Globe className="w-5 h-5 text-success dark:text-success/90" />
					<div>
						<h4 className="font-medium">Business Directory</h4>
						<p className="text-sm text-muted-foreground">Featured placement in category listings</p>
					</div>
				</div>
				<div className="flex items-center gap-3 p-3 bg-muted dark:bg-muted/40 rounded-lg">
					<Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-300" />
					<div>
						<h4 className="font-medium">Mobile Apps</h4>
						<p className="text-sm text-muted-foreground">Native ads in our mobile applications</p>
					</div>
				</div>
				<div className="flex items-center gap-3 p-3 bg-muted dark:bg-muted/40 rounded-lg">
					<Monitor className="w-5 h-5 text-warning dark:text-warning/90" />
					<div>
						<h4 className="font-medium">Partner Websites</h4>
						<p className="text-sm text-muted-foreground">Display ads on partner business sites</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);

	// Show loading state until hydrated
    if (!isHydrated) {
		return (
			<div className="flex items-center justify-center py-16">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div>
			{/* Header */}
			<div className="border-b border-border bg-card/80 dark:bg-card/70 sticky top-0 z-30">
				<div className="flex items-center justify-between p-6">
					<div className="flex items-center gap-4">
						<Link href="/dashboard/business/ads">
							<Button variant="ghost" size="sm">
								<ArrowLeft className="w-4 h-4 mr-2" />
								Back to Ads
							</Button>
						</Link>
						<div>
							<h1 className="text-2xl font-bold text-foreground">Create Ad Campaign</h1>
							<p className="text-muted-foreground">Set up your advertising campaign to reach more customers</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="outline" onClick={() => setStep(1)}>
							<Save className="w-4 h-4 mr-2" />
							Save Draft
						</Button>
						<Button onClick={handleSave} disabled={step < 5 || isSubmitting}>
							{isSubmitting ? (
								<>
									<Sparkles className="w-4 h-4 mr-2 animate-spin" />
									Creating...
								</>
							) : (
								"Launch Campaign"
							)}
						</Button>
					</div>
				</div>
				{/* Enhanced Progress Steps */}
				<div className="px-6 pb-6">
					<StepProgress currentStep={step} totalSteps={5} steps={steps} />
				</div>
			</div>

			<div className="flex flex-col lg:flex-row gap-8 w-full py-8">
				{/* Main Content */}
				<div className="flex-1 min-w-0">
					{renderStepContent()}
					<div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
						<Button variant="outline" onClick={handleBack} disabled={step === 1}>
							Back
						</Button>
						<Button onClick={handleNext} disabled={step === 5}>
							{step === 5 ? "Launch Campaign" : "Next"}
						</Button>
					</div>
				</div>

				{/* Sidebar */}
				<aside className="w-full lg:w-[420px] xl:w-[480px] flex-shrink-0 space-y-6 sticky top-24 self-start">
					<Card className="bg-card/90 dark:bg-card/80 border border-border">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<DollarSign className="w-5 h-5" />
								Cost Estimates
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<p className="text-muted-foreground">Estimated Impressions</p>
									<p className="font-semibold text-lg">{estimatedMetrics.impressions.toLocaleString()}</p>
								</div>
								<div>
									<p className="text-muted-foreground">Estimated Clicks</p>
									<p className="font-semibold text-lg">{estimatedMetrics.clicks.toLocaleString()}</p>
								</div>
								<div>
									<p className="text-muted-foreground">CTR</p>
									<p className="font-semibold text-lg">{estimatedMetrics.ctr}%</p>
								</div>
								<div>
									<p className="text-muted-foreground">Avg. CPC</p>
									<p className="font-semibold text-lg">${estimatedMetrics.cpc}</p>
								</div>
							</div>
							<Separator />
							<div className="flex justify-between items-center">
								<span className="font-medium">Total Estimated Cost</span>
								<span className="font-bold text-lg">${estimatedMetrics.totalCost.toFixed(2)}</span>
							</div>
						</CardContent>
					</Card>
					{renderAdPreview()}
					{renderWhereAdsShow()}
					<Card className="bg-card/90 dark:bg-card/80 border border-border">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Target className="w-5 h-5" />
								Targeting Summary
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex items-center gap-2">
								<MapPin className="w-4 h-4 text-muted-foreground" />
								<span className="text-sm">{adData.location || "Location not set"}</span>
							</div>
							<div className="flex items-center gap-2">
								<Users className="w-4 h-4 text-muted-foreground" />
								<span className="text-sm">{adData.radius} mile radius</span>
							</div>
							{adData.demographics.length > 0 && (
								<div className="flex items-center gap-2">
									<Users className="w-4 h-4 text-muted-foreground" />
									<span className="text-sm">{adData.demographics.length} demographics selected</span>
								</div>
							)}
							{adData.interests.length > 0 && (
								<div className="flex items-center gap-2">
									<Zap className="w-4 h-4 text-muted-foreground" />
									<span className="text-sm">{adData.interests.length} interests selected</span>
								</div>
							)}
						</CardContent>
					</Card>
				</aside>
			</div>
		</div>
	);
}
