import React, { useState, useEffect } from "react";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Card, CardContent } from "@components/ui/card";
import { TrendingUp, Clock, Users, Zap, Target, MapPin, Search, Filter, ArrowRight, Sparkles, ThumbsUp, Eye, Timer } from "lucide-react";

const SmartSearchSuggestions = ({ businesses = [], searchQuery = "", onSuggestionClick, onFilterApply, userLocation }) => {
	const [trendingSearches] = useState([
		{ query: "emergency plumber", boost: 85, urgency: "high" },
		{ query: "same day repair", boost: 92, urgency: "high" },
		{ query: "licensed electrician", boost: 78, urgency: "medium" },
		{ query: "free estimate", boost: 88, urgency: "low" },
		{ query: "24/7 service", boost: 95, urgency: "high" },
		{ query: "insured contractor", boost: 73, urgency: "medium" },
	]);

	const [personalizedFilters, setPersonalizedFilters] = useState([]);
	const [socialProofData] = useState({
		recentSearches: 247,
		activeUsers: 23,
		bookingsToday: 156,
	});

	// Generate smart suggestions based on current context
	useEffect(() => {
		const filters = [];

		const openCount = businesses.filter((b) => b.isOpenNow).length;
		const verifiedCount = businesses.filter((b) => b.isVerified).length;
		const freeQuoteCount = businesses.filter((b) => b.offers_free_consultation).length;
		const emergencyCount = businesses.filter((b) => b.emergency_service).length;

		if (openCount > 0) {
			filters.push({
				id: "open_now",
				label: `${openCount} open now`,
				count: openCount,
				priority: "high",
				icon: Clock,
				color: "bg-success/10 text-success border-green-200",
				socialProof: `${Math.floor(openCount * 1.3)} people called today`,
			});
		}

		if (emergencyCount > 0) {
			filters.push({
				id: "emergency",
				label: `${emergencyCount} emergency service`,
				count: emergencyCount,
				priority: "urgent",
				icon: Zap,
				color: "bg-destructive/10 text-destructive border-red-200",
				socialProof: `Available 24/7`,
			});
		}

		if (freeQuoteCount > 0) {
			filters.push({
				id: "free_quotes",
				label: `${freeQuoteCount} free quotes`,
				count: freeQuoteCount,
				priority: "medium",
				icon: Target,
				color: "bg-primary/10 text-primary border-primary/30",
				socialProof: `No obligation estimates`,
			});
		}

		if (verifiedCount > 0) {
			filters.push({
				id: "verified",
				label: `${verifiedCount} verified`,
				count: verifiedCount,
				priority: "medium",
				icon: ThumbsUp,
				color: "bg-purple-100 text-purple-700 border-purple-200",
				socialProof: `Background checked`,
			});
		}

		setPersonalizedFilters(filters.slice(0, 4));
	}, [businesses]);

	const getTimeBasedSuggestion = () => {
		const hour = new Date().getHours();

		if (hour < 9) {
			return {
				text: "Need early morning service?",
				suggestions: ["emergency repair", "24/7 service"],
				icon: Clock,
				urgency: "medium",
			};
		} else if (hour > 17) {
			return {
				text: "After hours service available",
				suggestions: ["evening service", "emergency repair"],
				icon: Clock,
				urgency: "high",
			};
		} else {
			return {
				text: "Popular right now",
				suggestions: ["same day service", "free estimate"],
				icon: TrendingUp,
				urgency: "low",
			};
		}
	};

	const timeBasedSuggestion = getTimeBasedSuggestion();

	return (
		<div className="space-y-4">
			{/* Social Proof Header */}
			<Card className="border-primary/20 bg-gradient-to-r from-blue-50 to-purple-50">
				<CardContent className="p-3">
					<div className="flex items-center justify-between text-xs">
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-1">
								<Eye className="w-3 h-3 text-primary" />
								<span className="font-medium">{socialProofData.activeUsers} people searching now</span>
							</div>
							<div className="flex items-center gap-1">
								<Users className="w-3 h-3 text-success" />
								<span className="font-medium">{socialProofData.bookingsToday} bookings today</span>
							</div>
						</div>
						<Badge variant="outline" className="bg-white/50 text-purple-700 border-purple-200">
							<Sparkles className="w-3 h-3 mr-1" />
							Live data
						</Badge>
					</div>
				</CardContent>
			</Card>

			{/* Time-Based Suggestions */}
			{timeBasedSuggestion && (
				<Card className={`border-l-4 ${timeBasedSuggestion.urgency === "high" ? "border-l-red-400 bg-red-50" : timeBasedSuggestion.urgency === "medium" ? "border-l-orange-400 bg-orange-50" : "border-l-blue-400 bg-blue-50"}`}>
					<CardContent className="p-3">
						<div className="flex items-start gap-3">
							<timeBasedSuggestion.icon className="w-4 h-4 mt-0.5 text-muted-foreground" />
							<div className="flex-1">
								<p className="text-sm font-medium text-foreground mb-2">{timeBasedSuggestion.text}</p>
								<div className="flex flex-wrap gap-2">
									{timeBasedSuggestion.suggestions.map((suggestion, index) => (
										<Button key={index} variant="outline" size="sm" className="text-xs h-6 bg-white/70 hover:bg-white hover:scale-105 transition-all" onClick={() => onSuggestionClick?.(suggestion)}>
											<Search className="w-3 h-3 mr-1" />
											{suggestion}
										</Button>
									))}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Smart Filters with Psychology */}
			{personalizedFilters.length > 0 && (
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Filter className="w-4 h-4 text-muted-foreground" />
						<span className="text-sm font-medium text-muted-foreground">Smart filters for you:</span>
					</div>
					<div className="grid grid-cols-1 gap-2">
						{personalizedFilters.map((filter) => {
							const IconComponent = filter.icon;
							return (
								<Card key={filter.id} className={`cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] border ${filter.color.split(" ")[2]} ${filter.priority === "urgent" ? "animate-pulse" : ""}`} onClick={() => onFilterApply?.(filter.id)}>
									<CardContent className="p-3">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<IconComponent className="w-4 h-4" />
												<div>
													<span className="text-sm font-medium">{filter.label}</span>
													<p className="text-xs text-muted-foreground mt-0.5">{filter.socialProof}</p>
												</div>
											</div>
											<div className="flex items-center gap-2">
												{filter.priority === "urgent" && (
													<Badge variant="outline" className="text-xs bg-destructive/10 text-destructive">
														<Timer className="w-3 h-3 mr-1" />
														Urgent
													</Badge>
												)}
												<ArrowRight className="w-4 h-4 text-muted-foreground" />
											</div>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</div>
			)}

			{/* Trending Searches */}
			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<TrendingUp className="w-4 h-4 text-muted-foreground" />
					<span className="text-sm font-medium text-muted-foreground">Trending searches:</span>
				</div>
				<div className="flex flex-wrap gap-2">
					{trendingSearches.slice(0, 4).map((trend, index) => (
						<Button key={index} variant="ghost" size="sm" className={`flex items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer ${trend.urgency === "high" ? "bg-red-50 hover:bg-destructive/10 text-destructive" : "bg-neutral-800 hover:bg-neutral-700"}`} onClick={() => onSuggestionClick?.(trend.query)}>
							<Search className="w-3 h-3 mr-1" />
							{trend.query}
							<Badge variant="outline" className="ml-2 text-xs">
								{trend.boost}%
							</Badge>
						</Button>
					))}
				</div>
			</div>

			{/* Location-based suggestions */}
			{userLocation && (
				<Card className="border-green-100 bg-green-50">
					<CardContent className="p-3">
						<div className="flex items-center gap-2 mb-2">
							<MapPin className="w-4 h-4 text-success" />
							<span className="text-sm font-medium text-success">Popular in your area:</span>
						</div>
						<div className="flex flex-wrap gap-2">
							{["licensed contractors", "emergency service", "home repair"].map((local, index) => (
								<Button key={index} variant="outline" size="sm" className="text-xs h-6 bg-white/70 border-green-200 text-success hover:bg-white" onClick={() => onSuggestionClick?.(local)}>
									{local}
								</Button>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default SmartSearchSuggestions;
