import RentalsClient from "./rentals-client";
// import { RentalDataFetchers } from "@/lib/database/supabase/server";


// Transform Supabase rental data to match client component expectations
function transformRentalData(rental) {
	const formatPrice = (price) => {
		if (!price) return "Contact for price";
		return `$${price.toLocaleString()}/mo`;
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

	return {
		id: rental.id,
		title: rental.title || rental.address,
		address: rental.address,
		city: rental.city,
		state: rental.state,
		zip: rental.zip_code,
		price: formatPrice(rental.price),
		beds: rental.bedrooms,
		baths: rental.bathrooms,
		sqft: rental.square_feet,
		type: rental.property_type || "Apartment",
		posted: formatPostedDate(rental.created_at),
		description: rental.description?.substring(0, 200) + "..." || "No description available",
		amenities: rental.amenities || [],
		petsAllowed: rental.pets_allowed,
		parking: rental.parking,
		laundry: rental.laundry,
		availableDate: rental.available_date,
		images: rental.images || [],
		landlord: {
			id: rental.landlords?.id,
			name: rental.landlords?.name,
			phone: rental.landlords?.phone,
			email: rental.landlords?.email,
		},
	};
}

async function getRentalsData(searchParams) {
	const params = {
		search: searchParams.search || searchParams.q || "",
		location: searchParams.location || "",
		propertyType: searchParams.type || "",
		minPrice: searchParams.min_price ? parseInt(searchParams.min_price) : undefined,
		maxPrice: searchParams.max_price ? parseInt(searchParams.max_price) : undefined,
		beds: searchParams.beds ? parseInt(searchParams.beds) : undefined,
		baths: searchParams.baths ? parseInt(searchParams.baths) : undefined,
		petsAllowed: searchParams.pets === "true" ? true : searchParams.pets === "false" ? false : undefined,
		limit: parseInt(searchParams.limit || "20"),
		offset: parseInt(searchParams.offset || "0"),
	};

	// Temporary mock data until RentalDataFetchers is implemented
	// const { data: rentalsResult, error } = await RentalDataFetchers.getRentals(params);

	// if (error) {
	// 	console.error("Failed to fetch rentals: `, error);
	// 	return { rentals: [], total: 0, hasMore: false };
	// }

	return {
		rentals: [],
		total: 0,
		hasMore: false,
	};
}

export async function generateMetadata({ searchParams }) {
	const awaitedSearchParams = await searchParams;
	const query = awaitedSearchParams.search || awaitedSearchParams.q || "";
	const location = awaitedSearchParams.location || "";

	let title = "Find Rentals Near You - Thorbis";
	let description = "Discover apartments, homes, and condos for rent. Search by location, price, and amenities to find your perfect home.";

	if (query && location) {
		title = `${query} Rentals in ${location} - Thorbis`;
		description = `Find ${query} rentals in ${location}. Browse available apartments and homes for rent.`;
	} else if (query) {
		title = `${query} Rentals - Thorbis`;
		description = `Find ${query} rentals across various locations. Browse available properties today.`;
	} else if (location) {
		title = `Rentals in ${location} - Thorbis`;
		description = `Find rentals in ${location}. Browse apartments, homes, and condos available for rent.`;
	}

	return {
		title,
		description,
		keywords: ["rentals", "apartments", "homes", "housing", "for rent", query, location].filter(Boolean),
		openGraph: {
			title,
			description,
			type: "website",
			url: "https://thorbis.com/rentals",
			images: [`https://thorbis.com/opengraph-image?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [`https://thorbis.com/twitter-image?title=${encodeURIComponent(title)}`],
		},
		robots: { index: true, follow: true },
		alternates: { canonical: "https://thorbis.com/rentals" },
	};
}



async function RentalsList({ searchParams }) {
	const rentalsData = await getRentalsData(searchParams);

	return <RentalsClient rentals={rentalsData.rentals} searchMetadata={rentalsData} searchParams={searchParams} />;
}

export default async function RentalsPage({ searchParams }) {
	const awaitedSearchParams = await searchParams;

	return (
		<RentalsList searchParams={awaitedSearchParams} />
	);
}