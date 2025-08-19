/**
 * Targeting Section
 * Extracted from ads create/edit pages (678/804 lines)
 * Handles audience targeting: demographics, keywords, and interests
 * Enterprise-level component with smart suggestions and validation
 */

"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import { Checkbox } from "@components/ui/checkbox";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Separator } from "@components/ui/separator";
import { Users, Target, Search, X, Plus, Lightbulb, TrendingUp, AlertCircle, CheckCircle, Globe, Zap } from "lucide-react";

// Predefined targeting options
const DEMOGRAPHICS = [
	{ id: "18-24", label: "18-24 years", description: "Young adults" },
	{ id: "25-34", label: "25-34 years", description: "Millennials" },
	{ id: "35-44", label: "35-44 years", description: "Gen X" },
	{ id: "45-54", label: "45-54 years", description: "Mid-career" },
	{ id: "55-64", label: "55-64 years", description: "Pre-retirement" },
	{ id: "65+", label: "65+ years", description: "Seniors" },
];

const INTERESTS = [
	{ id: "home-improvement", label: "Home Improvement", category: "Home & Garden" },
	{ id: "health-fitness", label: "Health & Fitness", category: "Lifestyle" },
	{ id: "technology", label: "Technology", category: "Tech" },
	{ id: "automotive", label: "Automotive", category: "Transportation" },
	{ id: "real-estate", label: "Real Estate", category: "Property" },
	{ id: "food-dining", label: "Food & Dining", category: "Lifestyle" },
	{ id: "travel", label: "Travel", category: "Lifestyle" },
	{ id: "finance", label: "Personal Finance", category: "Finance" },
	{ id: "education", label: "Education", category: "Learning" },
	{ id: "entertainment", label: "Entertainment", category: "Lifestyle" },
];

// Keyword suggestions based on business type
const KEYWORD_SUGGESTIONS = {
	plumbing: ["plumber", "emergency plumbing", "drain cleaning", "pipe repair", "water heater"],
	electrical: ["electrician", "electrical repair", "wiring", "circuit breaker", "electrical installation"],
	cleaning: ["house cleaning", "office cleaning", "deep cleaning", "move out cleaning", "recurring cleaning"],
	lawn: ["lawn care", "landscaping", "tree trimming", "lawn mowing", "garden maintenance"],
	automotive: ["auto repair", "car service", "oil change", "brake repair", "tire service"],
	roofing: ["roofing contractor", "roof repair", "roof replacement", "roof inspection", "gutter cleaning"],
	hvac: ["hvac repair", "air conditioning", "heating", "furnace repair", "duct cleaning"],
	dental: ["dentist", "dental cleaning", "teeth whitening", "dental implants", "emergency dental"],
};

// Smart keyword suggestions component
const KeywordSuggestions = ({ businessType, onAddKeyword, existingKeywords = [] }) => {
	const suggestions = KEYWORD_SUGGESTIONS[businessType] || KEYWORD_SUGGESTIONS.plumbing;
	const availableSuggestions = suggestions.filter((keyword) => !existingKeywords.toLowerCase().includes(keyword.toLowerCase()));

	if (availableSuggestions.length === 0) return null;

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2">
				<Lightbulb className="w-4 h-4 text-warning" />
				<span className="text-sm font-medium">Suggested Keywords</span>
			</div>
			<div className="flex flex-wrap gap-2">
				{availableSuggestions.slice(0, 8).map((keyword) => (
					<Badge key={keyword} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground" onClick={() => onAddKeyword(keyword)}>
						<Plus className="w-3 h-3 mr-1" />
						{keyword}
					</Badge>
				))}
			</div>
		</div>
	);
};

// Audience estimation component
const AudienceEstimation = ({ demographics, interests, location }) => {
	// Mock estimation logic - in real app, this would call an API
	const getEstimatedReach = () => {
		let baseReach = 50000;

		// Adjust based on demographics
		if (demographics.length > 0) {
			baseReach *= 1 - demographics.length * 0.1;
		}

		// Adjust based on interests
		if (interests.length > 0) {
			baseReach *= 1 - interests.length * 0.15;
		}

		// Random variation
		const variation = 0.8 + Math.random() * 0.4;
		return Math.round(baseReach * variation);
	};

	const estimatedReach = getEstimatedReach();

	return (
		<Card className="bg-blue-50/50 border-primary/30">
			<CardContent className="p-4">
				<div className="flex items-center gap-2 mb-2">
					<TrendingUp className="w-4 h-4 text-primary" />
					<span className="font-medium text-sm">Estimated Reach</span>
				</div>
				<p className="text-2xl font-bold text-primary">{estimatedReach.toLocaleString()}</p>
				<p className="text-xs text-primary/70">potential customers in your area</p>
			</CardContent>
		</Card>
	);
};

export const TargetingSection = ({
	// Data props
	targetingData,
	errors = {},
	businessType = "plumbing",

	// Event handlers
	onUpdateField,
	onValidation,

	// Configuration
	showAudienceEstimation = true,
	showKeywordSuggestions = true,
	className = "",
}) => {
	const { keywords, demographics, interests, excludedKeywords } = targetingData;
	const [keywordInput, setKeywordInput] = useState("");

	// Handle field updates with validation
	const handleFieldUpdate = (field, value) => {
		onUpdateField(field, value);

		// Trigger validation for the field
		if (onValidation) {
			onValidation(field, value);
		}
	};

	// Handle demographic selection
	const handleDemographicChange = (demographicId, checked) => {
		const updatedDemographics = checked ? [...demographics, demographicId] : demographics.filter((id) => id !== demographicId);

		handleFieldUpdate("demographics", updatedDemographics);
	};

	// Handle interest selection
	const handleInterestChange = (interestId, checked) => {
		const updatedInterests = checked ? [...interests, interestId] : interests.filter((id) => id !== interestId);

		handleFieldUpdate("interests", updatedInterests);
	};

	// Add keyword from input
	const addKeywordFromInput = () => {
		if (keywordInput.trim() && !keywords.toLowerCase().includes(keywordInput.toLowerCase())) {
			const newKeywords = keywords ? `${keywords}, ${keywordInput.trim()}` : keywordInput.trim();
			handleFieldUpdate("keywords", newKeywords);
			setKeywordInput("");
		}
	};

	// Add suggested keyword
	const addSuggestedKeyword = (keyword) => {
		const newKeywords = keywords ? `${keywords}, ${keyword}` : keyword;
		handleFieldUpdate("keywords", newKeywords);
	};

	// Remove keyword
	const removeKeyword = (keywordToRemove) => {
		const keywordArray = keywords
			.split(",")
			.map((k) => k.trim())
			.filter((k) => k);
		const updatedKeywords = keywordArray.filter((k) => k !== keywordToRemove).join(", ");
		handleFieldUpdate("keywords", updatedKeywords);
	};

	// Get keyword array for display
	const getKeywordArray = () => {
		return keywords
			? keywords
					.split(",")
					.map((k) => k.trim())
					.filter((k) => k)
			: [];
	};

	// Check if targeting is complete
	const isTargetingComplete = keywords?.trim() && (demographics.length > 0 || interests.length > 0);

	return (
		<Card className={`bg-card/90 dark:bg-card/80 shadow-lg border border-border ${className}`}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Target className="w-5 h-5 text-primary" />
					Audience Targeting
					{isTargetingComplete && <CheckCircle className="w-4 h-4 text-success" />}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Keywords */}
					<div className="lg:col-span-2 space-y-4">
						<div>
							<Label htmlFor="keywords" className="flex items-center gap-2">
								Keywords *
								<Search className="w-4 h-4 text-muted-foreground" />
							</Label>
							<div className="space-y-2">
								<div className="flex gap-2">
									<Input placeholder="Enter keywords..." value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && addKeywordFromInput()} />
									<Button type="button" onClick={addKeywordFromInput} disabled={!keywordInput.trim()}>
										<Plus className="w-4 h-4" />
									</Button>
								</div>
								<Textarea id="keywords" placeholder="e.g., plumber, emergency plumbing, drain cleaning" value={keywords} onChange={(e) => handleFieldUpdate("keywords", e.target.value)} className={errors.keywords ? "border-red-500 focus:border-red-500" : ""} rows={3} />
							</div>
							{errors.keywords && <p className="text-sm text-destructive mt-1">{errors.keywords}</p>}

							{/* Display keywords as badges */}
							{getKeywordArray().length > 0 && (
								<div className="flex flex-wrap gap-1 mt-2">
									{getKeywordArray().map((keyword, index) => (
										<Badge key={index} variant="secondary" className="gap-1">
											{keyword}
											<Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent" onClick={() => removeKeyword(keyword)}>
												<X className="w-3 h-3" />
											</Button>
										</Badge>
									))}
								</div>
							)}

							{/* Keyword suggestions */}
							{showKeywordSuggestions && <KeywordSuggestions businessType={businessType} onAddKeyword={addSuggestedKeyword} existingKeywords={keywords} />}
						</div>

						{/* Excluded Keywords */}
						<div>
							<Label htmlFor="excludedKeywords">Excluded Keywords</Label>
							<Textarea id="excludedKeywords" placeholder="e.g., free, cheap, DIY" value={excludedKeywords} onChange={(e) => handleFieldUpdate("excludedKeywords", e.target.value)} rows={2} />
							<p className="text-xs text-muted-foreground mt-1">Prevent your ads from showing for these terms</p>
						</div>
					</div>

					{/* Audience Estimation */}
					{showAudienceEstimation && (
						<div>
							<AudienceEstimation demographics={demographics} interests={interests} location={targetingData.location} />
						</div>
					)}
				</div>

				<Separator />

				{/* Demographics */}
				<div>
					<div className="flex items-center gap-2 mb-4">
						<Users className="w-4 h-4 text-muted-foreground" />
						<Label className="text-base font-medium">Age Demographics</Label>
					</div>
					<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
						{DEMOGRAPHICS.map((demo) => (
							<div key={demo.id} className="flex items-center space-x-2">
								<Checkbox id={demo.id} checked={demographics.includes(demo.id)} onCheckedChange={(checked) => handleDemographicChange(demo.id, checked)} />
								<Label htmlFor={demo.id} className="text-sm cursor-pointer">
									<div>
										<p className="font-medium">{demo.label}</p>
										<p className="text-xs text-muted-foreground">{demo.description}</p>
									</div>
								</Label>
							</div>
						))}
					</div>
				</div>

				<Separator />

				{/* Interests */}
				<div>
					<div className="flex items-center gap-2 mb-4">
						<Globe className="w-4 h-4 text-muted-foreground" />
						<Label className="text-base font-medium">Interests</Label>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{INTERESTS.map((interest) => (
							<div key={interest.id} className="flex items-center space-x-2">
								<Checkbox id={interest.id} checked={interests.includes(interest.id)} onCheckedChange={(checked) => handleInterestChange(interest.id, checked)} />
								<Label htmlFor={interest.id} className="text-sm cursor-pointer">
									<div>
										<p className="font-medium">{interest.label}</p>
										<p className="text-xs text-muted-foreground">{interest.category}</p>
									</div>
								</Label>
							</div>
						))}
					</div>
				</div>

				{/* Validation Summary */}
				{Object.keys(errors).length > 0 && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>Please fix the errors above before continuing.</AlertDescription>
					</Alert>
				)}

				{/* Targeting tip */}
				<Alert>
					<Zap className="h-4 w-4" />
					<AlertDescription>
						<strong>Pro tip:</strong> Start with broader targeting and narrow down based on performance data.
					</AlertDescription>
				</Alert>
			</CardContent>
		</Card>
	);
};

export default TargetingSection;
