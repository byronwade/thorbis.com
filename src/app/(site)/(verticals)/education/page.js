import EducationClient from "./education-client";
// import { EducationDataFetchers } from "@/lib/database/supabase/server";

// Transform Supabase education data to match client component expectations
function transformEducationData(institution) {
	const formatPrice = (price, priceType) => {
		if (!price) return "Contact for pricing";
		const formattedPrice = `$${price.toLocaleString()}`;
		if (priceType === "per_hour") return `${formattedPrice}/hr`;
		if (priceType === "per_course") return `${formattedPrice} per course`;
		if (priceType === "per_semester") return `${formattedPrice}/semester`;
		if (priceType === "per_year") return `${formattedPrice}/year`;
		return formattedPrice;
	};

	const formatRating = (rating) => {
		if (!rating) return 0;
		return Math.round(rating * 10) / 10;
	};

	return {
		id: institution.id,
		name: institution.name,
		institutionType: institution.institution_type || "School", // School, College, Training Center, etc.
		description: institution.description?.substring(0, 200) + "..." || "No description available",
		address: institution.address,
		city: institution.city,
		state: institution.state,
		zip: institution.zip_code,
		phone: institution.phone,
		email: institution.email,
		website: institution.website,
		rating: formatRating(institution.rating),
		reviewCount: institution.review_count || 0,
		established: institution.established_year,
		accreditation: institution.accreditation || [],
		programs: institution.programs || [],
		coursesOffered: institution.courses_offered || [],
		subjects: institution.subjects || [],
		gradeLevel: institution.grade_level || [], // K-12, Undergraduate, Graduate, etc.
		tuition: formatPrice(institution.tuition, institution.tuition_type),
		financialAid: institution.financial_aid_available || false,
		scholarships: institution.scholarships_available || false,
		onlineOptions: institution.online_options || false,
		campusSize: institution.campus_size,
		studentCount: institution.student_count,
		facultyCount: institution.faculty_count,
		studentToTeacherRatio: institution.student_teacher_ratio,
		languages: institution.languages || ["English"],
		facilities: institution.facilities || [],
		extracurriculars: institution.extracurricular_activities || [],
		admissionRequirements: institution.admission_requirements || [],
		applicationDeadline: institution.application_deadline,
		images: institution.images || [],
		virtualTour: institution.virtual_tour_url,
		isPrivate: institution.is_private || false,
		isReligious: institution.is_religious || false,
		tags: institution.tags || [],
	};
}

async function getEducationData(searchParams) {
	const params = {
		search: searchParams.search || searchParams.q || "",
		location: searchParams.location || "",
		institutionType: searchParams.institution_type || "",
		gradeLevel: searchParams.grade_level || "",
		subject: searchParams.subject || "",
		program: searchParams.program || "",
		maxTuition: searchParams.max_tuition ? parseInt(searchParams.max_tuition) : undefined,
		onlineOptions: searchParams.online === "true",
		financialAid: searchParams.financial_aid === "true",
		isPrivate: searchParams.private === "true" ? true : searchParams.private === "false" ? false : undefined,
		rating: searchParams.min_rating ? parseFloat(searchParams.min_rating) : undefined,
		sortBy: searchParams.sort_by || "rating",
		sortOrder: searchParams.sort_order || "desc",
		limit: parseInt(searchParams.limit || "20"),
		offset: parseInt(searchParams.offset || "0"),
	};

	// Temporary mock data until EducationDataFetchers is implemented
	// const { data: institutionsResult, error } = await EducationDataFetchers.getEducationInstitutions(params);

	// if (error) {
	// 	console.error("Failed to fetch education institutions: `, error);
	// 	return { institutions: [], total: 0, hasMore: false };
	// }

	return {
		institutions: [],
		total: 0,
		hasMore: false,
	};
}

export async function generateMetadata({ searchParams }) {
	const awaitedSearchParams = await searchParams;
	const query = awaitedSearchParams.search || awaitedSearchParams.q || "";
	const location = awaitedSearchParams.location || "";

	let title = "Find Schools & Educational Institutions - Thorbis";
	let description = "Discover schools, colleges, universities, and training centers. Find the right educational institution for your needs.";

	if (query && location) {
		title = `${query} in ${location} - Thorbis Education`;
		description = `Find ${query} educational institutions in ${location}. Browse schools, colleges, and training programs.`;
	} else if (query) {
		title = `${query} Educational Institutions - Thorbis Education`;
		description = `Find ${query} educational institutions across various locations. Discover schools and training programs.`;
	} else if (location) {
		title = `Education in ${location} - Thorbis`;
		description = `Find educational institutions in ${location}. Browse schools, colleges, universities, and training centers.`;
	}

	return {
		title,
		description,
		keywords: ["education", "schools", "colleges", "universities", "training", "courses", query, location].filter(Boolean),
		openGraph: {
			title,
			description,
			type: "website",
			url: "https://thorbis.com/education",
			images: [`https://thorbis.com/opengraph-image?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [`https://thorbis.com/twitter-image?title=${encodeURIComponent(title)}`],
		},
		robots: { index: true, follow: true },
		alternates: { canonical: "https://thorbis.com/education" },
	};
}

async function EducationList({ searchParams }) {
	const educationData = await getEducationData(searchParams);

	return <EducationClient institutions={educationData.institutions} searchMetadata={educationData} searchParams={searchParams} />;
}

export default async function EducationPage({ searchParams }) {
	const awaitedSearchParams = await searchParams;

	return (
		<EducationList searchParams={awaitedSearchParams} />
	);
}