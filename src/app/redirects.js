/**
 * URL Redirects Configuration
 * Handles redirects from old consolidated pages to new hub structure
 * Ensures SEO value preservation with 301 permanent redirects
 */

export const redirectConfig = {
	// Help Hub Redirects (support, faq, help-center, contact-support → help)
	"/support": "/help",
	"/faq": "/help",
	"/help-center": "/help",
	"/contact-support": "/help",

	// Business Resources Hub Redirects (business-* pages → business-resources, excluding restaurant-owners)
	"/business-certification": "/business-resources",
	"/business-story-videos": "/business-resources",
	"/business-success-stories": "/business-resources",
	"/business-support": "/business-resources",
	"/table-management": "/business-resources",

	// Legal Hub Redirects (terms, privacy, guidelines, trust-safety → legal)
	"/terms": "/legal",
	"/privacy": "/legal",
	"/community-guidelines": "/legal",
	"/content-guidelines": "/legal",
	"/trust-safety": "/legal",

	// Company Hub Redirects (about-us, careers, press, investor-relations → company)
	"/about-us": "/company",
	"/careers": "/company",
	"/press": "/company",
	"/investor-relations": "/company",

	// Resources Hub Redirects (news, learn, events → resources)
	"/news": "/resources",
	"/learn": "/resources",
	"/events": "/resources",

	// Discover Hub Redirects (explore-business, certified, categories, industries, neighborhoods → discover)
	"/explore-business": "/discover",
	"/certified": "/discover",
	"/categories": "/discover",
	"/industries": "/discover",
	"/neighborhoods": "/discover",

	// Removed pages - redirect to appropriate alternatives
        "/ad-choices": "/legal",
        "/changelog": "/resources",
        "/seo-examples": "/resources",
        "/accessibility-statement": "/legal",
        "/shop": "/store",

	// Specific section redirects for better UX
	"/support/contact": "/help#contact",
	"/faq/business": "/help#business-faq",
	"/faq/general": "/help#general-faq",
	"/about-us/team": "/company#team",
	"/careers/openings": "/company#careers",
	"/press/releases": "/company#press",
	"/blog/marketing": "/resources#blog",
	"/learn/courses": "/resources#learning",
	"/events/upcoming": "/resources#events",
	"/categories/restaurants": "/discover#categories",
	"/industries/food": "/discover#industries",
	"/neighborhoods/trending": "/discover#neighborhoods",
	"/certified/businesses": "/discover#certified",

	// Legacy URL patterns - catch common variations
	"/business-resources": "/business-resources", // Already correct
	"/business_support": "/business-resources",
	"/business_certification": "/business-resources",
	"/help_center": "/help",
	"/contact_support": "/help",
	"/community_guidelines": "/legal",
	"/content_guidelines": "/legal",
	"/trust_safety": "/legal",
	"/about_us": "/company",
	"/investor_relations": "/company",
	"/explore_business": "/discover",
};

/**
 * Get redirect destination for a given path
 * @param {string} pathname - The pathname to check for redirects
 * @returns {string|null} - The redirect destination or null if no redirect needed
 */
export function getRedirectDestination(pathname) {
	// Remove trailing slash for consistency
	const cleanPath = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;

	return redirectConfig[cleanPath] || null;
}

/**
 * Check if a path needs to be redirected
 * @param {string} pathname - The pathname to check
 * @returns {boolean} - Whether the path needs redirection
 */
export function shouldRedirect(pathname) {
	return getRedirectDestination(pathname) !== null;
}

/**
 * Legacy redirect patterns for dynamic routes
 * These handle more complex URL patterns that might exist
 */
export const dynamicRedirects = [
	{
		source: "/support/:path*",
		destination: "/help",
		permanent: true,
	},
	{
		source: "/faq/:path*",
		destination: "/help",
		permanent: true,
	},
	{
		source: "/business-:slug(certification|support|success-stories|story-videos)",
		destination: "/business-resources",
		permanent: true,
	},
	{
		source: "/blog/:slug*",
		destination: "/resources",
		permanent: true,
	},
	{
		source: "/news/:slug*",
		destination: "/resources",
		permanent: true,
	},
	{
		source: "/learn/:slug*",
		destination: "/resources",
		permanent: true,
	},
	{
		source: "/events/:slug*",
		destination: "/resources",
		permanent: true,
	},
	{
		source: "/categories/:slug*",
		destination: "/discover",
		permanent: true,
	},
	{
		source: "/industries/:slug*",
		destination: "/discover",
		permanent: true,
	},
	{
		source: "/neighborhoods/:slug*",
		destination: "/discover",
		permanent: true,
	},
];

export default redirectConfig;
