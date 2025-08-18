"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Info, Star, MapPin, Clock } from "lucide-react";

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
		<section className="relative h-[70vh] md:h-[85vh] overflow-hidden bg-background">
			{/* Netflix-style hero background image */}
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
				
				{/* Gradient overlays with design system colors */}
				<div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20 md:to-transparent" />
				<div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
			</div>

			{/* Netflix-style content overlay - mobile responsive */}
			<div className="relative z-10 h-full flex items-center">
				<div className="px-4 md:px-6 lg:px-12 max-w-screen-2xl mx-auto w-full">
					<div className="max-w-full md:max-w-2xl">
											{/* Business category badge - mobile responsive */}
					<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-4">
						<div className="bg-primary text-primary-foreground px-3 py-1 rounded text-xs sm:text-sm font-semibold">
							FEATURED
						</div>
						<span className="text-muted-foreground text-sm font-medium">
							{featuredBusiness.category}
						</span>
					</div>

					{/* Business name - mobile responsive sizing */}
					<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-4 leading-tight">
						{featuredBusiness.name}
					</h1>

						{/* Business info row - mobile stacked */}
						<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 mb-6">
							{/* Rating */}
							<div className="flex items-center gap-2">
								<Star className="w-4 h-4 sm:w-5 sm:h-5 text-primary fill-current" />
								<span className="text-foreground font-semibold text-base sm:text-lg">
									{featuredBusiness.rating}
								</span>
								<span className="text-muted-foreground text-xs sm:text-sm">
									({featuredBusiness.reviews} reviews)
								</span>
							</div>

							{/* Location */}
							<div className="flex items-center gap-2">
								<MapPin className="w-4 h-4 text-muted-foreground" />
								<span className="text-muted-foreground text-xs sm:text-sm">
									{featuredBusiness.location}
								</span>
							</div>

							{/* Hours */}
							<div className="flex items-center gap-2">
								<Clock className="w-4 h-4 text-primary" />
								<span className="text-primary text-xs sm:text-sm font-medium">
									{featuredBusiness.hours}
								</span>
							</div>
						</div>

						{/* Description - hidden on small mobile */}
						<p className="hidden sm:block text-muted-foreground text-base lg:text-lg leading-relaxed mb-8 max-w-xl">
							{featuredBusiness.description}
						</p>

						{/* Mobile short description */}
						<p className="block sm:hidden text-muted-foreground text-sm leading-relaxed mb-6">
							{featuredBusiness.description.split('.')[0]}.
						</p>

						{/* Action buttons with Thorbis design system */}
						<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
							<Link href={`/biz/${featuredBusiness.slug}`} className="flex-1 sm:flex-none">
								<button className="w-full sm:w-auto flex items-center justify-center gap-3 bg-primary text-primary-foreground px-6 sm:px-8 py-3 sm:py-4 rounded font-bold text-base sm:text-lg hover:bg-primary/90 transition-colors duration-200">
									<Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
									View Business
								</button>
							</Link>
							
							<button className="flex items-center justify-center gap-3 bg-accent/80 text-accent-foreground px-6 sm:px-8 py-3 sm:py-4 rounded font-bold text-base sm:text-lg hover:bg-accent transition-colors duration-200 backdrop-blur-sm border border-border">
								<Info className="w-4 h-4 sm:w-5 sm:h-5" />
								More Info
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Progress indicators with Thorbis colors */}
			<div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 flex gap-2">
				{featuredBusinesses.map((_, index) => (
					<button
						key={index}
						onClick={() => setCurrentIndex(index)}
						className={`w-2 sm:w-3 h-1 rounded-full transition-all duration-300 ${
							index === currentIndex ? 'bg-primary' : 'bg-border'
						}`}
					/>
				))}
			</div>

			{/* Fade gradient at bottom for seamless transition */}
			<div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
		</section>
	);
}
