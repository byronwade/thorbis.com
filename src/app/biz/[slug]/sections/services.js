import React from "react";
import { CheckCircle, Heart } from "lucide-react";
import Image from "next/image";

export default function Services({ business }) {
	// Defensive programming: ensure business object exists and has all required properties
	if (!business) {
		console.warn("Services: business prop is null or undefined");
		return null;
	}

	// Create safe accessors for all potentially undefined properties
	const safeDetailedServices = business?.detailedServices || [];
	const safeBusinessUpdates = business?.businessUpdates || [];
	const safeCommunityInvolvement = business?.communityInvolvement || [];

	return (
		<section className="scroll-mt-20 sm:scroll-mt-24 lg:scroll-mt-32">
			<div className="mb-8">
				<h2 className="flex items-center mb-2 text-2xl font-bold text-foreground">
					<CheckCircle className="w-6 h-6 mr-3 text-primary" />
					Services & Work Showcase
				</h2>
				<div className="w-20 h-1 rounded-full bg-gradient-to-r from-primary to-primary/50"></div>
			</div>

			<div className="space-y-8">
				{/* Services Overview */}
				{safeDetailedServices.length > 0 && (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-foreground">Our Services</h3>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{safeDetailedServices.map((service, index) => (
								<div key={index} className="flex items-start p-3 space-x-3 border rounded-lg bg-card/30 border-border">
									<CheckCircle className="flex-shrink-0 mt-0.5 w-4 h-4 text-primary" />
									<span className="text-sm leading-relaxed break-words text-foreground">{service}</span>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Business Updates */}
				{safeBusinessUpdates.length > 0 && (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-foreground">Recent Updates</h3>
						<div className="space-y-4">
							{safeBusinessUpdates.map((update) => (
								<div key={update.id} className="p-4 border rounded-xl bg-card/30 border-border">
									<div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
										<div className="relative w-full h-32 sm:w-16 sm:h-16 sm:flex-shrink-0">
											<Image src={update.image} alt={update.title} fill className="object-cover rounded-lg" sizes="(max-width: 640px) 100vw, 64px" />
										</div>
										<div className="flex-1 min-w-0 space-y-1">
											<h4 className="font-medium leading-snug break-words text-foreground">{update.title}</h4>
											<p className="text-sm leading-relaxed break-words text-muted-foreground">{update.content}</p>
											<p className="text-xs text-muted-foreground">{update.date}</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Community Involvement */}
				{safeCommunityInvolvement.length > 0 && (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-foreground">Community Involvement</h3>
						<div className="space-y-2">
							{safeCommunityInvolvement.map((involvement, index) => (
								<div key={index} className="flex items-center space-x-2">
									<Heart className="flex-shrink-0 w-4 h-4 text-destructive" />
									<span className="text-sm text-foreground">{involvement.activity}</span>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</section>
	);
}
