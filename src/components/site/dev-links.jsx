"use client";

export default function DevLinks() {
	if (process.env.NODE_ENV === "production") return null;

	const routes = [
		// Core site pages
                "/",
                "/company",
                "/accessibility-statement",
                "/ad-choices",
                "/advertise",
                "/affiliates",
                "/blog",
		"/blog/article",
		"/blog/example-post", // from /blog/[slug]
		"/biz/example-biz", // from /biz/[slug]
		"/business",
		"/business-certification",
		"/business-story-videos",
		"/business-success-stories",
                "/business-support",
                "/jobs",
		"/case-studies/wades-plumbing-and-septic",
		"/categories",
		"/categories/all",
		"/categories/plumbing", // from /categories/[category]
		"/challenges",
		"/changelog",
		"/community-guidelines",
		"/content-guidelines",
		"/contact-support",
		"/developers",
		"/events",
		"/explore-business",
		"/faq",
		"/help-center",
		"/how-it-works",
		"/certified",
		"/certified/biz",
                "/discover",
                "/company",
		"/learn",
		"/learn/example-course", // from /learn/[courseId]
		"/live-streaming",
		"/localhub",
		"/mobile",
		"/neighborhoods",
		"/news",
		"/partners",
                "/company",
                "/legal",
		"/restaurant-owners",
		"/rss",
		"/search",
		"/shorts",
		"/support",
                "/table-management",
                "/legal",
                "/legal",

		// Landing pages
		"/academy-learning-platform",
		"/admin-operations-console",
		"/agriculture-management-software",
		"/automotive-shop-software",
		"/beauty-salon-software",
		"/booking-alternative",
		"/bark-alternative",
		"/yelp-alternative",
		"/angies-list-alternative",
		"/expedia-alternative",
		"/google-business-alternative",
		"/ecommerce-operations-platform",
		"/energy-services-software",
		"/construction-management-software",
		"/fitness-studio-software",
		"/field-management-software",
		"/healthcare-operations-platform",
		"/hospitality-operations-platform",
		"/localhub-marketplace-platform",
		"/logistics-operations-platform",
		"/nonprofit-operations-platform",
		"/professional-services-platform",
		"/property-management-platform",
		"/real-estate-operations-platform",
		"/retail-operations-platform",
		"/transparency",
		"/tripadvisor-alternative",
		"/yellow-pages-alternative",

		// Jobs app
		"/jobs",
		"/jobs/1", // from /jobs/[jobId]
		"/jobs/post",
		"/reviews", // (jobs-app)/reviews
		"/salary", // (jobs-app)/salary

		// LinkedIn clone
		"/network",
		"/network/messages",
		"/network/manage",
		"/profile/example-user", // from /profile/[userId]
	];

	return (
		<div className="w-full border-t border-dashed border-yellow-300 bg-yellow-50 text-warning dark:bg-warning/10 dark:text-warning/80">
			<div className="container mx-auto px-4 py-4">
				<div className="mb-2 text-xs font-semibold uppercase tracking-wider opacity-80">Dev Route Index</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
					{routes.map((href) => (
						<a key={href} href={href} className="text-sm hover:underline break-all">
							{href}
						</a>
					))}
				</div>
			</div>
		</div>
	);
}
