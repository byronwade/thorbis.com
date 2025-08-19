/**
 * Ad Content Section
 * Extracted from ads create/edit pages (678/804 lines)
 * Handles ad creative content: headline, description, and call-to-action
 * Enterprise-level component with real-time preview and validation
 */

"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Badge } from "@components/ui/badge";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Button } from "@components/ui/button";
import { Edit, Eye, Lightbulb, Sparkles, TrendingUp, MousePointer, AlertCircle, CheckCircle, Smartphone, Monitor } from "lucide-react";

// Ad Preview Component
const AdPreview = ({ headline, description, cta, type = "search", businessName = "Your Business" }) => {
	const [previewDevice, setPreviewDevice] = useState("desktop");

	const getPreviewContent = () => {
		switch (type) {
			case "search":
				return (
					<div className="bg-white border rounded-lg p-4 shadow-sm">
						<div className="space-y-2">
							<div className="flex items-start justify-between">
								<div className="space-y-1">
									<h3 className="text-primary text-lg font-medium leading-tight">{headline || "Your Headline Here"}</h3>
									<p className="text-success text-sm">{businessName} • Ad</p>
									<p className="text-muted-foreground text-sm leading-relaxed">{description || "Your compelling ad description will appear here..."}</p>
								</div>
							</div>
							<div className="pt-2">
								<Button size="sm" className="bg-primary hover:bg-primary">
									{cta || "Learn More"}
								</Button>
							</div>
						</div>
					</div>
				);

			case "display":
				return (
					<div className="bg-gradient-to-r from-blue-50 to-indigo-50 border rounded-lg p-6 shadow-sm">
						<div className="text-center space-y-3">
							<div className="w-16 h-16 bg-primary/20 rounded-full mx-auto flex items-center justify-center">
								<Sparkles className="w-8 h-8 text-primary" />
							</div>
							<h3 className="text-xl font-bold text-foreground">{headline || "Your Headline Here"}</h3>
							<p className="text-muted-foreground text-sm">{description || "Your compelling ad description will appear here..."}</p>
							<Button className="bg-primary hover:bg-primary">{cta || "Learn More"}</Button>
						</div>
					</div>
				);

			case "social":
				return (
					<div className="bg-white border rounded-lg shadow-sm">
						<div className="p-4 border-b">
							<div className="flex items-center space-x-3">
								<div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
									<TrendingUp className="w-5 h-5 text-primary" />
								</div>
								<div>
									<p className="font-semibold text-sm">{businessName}</p>
									<p className="text-xs text-muted-foreground">Sponsored</p>
								</div>
							</div>
						</div>
						<div className="p-4 space-y-3">
							<h3 className="font-semibold text-foreground">{headline || "Your Headline Here"}</h3>
							<p className="text-muted-foreground text-sm">{description || "Your compelling ad description will appear here..."}</p>
							<Button size="sm" variant="outline" className="w-full">
								{cta || "Learn More"}
							</Button>
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Eye className="w-4 h-4 text-muted-foreground" />
					<span className="font-medium text-sm">Live Preview</span>
				</div>
				<div className="flex items-center gap-1">
					<Button variant={previewDevice === "mobile" ? "default" : "outline"} size="sm" onClick={() => setPreviewDevice("mobile")} className="h-8 px-2">
						<Smartphone className="w-3 h-3" />
					</Button>
					<Button variant={previewDevice === "desktop" ? "default" : "outline"} size="sm" onClick={() => setPreviewDevice("desktop")} className="h-8 px-2">
						<Monitor className="w-3 h-3" />
					</Button>
				</div>
			</div>

			<div className={previewDevice === "mobile" ? "max-w-sm mx-auto" : "max-w-md"}>{getPreviewContent()}</div>
		</div>
	);
};

// Content suggestions helper
const ContentSuggestions = ({ type, onSuggestionSelect }) => {
	const suggestions = {
		search: {
			headlines: ["Professional Services Near You", "Book Your Service Today", "Trusted Local Experts", "Same Day Service Available"],
			descriptions: ["Get professional service from licensed and insured experts in your area.", "Fast, reliable service with 100% satisfaction guarantee.", "Join thousands of satisfied customers in your area."],
			ctas: ["Book Now", "Get Quote", "Call Today", "Learn More", "Schedule Service"],
		},
		display: {
			headlines: ["Transform Your Space Today", "Limited Time Special Offer", "Discover the Difference", "Your Solution Awaits"],
			descriptions: ["Experience premium quality that exceeds expectations.", "Join the growing community of satisfied customers.", "Don't wait - spaces are filling up fast!"],
			ctas: ["Get Started", "Claim Offer", "Discover More", "Join Now", "Try Free"],
		},
		social: {
			headlines: ["See What Everyone's Talking About", "Join the Community", "Don't Miss Out", "This Changes Everything"],
			descriptions: ["Thousands of people are already enjoying the benefits.", "Be part of something amazing in your community.", "Find out why your neighbors are switching."],
			ctas: ["Join Community", "Learn Why", "Get Started", "See More", "Try Now"],
		},
	};

	const currentSuggestions = suggestions[type] || suggestions.search;

	return (
		<div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
			<div className="flex items-center gap-2">
				<Lightbulb className="w-4 h-4 text-warning" />
				<span className="font-medium text-sm">Content Suggestions</span>
			</div>

			<div className="space-y-3">
				<div>
					<p className="text-xs font-medium mb-2">Headlines:</p>
					<div className="flex flex-wrap gap-1">
						{currentSuggestions.headlines.map((headline, index) => (
							<Badge key={index} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs" onClick={() => onSuggestionSelect("headline", headline)}>
								{headline}
							</Badge>
						))}
					</div>
				</div>

				<div>
					<p className="text-xs font-medium mb-2">Call-to-Actions:</p>
					<div className="flex flex-wrap gap-1">
						{currentSuggestions.ctas.map((cta, index) => (
							<Badge key={index} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs" onClick={() => onSuggestionSelect("cta", cta)}>
								{cta}
							</Badge>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export const AdContentSection = ({
	// Data props
	contentData,
	errors = {},
	isHydrated = true,

	// Event handlers
	onUpdateField,
	onValidation,

	// Configuration
	showPreview = true,
	showSuggestions = true,
	businessName = "Your Business",
	className = "",
}) => {
	const { headline, description, cta, type = "search" } = contentData;

	// Handle field updates with validation
	const handleFieldUpdate = (field, value) => {
		onUpdateField(field, value);

		// Trigger validation for the field
		if (onValidation) {
			onValidation(field, value);
		}
	};

	// Handle suggestion selection
	const handleSuggestionSelect = (field, value) => {
		handleFieldUpdate(field, value);
	};

	// Get character count with color coding
	const getCharacterCountColor = (current, max) => {
		const percentage = (current / max) * 100;
		if (percentage >= 90) return "text-destructive";
		if (percentage >= 75) return "text-warning";
		return "text-muted-foreground";
	};

	// Validate content completeness
	const isContentComplete = headline?.trim() && description?.trim() && cta?.trim();

	return (
		<div className={`space-y-6 ${className}`}>
			<Card className="bg-card/90 dark:bg-card/80 shadow-lg border border-border">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Edit className="w-5 h-5 text-primary" />
						Ad Content
						{isContentComplete && <CheckCircle className="w-4 h-4 text-success" />}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Content Form */}
						<div className="space-y-4">
							{/* Headline */}
							<div>
								<Label htmlFor="headline" className="flex items-center gap-2">
									Headline *
									<MousePointer className="w-4 h-4 text-muted-foreground" />
								</Label>
								<Input id="headline" placeholder="e.g., Professional Plumbing Services" value={headline} onChange={(e) => handleFieldUpdate("headline", e.target.value)} className={errors.headline ? "border-red-500 focus:border-red-500" : ""} maxLength={30} {...(!isHydrated && { suppressHydrationWarning: true })} />
								{errors.headline && <p className="text-sm text-destructive mt-1">{errors.headline}</p>}
								<p className={`text-xs mt-1 ${getCharacterCountColor(headline?.length || 0, 30)}`}>{headline?.length || 0}/30 characters</p>
							</div>

							{/* Description */}
							<div>
								<Label htmlFor="description">Description *</Label>
								<Textarea id="description" placeholder="Describe your service and what makes you special..." value={description} onChange={(e) => handleFieldUpdate("description", e.target.value)} className={errors.description ? "border-red-500 focus:border-red-500" : ""} rows={4} maxLength={90} />
								{errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
								<p className={`text-xs mt-1 ${getCharacterCountColor(description?.length || 0, 90)}`}>{description?.length || 0}/90 characters</p>
							</div>

							{/* Call to Action */}
							<div>
								<Label htmlFor="cta">Call to Action</Label>
								<Select value={cta} onValueChange={(value) => handleFieldUpdate("cta", value)}>
									<SelectTrigger>
										<SelectValue placeholder="Select CTA" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Learn More">Learn More</SelectItem>
										<SelectItem value="Get Quote">Get Quote</SelectItem>
										<SelectItem value="Call Now">Call Now</SelectItem>
										<SelectItem value="Book Service">Book Service</SelectItem>
										<SelectItem value="Contact Us">Contact Us</SelectItem>
										<SelectItem value="Get Started">Get Started</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Content Suggestions */}
							{showSuggestions && <ContentSuggestions type={type} onSuggestionSelect={handleSuggestionSelect} />}
						</div>

						{/* Live Preview */}
						{showPreview && (
							<div>
								<AdPreview headline={headline} description={description} cta={cta} type={type} businessName={businessName} />
							</div>
						)}
					</div>

					{/* Validation Summary */}
					{Object.keys(errors).length > 0 && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>Please fix the errors above before continuing.</AlertDescription>
						</Alert>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default AdContentSection;
