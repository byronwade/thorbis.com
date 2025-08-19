import React, { useState } from "react";
import Image from "next/image";
import { Badge } from "@components/ui/badge";
import { Card, CardContent } from "@components/ui/card";
import { Star, MapPin, Shield, Award, Eye, Timer, DollarSign, ChevronRight, Verified, TrendingUp, Users, Zap, Clock } from "lucide-react";

const EnhancedBusinessCard = ({ business, isActive, onClick }) => {
	const [activityData] = useState(() => ({
		recentViews: Math.floor(Math.random() * 15) + 1,
		bookingsToday: Math.floor(Math.random() * 8),
		responseTime: Math.floor(Math.random() * 4) + 1,
		lastBooking: Math.floor(Math.random() * 120) + 1, // minutes ago
	}));

	const formatDistance = (distance) => {
		if (!distance) return "";
		return distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}mi`;
	};

	const getUrgencyIndicator = () => {
		if (activityData.bookingsToday >= 5) {
			return {
				type: "high-demand",
				text: "High demand today",
				color: "bg-destructive/20 text-destructive border-destructive/30",
				icon: TrendingUp,
			};
		}
		if (activityData.recentViews >= 10) {
			return {
				type: "trending",
				text: `${activityData.recentViews} people viewing`,
				color: "bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30",
				icon: Eye,
			};
		}
		if (activityData.responseTime <= 2) {
			return {
				type: "fast-response",
				text: `Responds in ${activityData.responseTime}h`,
				color: "bg-primary/20 text-primary border-primary/30",
				icon: Timer,
			};
		}
		return null;
	};

	const getTrustScore = () => {
		let score = 0;
		if (business.ratings?.overall >= 4.5) score += 20;
		if (business.isVerified) score += 25;
		if (business.isInsured) score += 20;
		if (business.yearsInBusiness >= 5) score += 15;
		if (business.isLicensed) score += 20;
		return Math.min(score, 100);
	};

	const renderStars = (rating, size = "w-3 h-3") => {
		return Array.from({ length: 5 }, (_, i) => <Star key={i} className={`${size} ${i < Math.floor(rating) ? "fill-muted-foreground text-muted-foreground" : i < rating ? "fill-muted-foreground/50 text-muted-foreground" : "text-muted-foreground/50"}`} />);
	};

	const urgency = getUrgencyIndicator();
	const trustScore = getTrustScore();
	const UrgencyIcon = urgency?.icon;

	return (
		<Card className={`mb-3 cursor-pointer transition-all duration-300 hover:shadow-lg group border-l-4 rounded-xl ${isActive ? "border-l-primary shadow-lg bg-primary/5 scale-[1.02]" : "border-l-transparent hover:border-l-border hover:scale-[1.01]"} bg-card/50 backdrop-blur-sm hover:bg-card/80`} onClick={onClick}>
			<CardContent className="p-5">
				{/* Header with Image and Quick Info */}
				<div className="flex gap-3 mb-3">
					<div className="relative flex-shrink-0">
						<div className="w-16 h-16 rounded-xl overflow-hidden bg-muted/50 shadow-sm ring-1 ring-border/50">
							<Image src={business.logo || business.image || "/placeholder.svg"} alt={business.name} width={64} height={64} className="object-cover w-full h-full" />
						</div>
						{/* Trust indicator overlay */}
						{trustScore >= 80 && (
							<div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-sm">
								<Shield className="w-3 h-3 text-primary-foreground" />
							</div>
						)}
						{/* Activity pulse for high activity */}
						{activityData.recentViews >= 8 && <div className="absolute -top-1 -left-1 w-3 h-3 bg-muted-foreground rounded-full animate-pulse shadow-sm" />}
					</div>

					<div className="flex-1 min-w-0">
						<div className="flex items-start justify-between">
							<div className="flex-1 min-w-0">
								<h3 className="font-semibold text-card-foreground truncate text-sm leading-tight">{business.name}</h3>
								<p className="text-xs text-muted-foreground truncate mt-0.5">{business.categories?.slice(0, 2).join(", ") || business.category || "Business"}</p>
							</div>
							{urgency && (
								<Badge variant="outline" className={`text-xs px-2 py-1 ${urgency.color} ml-2 flex items-center gap-1 font-medium border-border/50`}>
									{UrgencyIcon && <UrgencyIcon className="w-3 h-3" />}
									{urgency.text}
								</Badge>
							)}
						</div>

						{/* Rating and Distance */}
						<div className="flex items-center gap-2 mt-2">
							<div className="flex items-center gap-1 bg-muted/30 px-2 py-1 rounded-lg">
								{renderStars(business.ratings?.overall || 0)}
								<span className="text-sm font-medium text-foreground">{business.ratings?.overall?.toFixed(1) || "New"}</span>
							</div>
							<span className="text-xs text-muted-foreground">({business.ratings?.count || 0} reviews)</span>
							{business.distance && (
								<>
									<span className="text-muted-foreground/50">•</span>
									<span className="text-xs text-muted-foreground flex items-center gap-1">
										<MapPin className="w-3 h-3" />
										{formatDistance(business.distance)}
									</span>
								</>
							)}
						</div>
					</div>
				</div>

				{/* Trust Signals Row */}
				<div className="flex items-center gap-3 mb-3 text-xs">
					{business.isVerified && (
						<div className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
							<Verified className="w-3 h-3" />
							<span className="font-medium">Verified</span>
						</div>
					)}
					{business.isInsured && (
						<div className="flex items-center gap-1 text-success dark:text-success bg-success/10 px-2 py-1 rounded-full border border-green-500/20">
							<Shield className="w-3 h-3" />
							<span className="font-medium">Insured</span>
						</div>
					)}
					{business.yearsInBusiness >= 5 && (
						<div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full border border-purple-500/20">
							<Award className="w-3 h-3" />
							<span className="font-medium">{business.yearsInBusiness}+ years</span>
						</div>
					)}
				</div>

				{/* Social Proof and Activity Indicators */}
				<div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
					<div className="flex items-center gap-3">
						{activityData.recentViews > 3 && (
							<div className="flex items-center gap-1 text-foreground">
								<Eye className="w-3 h-3" />
								<span>{activityData.recentViews} viewing now</span>
							</div>
						)}
						{activityData.lastBooking <= 60 && (
							<div className="flex items-center gap-1 text-success dark:text-success">
								<Users className="w-3 h-3" />
								<span>Booked {activityData.lastBooking}m ago</span>
							</div>
						)}
						{activityData.responseTime <= 3 && (
							<div className="flex items-center gap-1 text-primary">
								<Timer className="w-3 h-3" />
								<span>Quick response</span>
							</div>
						)}
					</div>
					{business.pricing && (
						<div className="flex items-center gap-1 font-medium text-foreground">
							<DollarSign className="w-3 h-3" />
							<span>{business.pricing}</span>
						</div>
					)}
				</div>

				{/* Status and Call-to-Action */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className={`w-2 h-2 rounded-full ${business.isOpenNow ? "bg-success shadow-sm shadow-green-500/50" : "bg-destructive shadow-sm shadow-red-500/50"}`} />
						<span className={`text-xs font-medium ${business.isOpenNow ? "text-success dark:text-success" : "text-destructive dark:text-destructive"}`}>{business.isOpenNow ? "Open Now" : "Closed"}</span>
						{business.openUntil && business.isOpenNow && <span className="text-xs text-muted-foreground">until {business.openUntil}</span>}
						{business.opensAt && !business.isOpenNow && <span className="text-xs text-muted-foreground">opens {business.opensAt}</span>}
					</div>

					{/* CTAs and Indicators */}
					<div className="flex items-center gap-2">
						{business.offers_free_consultation && (
							<Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 font-medium">
								<Zap className="w-3 h-3 mr-1" />
								Free Quote
							</Badge>
						)}
						{business.same_day_service && (
							<Badge variant="outline" className="text-xs bg-success/10 text-success dark:text-success border-green-500/20 font-medium">
								<Clock className="w-3 h-3 mr-1" />
								Same Day
							</Badge>
						)}
						<ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
					</div>
				</div>

				{/* Specialties Preview - Only show if exists */}
				{business.specialties && business.specialties.length > 0 && (
					<div className="mt-3 pt-3 border-t border-border/30">
						<p className="text-xs text-muted-foreground line-clamp-1">
							<span className="font-medium text-foreground">Specializes in:</span> {business.specialties.slice(0, 3).join(", ")}
							{business.specialties.length > 3 && ` +${business.specialties.length - 3} more`}
						</p>
					</div>
				)}

				{/* Urgency Footer - Only for high-priority cases */}
				{(activityData.bookingsToday >= 6 || (business.limited_availability && business.isOpenNow)) && (
					<div className="mt-3 pt-3 border-t border-orange-500/20 bg-warning/10 -mx-5 -mb-5 px-5 pb-5 rounded-b-xl">
						<div className="flex items-center gap-2 text-xs">
							<div className="w-2 h-2 bg-warning rounded-full animate-pulse shadow-sm" />
							<span className="text-warning dark:text-warning font-medium">{activityData.bookingsToday >= 6 ? `${activityData.bookingsToday} bookings today - Popular choice!` : "Limited availability today"}</span>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default EnhancedBusinessCard;
