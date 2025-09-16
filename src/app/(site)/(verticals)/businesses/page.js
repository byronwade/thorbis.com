import BusinessesClient from "./businesses-client";
// import { BusinessDataFetchers } from "@/lib/database/supabase/server";

// Transform Supabase business data to match client component expectations
function transformBusinessData(business) {
	const formatRating = (rating) => {
		if (!rating) return 0;
		return Math.round(rating * 10) / 10;
	};

	const formatHours = (hours) => {
		if (!hours) return "Call for hours";
		return hours;
	};

	const formatPriceRange = (priceRange) => {
		if (!priceRange) return "$";
		return priceRange; // $, $$, $$$, $$$$
	};

	const formatDistance = (distance) => {
		if (!distance) return null;
		return distance < 1 ? `${Math.round(distance * 10) / 10} mi` : `${Math.round(distance)} mi`;
	};

	return {
		id: business.id,
		name: business.name,
		description: business.description?.substring(0, 200) + "..." || "No description available",
		category: business.category || "Business",
		subcategories: business.subcategories || [],
		phone: business.phone,
		email: business.email,
		website: business.website,
		address: business.address,
		city: business.city,
		state: business.state,
		zip: business.zip_code,
		rating: formatRating(business.rating),
		reviewCount: business.review_count || 0,
		hours: formatHours(business.hours),
		priceRange: formatPriceRange(business.price_range),
		yearEstablished: business.year_established,
		employeeCount: business.employee_count,
		distance: formatDistance(business.distance),
		images: business.images || [],
		logo: business.logo,
		coverPhoto: business.cover_photo,
		services: business.services || [],
		amenities: business.amenities || [],
		paymentMethods: business.payment_methods || [],
		languages: business.languages || ["English"],
		socialMedia: {
			facebook: business.facebook_url,
			instagram: business.instagram_url,
			twitter: business.twitter_url,
			linkedin: business.linkedin_url,
		},
		businessHours: business.business_hours || {},
		specialHours: business.special_hours || {},
		isVerified: business.is_verified || false,
		isClaimed: business.is_claimed || false,
		isSponsored: business.is_sponsored || false,
		hasDelivery: business.has_delivery || false,
		hasPickup: business.has_pickup || false,
		acceptsReservations: business.accepts_reservations || false,
		wheelchairAccessible: business.wheelchair_accessible || false,
		parkingAvailable: business.parking_available || false,
		wifiAvailable: business.wifi_available || false,
		outdoorSeating: business.outdoor_seating || false,
		petFriendly: business.pet_friendly || false,
		tags: business.tags || [],
		coordinates: {
			lat: business.latitude,
			lng: business.longitude,
		},
		owner: {
			id: business.owners?.id,
			name: business.owners?.name,
			email: business.owners?.email,
		},
	};
}

async function getBusinessesData(searchParams) {
	const params = {
		search: searchParams.search || searchParams.q || "",
		location: searchParams.location || "",
		category: searchParams.category || "",
		subcategory: searchParams.subcategory || "",
		rating: searchParams.min_rating ? parseFloat(searchParams.min_rating) : undefined,
		priceRange: searchParams.price_range || "",
		hasDelivery: searchParams.delivery === "true",
		hasPickup: searchParams.pickup === "true",
		acceptsReservations: searchParams.reservations === "true",
		wheelchairAccessible: searchParams.accessible === "true",
		petFriendly: searchParams.pet_friendly === "true",
		openNow: searchParams.open_now === "true",
		verified: searchParams.verified === "true",
		sortBy: searchParams.sort_by || "rating",
		sortOrder: searchParams.sort_order || "desc",
		radius: searchParams.radius ? parseInt(searchParams.radius) : undefined,
		limit: parseInt(searchParams.limit || "20"),
		offset: parseInt(searchParams.offset || "0"),
	};

	// Temporary mock data until BusinessDataFetchers is implemented
	// const { data: businessesResult, error } = await BusinessDataFetchers.getBusinesses(params);

	// if (error) {
	// 	console.error("Failed to fetch businesses: `, error);
	// 	return { businesses: [], total: 0, hasMore: false };
	// }

	return {
		businesses: [],
		total: 0,
		hasMore: false,
	};
}

export async function generateMetadata({ searchParams }) {
	const awaitedSearchParams = await searchParams;
	const query = awaitedSearchParams.search || awaitedSearchParams.q || "";
	const location = awaitedSearchParams.location || "";
	const category = awaitedSearchParams.category || "";

	let title = "Find Local Businesses - Thorbis";
	let description = "Discover local businesses, restaurants, shops, and services in your area. Read reviews and find contact information.";

	if (query && location) {
		title = `${query} in ${location} - Thorbis`;
		description = `Find ${query} businesses in ${location}. Read reviews, get contact info, and discover local services.`;
	} else if (category && location) {
		title = `${category} in ${location} - Thorbis`;
		description = `Find ${category} businesses in ${location}. Browse local options with reviews and contact information.`;
	} else if (query) {
		title = `${query} Businesses - Thorbis`;
		description = `Find ${query} businesses across various locations. Read reviews and get contact information.`;
	} else if (location) {
		title = `Businesses in ${location} - Thorbis`;
		description = `Find local businesses in ${location}. Browse restaurants, shops, services, and more with reviews.`;
	}

	return {
		title,
		description,
		keywords: ["businesses", "local", "restaurants", "shops", "services", "reviews", query, location, category].filter(Boolean),
		openGraph: {
			title,
			description,
			type: "website",
			url: "https://thorbis.com/businesses",
			images: [`https://thorbis.com/opengraph-image?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [`https://thorbis.com/twitter-image?title=${encodeURIComponent(title)}`],
		},
		robots: { index: true, follow: true },
		alternates: { canonical: "https://thorbis.com/businesses" },
	};
}

async function BusinessesList({ searchParams }) {
	const businessesData = await getBusinessesData(searchParams);

	return <BusinessesClient businesses={businessesData.businesses} searchMetadata={businessesData} searchParams={searchParams} />;
}

export default async function BusinessesPage({ searchParams }) {
	const awaitedSearchParams = await searchParams;

	return (
		<BusinessesList searchParams={awaitedSearchParams} />
	);
}