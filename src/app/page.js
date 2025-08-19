
import { ChevronRight, TrendingUp, Home as HomeIcon, Coffee, ShoppingBag, Heart, Truck } from "lucide-react";
import ScrollSection from "@components/site/home/scroll-section";
import NetflixHeroSection from "@components/site/home/netflix-hero-section";
import BusinessCard from "@components/site/home/business-card";
import ContinueBrowsingSection from "@components/shared/continue-browsing-section";
import AnimationWrapper from "@components/shared/animation-wrapper";
import Link from "next/link";


import React from "react";
import { generateHomeMetadata } from "@utils/server-seo";
import { getReliableImageUrl } from "@utils/reliable-image-service";
import { getDictionary } from "@lib/i18n/server";

// Force dynamic rendering to prevent build hanging
export const dynamic = "force-dynamic";

// Removed SectionSkeleton component - no loading states

// Transform business data to match existing component interface
function transformBusinessForCard(business) {
	return {
		id: business.id,
		name: business.name,
		description: business.description,
		image: business.photos?.[0] || getReliableImageUrl({
			category: business.business_categories?.[0]?.category?.name || "business",
			businessId: business.id,
			width: 400,
			height: 300
		}),
		rating: business.rating || 0,
		reviewCount: business.review_count || 0,
		price: business.price_range || "$$",
		location: `${business.city}, ${business.state}`,
		category: business.business_categories?.[0]?.category?.name || "Business",
		slug: business.slug,
		// ADD MISSING LOCATION FIELDS
		city: business.city,
		state: business.state,
		country: business.country,
		short_id: business.short_id,
		shortId: business.shortId,
	};
}

// Generate sponsored businesses for subtle advertising
function generateSponsoredBusinesses() {
	const sponsoredBusinesses = [
		{
			id: "sponsored-1",
			name: "Premium Auto Care Center",
			description: "Luxury car maintenance and detailing services",
			image: getReliableImageUrl({ category: "automotive", businessId: "sponsored-1", width: 400, height: 300 }),
			rating: 4.8,
			reviewCount: 127,
			price: "$$$",
			location: "Beverly Hills, CA",
			category: "Automotive",
			slug: "premium-auto-care-center",
			city: "Beverly Hills",
			state: "CA",
			country: "US",
			short_id: "PAC001",
		},
		{
			id: "sponsored-2", 
			name: "Elite Home Renovations",
			description: "High-end residential remodeling and design",
			image: getReliableImageUrl({ category: "construction", businessId: "sponsored-2", width: 400, height: 300 }),
			rating: 4.9,
			reviewCount: 89,
			price: "$$$$",
			location: "Manhattan, NY",
			category: "Construction",
			slug: "elite-home-renovations",
			city: "Manhattan",
			state: "NY",
			country: "US",
			short_id: "EHR002",
		},
		{
			id: "sponsored-3",
			name: "Gourmet Delights Catering",
			description: "Premium catering for corporate and private events",
			image: getReliableImageUrl({ category: "restaurant", businessId: "sponsored-3", width: 400, height: 300 }),
			rating: 4.7,
			reviewCount: 156,
			price: "$$$",
			location: "San Francisco, CA",
			category: "Restaurant",
			slug: "gourmet-delights-catering",
			city: "San Francisco",
			state: "CA",
			country: "US",
			short_id: "GDC003",
		},
		{
			id: "sponsored-4",
			name: "Wellness Spa & Retreat",
			description: "Luxury spa treatments and wellness programs",
			image: getReliableImageUrl({ category: "beauty", businessId: "sponsored-4", width: 400, height: 300 }),
			rating: 4.9,
			reviewCount: 203,
			price: "$$$",
			location: "Miami Beach, FL",
			category: "Beauty & Spa",
			slug: "wellness-spa-retreat",
			city: "Miami Beach",
			state: "FL",
			country: "US",
			short_id: "WSR004",
		},
		{
			id: "sponsored-5",
			name: "Tech Solutions Pro",
			description: "Enterprise IT consulting and managed services",
			image: getReliableImageUrl({ category: "technology", businessId: "sponsored-5", width: 400, height: 300 }),
			rating: 4.8,
			reviewCount: 67,
			price: "$$$$",
			location: "Seattle, WA",
			category: "Technology",
			slug: "tech-solutions-pro",
			city: "Seattle",
			state: "WA",
			country: "US",
			short_id: "TSP005",
		},
		{
			id: "sponsored-6",
			name: "Legal Excellence Partners",
			description: "Specialized legal services for businesses and individuals",
			image: getReliableImageUrl({ category: "legal", businessId: "sponsored-6", width: 400, height: 300 }),
			rating: 4.9,
			reviewCount: 134,
			price: "$$$$",
			location: "Chicago, IL",
			category: "Legal Services",
			slug: "legal-excellence-partners",
			city: "Chicago",
			state: "IL",
			country: "US",
			short_id: "LEP006",
		}
	];

	return sponsoredBusinesses;
}

// Categorize businesses by type for different sections
function categorizeBusinesses(businesses) {
	const categories = {
		restaurants: [],
		homeServices: [],
		health: [],
		shopping: [],
		beauty: [],
		automotive: [],
		entertainment: [],
		fitness: [],
		pet: [],
		education: [],
		financial: [],
		realEstate: [],
		technology: [],
		legal: [],
		construction: [],
		plumbing: [],
		electrical: [],
		hvac: [],
		landscaping: [],
		cleaning: [],
		roofing: [],
		painting: [],
		security: [],
		transportation: [],
		childcare: [],
		photography: [],
		events: [],
		repair: [],
		wellness: [],
		professional: [],
	};

	businesses.forEach((business) => {
		const categoryName = business.business_categories?.[0]?.category?.name?.toLowerCase() || "";
		const categorySlug = business.business_categories?.[0]?.category?.slug?.toLowerCase() || "";

		if (categoryName.includes("restaurant") || categoryName.includes("food") || categorySlug.includes("restaurant") || categoryName.includes("cafe") || categoryName.includes("dining")) {
			categories.restaurants.push(business);
		} else if (categoryName.includes("home") || categoryName.includes("service") || categorySlug.includes("home") || categoryName.includes("cleaning") || categoryName.includes("plumbing") || categoryName.includes("electrical")) {
			categories.homeServices.push(business);
		} else if (categoryName.includes("health") || categoryName.includes("medical") || categorySlug.includes("health") || categoryName.includes("dental") || categoryName.includes("pharmacy")) {
			categories.health.push(business);
		} else if (categoryName.includes("shop") || categoryName.includes("retail") || categorySlug.includes("shopping") || categoryName.includes("store") || categoryName.includes("boutique")) {
			categories.shopping.push(business);
		} else if (categoryName.includes("beauty") || categoryName.includes("spa") || categorySlug.includes("beauty") || categoryName.includes("salon") || categoryName.includes("cosmetic")) {
			categories.beauty.push(business);
		} else if (categoryName.includes("auto") || categoryName.includes("car") || categorySlug.includes("automotive") || categoryName.includes("mechanic") || categoryName.includes("dealership")) {
			categories.automotive.push(business);
		} else if (categoryName.includes("entertainment") || categorySlug.includes("entertainment") || categoryName.includes("movie") || categoryName.includes("theater") || categoryName.includes("amusement")) {
			categories.entertainment.push(business);
		} else if (categoryName.includes("fitness") || categoryName.includes("gym") || categorySlug.includes("fitness") || categoryName.includes("yoga") || categoryName.includes("training")) {
			categories.fitness.push(business);
		} else if (categoryName.includes("pet") || categorySlug.includes("pet") || categoryName.includes("veterinary") || categoryName.includes("grooming")) {
			categories.pet.push(business);
		} else if (categoryName.includes("education") || categoryName.includes("school") || categoryName.includes("training") || categoryName.includes("academy") || categoryName.includes("university")) {
			categories.education.push(business);
		} else if (categoryName.includes("financial") || categoryName.includes("bank") || categoryName.includes("insurance") || categoryName.includes("credit") || categoryName.includes("investment")) {
			categories.financial.push(business);
		} else if (categoryName.includes("real estate") || categoryName.includes("property") || categoryName.includes("rental") || categoryName.includes("realtor") || categoryName.includes("housing")) {
			categories.realEstate.push(business);
		} else if (categoryName.includes("technology") || categoryName.includes("computer") || categoryName.includes("software") || categoryName.includes("it") || categoryName.includes("tech")) {
			categories.technology.push(business);
		} else if (categoryName.includes("legal") || categoryName.includes("law") || categoryName.includes("attorney") || categoryName.includes("lawyer") || categoryName.includes("legal")) {
			categories.legal.push(business);
		} else if (categoryName.includes("construction") || categoryName.includes("contractor") || categoryName.includes("building") || categoryName.includes("renovation") || categoryName.includes("remodel")) {
			categories.construction.push(business);
		} else if (categoryName.includes("plumbing") || categoryName.includes("plumber") || categoryName.includes("pipe") || categoryName.includes("drain")) {
			categories.plumbing.push(business);
		} else if (categoryName.includes("electrical") || categoryName.includes("electrician") || categoryName.includes("electric") || categoryName.includes("wiring")) {
			categories.electrical.push(business);
		} else if (categoryName.includes("hvac") || categoryName.includes("heating") || categoryName.includes("cooling") || categoryName.includes("air conditioning") || categoryName.includes("furnace")) {
			categories.hvac.push(business);
		} else if (categoryName.includes("landscaping") || categoryName.includes("landscape") || categoryName.includes("garden") || categoryName.includes("lawn") || categoryName.includes("yard")) {
			categories.landscaping.push(business);
		} else if (categoryName.includes("cleaning") || categoryName.includes("cleaner") || categoryName.includes("janitorial") || categoryName.includes("housekeeping")) {
			categories.cleaning.push(business);
		} else if (categoryName.includes("roofing") || categoryName.includes("roofer") || categoryName.includes("roof") || categoryName.includes("shingle")) {
			categories.roofing.push(business);
		} else if (categoryName.includes("painting") || categoryName.includes("painter") || categoryName.includes("paint")) {
			categories.painting.push(business);
		} else if (categoryName.includes("security") || categoryName.includes("alarm") || categoryName.includes("surveillance") || categoryName.includes("guard")) {
			categories.security.push(business);
		} else if (categoryName.includes("transportation") || categoryName.includes("delivery") || categoryName.includes("moving") || categoryName.includes("trucking")) {
			categories.transportation.push(business);
		} else if (categoryName.includes("childcare") || categoryName.includes("daycare") || categoryName.includes("preschool") || categoryName.includes("babysitting")) {
			categories.childcare.push(business);
		} else if (categoryName.includes("photography") || categoryName.includes("photographer") || categoryName.includes("photo") || categoryName.includes("camera")) {
			categories.photography.push(business);
		} else if (categoryName.includes("event") || categoryName.includes("wedding") || categoryName.includes("party") || categoryName.includes("catering")) {
			categories.events.push(business);
		} else if (categoryName.includes("repair") || categoryName.includes("fix") || categoryName.includes("maintenance") || categoryName.includes("service")) {
			categories.repair.push(business);
		} else if (categoryName.includes("wellness") || categoryName.includes("therapy") || categoryName.includes("counseling") || categoryName.includes("mental health")) {
			categories.wellness.push(business);
		} else if (categoryName.includes("professional") || categoryName.includes("consulting") || categoryName.includes("business") || categoryName.includes("management")) {
			categories.professional.push(business);
		} else {
			// Distribute remaining businesses across categories based on business type hints
			if (business.description?.toLowerCase().includes("food") || business.name?.toLowerCase().includes("restaurant")) {
				categories.restaurants.push(business);
			} else if (business.description?.toLowerCase().includes("service") || business.name?.toLowerCase().includes("service")) {
				categories.homeServices.push(business);
			} else if (business.description?.toLowerCase().includes("shop") || business.name?.toLowerCase().includes("store")) {
				categories.shopping.push(business);
			} else if (business.description?.toLowerCase().includes("health") || business.name?.toLowerCase().includes("medical")) {
				categories.health.push(business);
			} else if (business.description?.toLowerCase().includes("auto") || business.name?.toLowerCase().includes("car")) {
				categories.automotive.push(business);
			} else {
				// Default distribution to ensure all categories have some content
				const keys = Object.keys(categories);
				const randomKey = keys[Math.floor(Math.random() * keys.length)];
				categories[randomKey].push(business);
			}
		}
	});

	return categories;
}

// Generate dynamic metadata using server-side SEO generator with i18n support
export async function generateMetadata({ params }) {
	try {
		const locale = params?.locale || 'en';
		const dictionary = await getDictionary(locale);
		
		const seoMetadata = await generateHomeMetadata();
		
		// Use i18n metadata if available, fallback to SEO generator
		return {
			...seoMetadata,
			title: dictionary?.pages?.homepage?.metadata?.title || seoMetadata?.title || "Thorbis - Discover Local Businesses & Community",
			description: dictionary?.pages?.homepage?.metadata?.description || seoMetadata?.description || "Find the best local businesses, events, and community resources in your area."
		};
	} catch (error) {
		console.error('Failed to generate home metadata:', error);
		// Fallback to simple metadata
		return {
			title: "Thorbis - Discover Local Businesses & Community",
			description: "Find the best local businesses, events, and community resources in your area. Connect with your neighborhood and discover what's happening nearby."
		};
	}
}

// Server-side data fetching using API routes
async function getHomePageData() {
    const startTime = performance.now();
    
    try {
        // In development, always use localhost with absolute URL for SSR
        let apiUrl;
        
        if (process.env.NODE_ENV === 'development') {
            // Use localhost for development (works for both client and server-side)
            apiUrl = 'http://localhost:3000/api/business/featured';
        } else {
            // For production, construct the full URL
            let baseUrl;
            
            if (process.env.NEXT_PUBLIC_APP_URL) {
                baseUrl = process.env.NEXT_PUBLIC_APP_URL;
            } else if (process.env.VERCEL_URL) {
                baseUrl = `https://${process.env.VERCEL_URL}`;
            } else if (process.env.NEXT_PUBLIC_VERCEL_URL) {
                baseUrl = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
            } else {
                baseUrl = 'http://localhost:3000';
            }
            
            apiUrl = `${baseUrl}/api/business/featured`;
        }

        console.log(`⚡ PERFORMANCE: Fetching home page data from: ${apiUrl}`);

        const response = await fetch(apiUrl, {
            next: { revalidate: 60 },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });

		const fetchDuration = performance.now() - startTime;
		console.log(`⚡ PERFORMANCE: API fetch completed in ${fetchDuration.toFixed(2)}ms`);

		if (!response.ok) {
			console.warn(`API request failed with status ${response.status}, using fallback data`);
			// Return empty data instead of throwing to prevent page from breaking
			return { 
				businesses: [], 
				categories: categorizeBusinesses([]),
				error: `API request failed: ${response.status}`,
				performance: { fetchTime: fetchDuration }
			};
		}

		const apiData = await response.json();
		const businesses = apiData.businesses || [];
		const categories = categorizeBusinesses(businesses);

		const totalDuration = performance.now() - startTime;
		console.log(`⚡ PERFORMANCE: Home page data processing completed in ${totalDuration.toFixed(2)}ms (${businesses.length} businesses)`);

		return {
			businesses,
			categories,
			performance: { fetchTime: totalDuration }
		};
	} catch (error) {
		const totalDuration = performance.now() - startTime;
		console.error("⚠️ Failed to fetch home page businesses:", error);
		console.log(`⚡ PERFORMANCE: Home page data fetch failed in ${totalDuration.toFixed(2)}ms`);
		
		// Gracefully handle errors by returning empty state
		return { 
			businesses: [], 
			categories: categorizeBusinesses([]),
			error: error.message,
			performance: { fetchTime: totalDuration }
		};
	}
}

// Home page sections with real data and i18n support
async function BusinessSections({ categories, locale = 'en', sponsoredBusinesses = [] }) {
	const dictionary = await getDictionary(locale);
	const t = dictionary?.pages?.homepage?.sections || {};
	return (
		<>
			{/* FOOD & DINING SECTION */}
			{categories.restaurants.length > 0 && (
				<div className="space-y-8 animate-fade-in-up" data-section="food-dining">
					<ScrollSection 
						title="Food & Dining" 
						subtitle="Discover local restaurants, cafes, and food experiences"
						link="/categories/restaurants"
					>
						{categories.restaurants.slice(0, 10).map((business) => (
							<BusinessCard
								key={business.id}
								business={{
									...transformBusinessForCard(business),
									status: "Open",
								}}
							/>
						))}
						{/* Sponsored restaurant */}
						<BusinessCard
							key="sponsored-restaurant"
							business={sponsoredBusinesses[2]}
							sponsored={true}
						/>
					</ScrollSection>
				</div>
			)}

			{/* HOME & PROFESSIONAL SERVICES SECTION */}
			{categories.homeServices.length > 0 && (
				<div className="space-y-8 animate-fade-in-up animate-delay-100" data-section="home-services">
					<ScrollSection 
						title="Home & Professional Services" 
						subtitle="Trusted professionals for your home and business needs"
						link="/categories/home-services"
					>
						{categories.homeServices.slice(0, 10).map((business) => (
							<BusinessCard
								key={business.id}
								business={{
									...transformBusinessForCard(business),
									badge: "24/7",
								}}
							/>
						))}
						{/* Sponsored home service */}
						<BusinessCard
							key="sponsored-home-service"
							business={sponsoredBusinesses[1]}
							sponsored={true}
						/>
					</ScrollSection>
				</div>
			)}

			{/* PLUMBING SERVICES SECTION */}
			{categories.plumbing.length > 0 && (
				<div className="space-y-8 animate-fade-in-up animate-delay-150" data-section="plumbing">
					<ScrollSection 
						title="Plumbing Services" 
						subtitle="Expert plumbers for repairs, installations, and emergencies"
						link="/categories/plumbing"
					>
						{categories.plumbing.map((business) => (
							<BusinessCard
								key={business.id}
								business={{
									...transformBusinessForCard(business),
									badge: "24/7",
								}}
							/>
						))}
					</ScrollSection>
				</div>
			)}

			{/* ELECTRICAL SERVICES SECTION */}
			{categories.electrical.length > 0 && (
				<div className="space-y-8 animate-fade-in-up animate-delay-200" data-section="electrical">
					<ScrollSection 
						title="Electrical Services" 
						subtitle="Licensed electricians for all your electrical needs"
						link="/categories/electrical"
					>
						{categories.electrical.map((business) => (
							<BusinessCard
								key={business.id}
								business={{
									...transformBusinessForCard(business),
									badge: "Licensed",
								}}
							/>
						))}
					</ScrollSection>
				</div>
			)}

			{/* HVAC SERVICES SECTION */}
			{categories.hvac.length > 0 && (
				<div className="space-y-8 animate-fade-in-up animate-delay-250" data-section="hvac">
					<ScrollSection 
						title="HVAC Services" 
						subtitle="Heating, ventilation, and air conditioning specialists"
						link="/categories/hvac"
					>
						{categories.hvac.map((business) => (
							<BusinessCard
								key={business.id}
								business={{
									...transformBusinessForCard(business),
									badge: "Certified",
								}}
							/>
						))}
					</ScrollSection>
				</div>
			)}

			{/* LANDSCAPING SERVICES SECTION */}
			{categories.landscaping.length > 0 && (
				<div className="space-y-8 animate-fade-in-up animate-delay-300" data-section="landscaping">
					<ScrollSection 
						title="Landscaping & Gardening" 
						subtitle="Transform your outdoor space with professional landscaping"
						link="/categories/landscaping"
					>
						{categories.landscaping.map((business) => (
							<BusinessCard key={business.id} business={transformBusinessForCard(business)} />
						))}
					</ScrollSection>
				</div>
			)}

			{/* CLEANING SERVICES SECTION */}
			{categories.cleaning.length > 0 && (
				<div className="space-y-8 animate-fade-in-up animate-delay-350" data-section="cleaning">
					<ScrollSection 
						title="Cleaning Services" 
						subtitle="Professional cleaning for homes and businesses"
						link="/categories/cleaning"
					>
						{categories.cleaning.map((business) => (
							<BusinessCard
								key={business.id}
								business={{
									...transformBusinessForCard(business),
									badge: "Bonded",
								}}
							/>
						))}
					</ScrollSection>
				</div>
			)}

			{/* ROOFING SERVICES SECTION */}
			{categories.roofing.length > 0 && (
				<div className="space-y-8 animate-fade-in-up animate-delay-400" data-section="roofing">
					<ScrollSection 
						title="Roofing Services" 
						subtitle="Expert roofers for repairs, replacements, and maintenance"
						link="/categories/roofing"
					>
						{categories.roofing.map((business) => (
							<BusinessCard
								key={business.id}
								business={{
									...transformBusinessForCard(business),
									badge: "Insured",
								}}
							/>
						))}
					</ScrollSection>
				</div>
			)}

			{/* PAINTING SERVICES SECTION */}
			{categories.painting.length > 0 && (
				<div className="space-y-8 animate-fade-in-up animate-delay-450" data-section="painting">
					<ScrollSection 
						title="Painting Services" 
						subtitle="Professional painters for interior and exterior projects"
						link="/categories/painting"
					>
						{categories.painting.map((business) => (
							<BusinessCard key={business.id} business={transformBusinessForCard(business)} />
						))}
					</ScrollSection>
				</div>
			)}

			{/* SECURITY SERVICES SECTION */}
			{categories.security.length > 0 && (
				<div className="space-y-8 animate-fade-in-up animate-delay-500" data-section="security">
					<ScrollSection 
						title="Security Services" 
						subtitle="Protect your home and business with professional security"
						link="/categories/security"
					>
						{categories.security.map((business) => (
							<BusinessCard
								key={business.id}
								business={{
									...transformBusinessForCard(business),
									badge: "24/7",
								}}
							/>
						))}
					</ScrollSection>
				</div>
			)}

			{/* TRANSPORTATION SERVICES SECTION */}
			{categories.transportation.length > 0 && (
				<div className="space-y-8 animate-fade-in-up animate-delay-550" data-section="transportation">
					<ScrollSection 
						title="Transportation & Delivery" 
						subtitle="Moving, delivery, and transportation services"
						link="/categories/transportation"
					>
						{categories.transportation.map((business) => (
							<BusinessCard key={business.id} business={transformBusinessForCard(business)} />
						))}
					</ScrollSection>
				</div>
			)}

			{/* CHILDCARE SERVICES SECTION */}
			{categories.childcare.length > 0 && (
				<div className="space-y-8 animate-fade-in-up animate-delay-600" data-section="childcare">
					<ScrollSection 
						title="Childcare & Education" 
						subtitle="Daycare, preschool, and educational services"
						link="/categories/childcare"
					>
						{categories.childcare.map((business) => (
							<BusinessCard
								key={business.id}
								business={{
									...transformBusinessForCard(business),
									badge: "Licensed",
								}}
							/>
						))}
					</ScrollSection>
				</div>
			)}

			{/* PHOTOGRAPHY SERVICES SECTION */}
			{categories.photography.length > 0 && (
				<div className="space-y-8 animate-fade-in-up animate-delay-650" data-section="photography">
					<ScrollSection 
						title="Photography & Media" 
						subtitle="Professional photographers and media services"
						link="/categories/photography"
					>
						{categories.photography.map((business) => (
							<BusinessCard key={business.id} business={transformBusinessForCard(business)} />
						))}
					</ScrollSection>
				</div>
			)}

			{/* EVENTS & WEDDINGS SECTION */}
			{categories.events.length > 0 && (
				<div className="space-y-8 animate-fade-in-up animate-delay-700" data-section="events">
					<ScrollSection 
						title="Events & Weddings" 
						subtitle="Make your special day unforgettable with local vendors"
						link="/categories/events"
					>
						{categories.events.map((business) => (
							<BusinessCard key={business.id} business={transformBusinessForCard(business)} />
						))}
					</ScrollSection>
				</div>
			)}

			{/* REPAIR SERVICES SECTION */}
			{categories.repair.length > 0 && (
				<div className="space-y-8 animate-fade-in-up animate-delay-750" data-section="repair">
					<ScrollSection 
						title="Repair & Maintenance" 
						subtitle="Fix it right the first time with expert repair services"
						link="/categories/repair"
					>
						{categories.repair.map((business) => (
							<BusinessCard
								key={business.id}
								business={{
									...transformBusinessForCard(business),
									badge: "Guaranteed",
								}}
							/>
						))}
					</ScrollSection>
				</div>
			)}

			{/* WELLNESS SERVICES SECTION */}
			{categories.wellness.length > 0 && (
				<div className="space-y-8 animate-fade-in-up animate-delay-800" data-section="wellness">
					<ScrollSection 
						title="Wellness & Therapy" 
						subtitle="Mental health, counseling, and wellness services"
						link="/categories/wellness"
					>
						{categories.wellness.map((business) => (
							<BusinessCard
								key={business.id}
								business={{
									...transformBusinessForCard(business),
									badge: "Licensed",
								}}
							/>
						))}
					</ScrollSection>
				</div>
			)}

			{/* PROFESSIONAL SERVICES SECTION */}
			{categories.professional.length > 0 && (
				<div className="space-y-8 animate-fade-in-up animate-delay-850" data-section="professional">
					<ScrollSection 
						title="Professional Services" 
						subtitle="Consulting, business services, and professional expertise"
						link="/categories/professional"
					>
						{categories.professional.map((business) => (
							<BusinessCard key={business.id} business={transformBusinessForCard(business)} />
						))}
					</ScrollSection>
				</div>
			)}

			{/* HEALTH & WELLNESS SECTION */}
			{(categories.health.length > 0 || categories.beauty.length > 0 || categories.fitness.length > 0) && (
				<div className="space-y-8 animate-fade-in-up animate-delay-900" data-section="health-wellness">
					<ScrollSection 
						title="Health & Wellness" 
						subtitle="Medical care, beauty services, and fitness facilities"
						link="/categories/health-medical"
					>
						{[...categories.health, ...categories.beauty, ...categories.fitness].slice(0, 10).map((business) => (
							<BusinessCard key={business.id} business={transformBusinessForCard(business)} />
						))}
						{/* Sponsored wellness business */}
						<BusinessCard
							key="sponsored-wellness"
							business={sponsoredBusinesses[3]}
							sponsored={true}
						/>
					</ScrollSection>
				</div>
			)}

			{/* SHOPPING & RETAIL SECTION */}
			{categories.shopping.length > 0 && (
				<div className="space-y-8 animate-fade-in-up animate-delay-950" data-section="shopping">
					<ScrollSection 
						title="Shopping & Retail" 
						subtitle="Local shops, boutiques, and retail experiences"
						link="/categories/shopping"
					>
						{categories.shopping.map((business) => (
							<BusinessCard key={business.id} business={transformBusinessForCard(business)} />
						))}
					</ScrollSection>
				</div>
			)}

			{/* AUTOMOTIVE SERVICES SECTION */}
			{categories.automotive.length > 0 && (
				<div className="space-y-8 animate-fade-in-up animate-delay-1000" data-section="automotive">
					<ScrollSection 
						title="Automotive Services" 
						subtitle="Repair shops, maintenance, and automotive care"
						link="/categories/automotive"
					>
						{categories.automotive.map((business) => (
							<BusinessCard key={business.id} business={transformBusinessForCard(business)} />
						))}
						{/* Sponsored automotive business */}
						<BusinessCard
							key="sponsored-automotive"
							business={sponsoredBusinesses[0]}
							sponsored={true}
						/>
					</ScrollSection>
				</div>
			)}

			{/* ENTERTAINMENT & LEISURE SECTION */}
			{categories.entertainment.length > 0 && (
				<div className="space-y-8 animate-fade-in-up animate-delay-1050" data-section="entertainment">
					<ScrollSection 
						title="Entertainment & Leisure" 
						subtitle="Fun activities, events, and entertainment venues"
						link="/categories/entertainment"
					>
						{categories.entertainment.map((business) => (
							<BusinessCard key={business.id} business={transformBusinessForCard(business)} />
						))}
					</ScrollSection>
				</div>
			)}

			{/* PET SERVICES SECTION */}
			{categories.pet.length > 0 && (
				<div className="space-y-8 animate-fade-in-up animate-delay-1100" data-section="pet-services">
					<ScrollSection 
						title="Pet Services" 
						subtitle="Veterinary care, grooming, and pet supplies"
						link="/categories/pet-services"
					>
						{categories.pet.map((business) => (
							<BusinessCard key={business.id} business={transformBusinessForCard(business)} />
						))}
					</ScrollSection>
				</div>
			)}

			{/* EDUCATION & TRAINING SECTION */}
			{categories.education && categories.education.length > 0 && (
				<div className="space-y-8 animate-fade-in-up animate-delay-1150" data-section="education">
					<ScrollSection 
						title="Education & Training" 
						subtitle="Schools, training centers, and educational services"
						link="/categories/education"
					>
						{categories.education.map((business) => (
							<BusinessCard key={business.id} business={transformBusinessForCard(business)} />
						))}
					</ScrollSection>
				</div>
			)}

			{/* FINANCIAL SERVICES SECTION */}
			{categories.financial && categories.financial.length > 0 && (
				<div className="space-y-8 animate-fade-in-up animate-delay-1200" data-section="financial">
					<ScrollSection 
						title="Financial Services" 
						subtitle="Banks, insurance, and financial advisors"
						link="/categories/financial"
					>
						{categories.financial.map((business) => (
							<BusinessCard key={business.id} business={transformBusinessForCard(business)} />
						))}
					</ScrollSection>
				</div>
			)}

			{/* REAL ESTATE SECTION */}
			{categories.realEstate && categories.realEstate.length > 0 && (
				<div className="space-y-8 animate-fade-in-up animate-delay-1250" data-section="real-estate">
					<ScrollSection 
						title="Real Estate" 
						subtitle="Property management, rentals, and real estate services"
						link="/categories/real-estate"
					>
						{categories.realEstate.map((business) => (
							<BusinessCard key={business.id} business={transformBusinessForCard(business)} />
						))}
					</ScrollSection>
				</div>
			)}

			{/* TECHNOLOGY & IT SERVICES SECTION */}
			{categories.technology && categories.technology.length > 0 && (
				<div className="space-y-8 animate-fade-in-up animate-delay-1300" data-section="technology">
					<ScrollSection 
						title="Technology & IT Services" 
						subtitle="Computer repair, software, and tech support"
						link="/categories/technology"
					>
						{categories.technology.map((business) => (
							<BusinessCard key={business.id} business={transformBusinessForCard(business)} />
						))}
						{/* Sponsored technology business */}
						<BusinessCard
							key="sponsored-technology"
							business={sponsoredBusinesses[4]}
							sponsored={true}
						/>
					</ScrollSection>
				</div>
			)}

			{/* LEGAL SERVICES SECTION */}
			{categories.legal && categories.legal.length > 0 && (
				<div className="space-y-8 animate-fade-in-up animate-delay-1350" data-section="legal">
					<ScrollSection 
						title="Legal Services" 
						subtitle="Lawyers, legal advice, and legal support"
						link="/categories/legal"
					>
						{categories.legal.map((business) => (
							<BusinessCard key={business.id} business={transformBusinessForCard(business)} />
						))}
						{/* Sponsored legal business */}
						<BusinessCard
							key="sponsored-legal"
							business={sponsoredBusinesses[5]}
							sponsored={true}
						/>
					</ScrollSection>
				</div>
			)}

			{/* CONSTRUCTION & CONTRACTORS SECTION */}
			{categories.construction && categories.construction.length > 0 && (
				<div className="space-y-8 animate-fade-in-up animate-delay-1400" data-section="construction">
					<ScrollSection 
						title="Construction & Contractors" 
						subtitle="Building, renovation, and construction services"
						link="/categories/construction"
					>
						{categories.construction.map((business) => (
							<BusinessCard key={business.id} business={transformBusinessForCard(business)} />
						))}
					</ScrollSection>
				</div>
			)}
		</>
	);
}

// Empty state component for when no businesses are loaded
function EmptyBusinessState({ error, locale = 'en' }) {
	const [dictionary, setDictionary] = React.useState(null);
	
	React.useEffect(() => {
		getDictionary(locale).then(setDictionary);
	}, [locale]);
	
	const t = dictionary?.pages?.homepage?.emptyState || {};
	return (
		<div className="text-center py-24 space-y-6">
			<div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center">
				<Coffee className="w-10 h-10 text-muted-foreground" />
			</div>
			
			<div className="space-y-2">
				<h3 className="text-xl font-bold text-white">
					{error ? (t?.error?.title || "Unable to Load Businesses") : (t?.noResults?.title || "No Businesses Found")}
				</h3>
				<p className="text-muted-foreground max-w-sm mx-auto">
					{error 
						? (t?.error?.description || "We're having trouble loading businesses right now. Please try again later.")
						: (t?.noResults?.description || "We're working on adding businesses to your area. Check back soon!")
					}
				</p>
			</div>

			<div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
				<button className="px-6 py-2 border border-border text-foreground hover:bg-muted transition-colors rounded">
					<Link href="/search">{t?.actions?.browseCategories || "Browse Categories"}</Link>
				</button>
				<button className="px-6 py-2 bg-card text-card-foreground hover:bg-accent transition-colors rounded">
					<Link href="/business-submission">{t?.actions?.addBusiness || "Add Your Business"}</Link>
				</button>
			</div>

			{error && (
				<div className="mt-6 p-4 bg-destructive/10 rounded border border-destructive/20 max-w-md mx-auto">
					<p className="text-sm text-destructive">
						<strong>Error:</strong> {error}
					</p>
				</div>
			)}
		</div>
	);
}

export default async function Home({ params }) {
	const locale = params?.locale || 'en';
	const dictionary = await getDictionary(locale);
	
	// Fetch data on the server using Supabase SSR
	const { businesses, categories, error } = await getHomePageData();

	// Generate sponsored businesses
	const sponsoredBusinesses = generateSponsoredBusinesses();

	// Check if we have any businesses to display
	const hasBusinesses = businesses && businesses.length > 0;
	const hasAnyCategories = Object.values(categories).some(category => category.length > 0);

	return (
		<main className="bg-background min-h-screen">
			{/* Netflix-Style Hero Section */}
			<NetflixHeroSection />

			{/* Main Content with Mobile-Optimized Application Design */}
			<AnimationWrapper>
				<div className="px-4 py-16 lg:px-24 space-y-16 sm:space-y-20">
					{/* Show business sections if we have data, otherwise show empty state */}
					{hasAnyCategories ? (
						<>
							{/* Dynamic Business Sections with SSR Data */}
							<BusinessSections categories={categories} locale={locale} sponsoredBusinesses={sponsoredBusinesses} />

							{/* TRENDING & NEW SECTION */}
							{hasBusinesses && (
								<div className="space-y-8 animate-fade-in-up animate-delay-500" data-section="trending">
									{/* Trending This Week */}
									<ScrollSection title="Trending This Week" subtitle="Most visited businesses" link="/trending">
										{businesses.slice(0, 20).map((business) => (
											<BusinessCard key={business.id} business={transformBusinessForCard(business)} />
										))}
									</ScrollSection>

									{/* Sponsored Section - Subtle Integration */}
									<ScrollSection title="Featured Businesses" subtitle="Premium services and experiences" link="/featured">
										{sponsoredBusinesses.slice(0, 3).map((business) => (
											<BusinessCard key={business.id} business={business} sponsored={true} />
										))}
									</ScrollSection>

									{/* Recently Added */}
									{businesses.length > 20 && (
										<ScrollSection title="New Businesses" subtitle="Recently joined our platform" link="/search?sort=newest">
											{businesses.slice(-20).map((business) => (
												<BusinessCard key={business.id} business={transformBusinessForCard(business)} />
											))}
										</ScrollSection>
									)}
								</div>
							)}

							{/* Continue Browsing - Netflix Style */}
							{hasBusinesses && (
								<div className="animate-fade-in-up animate-delay-300" data-section="continue-browsing">
									<ContinueBrowsingSection businesses={businesses} />
								</div>
							)}
						</>
					) : (
						<EmptyBusinessState error={error} locale={locale} />
					)}

					{/* Enhanced Business Owner CTA - Mobile-Optimized Application Design */}
					<section className="mt-16 sm:mt-20 mb-16 sm:mb-24 animate-fade-in-scale animate-delay-400">
						{/* Mobile-optimized container with better spacing */}
						<div className="bg-card rounded-2xl sm:rounded-3xl border border-border/50 shadow-xl overflow-hidden">
							{/* Inner content with mobile-optimized spacing */}
							<div className="px-6 sm:px-8 py-16 sm:py-20 lg:px-20 lg:py-28 text-center">
								<div className="max-w-4xl mx-auto space-y-8 sm:space-y-10">
									{/* Enhanced premium badge */}
									<div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium">
										<div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
										For Business Owners
									</div>
									
									{/* Enhanced main heading with mobile typography */}
									<div className="space-y-6 sm:space-y-8">
										<h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight">
											Own a <span className="text-primary">Business</span>?
										</h2>
										
										{/* Enhanced subtitle with mobile-optimized typography */}
										<div className="space-y-4 sm:space-y-6">
											<p className="text-lg sm:text-xl lg:text-2xl text-foreground/90 leading-relaxed max-w-3xl mx-auto">
												{dictionary?.pages?.homepage?.hero?.title || "Join thousands of businesses connecting with customers"}
											</p>
											<p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
												{dictionary?.pages?.homepage?.hero?.subtitle || "Get discovered by local customers, manage your online presence, and grow your business with our powerful platform."}
											</p>
										</div>
									</div>

									{/* Enhanced statistics with mobile-friendly layout */}
									<div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 lg:gap-12 py-8 sm:py-10">
										<div className="text-center">
											<div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">50K+</div>
											<div className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">{dictionary?.pages?.homepage?.hero?.stats?.businesses || "Active Businesses"}</div>
										</div>
										<div className="hidden sm:block w-px h-12 bg-border/50"></div>
										<div className="text-center">
											<div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">1M+</div>
											<div className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">{dictionary?.pages?.homepage?.hero?.stats?.connections || "Customer Connections"}</div>
										</div>
										<div className="hidden sm:block w-px h-12 bg-border/50"></div>
										<div className="text-center">
											<div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">4.8★</div>
											<div className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">{dictionary?.pages?.homepage?.hero?.stats?.rating || "Average Rating"}</div>
										</div>
									</div>

									{/* Enhanced action buttons with mobile-optimized touch targets */}
									<div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center pt-8 sm:pt-10">
										<Link href="/claim-business" className="group touch-manipulation">
											<button className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 bg-primary text-primary-foreground font-bold text-base sm:text-lg rounded-xl hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/20 group-hover:transform active:scale-95 min-h-[48px] sm:min-h-[56px]">
												{dictionary?.pages?.homepage?.hero?.actions?.claimBusiness || "Claim Your Business"}
											</button>
										</Link>
										<Link href="/business" className="group touch-manipulation">
											<button className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 border-2 border-border text-foreground font-bold text-base sm:text-lg rounded-xl hover:bg-accent/10 hover:border-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-lg group-hover:transform active:scale-95 min-h-[48px] sm:min-h-[56px]">
												{dictionary?.pages?.homepage?.hero?.actions?.learnMore || "Learn More"}
											</button>
										</Link>
									</div>

									{/* Enhanced footer text */}
									<div className="pt-6 sm:pt-8">
										<p className="text-xs sm:text-sm text-muted-foreground/80">
											{dictionary?.pages?.homepage?.hero?.actions?.footer || "Setup takes less than 5 minutes • No monthly fees • Cancel anytime"}
										</p>
									</div>
								</div>
							</div>
						</div>
					</section>
				</div>
			</AnimationWrapper>
		</main>
	);
}
