"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Progress } from "@components/ui/progress";
import { CheckCircle, ArrowRight, Sparkles, MapPin } from "lucide-react";
import { cn } from "@utils";
import logger from "@lib/utils/logger";

/**
 * Personalized Signup Flow Component
 * Adapts signup experience based on route context and user intent
 */
export default function PersonalizedSignupFlow({ context, onComplete }) {
	const [currentStep, setCurrentStep] = useState(0);
	const [selectedPreferences, setSelectedPreferences] = useState([]);

	// Generate personalized onboarding steps based on context
	const onboardingSteps = useMemo(() => {
		const baseSteps = [
			{
				id: "welcome",
				title: "Welcome to Thorbis!",
				description: "Let's personalize your experience",
				component: "welcome",
			},
		];

		// Context-specific onboarding steps
		const contextSteps = {
			business: [
				{
					id: "business-type",
					title: "What type of business do you have?",
					description: "This helps us customize your dashboard",
					component: "business-selector",
				},
				{
					id: "business-goals",
					title: "What are your main goals?",
					description: "We'll recommend the best features for you",
					component: "goal-selector",
				},
			],
			discovery: [
				{
					id: "interests",
					title: "What interests you most?",
					description: "We'll show you relevant businesses",
					component: "interest-selector",
				},
				{
					id: "location",
					title: "Where are you located?",
					description: "Get personalized local recommendations",
					component: "location-selector",
				},
			],
			social: [
				{
					id: "activity-preferences",
					title: "How do you like to engage?",
					description: "Customize your social features",
					component: "activity-selector",
				},
			],
			local: [
				{
					id: "neighborhood",
					title: "Tell us about your area",
					description: "Connect with your local community",
					component: "neighborhood-selector",
				},
				{
					id: "interests",
					title: "What local activities interest you?",
					description: "We'll show you relevant events and businesses",
					component: "local-interest-selector",
				},
			],
		};

		const categorySteps = contextSteps[context?.category] || contextSteps.discovery;

		return [
			...baseSteps,
			...categorySteps,
			{
				id: "complete",
				title: "You're all set!",
				description: "Start exploring with your personalized experience",
				component: "completion",
			},
		];
	}, [context]);

	// Step progress calculation
	const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

	// Handle step completion
	const handleStepComplete = (data) => {
		setSelectedPreferences((prev) => ({ ...prev, ...data }));

		if (currentStep < onboardingSteps.length - 1) {
			setCurrentStep((prev) => prev + 1);
		} else {
			// Log completion
			logger.interaction({
				type: "personalized_signup_completed",
				context: context?.key,
				preferences: selectedPreferences,
				steps_completed: onboardingSteps.length,
				timestamp: Date.now(),
			});

			onComplete &&
				onComplete({
					preferences: selectedPreferences,
					context: context,
				});
		}
	};

	// Render step components
	const renderStepComponent = () => {
		const step = onboardingSteps[currentStep];

		switch (step.component) {
			case "welcome":
				return <WelcomeStep context={context} onComplete={handleStepComplete} />;
			case "business-selector":
				return <BusinessTypeSelector onComplete={handleStepComplete} />;
			case "goal-selector":
				return <BusinessGoalsSelector onComplete={handleStepComplete} />;
			case "interest-selector":
				return <InterestSelector context={context} onComplete={handleStepComplete} />;
			case "location-selector":
				return <LocationSelector onComplete={handleStepComplete} />;
			case "activity-selector":
				return <ActivitySelector onComplete={handleStepComplete} />;
			case "neighborhood-selector":
				return <NeighborhoodSelector onComplete={handleStepComplete} />;
			case "local-interest-selector":
				return <LocalInterestSelector onComplete={handleStepComplete} />;
			case "completion":
				return <CompletionStep context={context} preferences={selectedPreferences} onComplete={handleStepComplete} />;
			default:
				return <WelcomeStep context={context} onComplete={handleStepComplete} />;
		}
	};

	const currentStepData = onboardingSteps[currentStep];

	return (
		<div className="w-full max-w-2xl mx-auto space-y-6">
			{/* Progress indicator */}
			<div className="space-y-2">
				<div className="flex justify-between text-sm text-muted-foreground">
					<span>
						Step {currentStep + 1} of {onboardingSteps.length}
					</span>
					<span>{Math.round(progress)}% complete</span>
				</div>
				<Progress value={progress} className="h-2" />
			</div>

			{/* Step content */}
			<Card className="border-2">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
					<p className="text-muted-foreground">{currentStepData.description}</p>
				</CardHeader>
				<CardContent>{renderStepComponent()}</CardContent>
			</Card>

			{/* Navigation */}
			<div className="flex justify-between">
				<Button variant="outline" onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))} disabled={currentStep === 0}>
					Previous
				</Button>

				{currentStep < onboardingSteps.length - 1 && (
					<Button variant="ghost" onClick={() => handleStepComplete({})}>
						Skip <ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				)}
			</div>
		</div>
	);
}

// Individual step components
function WelcomeStep({ context, onComplete }) {
	return (
		<div className="text-center space-y-6">
			<div className="text-6xl">{context?.icon || "👋"}</div>
			<div className="space-y-4">
				<h3 className="text-xl font-semibold">{context?.title || "Welcome to Thorbis!"}</h3>
				<p className="text-muted-foreground max-w-md mx-auto">{context?.message || "We're excited to help you discover and connect with local businesses."}</p>

				{context?.source && (
					<Badge variant="secondary" className="mt-4">
						Coming from: {context.source.replace(/_/g, " ")}
					</Badge>
				)}
			</div>

			<Button onClick={() => onComplete({})} className="w-full max-w-sm">
				Let's get started! <ArrowRight className="ml-2 h-4 w-4" />
			</Button>
		</div>
	);
}

function BusinessTypeSelector({ onComplete }) {
	const businessTypes = [
		{ id: "restaurant", label: "Restaurant/Food", icon: "🍽️" },
		{ id: "retail", label: "Retail/Shopping", icon: "🛍️" },
		{ id: "service", label: "Professional Service", icon: "💼" },
		{ id: "health", label: "Health & Wellness", icon: "⚕️" },
		{ id: "automotive", label: "Automotive", icon: "🚗" },
		{ id: "home", label: "Home & Garden", icon: "🏠" },
		{ id: "entertainment", label: "Entertainment", icon: "🎭" },
		{ id: "other", label: "Other", icon: "📋" },
	];

	const [selected, setSelected] = useState(null);

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
				{businessTypes.map((type) => (
					<button key={type.id} onClick={() => setSelected(type.id)} className={cn("p-4 rounded-lg border-2 transition-colors text-center hover:bg-accent", selected === type.id ? "border-primary bg-primary/10" : "border-border")}>
						<div className="text-2xl mb-2">{type.icon}</div>
						<div className="text-sm font-medium">{type.label}</div>
					</button>
				))}
			</div>

			{selected && (
				<Button onClick={() => onComplete({ businessType: selected })} className="w-full">
					Continue <ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			)}
		</div>
	);
}

function BusinessGoalsSelector({ onComplete }) {
	const goals = [
		{ id: "visibility", label: "Increase visibility", icon: "👁️" },
		{ id: "customers", label: "Attract new customers", icon: "🎯" },
		{ id: "reviews", label: "Get more reviews", icon: "⭐" },
		{ id: "bookings", label: "Manage bookings", icon: "📅" },
		{ id: "analytics", label: "Track performance", icon: "📊" },
		{ id: "marketing", label: "Marketing tools", icon: "📢" },
	];

	const [selected, setSelected] = useState([]);

	const toggleGoal = (goalId) => {
		setSelected((prev) => (prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]));
	};

	return (
		<div className="space-y-6">
			<p className="text-sm text-muted-foreground text-center">Select all that apply</p>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				{goals.map((goal) => (
					<button key={goal.id} onClick={() => toggleGoal(goal.id)} className={cn("p-4 rounded-lg border-2 transition-colors text-left hover:bg-accent flex items-center space-x-3", selected.includes(goal.id) ? "border-primary bg-primary/10" : "border-border")}>
						<span className="text-xl">{goal.icon}</span>
						<span className="font-medium">{goal.label}</span>
						{selected.includes(goal.id) && <CheckCircle className="ml-auto h-5 w-5 text-primary" />}
					</button>
				))}
			</div>

			{selected.length > 0 && (
				<Button onClick={() => onComplete({ businessGoals: selected })} className="w-full">
					Continue ({selected.length} selected) <ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			)}
		</div>
	);
}

function InterestSelector({ context, onComplete }) {
	const interests = [
		{ id: "dining", label: "Dining & Food", icon: "🍴" },
		{ id: "shopping", label: "Shopping", icon: "🛍️" },
		{ id: "entertainment", label: "Entertainment", icon: "🎬" },
		{ id: "health", label: "Health & Fitness", icon: "💪" },
		{ id: "beauty", label: "Beauty & Spa", icon: "💅" },
		{ id: "automotive", label: "Automotive", icon: "🚗" },
		{ id: "home", label: "Home Services", icon: "🔧" },
		{ id: "professional", label: "Professional Services", icon: "💼" },
	];

	const [selected, setSelected] = useState([]);

	const toggleInterest = (interestId) => {
		setSelected((prev) => (prev.includes(interestId) ? prev.filter((id) => id !== interestId) : [...prev, interestId]));
	};

	return (
		<div className="space-y-6">
			<p className="text-sm text-muted-foreground text-center">{context?.key === "search-results" ? "What types of businesses do you usually search for?" : "What types of businesses interest you most?"}</p>

			<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
				{interests.map((interest) => (
					<button key={interest.id} onClick={() => toggleInterest(interest.id)} className={cn("p-3 rounded-lg border-2 transition-colors text-center hover:bg-accent", selected.includes(interest.id) ? "border-primary bg-primary/10" : "border-border")}>
						<div className="text-xl mb-1">{interest.icon}</div>
						<div className="text-xs font-medium">{interest.label}</div>
						{selected.includes(interest.id) && <CheckCircle className="mx-auto mt-1 h-4 w-4 text-primary" />}
					</button>
				))}
			</div>

			{selected.length > 0 && (
				<Button onClick={() => onComplete({ interests: selected })} className="w-full">
					Continue ({selected.length} selected) <ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			)}
		</div>
	);
}

function LocationSelector({ onComplete }) {
	const [location, setLocation] = useState("");
	const [useCurrentLocation, setUseCurrentLocation] = useState(false);

	const getCurrentLocation = () => {
		if (navigator.geolocation) {
			setUseCurrentLocation(true);
			navigator.geolocation.getCurrentPosition(
				(position) => {
					onComplete({
						location: {
							lat: position.coords.latitude,
							lng: position.coords.longitude,
							type: "coordinates",
						},
					});
				},
				() => {
					setUseCurrentLocation(false);
					// Fallback to manual entry
				}
			);
		}
	};

	return (
		<div className="space-y-6">
			<div className="space-y-4">
				<div>
					<label className="block text-sm font-medium mb-2">Enter your location</label>
					<input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State or ZIP code" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
				</div>

				<div className="text-center">
					<p className="text-sm text-muted-foreground mb-3">or</p>
					<Button variant="outline" onClick={getCurrentLocation} disabled={useCurrentLocation} className="w-full">
						<MapPin className="mr-2 h-4 w-4" />
						{useCurrentLocation ? "Getting location..." : "Use current location"}
					</Button>
				</div>
			</div>

			{location && (
				<Button onClick={() => onComplete({ location: { address: location, type: "manual" } })} className="w-full">
					Continue <ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			)}
		</div>
	);
}

function ActivitySelector({ onComplete }) {
	const activities = [
		{ id: "reviews", label: "Writing reviews", icon: "✍️" },
		{ id: "photos", label: "Sharing photos", icon: "📸" },
		{ id: "recommendations", label: "Getting recommendations", icon: "👍" },
		{ id: "events", label: "Finding events", icon: "🎉" },
		{ id: "lists", label: "Creating lists", icon: "📝" },
		{ id: "following", label: "Following businesses", icon: "👥" },
	];

	const [selected, setSelected] = useState([]);

	const toggleActivity = (activityId) => {
		setSelected((prev) => (prev.includes(activityId) ? prev.filter((id) => id !== activityId) : [...prev, activityId]));
	};

	return (
		<div className="space-y-6">
			<p className="text-sm text-muted-foreground text-center">How do you like to engage with businesses?</p>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				{activities.map((activity) => (
					<button key={activity.id} onClick={() => toggleActivity(activity.id)} className={cn("p-4 rounded-lg border-2 transition-colors text-left hover:bg-accent flex items-center space-x-3", selected.includes(activity.id) ? "border-primary bg-primary/10" : "border-border")}>
						<span className="text-xl">{activity.icon}</span>
						<span className="font-medium">{activity.label}</span>
						{selected.includes(activity.id) && <CheckCircle className="ml-auto h-5 w-5 text-primary" />}
					</button>
				))}
			</div>

			{selected.length > 0 && (
				<Button onClick={() => onComplete({ activities: selected })} className="w-full">
					Continue ({selected.length} selected) <ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			)}
		</div>
	);
}

function NeighborhoodSelector({ onComplete }) {
	const [neighborhood, setNeighborhood] = useState("");
	const [interests, setInterests] = useState([]);

	const neighborhoodInterests = [
		{ id: "local_businesses", label: "Local businesses", icon: "🏪" },
		{ id: "community_events", label: "Community events", icon: "🎪" },
		{ id: "local_news", label: "Local news", icon: "📰" },
		{ id: "neighborhood_safety", label: "Safety updates", icon: "🛡️" },
		{ id: "local_groups", label: "Local groups", icon: "👥" },
		{ id: "development", label: "Development updates", icon: "🏗️" },
	];

	const toggleInterest = (interestId) => {
		setInterests((prev) => (prev.includes(interestId) ? prev.filter((id) => id !== interestId) : [...prev, interestId]));
	};

	return (
		<div className="space-y-6">
			<div>
				<label className="block text-sm font-medium mb-2">Your neighborhood</label>
				<input type="text" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="e.g., Downtown, Midtown, Historic District" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
			</div>

			<div>
				<p className="text-sm font-medium mb-3">What neighborhood updates interest you?</p>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
					{neighborhoodInterests.map((interest) => (
						<button key={interest.id} onClick={() => toggleInterest(interest.id)} className={cn("p-3 rounded-lg border transition-colors text-left hover:bg-accent flex items-center space-x-2", interests.includes(interest.id) ? "border-primary bg-primary/10" : "border-border")}>
							<span>{interest.icon}</span>
							<span className="text-sm">{interest.label}</span>
							{interests.includes(interest.id) && <CheckCircle className="ml-auto h-4 w-4 text-primary" />}
						</button>
					))}
				</div>
			</div>

			{(neighborhood || interests.length > 0) && (
				<Button
					onClick={() =>
						onComplete({
							neighborhood: neighborhood || "Not specified",
							neighborhoodInterests: interests,
						})
					}
					className="w-full"
				>
					Continue <ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			)}
		</div>
	);
}

function LocalInterestSelector({ onComplete }) {
	const localInterests = [
		{ id: "farmers_markets", label: "Farmers markets", icon: "🥕" },
		{ id: "local_festivals", label: "Local festivals", icon: "🎭" },
		{ id: "outdoor_activities", label: "Outdoor activities", icon: "🏃" },
		{ id: "art_culture", label: "Arts & culture", icon: "🎨" },
		{ id: "food_scene", label: "Local food scene", icon: "🍴" },
		{ id: "nightlife", label: "Nightlife", icon: "🌙" },
		{ id: "family_activities", label: "Family activities", icon: "👨‍👩‍👧‍👦" },
		{ id: "sports_recreation", label: "Sports & recreation", icon: "⚽" },
	];

	const [selected, setSelected] = useState([]);

	const toggleInterest = (interestId) => {
		setSelected((prev) => (prev.includes(interestId) ? prev.filter((id) => id !== interestId) : [...prev, interestId]));
	};

	return (
		<div className="space-y-6">
			<p className="text-sm text-muted-foreground text-center">What local activities and events interest you?</p>

			<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
				{localInterests.map((interest) => (
					<button key={interest.id} onClick={() => toggleInterest(interest.id)} className={cn("p-3 rounded-lg border-2 transition-colors text-center hover:bg-accent", selected.includes(interest.id) ? "border-primary bg-primary/10" : "border-border")}>
						<div className="text-xl mb-1">{interest.icon}</div>
						<div className="text-xs font-medium">{interest.label}</div>
						{selected.includes(interest.id) && <CheckCircle className="mx-auto mt-1 h-4 w-4 text-primary" />}
					</button>
				))}
			</div>

			{selected.length > 0 && (
				<Button onClick={() => onComplete({ localInterests: selected })} className="w-full">
					Continue ({selected.length} selected) <ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			)}
		</div>
	);
}

function CompletionStep({ context, preferences, onComplete }) {
	const getPersonalizedMessage = () => {
		if (context?.category === "business") {
			return "Your business dashboard is ready! Start managing your presence and connecting with customers.";
		}
		if (context?.category === "discovery") {
			return "We've personalized your experience based on your interests. Start exploring businesses that match your preferences!";
		}
		if (context?.category === "local") {
			return "You're now connected to your local community. Discover neighborhood businesses and events!";
		}
		return "Your personalized Thorbis experience is ready! Start exploring and connecting with local businesses.";
	};

	const getNextSteps = () => {
		if (context?.category === "business") {
			return ["Complete your business profile", "Add photos and descriptions", "Start responding to customer reviews", "Set up booking options"];
		}
		if (context?.category === "discovery") {
			return ["Browse personalized recommendations", "Save businesses you're interested in", "Write your first review", "Create custom business lists"];
		}
		return ["Explore local businesses", "Save your favorites", "Join the community", "Get personalized recommendations"];
	};

	return (
		<div className="text-center space-y-6">
			<div className="space-y-4">
				<div className="text-6xl">🎉</div>
				<h3 className="text-xl font-semibold">Welcome to your personalized Thorbis!</h3>
				<p className="text-muted-foreground max-w-md mx-auto">{getPersonalizedMessage()}</p>
			</div>

			<div className="bg-accent/50 rounded-lg p-4">
				<h4 className="font-medium mb-3">Your next steps:</h4>
				<div className="space-y-2">
					{getNextSteps().map((step, index) => (
						<div key={index} className="flex items-center space-x-2 text-sm">
							<CheckCircle className="h-4 w-4 text-success" />
							<span>{step}</span>
						</div>
					))}
				</div>
			</div>

			<Button onClick={() => onComplete({})} className="w-full max-w-sm">
				<Sparkles className="mr-2 h-4 w-4" />
				{context?.actionText || "Start Exploring"}
			</Button>
		</div>
	);
}
