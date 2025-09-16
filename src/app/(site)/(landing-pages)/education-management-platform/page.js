// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Education Management Platform – Student Records, Scheduling, Communication | Thorbis",
		description: "Complete education management system with student information, class scheduling, grade tracking, and parent-teacher communication tools for schools and educational institutions.",
		path: "/education-management-platform",
		keywords: ["education management software", "student information system", "school management platform", "grade tracking software", "educational administration", "school ERP"],
	});
}

import { Star, GraduationCap, Calendar, Users, BookOpen, BarChart3, Shield } from "lucide-react";

import { generateStaticPageMetadata } from "@/utils/server-seo";

function JsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: "Education Management Platform",
		description: "Complete school management system with student records, scheduling, grade tracking, and communication tools.",
		brand: { "@type": "Brand", name: "Thorbis" },
		offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
		applicationCategory: "EducationalApplication",
		operatingSystem: "Web Browser",
		aggregateRating: {
			"@type": "AggregateRating",
			ratingValue: "4.8",
			reviewCount: "674"
		}
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

function BreadcrumbsJsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Home", item: "https://thorbis.com/" },
			{ "@type": "ListItem", position: 2, name: "Education Management Platform", item: "https://thorbis.com/education-management-platform" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function EducationManagementPlatform() {
	const features = [
		{ 
			title: "Student Information System", 
			points: ["Student records management", "Enrollment tracking", "Academic history"],
			icon: GraduationCap,
			description: "Comprehensive student data management with secure records, enrollment tracking, and complete academic history."
		},
		{ 
			title: "Class & Schedule Management", 
			points: ["Course scheduling", "Teacher assignments", "Room allocation"],
			icon: Calendar,
			description: "Efficient scheduling system for courses, teachers, and facilities with automated conflict resolution."
		},
		{ 
			title: "Communication Hub", 
			points: ["Parent-teacher messaging", "Announcement system", "Progress reports"],
			icon: Users,
			description: "Streamlined communication between parents, teachers, and students with automated notifications."
		},
		{ 
			title: "Academic Management", 
			points: ["Grade tracking", "Assignment management", "Curriculum planning"],
			icon: BookOpen,
			description: "Complete academic workflow management from curriculum planning to grade reporting."
		},
		{ 
			title: "Analytics & Reporting", 
			points: ["Student performance analytics", "Attendance tracking", "Custom reports"],
			icon: BarChart3,
			description: "Comprehensive analytics and reporting tools for data-driven educational decisions."
		},
		{ 
			title: "Security & Compliance", 
			points: ["FERPA compliance", "Data security", "Access controls"],
			icon: Shield,
			description: "Enterprise-grade security and compliance with educational data protection regulations."
		},
	];

	const successStories = [
		{
			name: "Lincoln Elementary",
			location: "Portland, OR",
			growth: "40% efficiency gain",
			story: "Streamlined administrative tasks and improved parent-teacher communication with integrated platform.",
			rating: 4.9,
			reviews: 87
		},
		{
			name: "Riverside High School",
			location: "Austin, TX",
			growth: "25% time saved",
			story: "Automated scheduling and grade management freed up teachers to focus on instruction.",
			rating: 4.8,
			reviews: 156
		},
		{
			name: "Valley School District",
			location: "Phoenix, AZ",
			growth: "90% parent engagement",
			story: "Enhanced parent involvement through real-time communication and progress tracking.",
			rating: 4.7,
			reviews: 203
		}
	];

	const institutionTypes = [
		"Elementary Schools",
		"Middle Schools",
		"High Schools",
		"Private Schools",
		"Charter Schools",
		"School Districts"
	];

	return (
		<main className="min-h-screen w-full bg-white dark:bg-neutral-900 px-4 sm:px-6 lg:px-8 py-10">
			<JsonLd />
			<BreadcrumbsJsonLd />
			
			{/* Social Proof */}
			<section className="px-4 py-4 mx-auto max-w-6xl">
				<div className="flex flex-col items-center gap-2 text-center">
					<div className="flex items-center gap-1 text-amber-500" aria-label="rating 4.8 out of 5">
						{Array.from({ length: 5 }).map((_, i) => (
							<Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
						))}
					</div>
					<p className="text-sm text-muted-foreground">Trusted by 320+ educational institutions • 4.8/5 administrator satisfaction</p>
				</div>
			</section>

			{/* Hero Section */}
			<section className="max-w-6xl mx-auto text-center space-y-6">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
					Education Management Platform
				</h1>
				<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
					Comprehensive school management system with student records, scheduling, grade tracking, and communication tools designed for modern educational institutions.
				</p>
				<div className="flex items-center justify-center gap-4 pt-4">
					<a href="/signup" className="inline-flex items-center rounded-md bg-emerald-600 px-6 py-3 text-white font-semibold hover:bg-emerald-700 transition-colors">
						Start Free Trial
					</a>
					<a href="/contact" className="inline-flex items-center rounded-md border border-border px-6 py-3 font-semibold hover:bg-accent transition-colors">
						Schedule Demo
					</a>
				</div>
			</section>

			{/* Features Grid */}
			<section className="max-w-6xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{features.map((feature) => (
					<div key={feature.title} className="rounded-xl border p-6 bg-card hover:shadow-lg transition-shadow">
						<div className="flex items-center gap-3 mb-4">
							<feature.icon className="w-8 h-8 text-emerald-600" />
							<h3 className="font-bold text-lg">{feature.title}</h3>
						</div>
						<p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
						<ul className="space-y-2 text-sm text-muted-foreground">
							{feature.points.map((point) => (
								<li key={point} className="flex items-start gap-2">
									<span className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-2 flex-shrink-0"></span>
									{point}
								</li>
							))}
						</ul>
					</div>
				))}
			</section>

			{/* Institution Types */}
			<section className="max-w-6xl mx-auto mt-16">
				<div className="text-center mb-8">
					<h2 className="text-3xl font-bold mb-4">Perfect for All Educational Institutions</h2>
					<p className="text-lg text-muted-foreground">Flexible platform that scales with your institution</p>
				</div>
				<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
					{institutionTypes.map((type, index) => (
						<div key={index} className="text-center p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
							<span className="font-medium">{type}</span>
						</div>
					))}
				</div>
			</section>

			{/* Success Stories */}
			<section className="max-w-6xl mx-auto mt-16 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl p-8">
				<div className="text-center mb-8">
					<h2 className="text-3xl font-bold mb-4">Educational Institution Success Stories</h2>
					<p className="text-lg text-muted-foreground">See how schools are improving with Thorbis</p>
				</div>
				<div className="grid md:grid-cols-3 gap-6">
					{successStories.map((story, index) => (
						<div key={index} className="bg-white dark:bg-neutral-800 rounded-lg p-6 text-center">
							<div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-4">
								<GraduationCap className="w-6 h-6 text-emerald-600" />
							</div>
							<h3 className="font-bold text-lg mb-1">{story.name}</h3>
							<p className="text-sm text-muted-foreground mb-3">{story.location}</p>
							<div className="text-2xl font-bold text-success mb-2">{story.growth}</div>
							<p className="text-sm text-muted-foreground mb-4">{story.story}</p>
							<div className="flex items-center justify-center gap-1">
								<Star className="w-4 h-4 text-warning fill-current" />
								<span className="text-sm font-medium">{story.rating}</span>
								<span className="text-sm text-muted-foreground ml-1">({story.reviews} reviews)</span>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* Stats Section */}
			<section className="max-w-6xl mx-auto mt-16">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
					<div>
						<div className="text-3xl font-bold text-emerald-600 mb-2">50K+</div>
						<div className="text-sm text-muted-foreground">Students managed</div>
					</div>
					<div>
						<div className="text-3xl font-bold text-emerald-600 mb-2">320+</div>
						<div className="text-sm text-muted-foreground">Schools served</div>
					</div>
					<div>
						<div className="text-3xl font-bold text-emerald-600 mb-2">95%</div>
						<div className="text-sm text-muted-foreground">Parent satisfaction</div>
					</div>
					<div>
						<div className="text-3xl font-bold text-emerald-600 mb-2">40%</div>
						<div className="text-sm text-muted-foreground">Time savings</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="max-w-4xl mx-auto mt-16 text-center bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-8 text-white">
				<h2 className="text-3xl font-bold mb-4">Transform Your Educational Institution</h2>
				<p className="text-lg mb-6 opacity-90">Join hundreds of schools using Thorbis to improve efficiency and student outcomes.</p>
				<div className="flex items-center justify-center gap-4">
					<a href="/signup" className="inline-flex items-center rounded-md bg-card text-primary px-6 py-3 font-semibold hover:bg-accent transition-colors">
						Start Free Trial
					</a>
					<a href="/contact" className="inline-flex items-center rounded-md border border-white/30 px-6 py-3 font-semibold hover:bg-white/10 transition-colors">
						Schedule Demo
					</a>
				</div>
			</section>
		</main>
	);
}
