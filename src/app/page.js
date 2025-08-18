
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
	};
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
	};

	businesses.forEach((business) => {
		const categoryName = business.business_categories?.[0]?.category?.name?.toLowerCase() || "";
		const categorySlug = business.business_categories?.[0]?.category?.slug?.toLowerCase() || "";

		if (categoryName.includes("restaurant") || categoryName.includes("food") || categorySlug.includes("restaurant")) {
			categories.restaurants.push(business);
		} else if (categoryName.includes("home") || categoryName.includes("service") || categorySlug.includes("home")) {
			categories.homeServices.push(business);
		} else if (categoryName.includes("health") || categoryName.includes("medical") || categorySlug.includes("health")) {
			categories.health.push(business);
		} else if (categoryName.includes("shop") || categoryName.includes("retail") || categorySlug.includes("shopping")) {
			categories.shopping.push(business);
		} else if (categoryName.includes("beauty") || categoryName.includes("spa") || categorySlug.includes("beauty")) {
			categories.beauty.push(business);
		} else if (categoryName.includes("auto") || categoryName.includes("car") || categorySlug.includes("automotive")) {
			categories.automotive.push(business);
		} else if (categoryName.includes("entertainment") || categorySlug.includes("entertainment")) {
			categories.entertainment.push(business);
		} else if (categoryName.includes("fitness") || categoryName.includes("gym") || categorySlug.includes("fitness")) {
			categories.fitness.push(business);
		} else if (categoryName.includes("pet") || categorySlug.includes("pet")) {
			categories.pet.push(business);
		} else {
			// Distribute remaining businesses across categories
			const keys = Object.keys(categories);
			const randomKey = keys[Math.floor(Math.random() * keys.length)];
			categories[randomKey].push(business);
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
async function BusinessSections({ categories, locale = 'en' }) {
	const dictionary = await getDictionary(locale);
	const t = dictionary?.pages?.homepage?.sections || {};
	return (
		<>
			{/* FOOD & DINING SECTION */}
			{categories.restaurants.length > 0 && (
				<div className="space-y-8 animate-fade-in-up" data-section="food-dining">
					<div className="flex justify-between items-center">
						<h2 className="text-3xl sm:text-4xl font-bold text-foreground animate-slide-in-left">{t?.foodDining?.title || "Food & Dining"}</h2>
						<Link href="/categories/restaurants" className="text-base text-muted-foreground hover:text-primary transition-colors animate-fade-in-scale animate-delay-200">
							{t?.foodDining?.seeAll || "See all"}
						</Link>
					</div>

					{/* Open Now - Restaurants */}
					<ScrollSection title={t?.foodDining?.openNow?.title || "Open Now"} subtitle={t?.foodDining?.openNow?.subtitle || "Currently serving"} link="/search?category=restaurants&open=true">
						{categories.restaurants.slice(0, 10).map((business) => (
							<BusinessCard
								key={business.id}
								business={{
									...transformBusinessForCard(business),
									status: "Open",
								}}
							/>
						))}
					</ScrollSection>

					{/* Top Rated Restaurants */}
					{categories.restaurants.length > 10 && (
						<ScrollSection title={t?.foodDining?.topRated?.title || "Top Rated"} subtitle={t?.foodDining?.topRated?.subtitle || "Highest rated dining experiences"} link="/search?category=restaurants&rating=4.5">
							{categories.restaurants.slice(10, 20).map((business) => (
								<BusinessCard key={business.id} business={transformBusinessForCard(business)} />
							))}
						</ScrollSection>
					)}
				</div>
			)}

			{/* HOME & SERVICES SECTION */}
			{categories.homeServices.length > 0 && (
				<div className="space-y-8 animate-fade-in-up animate-delay-100" data-section="home-services">
					<div className="flex justify-between items-center">
						<h2 className="text-3xl sm:text-4xl font-bold text-foreground animate-slide-in-left animate-delay-100">{t?.homeServices?.title || "Home & Professional Services"}</h2>
						<Link href="/categories/home-services" className="text-base text-muted-foreground hover:text-primary transition-colors animate-fade-in-scale animate-delay-300">
							{t?.homeServices?.seeAll || "See all"}
						</Link>
					</div>

					{/* Emergency Services */}
					<ScrollSection title={t?.homeServices?.emergency?.title || "24/7 Emergency Services"} subtitle={t?.homeServices?.emergency?.subtitle || "Available anytime you need them"} link="/search?category=home-services&emergency=true">
						{categories.homeServices.slice(0, 10).map((business) => (
							<BusinessCard
								key={business.id}
								business={{
									...transformBusinessForCard(business),
									badge: t?.homeServices?.emergency?.badge || "24/7",
								}}
							/>
						))}
					</ScrollSection>

					{/* Popular Home Services */}
					{categories.homeServices.length > 10 && (
						<ScrollSection title={t?.homeServices?.popular?.title || "Popular Services"} subtitle={t?.homeServices?.popular?.subtitle || "Most booked this month"} link="/search?category=home-services&sort=popular">
							{categories.homeServices.slice(10, 20).map((business) => (
								<BusinessCard key={business.id} business={transformBusinessForCard(business)} />
							))}
						</ScrollSection>
					)}
				</div>
			)}

			{/* HEALTH & WELLNESS SECTION */}
			{(categories.health.length > 0 || categories.beauty.length > 0 || categories.fitness.length > 0) && (
				<div className="space-y-8 animate-fade-in-up animate-delay-200" data-section="health-wellness">
					<div className="flex justify-between items-center">
						<h2 className="text-3xl sm:text-4xl font-bold text-foreground animate-slide-in-left animate-delay-200">{t?.healthWellness?.title || "Health & Wellness"}</h2>
						<Link href="/categories/health-medical" className="text-base text-muted-foreground hover:text-primary transition-colors animate-fade-in-scale animate-delay-400">
							{t?.healthWellness?.seeAll || "See all"}
						</Link>
					</div>

					{/* Medical Services */}
					{categories.health.length > 0 && (
						<ScrollSection title={t?.healthWellness?.medical?.title || "Medical & Dental"} subtitle={t?.healthWellness?.medical?.subtitle || "Healthcare providers near you"} link="/search?category=health-medical">
							{categories.health.map((business) => (
								<BusinessCard key={business.id} business={transformBusinessForCard(business)} />
							))}
						</ScrollSection>
					)}

					{/* Beauty & Spa */}
					{categories.beauty.length > 0 && (
						<ScrollSection title={t?.healthWellness?.beauty?.title || "Beauty & Relaxation"} subtitle={t?.healthWellness?.beauty?.subtitle || "Salons, spas, and wellness centers"} link="/search?category=beauty-spa">
							{categories.beauty.map((business) => (
								<BusinessCard key={business.id} business={transformBusinessForCard(business)} />
							))}
						</ScrollSection>
					)}

					{/* Fitness */}
					{categories.fitness.length > 0 && (
						<ScrollSection title={t?.healthWellness?.fitness?.title || "Fitness & Sports"} subtitle={t?.healthWellness?.fitness?.subtitle || "Gyms, yoga, and training facilities"} link="/search?category=fitness-sports">
							{categories.fitness.map((business) => (
								<BusinessCard key={business.id} business={transformBusinessForCard(business)} />
							))}
						</ScrollSection>
					)}
				</div>
			)}

			{/* SHOPPING & RETAIL SECTION */}
			{categories.shopping.length > 0 && (
				<div className="space-y-8 animate-fade-in-up animate-delay-300" data-section="shopping">
					<div className="flex justify-between items-center">
						<h2 className="text-3xl sm:text-4xl font-bold text-foreground animate-slide-in-left animate-delay-300">{t?.shopping?.title || "Shopping & Retail"}</h2>
						<Link href="/categories/shopping" className="text-base text-muted-foreground hover:text-primary transition-colors animate-fade-in-scale animate-delay-500">
							{t?.shopping?.seeAll || "See all"}
						</Link>
					</div>

					<ScrollSection title={t?.shopping?.local?.title || "Local Shops & Boutiques"} subtitle={t?.shopping?.local?.subtitle || "Unique finds in your neighborhood"} link="/search?category=shopping">
						{categories.shopping.map((business) => (
							<BusinessCard key={business.id} business={transformBusinessForCard(business)} />
						))}
					</ScrollSection>
				</div>
			)}

			{/* AUTOMOTIVE SECTION */}
			{categories.automotive.length > 0 && (
				<div className="space-y-8 animate-fade-in-up animate-delay-400" data-section="automotive">
					<div className="flex justify-between items-center">
						<h2 className="text-3xl sm:text-4xl font-bold text-foreground animate-slide-in-left animate-delay-400">{t?.automotive?.title || "Automotive Services"}</h2>
						<Link href="/categories/automotive" className="text-base text-muted-foreground hover:text-primary transition-colors animate-fade-in-scale animate-delay-500">
							{t?.automotive?.seeAll || "See all"}
						</Link>
					</div>

					<ScrollSection title={t?.automotive?.services?.title || "Auto Services"} subtitle={t?.automotive?.services?.subtitle || "Repair shops, oil changes, and detailing"} link="/search?category=automotive">
						{categories.automotive.map((business) => (
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

	// Check if we have any businesses to display
	const hasBusinesses = businesses && businesses.length > 0;
	const hasAnyCategories = Object.values(categories).some(category => category.length > 0);

	return (
		<main className="bg-background min-h-screen">
			{/* Netflix-Style Hero Section */}
			<NetflixHeroSection />

			{/* Main Content with Thorbis Design System */}
			<AnimationWrapper>
				<div className="bg-background">
					<div className="px-6 py-12 lg:px-16 space-y-16 max-w-screen-2xl mx-auto">
					{/* Show business sections if we have data, otherwise show empty state */}
					{hasAnyCategories ? (
						<>
							{/* Dynamic Business Sections with SSR Data */}
							<BusinessSections categories={categories} locale={locale} />

							{/* TRENDING & NEW SECTION */}
							{hasBusinesses && (
															<div className="space-y-8 animate-fade-in-up animate-delay-500" data-section="trending">
								<div className="flex justify-between items-center">
									<h2 className="text-3xl sm:text-4xl font-bold text-foreground animate-slide-in-left animate-delay-500">Trending & New</h2>
								</div>

									{/* Trending This Week */}
									<ScrollSection title="Trending This Week" subtitle="Most visited businesses" link="/trending">
										{businesses.slice(0, 20).map((business) => (
											<BusinessCard key={business.id} business={transformBusinessForCard(business)} />
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

					{/* Business Owner CTA - Redesigned with Thorbis Design System */}
					<section className="mt-16 mb-20 animate-fade-in-scale animate-delay-400">
						{/* Spacious container with generous padding */}
						<div className="bg-gradient-to-r from-card via-muted to-card rounded-2xl border border-border shadow-2xl">
							{/* Inner content with massive padding for breathing room */}
							<div className="px-8 py-16 sm:px-12 sm:py-20 lg:px-16 lg:py-24 text-center">
								<div className="max-w-4xl mx-auto space-y-8">
									{/* Premium badge */}
									<div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/30 rounded-full text-primary text-sm font-medium mb-4">
										<div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
										For Business Owners
									</div>
									
									{/* Main heading with more impact */}
									<div className="space-y-6">
										<h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
											Own a <span className="text-primary">Business</span>?
										</h2>
										
										{/* Enhanced subtitle with more detail */}
																			<div className="space-y-4">
										<p className="text-xl sm:text-2xl text-foreground/90 leading-relaxed max-w-3xl mx-auto">
											{dictionary?.pages?.homepage?.hero?.title || "Join thousands of businesses connecting with customers"}
										</p>
										<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
											{dictionary?.pages?.homepage?.hero?.subtitle || "Get discovered by local customers, manage your online presence, and grow your business with our powerful platform."}
										</p>
									</div>
									</div>

									{/* Statistics or trust indicators */}
									<div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 py-8">
										<div className="text-center">
											<div className="text-3xl sm:text-4xl font-bold text-foreground">50K+</div>
											<div className="text-sm text-muted-foreground mt-1">{dictionary?.pages?.homepage?.hero?.stats?.businesses || "Active Businesses"}</div>
										</div>
										<div className="hidden sm:block w-px h-12 bg-border"></div>
										<div className="text-center">
											<div className="text-3xl sm:text-4xl font-bold text-foreground">1M+</div>
											<div className="text-sm text-muted-foreground mt-1">{dictionary?.pages?.homepage?.hero?.stats?.connections || "Customer Connections"}</div>
										</div>
										<div className="hidden sm:block w-px h-12 bg-border"></div>
										<div className="text-center">
											<div className="text-3xl sm:text-4xl font-bold text-primary">4.8★</div>
											<div className="text-sm text-muted-foreground mt-1">{dictionary?.pages?.homepage?.hero?.stats?.rating || "Average Rating"}</div>
										</div>
									</div>

									{/* Enhanced action buttons with more space */}
									<div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
										<Link href="/claim-business" className="group">
											<button className="w-full sm:w-auto px-12 py-5 bg-primary text-primary-foreground font-bold text-lg rounded-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/20 group-hover:transform">
												{dictionary?.pages?.homepage?.hero?.actions?.claimBusiness || "Claim Your Business"}
											</button>
										</Link>
										<Link href="/business" className="group">
											<button className="w-full sm:w-auto px-12 py-5 border-2 border-border text-foreground font-bold text-lg rounded-lg hover:bg-accent hover:border-accent-foreground transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-accent/50 group-hover:transform">
												{dictionary?.pages?.homepage?.hero?.actions?.learnMore || "Learn More"}
											</button>
										</Link>
									</div>

									{/* Additional call-to-action text */}
									<div className="pt-6">
										<p className="text-sm text-muted-foreground/80">
											{dictionary?.pages?.homepage?.hero?.actions?.footer || "Setup takes less than 5 minutes • No monthly fees • Cancel anytime"}
										</p>
									</div>
								</div>
							</div>
						</div>
					</section>
					</div>
				</div>
			</AnimationWrapper>
		</main>
	);
}
