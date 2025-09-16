import MarketplaceClient from "./marketplace-client";
// import { MarketplaceDataFetchers } from "@/lib/database/supabase/server";

// Transform Supabase marketplace data to match client component expectations
function transformMarketplaceData(product) {
	const formatPrice = (price) => {
		if (!price) return "Contact for price";
		return `$${price.toLocaleString()}`;
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
		id: product.id,
		title: product.title,
		description: product.description?.substring(0, 200) + "..." || "No description available",
		price: formatPrice(product.price),
		originalPrice: product.original_price ? formatPrice(product.original_price) : null,
		category: product.category || "General",
		subcategory: product.subcategory,
		condition: product.condition || "Used",
		brand: product.brand,
		model: product.model,
		location: product.location,
		city: product.city,
		state: product.state,
		zip: product.zip_code,
		posted: formatPostedDate(product.created_at),
		images: product.images || [],
		isNegotiable: product.is_negotiable || false,
		isFeatured: product.is_featured || false,
		tags: product.tags || [],
		specifications: product.specifications || {},
		seller: {
			id: product.sellers?.id,
			name: product.sellers?.name,
			phone: product.sellers?.phone,
			email: product.sellers?.email,
			rating: product.sellers?.rating || 0,
			verified: product.sellers?.is_verified || false,
		},
	};
}

async function getMarketplaceData(searchParams) {
	const params = {
		search: searchParams.search || searchParams.q || "",
		location: searchParams.location || "",
		category: searchParams.category || "",
		subcategory: searchParams.subcategory || "",
		condition: searchParams.condition || "",
		minPrice: searchParams.min_price ? parseInt(searchParams.min_price) : undefined,
		maxPrice: searchParams.max_price ? parseInt(searchParams.max_price) : undefined,
		brand: searchParams.brand || "",
		sortBy: searchParams.sort_by || "created_at",
		sortOrder: searchParams.sort_order || "desc",
		limit: parseInt(searchParams.limit || "20"),
		offset: parseInt(searchParams.offset || "0"),
	};

	// Temporary mock data until MarketplaceDataFetchers is implemented
	// const { data: productsResult, error } = await MarketplaceDataFetchers.getProducts(params);

	// if (error) {
	// 	console.error("Failed to fetch marketplace products: `, error);
	// 	return { products: [], total: 0, hasMore: false };
	// }

	return {
		products: [],
		total: 0,
		hasMore: false,
	};
}

export async function generateMetadata({ searchParams }) {
	const awaitedSearchParams = await searchParams;
	const query = awaitedSearchParams.search || awaitedSearchParams.q || "";
	const location = awaitedSearchParams.location || "";

	let title = "Buy & Sell on Thorbis Marketplace";
	let description = "Discover great deals on electronics, furniture, cars, and more. Buy and sell items safely in your local community.";

	if (query && location) {
		title = `${query} for Sale in ${location} - Thorbis Marketplace`;
		description = `Find ${query} for sale in ${location}. Browse local listings and great deals in your area.`;
	} else if (query) {
		title = `${query} for Sale - Thorbis Marketplace`;
		description = `Find ${query} for sale across various locations. Browse great deals and local listings.`;
	} else if (location) {
		title = `Marketplace in ${location} - Thorbis`;
		description = `Buy and sell items in ${location}. Find great deals on electronics, furniture, cars, and more.`;
	}

	return {
		title,
		description,
		keywords: ["marketplace", "buy", "sell", "deals", "electronics", "furniture", "cars", query, location].filter(Boolean),
		openGraph: {
			title,
			description,
			type: "website",
			url: "https://thorbis.com/marketplace",
			images: [`https://thorbis.com/opengraph-image?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [`https://thorbis.com/twitter-image?title=${encodeURIComponent(title)}`],
		},
		robots: { index: true, follow: true },
		alternates: { canonical: "https://thorbis.com/marketplace" },
	};
}

async function MarketplaceList({ searchParams }) {
	const marketplaceData = await getMarketplaceData(searchParams);

	return <MarketplaceClient products={marketplaceData.products} searchMetadata={marketplaceData} searchParams={searchParams} />;
}

export default async function MarketplacePage({ searchParams }) {
	const awaitedSearchParams = await searchParams;

	return (
		<MarketplaceList searchParams={awaitedSearchParams} />
	);
}