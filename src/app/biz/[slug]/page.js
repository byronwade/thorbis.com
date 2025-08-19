import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { BusinessDataFetchers } from "@lib/database/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { MapPin, Phone, Globe, Clock, Star, Shield, CheckCircle, MessageSquare, Share2, Heart, Users, TrendingUp, Wrench as Tools } from "lucide-react";
import Link from "next/link";
import ServiceBookingWidget from "@components/business/field-service/service-booking-widget";
import BizProfileClient from "./biz-profile-client";
import { buildBusinessUrl, toKebabCase } from "@utils";
import { generateAdvancedServerSEO } from "@utils/advanced-server-seo";

/**
 * Unified Business Profile Page for Thorbis Platform
 * Handles both ID and slug-based business lookups
 * Showcases unified discovery and field service capabilities
 */

// Helper function to fetch business data by slug only
async function fetchBusinessData(slug) {
	console.log(`Fetching business by slug: ${slug}`);

	try {
		// For slug-based queries, use the slug-specific method
		const { data: business, error } = await BusinessDataFetchers.getBusinessProfile(slug);

		// If database query fails, try mock data fallback
		if (!business && error) {
			console.log(`Database query failed for slug: ${slug}, attempting mock data fallback`);
			
			// Generate mock data directly for development
			if (process.env.NODE_ENV === "development" || slug.includes("demo") || slug.includes("test")) {
				const mockBusiness = {
					id: `mock-${slug}`,
					name: slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
					slug: slug,
					description: "This is a sample business used for testing the application. The database is not fully configured yet.",
					address: "123 Main St",
					city: "San Francisco",
					state: "CA",
					zipCode: "94105",
					country: "US",
					phone: "(555) 123-4567",
					email: "info@business.com",
					website: "https://example.com",
					logo: slug.includes("bowling") ? "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop&crop=center" : null,
					rating: 4.5,
					reviewCount: 125,
					verified: true,
					featured: false,
					status: "published",
					categories: ["Restaurant", "Food"],
					photos: [],
					reviews: [],
					hours: [],
					certifications: []
				};
				console.log(`Returning mock data for slug: ${slug}`);
				return { data: mockBusiness, error: null };
			}
		}

		// If we have business data (including mock data), return it
		if (business) {
			console.log(`Found business by slug: ${slug}`);
			return { data: business, error: null };
		}

		// If no business data and no error, this might be a development fallback
		if (!error) {
			console.log(`No business data returned for slug: ${slug}`);
			return { data: null, error: new Error("Business not found") };
		}

		console.log(`No business found for slug: ${slug}`);
		return { data: null, error: error || new Error("Business not found") };
	} catch (fetchError) {
		console.error(`Page data fetch failed in ${performance.now().toFixed(2)}ms:`, fetchError);
		return { data: null, error: fetchError };
	}
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
	const resolvedParams = await params;
	const startTime = performance.now();

	try {
		const { data: business, error } = await fetchBusinessData(resolvedParams.slug);

		const duration = performance.now() - startTime;
		console.log(`Metadata generation completed in ${duration.toFixed(2)}ms for slug: ${resolvedParams.slug}`);

		// If database query fails, use mock data for metadata
		if (error || !business) {
			console.warn("Metadata generation using fallback data:", error?.message || "No business data");
			
			const mockBusinessName = resolvedParams.slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
			const mockLocation = "San Francisco, CA";
			const mockCategory = "Professional Service";

			// Return comprehensive SEO-optimized metadata for mock business
			return {
				title: `Demo Local Business - San Francisco, CA | Thorbis`,
				description: "This is a sample business used for testing the application. The database is not fully configured yet.",
				keywords: ["Demo Local Business", "Restaurant", "San Francisco, CA", "reviews", "local business", "San Francisco", "CA"],
				openGraph: {
					title: `${mockBusinessName} | Top-Rated ${mockCategory} in ${mockLocation}`,
					description: `Professional ${mockCategory.toLowerCase()} with 4.5★ rating. Licensed, insured, free estimates. Serving ${mockLocation} with excellence.`,
					url: (() => {
						try {
							return buildBusinessUrl({
								country: 'us',
								state: 'ga',
								city: 'jasper',
								name: resolvedParams.slug,
							});
						} catch { return `/biz/${resolvedParams.slug}`; }
					})(),
					siteName: "Local Business Directory | Thorbis",
					images: [
						{
							url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=630&fit=crop",
							width: 1200,
							height: 630,
							alt: `${mockBusinessName} - Professional ${mockCategory} in ${mockLocation}`,
							type: "image/jpeg",
						},
					],
					locale: "en_US",
					type: "website",
				},
				twitter: {
					card: "summary_large_image",
					title: `${mockBusinessName} | ${mockCategory} ${mockLocation}`,
					description: `4.5★ rated ${mockCategory.toLowerCase()} • Professional service • Licensed & insured • Free estimates`,
					images: ["https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=630&fit=crop"],
					creator: "@thorbisplatform",
					site: "@thorbisplatform",
				},
				robots: {
					index: true,
					follow: true,
					googleBot: {
						index: true,
						follow: true,
						"max-image-preview": "large",
						"max-snippet": -1,
					}
				},
				alternates: {
					canonical: (() => {
						try {
							return buildBusinessUrl({
								country: 'us',
								state: 'ga',
								city: 'jasper',
								name: resolvedParams.slug,
							});
						} catch { return `/biz/${resolvedParams.slug}`; }
					})(),
				},
			};
		}

		// Validate business data before SEO generation
		if (!business.name || !business.slug) {
			console.warn("Business data is incomplete for SEO generation:", { name: business.name, slug: business.slug });
			return {
				title: `Local Business | Thorbis`,
				description: "Find and connect with local businesses in your area.",
				keywords: ["local business", "directory", "reviews"],
			};
		}

		// Check if we're in build/prerender context and use simpler SEO
		const isBuildTime = process.env.NODE_ENV === "production" && !process.env.VERCEL_ENV;

		if (isBuildTime) {
			// Use simple, reliable SEO during build to prevent prerender errors
			return {
				title: `${business.name} - ${business.city}, ${business.state} | Local Business Directory`,
				description: business.description ? `${business.description.substring(0, 155)}...` : `Find ${business.name} in ${business.city}, ${business.state}. Local business with customer reviews and contact information.`,
				keywords: [business.name, business.city, business.state, business.business_categories?.[0]?.categories?.name || "local business", "reviews", "contact"],
				openGraph: {
					title: `${business.name} - ${business.city}, ${business.state}`,
					description: business.description?.substring(0, 200) || `Local business in ${business.city}, ${business.state}`,
					type: "website",
					url: `/biz/${business.slug}`,
					siteName: "Local Business Directory",
				},
				robots: "index,follow",
				canonical: `/biz/${business.slug}`,
			};
		}

		// Extract business data for comprehensive SEO optimization
		const businessName = business.name;
		const businessLocation = business.city && business.state ? `${business.city}, ${business.state}` : business.city || "Local Area";
		const primaryCategory = business.business_categories?.[0]?.categories?.name || "Professional Service";
		const businessPhone = business.phone || "";
		const businessRating = business.rating || 4.5;
		const businessReviews = business.review_count || 0;
		const businessUrl = (() => {
			try {
				return buildBusinessUrl({
					country: (business.country || 'US').toLowerCase(),
					state: business.state,
					city: business.city,
					name: business.name,
					shortId: business.short_id || business.shortId,
				});
			} catch { return `/biz/${business.slug}`; }
		})();
		const businessImage = business.photos?.[0] || business.logo || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=630&fit=crop";

		// Enterprise-level SEO metadata with comprehensive optimization
		return {
			// Title optimized for local SEO and CTR (55-60 characters optimal)
			title: `${businessName} - ${primaryCategory} in ${businessLocation} | ${businessRating}★ Rated`,
			
			// Description optimized for SERP display and local search (155-160 characters)
			description: `${business.description?.substring(0, 100) || `Top-rated ${primaryCategory.toLowerCase()} serving ${businessLocation}`}. ${businessRating}★ rating, ${businessReviews} reviews. ${business.is_open_now ? "Open now" : "Call for hours"}. ${businessPhone ? `Call ${businessPhone}` : "Free estimates"}.`,
			
			// Comprehensive keywords for local SEO dominance
			keywords: [
				businessName,
				`${businessName} ${business.city}`,
				`${primaryCategory} ${business.city}`,
				`${primaryCategory} near me`,
				business.city, business.state,
				"professional service", "licensed insured", "top rated",
				"customer reviews", "free estimates"
			].filter(Boolean).join(", "),
			
			// Enhanced Open Graph for social sharing
			openGraph: {
				title: `${businessName} | ${businessRating}★ ${primaryCategory} in ${businessLocation}`,
				description: `${business.description?.substring(0, 160) || `Professional ${primaryCategory.toLowerCase()} with exceptional customer satisfaction`}. ${businessReviews} verified reviews. Licensed & insured.`,
				type: "website",
				locale: "en_US",
				url: businessUrl,
				siteName: "Local Business Directory | Thorbis Platform",
				images: [
					{
						url: businessImage,
						width: 1200,
						height: 630,
						alt: `${businessName} - Professional ${primaryCategory} in ${businessLocation}`,
						type: "image/jpeg",
					}
				],
			},
			
			// Optimized Twitter Card
			twitter: {
				card: "summary_large_image",
				title: `${businessName} | ${primaryCategory} ${businessLocation}`,
				description: `${businessRating}★ rated • ${businessReviews} reviews • ${business.is_open_now ? "Open now" : "Call for hours"} • Licensed & insured`,
				images: [businessImage],
				creator: "@thorbisplatform",
				site: "@thorbisplatform",
			},
			
			// Enhanced robots directives
			robots: {
				index: true,
				follow: true,
				googleBot: {
					index: true,
					follow: true,
					"max-image-preview": "large",
					"max-snippet": -1,
				}
			},
			
			// Canonical URL
			alternates: {
				canonical: businessUrl,
			},
			
			// Local SEO signals
			other: {
				"geo.region": business.state || "",
				"geo.placename": business.city || "",
				"business:category": primaryCategory,
				"business:rating:value": String(businessRating),
				"business:rating:count": String(businessReviews),
				"business:verified": business.verified ? "true" : "false"
			}
		};
	} catch (error) {
		console.error("Error generating metadata:", error);

		// Try to use basic business data if available in the error context
		const slugFromParams = resolvedParams?.slug;
		const fallbackTitle = slugFromParams ? `${slugFromParams.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())} | Local Business` : "Business Profile | Thorbis";

		return {
			title: fallbackTitle,
			description: "Find and connect with local businesses in your area.",
			keywords: ["local business", "directory", "reviews"],
			openGraph: {
				title: fallbackTitle,
				description: "Find and connect with local businesses in your area.",
				type: "website",
			},
		};
	}
}

export default async function BusinessProfilePage({ params }) {
	const resolvedParams = await params;
	const startTime = performance.now();

	try {
		const { data: business, error } = await fetchBusinessData(resolvedParams.slug);

		const duration = performance.now() - startTime;
		console.log(`Business data fetch completed in ${duration.toFixed(2)}ms for slug: ${resolvedParams.slug}`);

		// If no business found and not in development with mock data, show 404
		if (!business) {
			console.error("Business not found:", error?.message || "No business data");
			notFound();
		}

		// Check if this is a field service business and render appropriate component
		const isFieldService = business.business_type === "field_service" || business.business_categories?.some((cat) => ["plumbing", "electrical", "hvac", "landscaping", "cleaning", "handyman"].includes(cat.categories?.slug));

		if (isFieldService) {
			return <FieldServiceBusinessProfile business={business} slug={resolvedParams.slug} />;
		}

					// Generate comprehensive Schema.org structured data for SEO
		const businessSchemas = [
			// LocalBusiness Schema
			{
				"@context": "https://schema.org",
				"@type": "LocalBusiness",
				"@id": businessUrl,
				name: business.name,
				description: business.description || `Professional service provider in ${business.city || 'your area'}`,
				telephone: business.phone || "",
				address: {
					"@type": "PostalAddress",
					streetAddress: business.address || "",
					addressLocality: business.city || "",
					addressRegion: business.state || "",
					postalCode: business.zip_code || "",
					addressCountry: "US"
				},
				aggregateRating: {
					"@type": "AggregateRating",
					ratingValue: business.rating || 4.5,
					reviewCount: business.review_count || 0,
					bestRating: 5
				},
				priceRange: business.price_range || "$$",
				image: business.photos || [],
				url: `https://local.byronwade.com/biz/${business.slug}`
			},
			// Breadcrumb Schema
			{
				"@context": "https://schema.org",
				"@type": "BreadcrumbList",
				itemListElement: [
					{
						"@type": "ListItem",
						position: 1,
						name: "Home",
						item: "https://thorbis.com"
					},
					{
						"@type": "ListItem",
						position: 2,
						name: "Businesses",
						item: "https://thorbis.com/search"
					},
					{
						"@type": "ListItem",
						position: 3,
						name: business.name,
						item: businessUrl
					}
				]
			}
		];

		// Render with comprehensive SEO
		return (
			<>
				{/* Schema.org Structured Data for Maximum SEO Impact */}
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(businessSchemas)
					}}
				/>
				<BizProfileClient businessId={business.id} initialBusiness={business} />
			</>
		);
	} catch (error) {
		console.error("Error rendering business profile:", error);
		notFound();
	}
}

// Enhanced Business Profile Component for slug-based lookups
function EnhancedBusinessProfile({ business, slug }) {
	const rating = business.rating || 4.5;
	const reviewCount = business.reviews?.length || 0;
	const category = business.business_categories?.[0]?.categories?.name || "Business";

	return (
		<div className="min-h-screen bg-muted/30">
			{/* Hero Section */}
			<div className="relative h-64 md:h-80 bg-primary">
				<div className="absolute inset-0 bg-black bg-opacity-40" />
				<div className="absolute bottom-0 left-0 right-0 p-6 text-white">
					<div className="max-w-7xl mx-auto">
						<div className="flex items-center space-x-3 mb-2">
							<Badge variant="secondary" className="bg-white/20 text-white border-white/30">
								{category}
							</Badge>
							{business.verified && (
								<Badge variant="secondary" className="bg-success/20 text-success/70 border-success/30">
									<CheckCircle className="w-3 h-3 mr-1" />
									Verified
								</Badge>
							)}
						</div>
						<h1 className="text-3xl md:text-4xl font-bold mb-2">{business.name}</h1>
						<div className="flex items-center space-x-4 text-sm opacity-90">
							<div className="flex items-center">
								<Star className="w-4 h-4 mr-1 fill-yellow-400 text-warning" />
								<span className="font-medium">{rating.toFixed(1)}</span>
								<span className="ml-1">({reviewCount} reviews)</span>
							</div>
							<div className="flex items-center">
								<MapPin className="w-4 h-4 mr-1" />
								<span>
									{business.city}, {business.state}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Left Column - Main Info */}
					<div className="lg:col-span-2 space-y-6">
						{/* Quick Actions */}
						<Card>
							<CardContent className="p-6">
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									<Button variant="outline" className="flex flex-col items-center p-4 h-auto">
										<Phone className="w-6 h-6 mb-2 text-primary" />
										<span className="text-sm">Call Now</span>
									</Button>
									<Button variant="outline" className="flex flex-col items-center p-4 h-auto">
										<MessageSquare className="w-6 h-6 mb-2 text-success" />
										<span className="text-sm">Message</span>
									</Button>
									<Button variant="outline" className="flex flex-col items-center p-4 h-auto">
										<Share2 className="w-6 h-6 mb-2 text-purple-600" />
										<span className="text-sm">Share</span>
									</Button>
									<Button variant="outline" className="flex flex-col items-center p-4 h-auto">
										<Heart className="w-6 h-6 mb-2 text-destructive" />
										<span className="text-sm">Save</span>
									</Button>
								</div>
							</CardContent>
						</Card>

						{/* About Section */}
						<Card>
							<CardHeader>
								<CardTitle>About {business.name}</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground leading-relaxed">{business.description || "A trusted local business serving the community with excellent service and expertise."}</p>
							</CardContent>
						</Card>

						{/* Reviews Section */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									<span>Customer Reviews</span>
									<Badge variant="outline">{reviewCount} reviews</Badge>
								</CardTitle>
							</CardHeader>
							<CardContent>
								{business.reviews && business.reviews.length > 0 ? (
									<div className="space-y-4">
										{business.reviews.slice(0, 3).map((review) => (
											<div key={review.id} className="border-b pb-4 last:border-b-0">
												<div className="flex items-center justify-between mb-2">
													<div className="flex items-center space-x-2">
														<div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
															<Users className="w-4 h-4 text-muted-foreground" />
														</div>
														<span className="font-medium">{review.user_profiles?.full_name || "Anonymous"}</span>
													</div>
													<div className="flex items-center">
														{[...Array(5)].map((_, i) => (
															<Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-muted-foreground text-muted-foreground" : "text-muted-foreground/30"}`} />
														))}
													</div>
												</div>
												<p className="text-muted-foreground text-sm">{review.comment}</p>
											</div>
										))}
									</div>
								) : (
									<p className="text-muted-foreground text-center py-8">No reviews yet. Be the first to leave a review!</p>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Right Column - Business Details */}
					<div className="space-y-6">
						{/* Contact Info */}
						<Card>
							<CardHeader>
								<CardTitle>Contact Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex items-center">
									<MapPin className="w-5 h-5 mr-3 text-muted-foreground" />
									<div>
										<p className="font-medium">{business.address}</p>
										<p className="text-sm text-muted-foreground">
											{business.city}, {business.state} {business.zip_code}
										</p>
									</div>
								</div>
								{business.phone && (
									<div className="flex items-center">
										<Phone className="w-5 h-5 mr-3 text-muted-foreground" />
										<span>{business.phone}</span>
									</div>
								)}
								{business.website && (
									<div className="flex items-center">
										<Globe className="w-5 h-5 mr-3 text-muted-foreground" />
										<Link href={business.website} className="text-primary hover:underline" target="_blank">
											Visit Website
										</Link>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Business Hours */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center">
									<Clock className="w-5 h-5 mr-2" />
									Hours
								</CardTitle>
							</CardHeader>
							<CardContent>
								{business.business_hours && business.business_hours.length > 0 ? (
									<div className="space-y-1">
										{business.business_hours.map((hours, index) => (
											<div key={index} className="flex justify-between text-sm">
												<span className="capitalize">{hours.day_of_week}</span>
												<span>{hours.is_closed ? "Closed" : `${hours.open_time} - ${hours.close_time}`}</span>
											</div>
										))}
									</div>
								) : (
									<p className="text-muted-foreground text-sm">Hours not available</p>
								)}
							</CardContent>
						</Card>

						{/* Business Stats */}
						<Card>
							<CardHeader>
								<CardTitle>Business Highlights</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center">
										<TrendingUp className="w-5 h-5 mr-2 text-success" />
										<span className="text-sm">Rating</span>
									</div>
									<span className="font-medium">{rating.toFixed(1)}/5.0</span>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center">
										<Users className="w-5 h-5 mr-2 text-primary" />
										<span className="text-sm">Reviews</span>
									</div>
									<span className="font-medium">{reviewCount}</span>
								</div>
								{business.verified && (
									<div className="flex items-center justify-between">
										<div className="flex items-center">
											<Shield className="w-5 h-5 mr-2 text-success" />
											<span className="text-sm">Verified</span>
										</div>
										<CheckCircle className="w-5 h-5 text-success" />
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}

// Field Service Business Profile Component
function FieldServiceBusinessProfile({ business, slug }) {
	return (
		<div className="min-h-screen bg-muted/30">
			{/* Field Service Hero */}
			<div className="relative h-64 md:h-80 bg-primary">
				<div className="absolute inset-0 bg-black bg-opacity-40" />
				<div className="absolute bottom-0 left-0 right-0 p-6 text-white">
					<div className="max-w-7xl mx-auto">
						<div className="flex items-center space-x-3 mb-2">
							<Badge variant="secondary" className="bg-white/20 text-white border-white/30">
								<Tools className="w-3 h-3 mr-1" />
								Field Service
							</Badge>
							{business.verified && (
								<Badge variant="secondary" className="bg-success/20 text-success/70 border-success/30">
									<CheckCircle className="w-3 h-3 mr-1" />
									Verified Professional
								</Badge>
							)}
						</div>
						<h1 className="text-3xl md:text-4xl font-bold mb-2">{business.name}</h1>
						<p className="text-lg opacity-90">
							Professional field services in {business.city}, {business.state}
						</p>
					</div>
				</div>
			</div>

			{/* Service Booking Widget */}
			<div className="max-w-7xl mx-auto px-4 py-8">
				<ServiceBookingWidget businessId={business.id} />
			</div>
		</div>
	);
}
