import DealsClient from "./deals-client";
// import { DealDataFetchers } from "@/lib/database/supabase/server";

// Transform Supabase deal data to match client component expectations
function transformDealData(deal) {
	const formatPrice = (price) => {
		if (!price) return "Free";
		return `$${price.toLocaleString()}`;
	};

	const formatDiscount = (originalPrice, salePrice) => {
		if (!originalPrice || !salePrice) return null;
		const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
		return `${discount}% off`;
	};

	const formatExpiryDate = (dateString) => {
		if (!dateString) return null;
		const date = new Date(dateString);
		const now = new Date();
		const diffTime = date - now;
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays < 0) return "Expired";
		if (diffDays === 0) return "Expires today";
		if (diffDays === 1) return "Expires tomorrow";
		if (diffDays < 7) return `Expires in ${diffDays} days`;
		return `Expires ${date.toLocaleDateString()}`;
	};

	return {
		id: deal.id,
		title: deal.title,
		description: deal.description?.substring(0, 200) + "..." || "No description available",
		originalPrice: deal.original_price ? formatPrice(deal.original_price) : null,
		salePrice: formatPrice(deal.sale_price),
		discount: formatDiscount(deal.original_price, deal.sale_price),
		category: deal.category || "General",
		dealType: deal.deal_type || "Sale", // Sale, Coupon, BOGO, etc.
		expiryDate: formatExpiryDate(deal.expiry_date),
		isExpired: deal.expiry_date ? new Date(deal.expiry_date) < new Date() : false,
		isFeatured: deal.is_featured || false,
		images: deal.images || [],
		terms: deal.terms_conditions,
		couponCode: deal.coupon_code,
		maxRedemptions: deal.max_redemptions,
		currentRedemptions: deal.current_redemptions || 0,
		location: deal.location,
		city: deal.city,
		state: deal.state,
		tags: deal.tags || [],
		business: {
			id: deal.businesses?.id,
			name: deal.businesses?.name,
			logo: deal.businesses?.logo,
			rating: deal.businesses?.rating || 0,
			phone: deal.businesses?.phone,
			address: deal.businesses?.address,
		},
	};
}

async function getDealsData(searchParams) {
	const params = {
		search: searchParams.search || searchParams.q || "",
		location: searchParams.location || "",
		category: searchParams.category || "",
		dealType: searchParams.deal_type || "",
		minDiscount: searchParams.min_discount ? parseInt(searchParams.min_discount) : undefined,
		maxPrice: searchParams.max_price ? parseInt(searchParams.max_price) : undefined,
		includeExpired: searchParams.include_expired === "true",
		sortBy: searchParams.sort_by || "created_at",
		sortOrder: searchParams.sort_order || "desc",
		limit: parseInt(searchParams.limit || "20"),
		offset: parseInt(searchParams.offset || "0"),
	};

	// Temporary mock data until DealDataFetchers is implemented
	// const { data: dealsResult, error } = await DealDataFetchers.getDeals(params);

	// if (error) {
	// 	console.error("Failed to fetch deals: `, error);
	// 	return { deals: [], total: 0, hasMore: false };
	// }

	return {
		deals: [],
		total: 0,
		hasMore: false,
	};
}

export async function generateMetadata({ searchParams }) {
	const awaitedSearchParams = await searchParams;
	const query = awaitedSearchParams.search || awaitedSearchParams.q || "";
	const location = awaitedSearchParams.location || "";

	let title = "Best Deals & Discounts - Thorbis";
	let description = "Find amazing deals, coupons, and discounts from local businesses. Save money on restaurants, services, and shopping.";

	if (query && location) {
		title = `${query} Deals in ${location} - Thorbis`;
		description = `Find ${query} deals and discounts in ${location}. Save money with local coupons and special offers.`;
	} else if (query) {
		title = `${query} Deals - Thorbis`;
		description = `Find ${query} deals and discounts across various locations. Discover great savings and special offers.`;
	} else if (location) {
		title = `Deals in ${location} - Thorbis`;
		description = `Find deals and discounts in ${location}. Save money with local coupons and special offers from nearby businesses.`;
	}

	return {
		title,
		description,
		keywords: ["deals", "discounts", "coupons", "savings", "offers", "promotions", query, location].filter(Boolean),
		openGraph: {
			title,
			description,
			type: "website",
			url: "https://thorbis.com/deals",
			images: [`https://thorbis.com/opengraph-image?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [`https://thorbis.com/twitter-image?title=${encodeURIComponent(title)}`],
		},
		robots: { index: true, follow: true },
		alternates: { canonical: "https://thorbis.com/deals" },
	};
}

async function DealsList({ searchParams }) {
	const dealsData = await getDealsData(searchParams);

	return <DealsClient deals={dealsData.deals} searchMetadata={dealsData} searchParams={searchParams} />;
}

export default async function DealsPage({ searchParams }) {
	const awaitedSearchParams = await searchParams;

	return (
		<DealsList searchParams={awaitedSearchParams} />
	);
}