import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@components/ui/button";
import { ScrollArea } from "@components/ui/scroll-area";
import { X, Star, Phone, MapPin, Clock, Share2, Heart, ExternalLink, Navigation, Wifi, CreditCard, ParkingCircle as Parking, Accessibility, ChevronLeft, ChevronRight, TrendingUp, Users, Award } from "lucide-react";
import { useBusinessStore } from "@store/business";
import { useMapStore } from "@store/map";
import { logger } from "@utils/logger";
import { getReliableImageUrl, generateReliableBusinessPhotos } from "@utils/reliable-image-service";

const BusinessInfoPanel = () => {
	const { activeBusinessId, filteredBusinesses, setActiveBusinessId } = useBusinessStore();
	const { centerOn, isMapAvailable } = useMapStore();
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [isFavorited, setIsFavorited] = useState(false);

	const business = filteredBusinesses.find((b) => b.id === activeBusinessId);
	const businessIndex = business ? filteredBusinesses.findIndex((b) => b.id === business.id) : -1;

	// Debug logging
	useEffect(() => {
		logger.debug("BusinessInfoPanel - activeBusinessId:", activeBusinessId, "business found:", business?.name);
		logger.debug("BusinessInfoPanel - filteredBusinesses count:", filteredBusinesses.length);
		if (activeBusinessId && !business) {
			logger.debug("BusinessInfoPanel - No business found with ID:", activeBusinessId);
			logger.debug(
				"Available business IDs:",
				filteredBusinesses.map((b) => b.id)
			);
		}
		if (business) {
			logger.debug("BusinessInfoPanel - Showing panel for business:", business.name);
		} else {
			logger.debug("BusinessInfoPanel - No business to show, panel hidden");
		}
	}, [activeBusinessId, business, filteredBusinesses]);

	// Use reliable image service to avoid timeout issues
	const businessPhotos = business?.photos?.length > 0 
		? business.photos
		: generateReliableBusinessPhotos(business?.id || 'default', business?.category || 'default', 4);
	
	const allImages = [
		business?.image || getReliableImageUrl({ 
			category: business?.category || 'default', 
			businessId: business?.id || 'default',
			width: 400, 
			height: 300 
		}),
		...businessPhotos.slice(0, 3)
	];

	// Center map on business when panel opens (only if map is available)
	useEffect(() => {
		if (isMapAvailable() && business?.coordinates) {
			const { lat, lng } = business.coordinates;
			if (typeof lat === "number" && typeof lng === "number" && !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
				centerOn(lat, lng);
			}
		}
	}, [business?.coordinates, centerOn, isMapAvailable]);

	const handlePrev = () => {
		if (businessIndex > 0) {
			const prevBusiness = filteredBusinesses[businessIndex - 1];
			setActiveBusinessId(prevBusiness.id);
		}
	};

	const handleNext = () => {
		if (businessIndex < filteredBusinesses.length - 1) {
			const nextBusiness = filteredBusinesses[businessIndex + 1];
			setActiveBusinessId(nextBusiness.id);
		}
	};

	const handleClose = () => {
		setActiveBusinessId(null);
	};

	const renderStars = (rating) => {
		return Array.from({ length: 5 }, (_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />);
	};

	if (!business) return null;

	return (
		<div className={`absolute top-0 left-0 z-40 flex flex-col h-full transition-transform duration-300 ease-in-out shadow-xl bg-card border-r border-border w-96 ${business ? "translate-x-0" : "-translate-x-full"}`}>
			{/* Header - More Compact */}
			<div className="flex items-center justify-between px-3 py-2 border-b bg-card/50 border-border/20">
				<div className="flex items-center gap-1">
					{businessIndex > 0 && (
						<button onClick={handlePrev} className="p-1.5 transition-colors rounded-full hover:bg-accent/80 text-muted-foreground hover:text-foreground">
							<ChevronLeft className="w-4 h-4" />
						</button>
					)}
					{businessIndex < filteredBusinesses.length - 1 && (
						<button onClick={handleNext} className="p-1.5 transition-colors rounded-full hover:bg-accent/80 text-muted-foreground hover:text-foreground">
							<ChevronRight className="w-4 h-4" />
						</button>
					)}
				</div>
				<div className="flex items-center gap-1">
					<button onClick={() => setIsFavorited(!isFavorited)} className="p-1.5 transition-colors rounded-full hover:bg-accent/80 text-muted-foreground hover:text-foreground">
						<Heart className={`w-4 h-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
					</button>
					<button className="p-1.5 transition-colors rounded-full hover:bg-accent/80 text-muted-foreground hover:text-foreground">
						<Share2 className="w-4 h-4" />
					</button>
					<button onClick={handleClose} className="p-1.5 transition-colors rounded-full hover:bg-accent/80 text-muted-foreground hover:text-foreground">
						<X className="w-4 h-4" />
					</button>
				</div>
			</div>
			<ScrollArea className="flex-1">
				{/* Image Gallery */}
				<div className="relative h-64 bg-muted/30">
					<Image src={allImages[selectedImageIndex]} alt={business.name} fill className="object-cover" />

					{/* Image Navigation */}
					{allImages.length > 1 && (
						<>
							<button onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))} className="absolute p-2 transition-all transform -translate-y-1/2 rounded-full shadow-lg left-3 top-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90">
								<ChevronLeft className="w-4 h-4 text-foreground" />
							</button>
							<button onClick={() => setSelectedImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))} className="absolute p-2 transition-all transform -translate-y-1/2 rounded-full shadow-lg right-3 top-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90">
								<ChevronRight className="w-4 h-4 text-foreground" />
							</button>

							{/* Image Dots */}
							<div className="absolute flex gap-1.5 transform -translate-x-1/2 bottom-4 left-1/2">
								{allImages.map((_, index) => (
									<button key={index} onClick={() => setSelectedImageIndex(index)} className={`w-2.5 h-2.5 rounded-full transition-all ${index === selectedImageIndex ? "bg-white shadow-sm" : "bg-white/50"}`} />
								))}
							</div>
						</>
					)}
				</div>

				{/* Business Info */}
				<div className="p-6 space-y-6">
					{/* Title & Rating */}
					<div>
						<h1 className="mb-2 text-2xl font-semibold text-card-foreground">{business.name}</h1>
						<p className="mb-4 text-muted-foreground">{business.categories?.[0] || "Business"}</p>

						<div className="flex items-center gap-3 mb-3">
							<div className="flex items-center bg-muted/30 px-3 py-1.5 rounded-lg">{renderStars(business.ratings?.overall || 0)}</div>
							<span className="font-medium text-foreground">{business.ratings?.overall?.toFixed(1) || "New"}</span>
							<span className="text-muted-foreground">({business.ratings?.count || 0} reviews)</span>
						</div>

						{business.priceLevel && (
							<div className="text-lg font-medium text-card-foreground">
								{"$".repeat(business.priceLevel)} • {business.cuisine || "Local Business"}
							</div>
						)}
					</div>

					{/* Status & Hours */}
					<div className="space-y-4">
						{business.isOpen && (
							<div className="flex items-center gap-2">
								<div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-sm shadow-green-500/50"></div>
								<span className="font-medium text-green-600 dark:text-green-400">Open now</span>
							</div>
						)}

						<div className="flex items-start gap-3 text-muted-foreground">
							<Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
							<div>
								<div className="text-foreground">Today: 9:00 AM - 9:00 PM</div>
								<button className="text-sm transition-colors text-primary hover:text-primary/80">See all hours</button>
							</div>
						</div>

						<div className="flex items-start gap-3 text-muted-foreground">
							<MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
							<div>
								<div className="text-foreground">{business.address || "Address not available"}</div>
								<div className="text-sm text-muted-foreground">
									{business.city}, {business.state} {business.zipCode}
								</div>
							</div>
						</div>
					</div>

					{/* AI Insights - Subtle */}
					<div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10">
						<div className="flex items-center gap-2 mb-3">
							<Award className="w-4 h-4 text-primary" />
							<span className="text-sm font-medium text-card-foreground">Business Insights</span>
						</div>
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div className="flex items-center gap-2">
								<TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
								<span className="text-muted-foreground">Trending up</span>
							</div>
							<div className="flex items-center gap-2">
								<Users className="w-3 h-3 text-primary" />
								<span className="text-muted-foreground">Popular choice</span>
							</div>
						</div>
						<div className="mt-2 text-xs text-muted-foreground">{Math.floor(Math.random() * 20) + 15} people viewed today</div>
					</div>

					{/* Action Buttons */}
					<div className="grid grid-cols-2 gap-3">
						<Button className="shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">
							<Phone className="w-4 h-4 mr-2" />
							Call
						</Button>
						<Button variant="outline" className="transition-all border-0 hover:bg-accent/80">
							<Navigation className="w-4 h-4 mr-2" />
							Directions
						</Button>
					</div>

					{/* Amenities */}
					<div>
						<h3 className="mb-4 font-medium text-card-foreground">What this place offers</h3>
						<div className="grid grid-cols-2 gap-3">
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Wifi className="w-4 h-4 text-primary" />
								Free Wi-Fi
							</div>
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<CreditCard className="w-4 h-4 text-primary" />
								Cards accepted
							</div>
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Parking className="w-4 h-4 text-primary" />
								Free parking
							</div>
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Accessibility className="w-4 h-4 text-primary" />
								Accessible
							</div>
						</div>
					</div>

					{/* Description */}
					{business.description && (
						<div>
							<h3 className="mb-3 font-medium text-card-foreground">About</h3>
							<p className="text-sm leading-relaxed text-muted-foreground">{business.description}</p>
						</div>
					)}

					{/* Reviews Preview */}
					<div>
						<h3 className="mb-4 font-medium text-card-foreground">Recent reviews</h3>
						<div className="space-y-4">
							<div className="pb-4">
								<div className="flex items-center gap-3 mb-2">
									<div className="w-8 h-8 rounded-full bg-muted"></div>
									<div>
										<div className="text-sm font-medium text-card-foreground">Sarah M.</div>
										<div className="flex items-center gap-1">
											{renderStars(5)}
											<span className="ml-1 text-xs text-muted-foreground">2 days ago</span>
										</div>
									</div>
								</div>
								<p className="text-sm leading-relaxed text-muted-foreground">Great service and friendly staff. Would definitely recommend!</p>
							</div>

							<div className="pb-4">
								<div className="flex items-center gap-3 mb-2">
									<div className="w-8 h-8 rounded-full bg-muted"></div>
									<div>
										<div className="text-sm font-medium text-card-foreground">Mike R.</div>
										<div className="flex items-center gap-1">
											{renderStars(4)}
											<span className="ml-1 text-xs text-muted-foreground">1 week ago</span>
										</div>
									</div>
								</div>
								<p className="text-sm leading-relaxed text-muted-foreground">Good experience overall. Fast and professional service.</p>
							</div>
						</div>

						<button className="mt-3 text-sm transition-colors text-primary hover:text-primary/80">Show all {business.ratings?.count || 0} reviews</button>
					</div>

					{/* View Full Profile - More Prominent */}
					<Link href={`/biz/${business.slug}`} className="block">
						<Button className="w-full py-3 font-medium shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">
							<ExternalLink className="w-4 h-4 mr-2" />
							View Full Business Profile
						</Button>
					</Link>
				</div>
			</ScrollArea>
		</div>
	);
};

export default BusinessInfoPanel;
