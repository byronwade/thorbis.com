import React from "react";
import { Badge } from "@components/ui/badge";
import { Building, Sparkles, CheckCircle } from "lucide-react";

export default function BusinessOverview({ business }) {
	// Ultra-defensive programming: ensure business object exists and has all required properties
	if (!business) {
		console.warn("BusinessOverview: business prop is null or undefined");
		return null;
	}

	// Create safe accessors for all potentially undefined properties with enhanced defensive programming
	const safeServiceArea = business?.serviceArea || {};
	const safeBusinessHighlights = business?.businessHighlights || [];
	const safeDescription = business?.description || "No description available";
	const safeEstablished = business?.established;
	const safeEmployees = business?.employees;
	const safeResponseTime = business?.responseTime;
	const safeResponseRate = business?.responseRate;

	// Additional safety checks for nested properties
	const hasServiceArea = safeServiceArea && typeof safeServiceArea === "object";
	const serviceAreaPrimary = hasServiceArea ? safeServiceArea.primary : null;
	const serviceAreaCoverage = hasServiceArea ? safeServiceArea.coverage : null;
	const serviceAreaCities = hasServiceArea && Array.isArray(safeServiceArea.cities) ? safeServiceArea.cities : [];

	return (
		<section className="scroll-mt-20 sm:scroll-mt-24 lg:scroll-mt-32">
			<div className="mb-6 sm:mb-8 md:mb-12">
				<h2 className="flex items-center mb-3 text-2xl font-bold sm:text-3xl md:text-4xl text-foreground">
					<Building className="mr-3 w-6 h-6 sm:w-8 sm:h-8 sm:mr-4 text-primary" />
					Business Overview
				</h2>
				<div className="w-20 h-1 bg-gradient-to-r rounded-full sm:w-24 sm:h-1.5 from-primary to-primary/50"></div>
			</div>
			<div className="space-y-6 sm:space-y-8">
				<div className="p-6 rounded-xl border backdrop-blur-sm bg-card/50 border-border sm:p-8">
					<div className="flex items-start space-x-4">
						<div className="flex flex-shrink-0 justify-center items-center w-8 h-8 rounded-full sm:w-10 sm:h-10 bg-primary/10">
							<Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
						</div>
						<div className="space-y-2 sm:space-y-3">
							<h3 className="text-lg font-semibold sm:text-xl text-foreground">AI Insights</h3>
							<p className="text-sm leading-relaxed sm:text-base text-muted-foreground">This business has consistently high ratings for quality work and customer service. Customers frequently mention their professionalism, reliability, and quick response times for emergency services.</p>
						</div>
					</div>
				</div>
				<div className="space-y-6">
					<h3 className="text-xl font-semibold sm:text-2xl text-foreground">About This Business</h3>
					<p className="text-base leading-relaxed text-muted-foreground sm:text-lg">{safeDescription}</p>
					<div className="grid grid-cols-2 gap-4 p-6 rounded-xl border lg:grid-cols-4 bg-card/30 border-border">
						{safeEstablished && (
							<div className="text-center">
								<div className="text-2xl font-bold text-foreground">{safeEstablished}</div>
								<div className="text-sm text-muted-foreground">Established</div>
							</div>
						)}
						{safeEmployees && (
							<div className="text-center">
								<div className="text-2xl font-bold text-foreground">{safeEmployees}</div>
								<div className="text-sm text-muted-foreground">Team Size</div>
							</div>
						)}
						{safeResponseTime && (
							<div className="text-center">
								<div className="text-2xl font-bold text-foreground">{safeResponseTime}</div>
								<div className="text-sm text-muted-foreground">Response Time</div>
							</div>
						)}
						{safeResponseRate && (
							<div className="text-center">
								<div className="text-2xl font-bold text-foreground">{safeResponseRate}%</div>
								<div className="text-sm text-muted-foreground">Response Rate</div>
							</div>
						)}
					</div>
					{serviceAreaPrimary && (
						<div className="p-4 rounded-lg border bg-card/30 border-border">
							<h4 className="mb-3 font-medium text-foreground">Service Area</h4>
							<div className="space-y-2">
								{serviceAreaPrimary && (
									<p className="text-sm text-muted-foreground">
										Primary: <span className="font-medium text-foreground">{serviceAreaPrimary}</span>
									</p>
								)}
								{serviceAreaCoverage && (
									<p className="text-sm text-muted-foreground">
										Coverage: <span className="font-medium text-foreground">{serviceAreaCoverage}</span>
									</p>
								)}
								{serviceAreaCities.length > 0 && (
									<div className="flex flex-wrap gap-2 mt-3">
										{serviceAreaCities.map((city, index) => (
											<Badge key={index} variant="secondary" className="bg-muted text-foreground">
												{city}
											</Badge>
										))}
									</div>
								)}
							</div>
						</div>
					)}
				</div>
				{safeBusinessHighlights.length > 0 && (
					<div className="space-y-4 sm:space-y-6">
						<h3 className="text-xl font-semibold sm:text-2xl text-foreground">Why Choose Us</h3>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
							{safeBusinessHighlights.map((highlight, index) => (
								<div key={index} className="flex items-start p-4 space-x-3 rounded-lg border bg-card/30 border-border sm:p-5">
									<CheckCircle className="flex-shrink-0 mt-0.5 w-4 h-4 text-success sm:w-5 sm:h-5 sm:mt-0" />
									<span className="text-sm leading-relaxed break-words sm:text-base text-foreground">{highlight}</span>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</section>
	);
}
