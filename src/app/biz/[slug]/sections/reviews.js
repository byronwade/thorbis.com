import React from "react";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Star, Home, CheckCircle } from "lucide-react";

export default function Reviews({ business, setShowReviewModal }) {
	// Add defensive checks to prevent undefined errors
	if (!business) {
		return (
			<section className="scroll-mt-20 sm:scroll-mt-24 lg:scroll-mt-32">
				<div className="mb-8 sm:mb-12">
					<h2 className="flex items-center mb-3 text-2xl font-bold sm:text-3xl md:text-4xl text-foreground">
						<Star className="w-6 h-6 mr-3 sm:w-8 sm:h-8 sm:mr-4 text-primary" />
						Reviews & Neighborhood Insights
					</h2>
					<div className="w-20 h-1 bg-gradient-to-r rounded-full sm:w-24 sm:h-1.5 from-primary to-primary/50"></div>
				</div>
				<div className="p-8 text-center text-muted-foreground">Loading reviews...</div>
			</section>
		);
	}

	// Safely extract review data with fallbacks
	const rating = business?.rating || 0;
	const reviewCount = business?.review_count || business?.reviewCount || 0;
	const peerRecommendations = business?.peerRecommendations || business?.peer_recommendations || [];
	const responseRate = business?.responseRate || business?.response_rate || 85;
	const reviews = business?.reviews || [];
	const trustScore = business?.trustScore || business?.trust_score || 90;

	return (
		<section className="scroll-mt-20 sm:scroll-mt-24 lg:scroll-mt-32">
			<div className="mb-8 sm:mb-12">
				<h2 className="flex items-center mb-3 text-2xl font-bold sm:text-3xl md:text-4xl text-foreground">
					<Star className="w-6 h-6 mr-3 sm:w-8 sm:h-8 sm:mr-4 text-primary" />
					Reviews & Neighborhood Insights
				</h2>
				<div className="w-20 h-1 bg-gradient-to-r rounded-full sm:w-24 sm:h-1.5 from-primary to-primary/50"></div>
			</div>

			<div className="space-y-8">
				{/* Modern Review Overview */}
				<div className="relative overflow-hidden border bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-2xl dark:from-yellow-950/20 dark:via-orange-950/20 dark:to-red-950/20 border-yellow-200/50 dark:border-yellow-800/50">
					<div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-orange-400/5"></div>
					<div className="relative p-6 sm:p-8">
						<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
							{/* Left: Main Rating */}
							<div className="text-center lg:text-left">
								<div className="flex items-center justify-center gap-4 lg:justify-start">
									<div className="text-4xl font-bold text-foreground sm:text-5xl">{rating}</div>
									<div className="space-y-2">
										<div className="flex items-center space-x-1">
											{[...Array(5)].map((_, i) => (
												<Star key={i} className={`w-5 h-5 ${i < Math.floor(rating) ? "fill-yellow-400 text-warning" : "text-muted-foreground"}`} />
											))}
										</div>
										<div className="text-sm text-muted-foreground">{reviewCount} reviews</div>
									</div>
								</div>
								<div className="mt-4 lg:mt-6">
									<h3 className="mb-2 text-lg font-semibold text-foreground">Community Trust</h3>
									<div className="flex items-center justify-center gap-3 lg:justify-start">
										<div className="flex items-center gap-2 px-3 py-1 bg-warning/10 rounded-full dark:bg-warning/30">
											<Home className="w-4 h-4 text-warning dark:text-warning" />
											<span className="text-sm font-medium text-warning dark:text-warning/80">{peerRecommendations.length} Neighbors</span>
										</div>
										<div className="flex items-center gap-2 px-3 py-1 bg-success/10 rounded-full dark:bg-success/30">
											<CheckCircle className="w-4 h-4 text-success dark:text-success" />
											<span className="text-sm font-medium text-success dark:text-success/80">{responseRate}% Response</span>
										</div>
									</div>
								</div>
							</div>

							{/* Right: Quick Stats */}
							<div className="grid grid-cols-2 gap-4">
								<div className="p-4 border rounded-xl backdrop-blur-sm bg-card/60 border-border/20">
									<div className="text-2xl font-bold text-primary">{trustScore}%</div>
									<div className="text-sm text-muted-foreground">Trust Score</div>
								</div>
								<div className="p-4 border rounded-xl backdrop-blur-sm bg-card/60 border-border/20">
									<div className="text-2xl font-bold text-primary">{peerRecommendations.length}</div>
									<div className="text-sm text-muted-foreground">Local Reviews</div>
								</div>
								<div className="p-4 border rounded-xl backdrop-blur-sm bg-card/60 border-border/20">
									<div className="text-2xl font-bold text-primary">24h</div>
									<div className="text-sm text-muted-foreground">Avg Response</div>
								</div>
								<div className="p-4 border rounded-xl backdrop-blur-sm bg-card/60 border-border/20">
									<div className="text-2xl font-bold text-primary">98%</div>
									<div className="text-sm text-muted-foreground">Satisfaction</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Community Reviews - Better Spacing */}
				<div className="space-y-6">
					<div className="flex items-center justify-between">
						<h3 className="text-lg font-semibold text-foreground">Community Reviews</h3>
						<div className="flex gap-2">
							<Button variant="outline" size="sm">
								Neighbors
							</Button>
							<Button variant="outline" size="sm">
								All
							</Button>
							<Button variant="outline" size="sm">
								Recent
							</Button>
						</div>
					</div>

					{/* Neighbor Reviews */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Home className="w-5 h-5 text-warning" />
							<span className="font-medium text-foreground">Your Neighbors</span>
							<Badge variant="secondary">Verified</Badge>
						</div>

						{peerRecommendations.map((neighbor, index) => (
							<div key={index} className="p-4 border rounded-lg bg-card border-border">
								<div className="flex items-start gap-4">
									<Avatar className="w-10 h-10">
										<AvatarImage src={`https://i.pravatar.cc/150?img=${index + 10}`} />
										<AvatarFallback>{(neighbor.recommenderName || 'N').charAt(0)}</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0 space-y-2">
										<div className="flex items-center gap-2">
											<span className="font-medium text-foreground">{neighbor.recommenderName || 'Anonymous'}</span>
											<span className="text-muted-foreground">•</span>
											<span className="text-sm text-muted-foreground">{neighbor.date}</span>
											<div className="flex items-center ml-2">
												{[...Array(5)].map((_, i) => (
													<Star key={i} className={`w-4 h-4 ${i < neighbor.rating ? "fill-yellow-400 text-warning" : "text-muted-foreground"}`} />
												))}
											</div>
										</div>
										<p className="text-foreground">&ldquo;{neighbor.comment || 'No comment provided'}&rdquo;</p>
										<div className="text-sm text-muted-foreground">{neighbor.serviceUsed}</div>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* All Reviews */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Star className="w-5 h-5 text-primary" />
							<span className="font-medium text-foreground">All Customer Reviews</span>
						</div>

						{reviews.map((review) => (
							<div key={review.id} className="p-4 border rounded-lg bg-card border-border">
								<div className="flex items-start gap-4">
									<Avatar className="w-10 h-10">
										<AvatarImage src={review.avatar} />
										<AvatarFallback>{(review.author || 'U').charAt(0)}</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0 space-y-2">
										<div className="flex items-center gap-2">
											<span className="font-medium text-foreground">{review.author || 'Anonymous'}</span>
											{review.verified && <Badge variant="secondary">Verified</Badge>}
											<span className="text-muted-foreground">•</span>
											<span className="text-sm text-muted-foreground">{review.date}</span>
											<div className="flex items-center ml-2">
												{[...Array(5)].map((_, i) => (
													<Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-warning" : "text-muted-foreground"}`} />
												))}
											</div>
										</div>
										<p className="text-foreground">{review.text || 'No review text provided'}</p>
										<div className="flex items-center gap-4 text-sm text-muted-foreground">
											<button className="hover:text-foreground">Helpful ({review.helpful || 0})</button>
											<button className="hover:text-foreground">Reply</button>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Write Review */}
					<div className="flex gap-3">
						<Button onClick={() => setShowReviewModal(true)} className="flex-1">
							Write Review
						</Button>
						<Button variant="outline" className="flex-1">
							Verify as Neighbor
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
