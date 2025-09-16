import ServicesClient from "./services-client";
import AISearchAssistant from "@/components/ai/AISearchAssistant";
import TransactionButtons from "@/components/ai/TransactionButtons";
import Script from "next/script";
// import { ServiceDataFetchers } from "@/lib/database/supabase/server";

// Transform Supabase service data to match client component expectations
function transformServiceData(service) {
	const formatPrice = (price, priceType) => {
		if (!price) return "Contact for price";
		const formattedPrice = `$${price.toLocaleString()}`;
		if (priceType === "hourly") return `${formattedPrice}/hr`;
		if (priceType === "per_project") return `${formattedPrice} per project`;
		if (priceType === "per_service") return `${formattedPrice} per service`;
		return formattedPrice;
	};

	const formatRating = (rating) => {
		if (!rating) return 0;
		return Math.round(rating * 10) / 10;
	};

	return {
		id: service.id,
		title: service.title,
		description: service.description?.substring(0, 200) + "..." || "No description available",
		category: service.category || "General Services",
		subcategory: service.subcategory,
		price: formatPrice(service.price, service.price_type),
		priceType: service.price_type || "per_service",
		minPrice: service.min_price ? formatPrice(service.min_price, service.price_type) : null,
		maxPrice: service.max_price ? formatPrice(service.max_price, service.price_type) : null,
		location: service.location,
		city: service.city,
		state: service.state,
		serviceArea: service.service_area || "Local",
		isRemote: service.is_remote || false,
		isEmergency: service.is_emergency || false,
		availability: service.availability || "Mon-Fri 9AM-5PM",
		responseTime: service.response_time || "Within 24 hours",
		tags: service.tags || [],
		certifications: service.certifications || [],
		yearsExperience: service.years_experience,
		images: service.images || [],
		portfolio: service.portfolio || [],
		provider: {
			id: service.providers?.id,
			name: service.providers?.name,
			businessName: service.providers?.business_name,
			phone: service.providers?.phone,
			email: service.providers?.email,
			rating: formatRating(service.providers?.rating),
			reviewCount: service.providers?.review_count || 0,
			verified: service.providers?.is_verified || false,
			profileImage: service.providers?.profile_image,
		},
	};
}

async function getServicesData(searchParams) {
	const params = {
		search: searchParams.search || searchParams.q || "",
		location: searchParams.location || "",
		category: searchParams.category || "",
		subcategory: searchParams.subcategory || "",
		minPrice: searchParams.min_price ? parseInt(searchParams.min_price) : undefined,
		maxPrice: searchParams.max_price ? parseInt(searchParams.max_price) : undefined,
		isRemote: searchParams.remote === "true" ? true : searchParams.remote === "false" ? false : undefined,
		isEmergency: searchParams.emergency === "true",
		rating: searchParams.min_rating ? parseFloat(searchParams.min_rating) : undefined,
		sortBy: searchParams.sort_by || "rating",
		sortOrder: searchParams.sort_order || "desc",
		limit: parseInt(searchParams.limit || "20"),
		offset: parseInt(searchParams.offset || "0"),
	};

	// Enhanced mock data with AI-driven services and transaction capabilities
	const mockServices = [
		{
			id: "service-1",
			title: "24/7 Emergency Plumbing Services",
			description: "Professional emergency plumbing services with instant booking. We handle burst pipes, clogged drains, water heater repairs, and all plumbing emergencies. Available 24/7 with 30-minute response time.",
			category: "Home Services",
			subcategory: "Plumbing",
			price: 150,
			price_type: "hourly",
			min_price: 99,
			max_price: 250,
			location: "Santa Cruz, CA",
			city: "Santa Cruz",
			state: "CA",
			service_area: "Santa Cruz County",
			is_remote: false,
			is_emergency: true,
			availability: "24/7 Emergency Service",
			response_time: "30 minutes",
			tags: ["emergency", "licensed", "insured", "warranty"],
			certifications: ["Licensed Plumber", "Insured", "Bonded"],
			years_experience: 15,
			images: ["/images/services/plumbing-1.jpg"],
			aiScore: 95,
			transactionType: "service",
			providers: {
				id: "provider-1",
				name: "Mike Johnson",
				business_name: "Johnson Plumbing Pro",
				phone: "(831) 555-0123",
				email: "mike@johnsonplumbing.com",
				rating: 4.9,
				review_count: 247,
				is_verified: true,
				profile_image: "/images/providers/mike-johnson.jpg"
			}
		},
		{
			id: "service-2",
			title: "AI-Powered Home Security Installation",
			description: "Next-generation smart home security systems with AI monitoring, facial recognition, and mobile app control. Professional installation with lifetime support and monitoring services.",
			category: "Home Services",
			subcategory: "Security",
			price: 2500,
			price_type: "per_project",
			min_price: 1500,
			max_price: 5000,
			location: "San Jose, CA",
			city: "San Jose",
			state: "CA",
			service_area: "Bay Area",
			is_remote: false,
			is_emergency: false,
			availability: "Mon-Sat 8AM-8PM",
			response_time: "Same day consultation",
			tags: ["AI-powered", "smart-home", "24/7-monitoring", "mobile-app"],
			certifications: ["Security Licensed", "Smart Home Certified", "Insurance Approved"],
			years_experience: 10,
			images: ["/images/services/security-1.jpg"],
			aiScore: 92,
			transactionType: "service",
			providers: {
				id: "provider-2",
				name: "Sarah Chen",
				business_name: "Smart Security Solutions",
				phone: "(408) 555-0456",
				email: "sarah@smartsecuritysolutions.com",
				rating: 4.8,
				review_count: 189,
				is_verified: true,
				profile_image: "/images/providers/sarah-chen.jpg"
			}
		},
		{
			id: "service-3",
			title: "Electric Vehicle Charging Station Installation",
			description: "Professional EV charging station installation for homes and businesses. Tesla-certified technicians with permits included. Smart charging solutions with mobile app integration.",
			category: "Automotive",
			subcategory: "Electric Vehicle Services",
			price: 1200,
			price_type: "per_project",
			min_price: 800,
			max_price: 2000,
			location: "Palo Alto, CA",
			city: "Palo Alto",
			state: "CA",
			service_area: "Silicon Valley",
			is_remote: false,
			is_emergency: false,
			availability: "Mon-Fri 7AM-6PM",
			response_time: "Within 48 hours",
			tags: ["tesla-certified", "permits-included", "smart-charging", "warranty"],
			certifications: ["Tesla Certified", "Licensed Electrician", "Permit Ready"],
			years_experience: 8,
			images: ["/images/services/ev-charging.jpg"],
			aiScore: 88,
			transactionType: "service",
			providers: {
				id: "provider-3",
				name: "David Rodriguez",
				business_name: "EV Solutions Pro",
				phone: "(650) 555-0789",
				email: "david@evsolutionspro.com",
				rating: 4.7,
				review_count: 156,
				is_verified: true,
				profile_image: "/images/providers/david-rodriguez.jpg"
			}
		},
		{
			id: "service-4",
			title: "Professional House Cleaning with Eco-Friendly Products",
			description: "Premium house cleaning service using only eco-friendly, non-toxic products. Recurring or one-time cleaning available. Online booking with satisfaction guarantee.",
			category: "Home Services",
			subcategory: "Cleaning",
			price: 120,
			price_type: "per_service",
			min_price: 80,
			max_price: 200,
			location: "Los Altos, CA",
			city: "Los Altos",
			state: "CA",
			service_area: "Peninsula",
			is_remote: false,
			is_emergency: false,
			availability: "Mon-Sat 8AM-6PM",
			response_time: "Next day booking",
			tags: ["eco-friendly", "insured", "recurring", "satisfaction-guarantee"],
			certifications: ["Bonded", "Insured", "Eco-Certified"],
			years_experience: 12,
			images: ["/images/services/cleaning-1.jpg"],
			aiScore: 90,
			transactionType: "service",
			providers: {
				id: "provider-4",
				name: "Maria Gonzalez",
				business_name: "Green Clean Team",
				phone: "(650) 555-0321",
				email: "maria@greencleanteam.com",
				rating: 4.9,
				review_count: 312,
				is_verified: true,
				profile_image: "/images/providers/maria-gonzalez.jpg"
			}
		}
	];

	// Filter and search through mock services
	let filteredServices = mockServices;

	if (params.search || params.category || params.location) {
		filteredServices = mockServices.filter(service => {
			const matchesSearch = !params.search || 
				service.title.toLowerCase().includes(params.search.toLowerCase()) ||
				service.description.toLowerCase().includes(params.search.toLowerCase()) ||
				service.category.toLowerCase().includes(params.search.toLowerCase());
			
			const matchesCategory = !params.category || 
				service.category.toLowerCase().includes(params.category.toLowerCase());
			
			const matchesLocation = !params.location ||
				service.location.toLowerCase().includes(params.location.toLowerCase()) ||
				service.city.toLowerCase().includes(params.location.toLowerCase()) ||
				service.state.toLowerCase().includes(params.location.toLowerCase());
			
			return matchesSearch && matchesCategory && matchesLocation;
		});
	}

	// Transform the data
	const transformedServices = filteredServices.map(transformServiceData);

	return {
		services: transformedServices,
		total: transformedServices.length,
		hasMore: false,
		aiEnhanced: true,
		searchContext: {
			query: params.search,
			location: params.location,
			category: params.category
		}
	};
}

export async function generateMetadata({ searchParams }) {
	const awaitedSearchParams = await searchParams;
	const query = awaitedSearchParams.search || awaitedSearchParams.q || "";
	const location = awaitedSearchParams.location || "";

	let title = "AI-Powered Service Discovery - Book Local Professionals Instantly | Thorbis";
	let description = "Revolutionary AI search for local services. Book plumbers, electricians, cleaners, contractors instantly. Natural language search: 'Find a plumber near me who works weekends`.";

	if (query && location) {
		title = `${query} Services in ${location} - AI-Powered Booking | Thorbis`;
		description = `Find and book ${query} services in ${location} instantly. AI-powered matching with verified professionals. Transparent pricing and instant booking.`;
	} else if (query) {
		title = `${query} Services - AI Search & Instant Booking | Thorbis`;
		description = `Discover ${query} services with AI-powered search. Compare verified professionals, read reviews, and book instantly with transparent pricing.`;
	} else if (location) {
		title = `Local Services in ${location} - AI Discovery & Booking | Thorbis`;
		description = `Find local services in ${location} with AI-powered search. Instant booking for plumbers, electricians, cleaners, and contractors.`;
	}

	return {
		title,
		description,
		keywords: [
			"AI service discovery", 
			"instant booking", 
			"local professionals", 
			"smart service search",
			"verified contractors",
			"transparent pricing",
			"emergency services",
			"natural language search",
			query, 
			location
		].filter(Boolean),
		openGraph: {
			title,
			description,
			type: "website",
			url: `https://thorbis.com/services${query || location ? `?${new URLSearchParams(awaitedSearchParams).toString()}` : ""}`,
			siteName: "Thorbis",
			images: [{
				url: `https://thorbis.com/opengraph-image?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`,
				width: 1200,
				height: 630,
				alt: "Thorbis AI-Powered Service Discovery"
			}],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			creator: "@thorbis",
			images: [`https://thorbis.com/twitter-image?title=${encodeURIComponent(title)}`],
		},
		robots: { 
			index: true, 
			follow: true,
			"max-image-preview": "large",
			"max-snippet": -1,
			"max-video-preview": -1
		},
		alternates: { 
			canonical: `https://thorbis.com/services${query || location ? `?${new URLSearchParams(awaitedSearchParams).toString()}` : ""}`,
			languages: {
				"en-US": `https://thorbis.com/en-US/services`,
				"es-ES": `https://thorbis.com/es-ES/services`
			}
		},
		category: "services",
		classification: "service marketplace",
		other: {
			"theme-color": "hsl(var(--primary))",
			"color-scheme": "light dark",
		}
	};
}

// Enhanced JSON-LD structured data for services
function createServicesJsonLd(servicesData, searchParams) {
	const baseUrl = "https://thorbis.com";
	
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: "AI-Powered Local Services Directory",
		description: "Find and book local services with AI-powered search and instant booking capabilities",
		url: `${baseUrl}/services${searchParams.search || searchParams.location ? `?${new URLSearchParams(searchParams).toString()}` : ""}`,
		numberOfItems: servicesData.total,
		itemListOrder: "https://schema.org/ItemListOrderAscending",
		provider: {
			"@type": "Organization",
			name: "Thorbis",
			url: baseUrl,
			logo: `${baseUrl}/logos/ThorbisLogo.webp`,
			contactPoint: {
				"@type": "ContactPoint",
				contactType: "customer service"
			}
		},
		itemListElement: servicesData.services.slice(0, 10).map((service, index) => ({
			"@type": "Service",
			"@id": `${baseUrl}/services/${service.id}`,
			position: index + 1,
			name: service.title,
			description: service.description,
			serviceType: service.category,
			category: service.subcategory,
			provider: {
				"@type": "LocalBusiness",
				name: service.provider.businessName || service.provider.name,
				telephone: service.provider.phone,
				email: service.provider.email,
				address: {
					"@type": "PostalAddress",
					addressLocality: service.city,
					addressRegion: service.state,
					addressCountry: "US"
				},
				aggregateRating: service.provider.rating ? {
					"@type": "AggregateRating",
					ratingValue: service.provider.rating,
					reviewCount: service.provider.reviewCount || 0,
					bestRating: 5,
					worstRating: 1
				} : undefined
			},
			offers: {
				"@type": "Offer",
				price: service.price.toString(),
				priceCurrency: "USD",
				priceSpecification: {
					"@type": "PriceSpecification",
					price: service.price,
					priceCurrency: "USD",
					unitText: service.priceType === "hourly" ? "per hour" : 
							 service.priceType === "per_project" ? "per project" : 
							 service.priceType === "per_service" ? "per service" : "fixed"
				},
				availability: service.isEmergency ? "https://schema.org/InStock" : "https://schema.org/InStock",
				validFrom: new Date().toISOString(),
				seller: {
					"@type": "Organization",
					name: service.provider.businessName || service.provider.name
				}
			},
			areaServed: {
				"@type": "Place",
				name: service.location,
				address: {
					"@type": "PostalAddress",
					addressLocality: service.city,
					addressRegion: service.state,
					addressCountry: "US"
				}
			},
			hoursAvailable: service.availability ? {
				"@type": "OpeningHours",
				description: service.availability
			} : undefined,
			additionalProperty: [
				...(service.isEmergency ? [{
					"@type": "PropertyValue",
					name: "Emergency Service",
					value: "Available 24/7"
				}] : []),
				{
					"@type": "PropertyValue", 
					name: "Response Time",
					value: service.responseTime
				},
				{
					"@type": "PropertyValue",
					name: "Years of Experience", 
					value: service.yearsExperience?.toString() || "Professional"
				},
				...(service.certifications?.map(cert => ({
					"@type": "PropertyValue",
					name: "Certification",
					value: cert
				})) || [])
			],
			// Enhanced with AI capabilities
			...(servicesData.aiEnhanced && {
				potentialAction: {
					"@type": "ReserveAction",
					name: "Book Service",
					target: {
						"@type": "EntryPoint",
						urlTemplate: `${baseUrl}/services/${service.id}/book`,
						description: "Instant booking with AI-powered scheduling"
					}
				}
			})
		}))
	};

	// Add search context if available
	if (servicesData.searchContext?.query) {
		jsonLd.mainEntity = {
			"@type": "SearchResultsPage",
			name: `Search results for: ${servicesData.searchContext.query}',
			about: {
				"@type": "Thing",
				name: servicesData.searchContext.query,
				description: 'Service search results for ${servicesData.searchContext.query}'
			}
		};
	}

	return jsonLd;
}

async function ServicesList({ searchParams }) {
	const servicesData = await getServicesData(searchParams);
	const jsonLd = createServicesJsonLd(servicesData, searchParams);

	const handleAISearch = (query, filters) => {
		// This would typically update URL params and trigger a new search
		const newParams = new URLSearchParams();
		if (query) newParams.set('search', query);
		if (filters?.location) newParams.set('location', filters.location);
		if (filters?.category) newParams.set('category', filters.category);
		if (filters?.minRating) newParams.set('min_rating', filters.minRating.toString());
		if (filters?.maxPrice) newParams.set('max_price', filters.maxPrice);
		
		// In a real app, this would navigate to the new URL
		console.log('AI Search:', query, filters);
		window.location.href = '/services?${newParams.toString()}';
	};

	return (
		<>
			{/* AI-Powered Search Header */}
			<div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12">
				<div className="container mx-auto px-4">
					<div className="max-w-4xl mx-auto text-center mb-8">
						<h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
							AI-Powered Service Discovery
						</h1>
						<p className="text-lg text-muted-foreground mb-8">
							Book local professionals instantly with natural language search
						</p>
						
						{/* AI Search Assistant */}
						<AISearchAssistant
							onSearch={handleAISearch}
							placeholder="Try: 'Find a plumber near me who works weekends and has 5-star reviews'"
							className="max-w-3xl mx-auto"
							initialQuery={searchParams.search || searchParams.q || ""}
							location={searchParams.location || ""}
						/>
					</div>
				</div>
			</div>

			{/* Services Results */}
			<div className="container mx-auto px-4 py-8">
				{servicesData.aiEnhanced && (
					<div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
						<p className="text-sm text-purple-600 dark:text-purple-400 flex items-center gap-2">
							<span className="text-lg">✨</span>
							AI Enhanced Results: Showing {servicesData.total} services with intelligent matching
						</p>
					</div>
				)}
				
				<ServicesClient 
					services={servicesData.services} 
					searchMetadata={servicesData} 
					searchParams={searchParams}
					aiEnhanced={servicesData.aiEnhanced}
				/>
			</div>

			{/* Enhanced Structured Data */}
			<Script
				id="services-jsonld"
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(jsonLd, null, 2)
				}}
			/>
		</>
	);
}

export default async function ServicesPage({ searchParams }) {
	const awaitedSearchParams = await searchParams;

	return (
		<ServicesList searchParams={awaitedSearchParams} />
	);
}