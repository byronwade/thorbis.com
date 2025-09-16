import HealthClient from "./health-client";
// import { HealthDataFetchers } from "@/lib/database/supabase/server";

// Transform Supabase health data to match client component expectations
function transformHealthData(provider) {
	const formatRating = (rating) => {
		if (!rating) return 0;
		return Math.round(rating * 10) / 10;
	};

	const formatInsurance = (insurance) => {
		if (!insurance || insurance.length === 0) return ["Contact for insurance info"];
		return insurance;
	};

	const formatHours = (hours) => {
		if (!hours) return "Call for hours";
		return hours;
	};

	return {
		id: provider.id,
		name: provider.name || provider.practice_name,
		practiceName: provider.practice_name,
		specialty: provider.specialty || "General Practice",
		subspecialties: provider.subspecialties || [],
		description: provider.description?.substring(0, 200) + "..." || "No description available",
		phone: provider.phone,
		email: provider.email,
		website: provider.website,
		address: provider.address,
		city: provider.city,
		state: provider.state,
		zip: provider.zip_code,
		rating: formatRating(provider.rating),
		reviewCount: provider.review_count || 0,
		yearsExperience: provider.years_experience,
		education: provider.education || [],
		certifications: provider.certifications || [],
		languages: provider.languages || ["English"],
		acceptingNewPatients: provider.accepting_new_patients || false,
		insuranceAccepted: formatInsurance(provider.insurance_accepted),
		hours: formatHours(provider.hours),
		emergencyServices: provider.emergency_services || false,
		telemedicine: provider.telemedicine || false,
		wheelchairAccessible: provider.wheelchair_accessible || false,
		images: provider.images || [],
		services: provider.services || [],
		tags: provider.tags || [],
		providerType: provider.provider_type || "Doctor", // Doctor, Dentist, Therapist, etc.
		gender: provider.gender,
		npi: provider.npi_number,
	};
}

async function getHealthData(searchParams) {
	const params = {
		search: searchParams.search || searchParams.q || "",
		location: searchParams.location || "",
		specialty: searchParams.specialty || "",
		providerType: searchParams.provider_type || "",
		acceptingPatients: searchParams.accepting_patients === "true",
		telemedicine: searchParams.telemedicine === "true",
		insurance: searchParams.insurance || "",
		gender: searchParams.gender || "",
		language: searchParams.language || "",
		rating: searchParams.min_rating ? parseFloat(searchParams.min_rating) : undefined,
		sortBy: searchParams.sort_by || "rating",
		sortOrder: searchParams.sort_order || "desc",
		limit: parseInt(searchParams.limit || "20"),
		offset: parseInt(searchParams.offset || "0"),
	};

	// Temporary mock data until HealthDataFetchers is implemented
	// const { data: providersResult, error } = await HealthDataFetchers.getHealthProviders(params);

	// if (error) {
	// 	console.error("Failed to fetch health providers: ', error);
	// 	return { providers: [], total: 0, hasMore: false };
	// }

	return {
		providers: [],
		total: 0,
		hasMore: false,
	};
}

export async function generateMetadata({ searchParams }) {
	const awaitedSearchParams = await searchParams;
	const query = awaitedSearchParams.search || awaitedSearchParams.q || "";
	const location = awaitedSearchParams.location || "";

	let title = "Find Healthcare Providers Near You - Thorbis";
	let description = "Find doctors, dentists, therapists, and other healthcare providers in your area. Book appointments and read reviews.";

	if (query && location) {
		title = `${query} in ${location} - Thorbis Health`;
		description = `Find ${query} healthcare providers in ${location}. Book appointments with trusted doctors and specialists.`;
	} else if (query) {
		title = `${query} Healthcare Providers - Thorbis Health`;
		description = `Find ${query} healthcare providers across various locations. Book appointments with trusted professionals.`;
	} else if (location) {
		title = `Healthcare in ${location} - Thorbis Health`;
		description = `Find healthcare providers in ${location}. Book appointments with doctors, dentists, and specialists in your area.`;
	}

	return {
		title,
		description,
		keywords: ["healthcare", "doctors", "dentists", "therapists", "medical", "appointments", query, location].filter(Boolean),
		openGraph: {
			title,
			description,
			type: "website",
			url: "https://thorbis.com/health",
			images: [`https://thorbis.com/opengraph-image?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}'],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: ['https://thorbis.com/twitter-image?title=${encodeURIComponent(title)}'],
		},
		robots: { index: true, follow: true },
		alternates: { canonical: "https://thorbis.com/health" },
	};
}

async function HealthProvidersList({ searchParams }) {
	const healthData = await getHealthData(searchParams);

	return <HealthClient providers={healthData.providers} searchMetadata={healthData} searchParams={searchParams} />;
}

export default async function HealthPage({ searchParams }) {
	const awaitedSearchParams = await searchParams;

	return (
		<HealthProvidersList searchParams={awaitedSearchParams} />
	);
}