// REQUIRED: User Guidance Component
// Provides helpful, non-intrusive guidance for users of all skill levels

"use client";

import { useState, useEffect } from "react";
import { X, Lightbulb, Shield, Clock, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@utils";
import { Button } from "@components/ui/button";

/**
 * Smart Help System that adapts to user behavior
 */
export function SmartHelp({
	context = "login",
	userSkillLevel = "auto", // auto, beginner, intermediate, advanced
	className = "",
}) {
	const [isVisible, setIsVisible] = useState(false);
	const [expandedTips, setExpandedTips] = useState(new Set());
	const [userInteractions, setUserInteractions] = useState(0);
	const [detectedSkillLevel, setDetectedSkillLevel] = useState("intermediate");

	// Auto-detect user skill level based on behavior
	useEffect(() => {
		const detectSkillLevel = () => {
			const hasSeenHelp = localStorage.getItem("hasSeenHelp");
			const errorCount = parseInt(sessionStorage.getItem("loginAttempts") || "0");
			const timeOnPage = Date.now() - parseInt(sessionStorage.getItem("pageStartTime") || Date.now().toString());

			// Scoring system for skill detection
			let skillScore = 50; // Start neutral

			// Factors that suggest beginner level
			if (!hasSeenHelp) skillScore -= 20;
			if (errorCount > 1) skillScore -= 15;
			if (timeOnPage > 30000) skillScore -= 10; // More than 30 seconds

			// Factors that suggest advanced level
			if (userInteractions > 5) skillScore += 15;
			if (timeOnPage < 10000) skillScore += 10; // Less than 10 seconds

			if (skillScore < 30) setDetectedSkillLevel("beginner");
			else if (skillScore > 70) setDetectedSkillLevel("advanced");
			else setDetectedSkillLevel("intermediate");
		};

		const timer = setTimeout(detectSkillLevel, 5000); // Detect after 5 seconds
		return () => clearTimeout(timer);
	}, [userInteractions]);

	// Show help automatically for beginners
	useEffect(() => {
		if ((userSkillLevel === "auto" ? detectedSkillLevel : userSkillLevel) === "beginner") {
			const timer = setTimeout(() => setIsVisible(true), 3000);
			return () => clearTimeout(timer);
		}
	}, [detectedSkillLevel, userSkillLevel]);

	const skillLevel = userSkillLevel === "auto" ? detectedSkillLevel : userSkillLevel;

	const helpContent = {
		login: {
			beginner: {
				title: "Need help signing in?",
				tips: [
					{
						icon: <HelpCircle className="w-4 h-4" />,
						title: "Finding your email",
						content: "Use the same email address you used when you first created your account. This is usually your personal email like yourname@gmail.com",
						expandable: true,
					},
					{
						icon: <Shield className="w-4 h-4" />,
						title: "About your password",
						content: "Your password is case-sensitive, which means capital and lowercase letters matter. Make sure Caps Lock is off.",
						expandable: true,
					},
					{
						icon: <Clock className="w-4 h-4" />,
						title: "Stay signed in",
						content: 'Check "Keep me signed in" if this is your personal device. This will save time on future visits.',
						expandable: true,
					},
				],
			},
			intermediate: {
				title: "Quick help",
				tips: [
					{
						icon: <Shield className="w-4 h-4" />,
						title: "Security notice",
						content: "We use advanced security to protect your account. You may see additional verification steps.",
						expandable: false,
					},
					{
						icon: <HelpCircle className="w-4 h-4" />,
						title: "Trouble signing in?",
						content: 'Use the "Forgot password?" link if you can\'t remember your password.',
						expandable: false,
					},
				],
			},
			advanced: {
				title: "Security info",
				tips: [
					{
						icon: <Shield className="w-4 h-4" />,
						title: "Enhanced security active",
						content: "Device fingerprinting and breach detection are enabled for your protection.",
						expandable: false,
					},
				],
			},
		},
	};

	const currentContent = helpContent[context]?.[skillLevel];
	if (!currentContent) return null;

	const toggleTip = (index) => {
		const newExpanded = new Set(expandedTips);
		if (newExpanded.has(index)) {
			newExpanded.delete(index);
		} else {
			newExpanded.add(index);
		}
		setExpandedTips(newExpanded);
		setUserInteractions((prev) => prev + 1);
	};

	const handleDismiss = () => {
		setIsVisible(false);
		localStorage.setItem("hasSeenHelp", "true");
		setUserInteractions((prev) => prev + 1);
	};

	if (!isVisible) {
		return (
			<Button variant="ghost" size="sm" onClick={() => setIsVisible(true)} className="fixed bottom-4 right-4 z-50 bg-background/80 backdrop-blur-sm border shadow-lg">
				<HelpCircle className="w-4 h-4 mr-2" />
				Need help?
			</Button>
		);
	}

	return (
		<div className={cn("fixed bottom-4 right-4 z-50 w-80 bg-background border shadow-lg rounded-lg p-4", "animate-in slide-in-from-bottom-2 duration-300", className)}>
			{/* Header */}
			<div className="flex items-center justify-between mb-3">
				<div className="flex items-center space-x-2">
					<Lightbulb className="w-5 h-5 text-primary" />
					<h3 className="font-semibold text-foreground">{currentContent.title}</h3>
				</div>
				<Button variant="ghost" size="sm" onClick={handleDismiss} className="h-8 w-8 p-0">
					<X className="w-4 h-4" />
				</Button>
			</div>

			{/* Tips */}
			<div className="space-y-3">
				{currentContent.tips.map((tip, index) => (
					<div key={index} className="border rounded-lg p-3">
						<div className={cn("flex items-start space-x-3", tip.expandable && "cursor-pointer")} onClick={() => tip.expandable && toggleTip(index)}>
							<div className="text-primary mt-0.5">{tip.icon}</div>
							<div className="flex-1">
								<div className="flex items-center justify-between">
									<h4 className="font-medium text-sm text-foreground">{tip.title}</h4>
									{tip.expandable && <div className="ml-2">{expandedTips.has(index) ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}</div>}
								</div>
								{(!tip.expandable || expandedTips.has(index)) && <p className="text-sm text-muted-foreground mt-1">{tip.content}</p>}
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Footer */}
			<div className="mt-4 pt-3 border-t text-center">
				<p className="text-xs text-muted-foreground">
					Still need help?{" "}
					<a href="/support" className="text-primary hover:underline">
						Contact support
					</a>
				</p>
			</div>
		</div>
	);
}

/**
 * Contextual Tooltips for specific elements
 */
export function ContextualTooltip({
	children,
	content,
	trigger = "hover",
	position = "top",
	showFor = "all", // all, beginner, intermediate, advanced
	className = "",
}) {
	const [isVisible, setIsVisible] = useState(false);
	const [userSkillLevel] = useState("intermediate"); // Would come from context

	// Don't show for advanced users unless specifically requested
	if (showFor !== "all" && showFor !== userSkillLevel) {
		return children;
	}

	const handleTrigger = () => {
		if (trigger === "click") {
			setIsVisible(!isVisible);
		}
	};

	const handleMouseEnter = () => {
		if (trigger === "hover") {
			setIsVisible(true);
		}
	};

	const handleMouseLeave = () => {
		if (trigger === "hover") {
			setIsVisible(false);
		}
	};

	return (
		<div className="relative inline-block" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={handleTrigger}>
			{children}

			{isVisible && (
				<div className={cn("absolute z-50 px-3 py-2 text-sm bg-background border shadow-lg rounded-md", "animate-in fade-in-0 zoom-in-95 duration-200", position === "top" && "bottom-full mb-2 left-1/2 transform -translate-x-1/2", position === "bottom" && "top-full mt-2 left-1/2 transform -translate-x-1/2", position === "left" && "right-full mr-2 top-1/2 transform -translate-y-1/2", position === "right" && "left-full ml-2 top-1/2 transform -translate-y-1/2", className)}>
					<div className="max-w-xs text-foreground">{content}</div>
				</div>
			)}
		</div>
	);
}

/**
 * Progress Indicator for multi-step processes
 */
export function StepProgress({ currentStep, totalSteps, steps = [], showLabels = true, className = "" }) {
	return (
		<div className={cn("w-full", className)}>
			{/* Progress Bar */}
			<div className="flex items-center justify-between mb-4">
				{Array.from({ length: totalSteps }, (_, index) => {
					const stepNumber = index + 1;
					const isActive = stepNumber === currentStep;
					const isCompleted = stepNumber < currentStep;

					return (
						<div key={stepNumber} className="flex items-center">
							{/* Step Circle */}
							<div className={cn("w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium", isCompleted && "bg-success border-green-500 text-white", isActive && "border-primary text-primary bg-primary/10", !isActive && !isCompleted && "border-muted-foreground text-muted-foreground")}>{isCompleted ? "✓" : stepNumber}</div>

							{/* Connector Line */}
							{index < totalSteps - 1 && <div className={cn("h-0.5 w-12 mx-2", stepNumber < currentStep ? "bg-success" : "bg-muted")} />}
						</div>
					);
				})}
			</div>

			{/* Step Labels */}
			{showLabels && steps.length > 0 && (
				<div className="flex justify-between text-sm">
					{steps.map((step, index) => (
						<div key={index} className={cn("text-center flex-1", index + 1 === currentStep ? "text-primary font-medium" : "text-muted-foreground")}>
							{step}
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default {
	SmartHelp,
	ContextualTooltip,
	StepProgress,
};
