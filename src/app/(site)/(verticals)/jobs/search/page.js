import JobsClient from "../jobs-client";
// import { JobDataFetchers } from "@/lib/database/supabase/server";

// Transform Supabase job data to match client component expectations
function transformJobData(job) {
	const formatSalary = (min, max) => {
		if (!min && !max) return "Salary not specified";
		if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
		if (min) return `$${min.toLocaleString()}+`;
		return `Up to $${max.toLocaleString()}`;
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
		id: job.id,
		title: job.title,
		company: job.companies?.name || "Company",
		logo: job.companies?.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.companies?.name || "Company")}&background=0ea5e9&color=fff`,
		location: job.location,
		isRemote: job.remote_ok,
		type: job.job_type || "Full-time",
		posted: formatPostedDate(job.created_at),
		description: job.description?.substring(0, 200) + "..." || "No description available",
		salary: formatSalary(job.salary_min, job.salary_max),
		skills: job.skills_required || [],
		experienceLevel: job.experience_level,
		benefits: job.benefits || [],
		applicationDeadline: job.application_deadline,
		companyInfo: {
			id: job.companies?.id,
			industry: job.companies?.industry,
			size: job.companies?.company_size,
			website: job.companies?.website,
		},
	};
}

async function getJobsData(searchParams) {
	const params = {
		search: searchParams.search || searchParams.q || "",
		location: searchParams.location || "",
		jobType: searchParams.type || "",
		remote: searchParams.remote === "true" ? true : searchParams.remote === "false" ? false : undefined,
		salaryMin: searchParams.salary_min ? parseInt(searchParams.salary_min) : undefined,
		limit: parseInt(searchParams.limit || "20"),
		offset: parseInt(searchParams.offset || "0"),
	};

	// Temporary mock data until JobDataFetchers is implemented
	// const { data: jobsResult, error } = await JobDataFetchers.getJobs(params);

	// if (error) {
	// 	console.error("Failed to fetch jobs: `, error);
	// 	return { jobs: [], total: 0, hasMore: false };
	// }

	return {
		jobs: [],
		total: 0,
		hasMore: false,
	};
}

export async function generateMetadata({ searchParams }) {
	const awaitedSearchParams = await searchParams;
	const query = awaitedSearchParams.search || awaitedSearchParams.q || "";
	const location = awaitedSearchParams.location || "";

	let title = "Search Jobs - Thorbis";
	let description = "Search for job opportunities across all locations. Filter by position, company, salary, and more.";

	if (query && location) {
		title = `${query} Jobs in ${location} - Search Results | Thorbis`;
		description = `Search results for ${query} jobs in ${location}. Find the perfect opportunity today.`;
	} else if (query) {
		title = `${query} Jobs - Search Results | Thorbis`;
		description = `Search results for ${query} jobs. Browse opportunities across all locations.`;
	} else if (location) {
		title = `Jobs in ${location} - Search Results | Thorbis`;
		description = `Search results for jobs in ${location}. Find opportunities near you.`;
	}

	return {
		title,
		description,
		keywords: ["job search", "careers", "employment", "hiring", query, location].filter(Boolean),
		openGraph: {
			title,
			description,
			type: "website",
			url: "https://thorbis.com/jobs/search",
			images: [`https://thorbis.com/opengraph-image?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [`https://thorbis.com/twitter-image?title=${encodeURIComponent(title)}`],
		},
		robots: { index: true, follow: true },
		alternates: { canonical: "https://thorbis.com/jobs/search" },
	};
}

async function JobsSearchResults({ searchParams }) {
	const jobsData = await getJobsData(searchParams);

	return (
		<div>
			<div className="container mx-auto px-4 py-6">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Job Search Results</h1>
					<p className="text-muted-foreground mt-2">
						{searchParams.search || searchParams.q ? 
							`Search results for "${searchParams.search || searchParams.q}"` : 
							"Browse all available positions"
						}
						{searchParams.location && ` in ${searchParams.location}`}
					</p>
				</div>
			</div>
			<JobsClient jobs={jobsData.jobs} searchMetadata={jobsData} searchParams={searchParams} />
		</div>
	);
}

export default async function JobsSearchPage({ searchParams }) {
	const awaitedSearchParams = await searchParams;

	return (
		<JobsSearchResults searchParams={awaitedSearchParams} />
	);
}