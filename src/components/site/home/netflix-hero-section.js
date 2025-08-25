"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Info, Star, MapPin, Clock, Heart, Share2, Search, Mic, Bot, Sparkles } from "lucide-react";
import AdvancedSearchHeader from "@components/shared/advanced-search-header";

export default function NetflixHeroSection() {
	// Netflix-style featured business data (normally from API)
	const [featuredBusiness, setFeaturedBusiness] = useState({
		name: "Bella Vista Italian Restaurant",
		description: "Authentic Italian cuisine in the heart of downtown. Experience handmade pasta, wood-fired pizzas, and an extensive wine selection in our warm, welcoming atmosphere. Family-owned for over 20 years.",
		image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
		rating: 4.8,
		category: "Italian Restaurant",
		reviews: 324,
		location: "Downtown District",
		slug: "bella-vista-italian-restaurant",
		hours: "Open until 10:00 PM",
		phone: "(555) 123-4567",
		priceRange: "$$-$$$"
	});

	// Auto-rotate featured businesses every 10 seconds
	const featuredBusinesses = [
		{
			name: "Bella Vista Italian Restaurant",
			description: "Authentic Italian cuisine in the heart of downtown. Experience handmade pasta, wood-fired pizzas, and an extensive wine selection in our warm, welcoming atmosphere.",
			image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
			rating: 4.8,
			category: "Italian Restaurant",
			reviews: 324,
			location: "Downtown District",
			slug: "bella-vista-italian-restaurant",
			hours: "Open until 10:00 PM"
		},
		{
			name: "Elite Auto Services",
			description: "Professional automotive repair and maintenance services. From oil changes to engine rebuilds, our certified technicians keep your vehicle running at peak performance.",
			image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
			rating: 4.9,
			category: "Auto Repair",
			reviews: 187,
			location: "Industrial District",
			slug: "elite-auto-services",
			hours: "Open until 6:00 PM"
		},
		{
			name: "Serenity Day Spa",
			description: "Luxury wellness retreat offering massage therapy, facials, and holistic treatments. Escape the stress of daily life and rejuvenate your mind, body, and spirit.",
			image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
			rating: 4.7,
			category: "Spa & Wellness",
			reviews: 256,
			location: "Uptown",
			slug: "serenity-day-spa",
			hours: "Open until 8:00 PM"
		}
	];

	const [currentIndex, setCurrentIndex] = useState(0);
	const [isLiked, setIsLiked] = useState(false);

	// Auto-rotate featured business
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentIndex((prev) => (prev + 1) % featuredBusinesses.length);
		}, 8000); // Change every 8 seconds

		return () => clearInterval(interval);
	}, []);

	// Update featured business when index changes
	useEffect(() => {
		setFeaturedBusiness(featuredBusinesses[currentIndex]);
	}, [currentIndex]);

	return (
		<section className="relative h-[85vh] sm:h-[90vh] lg:h-screen overflow-hidden bg-background">
			{/* Netflix-style full-screen background image */}
			<div className="absolute inset-0">
				<Image
					src={featuredBusiness.image}
					alt={featuredBusiness.name}
					fill
					className="object-cover transition-all duration-1000 ease-in-out"
					priority
					onError={(e) => {
						e.target.src = "/placeholder-business.svg";
					}}
				/>
				
				{/* Netflix-style gradient overlays */}
				<div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent lg:to-background/20" />
				<div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
			</div>

			{/* Netflix-style content overlay - responsive layout */}
			<div className="relative z-10 h-full flex items-center">
				<div className="px-4 sm:px-6 lg:px-12 xl:px-16 max-w-screen-2xl mx-auto w-full">
					{/* Hero Content with Advanced Search */}
					<div className="flex flex-col justify-center h-full">
						{/* Hero Title and Description */}
						<div className="text-center mb-8 lg:mb-12">
							{/* Main Title */}
							<h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 leading-tight">
								Discover Local{" "}
								<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
									Businesses
								</span>
							</h1>
							
							{/* Subtitle */}
							<p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
								Find the best restaurants, services, and experiences in your area. 
								Connect with your community and discover what's happening nearby.
							</p>

							{/* Stats */}
							<div className="flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-12 mb-8">
								<div className="text-center">
									<div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">50K+</div>
									<div className="text-sm text-muted-foreground">Local Businesses</div>
								</div>
								<div className="text-center">
									<div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">1M+</div>
									<div className="text-sm text-muted-foreground">Happy Customers</div>
								</div>
								<div className="text-center">
									<div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">4.8★</div>
									<div className="text-sm text-muted-foreground">Average Rating</div>
								</div>
							</div>
						</div>

						{/* Advanced Search Bar - Center Stage */}
						<div className="max-w-4xl mx-auto mb-8 lg:mb-12">
							<div className="relative">
								{/* Enhanced Search Bar */}
								<AdvancedSearchHeader 
									onSearch={(query, location) => {
										console.log('Hero search', { query, location });
										if (query.trim()) {
											// Navigate to search page
											const searchUrl = `/search?q=${encodeURIComponent(query)}${location ? `&location=${encodeURIComponent(location)}` : ''}`;
											window.location.href = searchUrl;
										}
									}}
									placeholder="Search for restaurants, services, businesses..."
									className="w-full"
									showAiMode={true}
									showVoiceSearch={true}
									showLocationSelector={true}
								/>
								
								{/* Search Enhancement Overlay */}
								<div className="absolute inset-0 pointer-events-none rounded-lg bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
							</div>

							{/* Quick Search Suggestions */}
							<div className="flex flex-wrap justify-center gap-3 mt-6">
								{[
									"Best pizza near me",
									"Plumbers",
									"Auto repair",
									"Restaurants",
									"Beauty salons",
									"Healthcare"
								].map((suggestion) => (
									<button
										key={suggestion}
										onClick={() => {
											const searchUrl = `/search?q=${encodeURIComponent(suggestion)}`;
											window.location.href = searchUrl;
										}}
										className="px-4 py-2 bg-background/20 backdrop-blur-sm border border-border/50 text-foreground rounded-full text-sm hover:bg-background/30 hover:border-primary/30 transition-all duration-200"
									>
										{suggestion}
									</button>
								))}
							</div>
						</div>

						{/* Featured Business Preview */}
						<div className="max-w-2xl mx-auto">
							<div className="bg-background/20 backdrop-blur-sm border border-border/50 rounded-2xl p-6 lg:p-8">
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center gap-2">
										<div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-semibold">
											FEATURED
										</div>
										<span className="text-muted-foreground text-sm">
											{featuredBusiness.category}
										</span>
									</div>
									
									<div className="flex items-center gap-2">
										<button 
											onClick={() => setIsLiked(!isLiked)}
											className={`p-2 rounded-full transition-all duration-200 ${
												isLiked 
													? 'bg-primary/20 text-primary' 
													: 'bg-background/20 text-muted-foreground hover:text-foreground'
											}`}
										>
											<Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
										</button>
										<button className="p-2 rounded-full bg-background/20 text-muted-foreground hover:text-foreground transition-all duration-200">
											<Share2 className="w-4 h-4" />
										</button>
									</div>
								</div>

								<h3 className="text-xl lg:text-2xl font-bold text-foreground mb-3">
									{featuredBusiness.name}
								</h3>

								<div className="flex items-center gap-4 mb-3">
									<div className="flex items-center gap-2">
										<Star className="w-4 h-4 text-primary fill-current" />
										<span className="text-foreground font-semibold">
											{featuredBusiness.rating}
										</span>
										<span className="text-muted-foreground text-sm">
											({featuredBusiness.reviews} reviews)
										</span>
									</div>
									<div className="flex items-center gap-2">
										<MapPin className="w-4 h-4 text-muted-foreground" />
										<span className="text-muted-foreground text-sm">
											{featuredBusiness.location}
										</span>
									</div>
									<div className="flex items-center gap-2">
										<Clock className="w-4 h-4 text-primary" />
										<span className="text-primary text-sm font-medium">
											{featuredBusiness.hours}
										</span>
									</div>
								</div>

								<p className="text-muted-foreground text-sm lg:text-base leading-relaxed mb-4">
									{featuredBusiness.description}
								</p>

								<div className="flex flex-col sm:flex-row gap-3">
									<Link href={`/biz/${featuredBusiness.slug}`} className="flex-1">
										<button className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-base hover:bg-primary/90 transition-all duration-200">
											<Play className="w-4 h-4 fill-current" />
											View Business
										</button>
									</Link>
									
									<button className="flex items-center justify-center gap-3 bg-background/20 backdrop-blur-sm border border-border/50 text-foreground px-6 py-3 rounded-xl font-semibold text-base hover:bg-background/30 transition-all duration-200">
										<Info className="w-4 h-4" />
										More Info
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Netflix-style progress indicators */}
			<div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
				{featuredBusinesses.map((_, index) => (
					<button
						key={index}
						onClick={() => setCurrentIndex(index)}
						className={`w-2 h-2 rounded-full transition-all duration-300 ${
							index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
						}`}
					/>
				))}
			</div>

			{/* Netflix-style fade gradient */}
			<div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
		</section>
	);
}
