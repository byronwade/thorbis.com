import { MapPin, Building, Calendar, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import { JobDataFetchers } from "@/lib/database/supabase/server";
import React from "react";

// Transform Supabase job data for the detail view
function transformJobDetailData(job) {
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
		description: job.description || "No description available",
		salary: formatSalary(job.salary_min, job.salary_max),
		skills: job.skills_required || [],
		experienceLevel: job.experience_level,
		benefits: job.benefits || [],
		requirements: job.requirements || [],
		applicationDeadline: job.application_deadline,
		applicationCount: job.job_applications?.length || 0,
		companyInfo: {
			id: job.companies?.id,
			name: job.companies?.name,
			industry: job.companies?.industry,
			size: job.companies?.company_size,
			website: job.companies?.website,
			description: job.companies?.description,
			foundedYear: job.companies?.founded_year,
			headquarters: job.companies?.headquarters,
		},
	};
}

async function getJobData(jobId) {
	const { data: job, error } = await JobDataFetchers.getJobById(jobId);

	if (error || !job) {
		console.error("Failed to fetch job: `, error);
		return null;
	}

	return transformJobDetailData(job);
}

export async function generateMetadata({ params }) {
	const resolvedParams = await params;
	const job = await getJobData(resolvedParams.jobId);

	if (!job) {
		return {
			title: "Job Not Found - Thorbis",
			description: "The requested job could not be found.",
		};
	}

	const title = `${job.title} at ${job.company} - Thorbis`;
	const description = `${job.title} position at ${job.company} in ${job.location}. ${job.salary}. Apply now on Thorbis.`;

	return {
		title,
		description,
		keywords: [job.title, job.company, job.location, "job", "career", "employment", ...job.skills].filter(Boolean),
		openGraph: {
			title,
			description,
			type: "website",
			url: `https://thorbis.com/jobs/${resolvedParams.jobId}`,
			images: job.logo ? [{ url: job.logo, width: 300, height: 300, alt: `${job.company} logo` }] : [`https://thorbis.com/opengraph-image?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: job.logo ? [job.logo] : [`https://thorbis.com/twitter-image?title=${encodeURIComponent(title)}`],
		},
		alternates: { canonical: `https://thorbis.com/jobs/${resolvedParams.jobId}` },
	};
}

// Loading skeleton for job details
function JobDetailSkeleton() {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
			<div className="lg:col-span-3">
				<div className="border rounded-lg p-6 animate-pulse">
					<div className="h-8 bg-muted rounded w-2/3 mb-4"></div>
					<div className="flex gap-4 mb-6">
						<div className="h-4 bg-muted/60 rounded w-32"></div>
						<div className="h-4 bg-muted/60 rounded w-32"></div>
					</div>
					<div className="space-y-3">
						{Array.from({ length: 8 }).map((_, i) => (
							<div key={i} className="h-4 bg-muted/60 rounded w-full"></div>
						))}
					</div>
				</div>
			</div>
			<aside className="lg:col-span-1">
				<div className="border rounded-lg p-6 animate-pulse">
					<div className="w-20 h-20 bg-muted rounded mx-auto mb-4"></div>
					<div className="h-6 bg-muted rounded w-full mb-2"></div>
					<div className="h-4 bg-muted/60 rounded w-24 mx-auto mb-6"></div>
					<div className="h-10 bg-muted rounded w-full mb-4"></div>
					<div className="space-y-2">
						{Array.from({ length: 4 }).map((_, i) => (
							<div key={i} className="flex justify-between">
								<div className="h-4 bg-muted/60 rounded w-20"></div>
								<div className="h-4 bg-muted/60 rounded w-16"></div>
							</div>
						))}
					</div>
				</div>
			</aside>
		</div>
	);
}

async function JobDetails({ params }) {
	const resolvedParams = await params;
	const job = await getJobData(resolvedParams.jobId);

	if (!job) {
		notFound();
	}

	return (
		<div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
			{/* Structured Data: JobPosting + BreadcrumbList */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "JobPosting",
						title: job.title,
						description: job.description,
						hiringOrganization: {
							"@type": "Organization",
							name: job.company,
							sameAs: job.companyInfo?.website || undefined,
							logo: job.logo || undefined,
						},
						jobLocation: job.isRemote
							? undefined
							: {
									"@type": "Place",
									address: {
										"@type": "PostalAddress",
										addressLocality: job.location,
										addressCountry: "US",
									},
								},
						employmentType: job.type,
						datePosted: new Date().toISOString(),
						validThrough: job.applicationDeadline || undefined,
					}),
				}}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "BreadcrumbList",
						itemListElement: [
							{ "@type": "ListItem", position: 1, name: "Home", item: "https://thorbis.com/" },
							{ "@type": "ListItem", position: 2, name: "Jobs", item: "https://thorbis.com/jobs" },
							{ "@type": "ListItem", position: 3, name: job.title, item: `https://thorbis.com/jobs/${resolvedParams.jobId}` },
						],
					}),
				}}
			/>
			{/* Left Column - Job Description */}
			<div className="lg:col-span-3 space-y-6">
				<Card>
					<CardHeader>
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
								<div className="flex items-center gap-x-4 text-muted-foreground">
									<span className="flex items-center gap-x-1.5">
										<Building className="w-4 h-4" />
										{job.company}
									</span>
									<span className="flex items-center gap-x-1.5">
										<MapPin className="w-4 h-4" />
										{job.location}
									</span>
									{job.isRemote && <Badge variant="outline">Remote</Badge>}
									<span className="flex items-center gap-x-1.5">
										<Calendar className="w-4 h-4" />
										{job.posted}
									</span>
								</div>
							</div>
						</div>
						{job.skills.length > 0 && (
							<div className="flex flex-wrap gap-2 pt-4">
								{job.skills.map((skill, index) => (
									<Badge key={index} variant="secondary">
										{skill}
									</Badge>
								))}
							</div>
						)}
					</CardHeader>
					<CardContent>
						<div className="prose dark:prose-invert max-w-none">
							<Markdown>{job.description}</Markdown>
						</div>

						{job.requirements.length > 0 && (
							<div className="mt-8">
								<h3 className="text-lg font-semibold mb-4">Requirements</h3>
								<ul className="space-y-2">
									{job.requirements.map((req, index) => (
										<li key={index} className="flex items-start gap-2">
											<span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
											<span>{req}</span>
										</li>
									))}
								</ul>
							</div>
						)}

						{job.benefits.length > 0 && (
							<div className="mt-8">
								<h3 className="text-lg font-semibold mb-4">Benefits</h3>
								<ul className="space-y-2">
									{job.benefits.map((benefit, index) => (
										<li key={index} className="flex items-start gap-2">
											<span className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0"></span>
											<span>{benefit}</span>
										</li>
									))}
								</ul>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Company Information */}
				{job.companyInfo.description && (
					<Card>
						<CardHeader>
							<CardTitle>About {job.company}</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="prose dark:prose-invert max-w-none">
								<Markdown>{job.companyInfo.description}</Markdown>
							</div>
							<div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
								{job.companyInfo.industry && (
									<div>
										<p className="text-sm font-medium text-muted-foreground">Industry</p>
										<p className="text-sm">{job.companyInfo.industry}</p>
									</div>
								)}
								{job.companyInfo.size && (
									<div>
										<p className="text-sm font-medium text-muted-foreground">Company Size</p>
										<p className="text-sm">{job.companyInfo.size}</p>
									</div>
								)}
								{job.companyInfo.foundedYear && (
									<div>
										<p className="text-sm font-medium text-muted-foreground">Founded</p>
										<p className="text-sm">{job.companyInfo.foundedYear}</p>
									</div>
								)}
								{job.companyInfo.headquarters && (
									<div>
										<p className="text-sm font-medium text-muted-foreground">Headquarters</p>
										<p className="text-sm">{job.companyInfo.headquarters}</p>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				)}
			</div>

			{/* Right Column - Summary */}
			<aside className="lg:col-span-1 sticky top-24">
				<Card>
					<CardHeader className="text-center">
						<Avatar className="w-20 h-20 mx-auto mb-4 rounded-md">
							<AvatarImage src={job.logo} alt={`${job.company} logo`} />
							<AvatarFallback>{job.company.charAt(0)}</AvatarFallback>
						</Avatar>
						<CardTitle>{job.company}</CardTitle>
						<CardDescription>
							{job.companyInfo.website ? (
								<Link href={job.companyInfo.website} target="_blank" className="hover:underline flex items-center gap-1">
									<Globe className="w-3 h-3" />
									Company website
								</Link>
							) : (
								<span className="text-muted-foreground">View company profile</span>
							)}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<Button className="w-full">Apply Now</Button>

						<div className="space-y-3 text-sm">
							<div className="flex justify-between">
								<span className="font-semibold">Job Type</span>
								<span className="text-muted-foreground">{job.type}</span>
							</div>
							<div className="flex justify-between">
								<span className="font-semibold">Experience</span>
								<span className="text-muted-foreground">{job.experienceLevel || "Not specified"}</span>
							</div>
							{job.isRemote ? (
								<div className="flex justify-between">
									<span className="font-semibold">Location</span>
									<span className="text-muted-foreground">Remote</span>
								</div>
							) : (
								<div className="flex justify-between">
									<span className="font-semibold">Location</span>
									<span className="text-muted-foreground">{job.location}</span>
								</div>
							)}
							<div className="flex justify-between">
								<span className="font-semibold">Salary</span>
								<span className="text-muted-foreground">{job.salary}</span>
							</div>
							{job.applicationDeadline && (
								<div className="flex justify-between">
									<span className="font-semibold">Apply by</span>
									<span className="text-muted-foreground">{new Date(job.applicationDeadline).toLocaleDateString()}</span>
								</div>
							)}
							{job.applicationCount > 0 && (
								<div className="flex justify-between">
									<span className="font-semibold">Applications</span>
									<span className="text-muted-foreground">{job.applicationCount}</span>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</aside>
		</div>
	);
}

export default async function JobDetailsPage({ params }) {
	return (
		<JobDetails params={params} />
	);
}
