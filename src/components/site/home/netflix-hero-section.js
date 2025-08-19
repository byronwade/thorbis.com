"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Info, Star, MapPin, Clock, Heart, Share2 } from "lucide-react";

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
					{/* Mobile app-style layout for small screens */}
					<div className="block lg:hidden">
						<div className="flex flex-col justify-end h-full pb-8 sm:pb-12">
							{/* Top action buttons - mobile app style */}
							<div className="flex items-center justify-between mb-6">
								<div className="flex items-center gap-2">
									<div className="bg-primary/20 backdrop-blur-sm border border-primary/30 text-primary px-3 py-1.5 rounded-full text-xs font-semibold">
										FEATURED
									</div>
									<span className="text-muted-foreground/80 text-sm font-medium">
										{featuredBusiness.category}
									</span>
								</div>
								
								{/* Mobile app-style action buttons */}
								<div className="flex items-center gap-3">
									<button 
										onClick={() => setIsLiked(!isLiked)}
										className={`p-2.5 rounded-full backdrop-blur-sm border transition-all duration-200 ${
											isLiked 
												? 'bg-primary/20 border-primary/30 text-primary' 
												: 'bg-background/20 border-border/50 text-muted-foreground hover:text-foreground'
										}`}
									>
										<Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
									</button>
									<button className="p-2.5 rounded-full bg-background/20 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground transition-all duration-200">
										<Share2 className="w-5 h-5" />
									</button>
								</div>
							</div>

							{/* Business name - mobile app typography */}
							<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
								{featuredBusiness.name}
							</h1>

							{/* Business info - mobile app layout */}
							<div className="flex flex-col gap-3 mb-6">
								{/* Rating and reviews */}
								<div className="flex items-center gap-3">
									<div className="flex items-center gap-2">
										<Star className="w-4 h-4 text-primary fill-current" />
										<span className="text-foreground font-semibold text-base">
											{featuredBusiness.rating}
										</span>
										<span className="text-muted-foreground text-sm">
											({featuredBusiness.reviews} reviews)
										</span>
									</div>
								</div>

								{/* Location and hours */}
								<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
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
							</div>

							{/* Description - mobile app style */}
							<p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6 max-w-lg">
								{featuredBusiness.description}
							</p>

							{/* Mobile app-style action buttons */}
							<div className="flex flex-col sm:flex-row gap-3">
								<Link href={`/biz/${featuredBusiness.slug}`} className="flex-1">
									<button className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground px-6 py-4 rounded-xl font-semibold text-base hover:bg-primary/90 transition-all duration-200 active:scale-95 touch-manipulation">
										<Play className="w-5 h-5 fill-current" />
										View Business
									</button>
								</Link>
								
								<button className="flex items-center justify-center gap-3 bg-background/20 backdrop-blur-sm border border-border/50 text-foreground px-6 py-4 rounded-xl font-semibold text-base hover:bg-background/30 transition-all duration-200 active:scale-95 touch-manipulation">
									<Info className="w-5 h-5" />
									More Info
								</button>
							</div>
						</div>
					</div>

					{/* Netflix-style desktop layout for larger screens */}
					<div className="hidden lg:block">
						<div className="max-w-2xl xl:max-w-3xl">
							{/* Netflix-style category badge */}
							<div className="flex items-center gap-3 mb-4">
								<div className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-semibold">
									FEATURED
								</div>
								<span className="text-muted-foreground text-lg font-medium">
									{featuredBusiness.category}
								</span>
							</div>

							{/* Netflix-style prominent title */}
							<h1 className="text-5xl xl:text-6xl 2xl:text-7xl font-bold text-foreground mb-6 leading-tight">
								{featuredBusiness.name}
							</h1>

							{/* Netflix-style business info */}
							<div className="flex items-center gap-6 mb-6">
								{/* Rating */}
								<div className="flex items-center gap-2">
									<Star className="w-5 h-5 text-primary fill-current" />
									<span className="text-foreground font-semibold text-lg">
										{featuredBusiness.rating}
									</span>
									<span className="text-muted-foreground text-base">
										({featuredBusiness.reviews} reviews)
									</span>
								</div>

								{/* Location */}
								<div className="flex items-center gap-2">
									<MapPin className="w-5 h-5 text-muted-foreground" />
									<span className="text-muted-foreground text-base">
										{featuredBusiness.location}
									</span>
								</div>

								{/* Hours */}
								<div className="flex items-center gap-2">
									<Clock className="w-5 h-5 text-primary" />
									<span className="text-primary text-base font-medium">
										{featuredBusiness.hours}
									</span>
								</div>
							</div>

							{/* Netflix-style description */}
							<p className="text-muted-foreground text-lg xl:text-xl leading-relaxed mb-8 max-w-2xl">
								{featuredBusiness.description}
							</p>

							{/* Netflix-style action buttons */}
							<div className="flex items-center gap-4">
								<Link href={`/biz/${featuredBusiness.slug}`}>
									<button className="flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all duration-200">
										<Play className="w-6 h-6 fill-current" />
										View Business
									</button>
								</Link>
								
								<button className="flex items-center justify-center gap-3 bg-background/20 backdrop-blur-sm border border-border/50 text-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:bg-background/30 transition-all duration-200">
									<Info className="w-6 h-6" />
									More Info
								</button>

								{/* Desktop action buttons */}
								<button 
									onClick={() => setIsLiked(!isLiked)}
									className={`p-3 rounded-full backdrop-blur-sm border transition-all duration-200 ${
										isLiked 
											? 'bg-primary/20 border-primary/30 text-primary' 
											: 'bg-background/20 border-border/50 text-muted-foreground hover:text-foreground'
									}`}
								>
									<Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
								</button>
								<button className="p-3 rounded-full bg-background/20 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground transition-all duration-200">
									<Share2 className="w-6 h-6" />
								</button>
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
