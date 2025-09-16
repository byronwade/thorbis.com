import HomesClient from "./homes-client";
// import { HomeDataFetchers } from "@/lib/database/supabase/server";

// Transform Supabase home data to match client component expectations
function transformHomeData(home) {
	const formatPrice = (price) => {
		if (!price) return "Contact for price";
		return `$${price.toLocaleString()}`;
	};

	const formatPricePerSqft = (price, sqft) => {
		if (!price || !sqft) return null;
		const pricePerSqft = Math.round(price / sqft);
		return `$${pricePerSqft}/sqft`;
	};

	const formatPostedDate = (dateString) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffTime = Math.abs(now - date);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 1) return "1d ago";
		if (diffDays < 7) return `${diffDays}d ago`;
		if (diffDays < 30) return `${Math.ceil(diffDays / 7)}w ago`;
		return `${Math.ceil(diffDays / 30)}m ago`;
	};

	const formatLotSize = (lotSize, unit) => {
		if (!lotSize) return null;
		if (unit === "acres") {
			return `${lotSize} acre${lotSize !== 1 ? 's' : '}`;
		}
		return `${lotSize.toLocaleString()} sqft lot`;
	};

	return {
		id: home.id,
		title: home.title || home.address,
		address: home.address,
		city: home.city,
		state: home.state,
		zip: home.zip_code,
		price: formatPrice(home.price),
		pricePerSqft: formatPricePerSqft(home.price, home.square_feet),
		beds: home.bedrooms,
		baths: home.bathrooms,
		sqft: home.square_feet,
		lotSize: formatLotSize(home.lot_size, home.lot_size_unit),
		yearBuilt: home.year_built,
		propertyType: home.property_type || "Single Family Home",
		homeType: home.home_type || "Detached",
		description: home.description?.substring(0, 200) + "..." || "No description available",
		posted: formatPostedDate(home.created_at),
		status: home.listing_status || "Active", // Active, Pending, Sold, Off Market
		daysOnMarket: home.days_on_market || 0,
		images: home.images || [],
		virtualTour: home.virtual_tour_url,
		floorPlan: home.floor_plan_url,
		amenities: home.amenities || [],
		appliances: home.appliances || [],
		features: home.features || [],
		heating: home.heating_type,
		cooling: home.cooling_type,
		parking: home.parking_spaces,
		garage: home.garage_spaces,
		basement: home.has_basement || false,
		pool: home.has_pool || false,
		fireplace: home.fireplace_count || 0,
		hoa: home.hoa_fee,
		taxes: home.annual_taxes,
		schools: home.nearby_schools || [],
		walkScore: home.walk_score,
		coordinates: {
			lat: home.latitude,
			lng: home.longitude,
		},
		tags: home.tags || [],
		agent: {
			id: home.agents?.id,
			name: home.agents?.name,
			phone: home.agents?.phone,
			email: home.agents?.email,
			photo: home.agents?.photo,
			company: home.agents?.company,
			license: home.agents?.license_number,
		},
	};
}

async function getHomesData(searchParams) {
	const params = {
		search: searchParams.search || searchParams.q || "",
		location: searchParams.location || "",
		propertyType: searchParams.property_type || "",
		minPrice: searchParams.min_price ? parseInt(searchParams.min_price) : undefined,
		maxPrice: searchParams.max_price ? parseInt(searchParams.max_price) : undefined,
		beds: searchParams.beds ? parseInt(searchParams.beds) : undefined,
		baths: searchParams.baths ? parseInt(searchParams.baths) : undefined,
		minSqft: searchParams.min_sqft ? parseInt(searchParams.min_sqft) : undefined,
		maxSqft: searchParams.max_sqft ? parseInt(searchParams.max_sqft) : undefined,
		minYear: searchParams.min_year ? parseInt(searchParams.min_year) : undefined,
		maxYear: searchParams.max_year ? parseInt(searchParams.max_year) : undefined,
		status: searchParams.status || "Active",
		hasPool: searchParams.pool === "true",
		hasBasement: searchParams.basement === "true",
		garage: searchParams.garage === "true",
		sortBy: searchParams.sort_by || "created_at",
		sortOrder: searchParams.sort_order || "desc",
		limit: parseInt(searchParams.limit || "20"),
		offset: parseInt(searchParams.offset || "0"),
	};

	// Temporary mock data until HomeDataFetchers is implemented
	// const { data: homesResult, error } = await HomeDataFetchers.getHomes(params);

	// if (error) {
	// 	console.error("Failed to fetch homes: `, error);
	// 	return { homes: [], total: 0, hasMore: false };
	// }

	return {
		homes: [],
		total: 0,
		hasMore: false,
	};
}

export async function generateMetadata({ searchParams }) {
	const awaitedSearchParams = await searchParams;
	const query = awaitedSearchParams.search || awaitedSearchParams.q || "";
	const location = awaitedSearchParams.location || "";

	let title = "Find Homes for Sale - Thorbis";
	let description = "Search homes for sale in your area. Find single family homes, condos, townhomes, and more with detailed listings and photos.";

	if (query && location) {
		title = `${query} Homes for Sale in ${location} - Thorbis`;
		description = `Find ${query} homes for sale in ${location}. Browse listings with photos, details, and neighborhood information.`;
	} else if (query) {
		title = `${query} Homes for Sale - Thorbis`;
		description = `Find ${query} homes for sale across various locations. Browse detailed listings and property information.`;
	} else if (location) {
		title = `Homes for Sale in ${location} - Thorbis`;
		description = `Find homes for sale in ${location}. Search single family homes, condos, and townhomes with detailed listings.`;
	}

	return {
		title,
		description,
		keywords: ["homes", "houses", "real estate", "for sale", "property", "listings", query, location].filter(Boolean),
		openGraph: {
			title,
			description,
			type: "website",
			url: "https://thorbis.com/homes",
			images: [`https://thorbis.com/opengraph-image?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}'],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: ['https://thorbis.com/twitter-image?title=${encodeURIComponent(title)}'],
		},
		robots: { index: true, follow: true },
		alternates: { canonical: "https://thorbis.com/homes" },
	};
}

async function HomesList({ searchParams }) {
	const homesData = await getHomesData(searchParams);

	return <HomesClient homes={homesData.homes} searchMetadata={homesData} searchParams={searchParams} />;
}

export default async function HomesPage({ searchParams }) {
	const awaitedSearchParams = await searchParams;

	return (
		<HomesList searchParams={awaitedSearchParams} />
	);
}