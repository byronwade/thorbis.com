import "./globals.css";
import React from "react";
import { Inter as FontSans } from "next/font/google";
import { ThemeProvider } from "@context/theme-context";
import { TranslationProvider } from "@lib/i18n/enhanced-client";
import { getDictionary } from "@lib/i18n/server";
import { StatsigProvider } from "@context/statsig-context";
import { Toaster } from "@components/ui/toaster";
import ErrorBoundary from "@components/shared/error-boundary";
import AnalyticsInitializer from "@components/shared/analytics-initializer";
import { cn } from "@utils";

import { AuthProvider } from "@context/auth-context";
import PerformanceProvider from "@components/performance/performance-provider";
import DevDiagnostics from "@components/debug/dev-diagnostics";

// NextFaster Performance Optimizations - Disable cache for dev
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import SiteWideAlert from "@components/shared/site-alert";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

// Feature flags and site layout components
import { evaluateAllFlags } from "@/lib/flags/server";
import { cookies, headers } from "next/headers";
import VoipProvider from "@components/voip/VoipProvider";
import { VoipControlButton } from "@components/shared/voip/voip-integration";
import VercelFlagTracker from "@components/shared/vercel-flag-tracker";
import ConditionalLayoutWrapper from "@components/layout/conditional-layout-wrapper";
import HydrationMonitor from "@components/shared/hydration-monitor";
import CartProvider from "@components/shared/cart/cart-provider";

// Import SEO configuration from centralized location
export { baseMetadata as metadata, viewport } from "@lib/seo";

// Font configuration - must be defined early
const fontSans = FontSans({
	subsets: ["latin"],
	variable: "--font-sans",
});

// Legacy metadata kept for reference - moved to @lib/seo/metadata.js
/* export const metadata = {
	// Basic metadata
	title: {
		default: "Thorbis - Discover Local Businesses & Community",
		template: "%s | Thorbis",
	},
	description: "Discover the best local businesses, events, and community resources in your area. Connect with your neighborhood and find trusted local services with verified reviews and ratings.",
	keywords: ["local business directory", "community events", "neighborhood guide", "local services", "business reviews", "community resources", "local marketplace", "small business", "local economy", "community networking"],

	// Authors and creator
	authors: [{ name: "ByteRover LLC", url: "https://thorbis.com" }],
	creator: "ByteRover LLC",
	publisher: "ByteRover LLC",

	// Application metadata
	applicationName: "Thorbis",
	generator: "Next.js",
	category: "Business Directory",

	// Referrer policy
	referrer: "origin-when-cross-origin",

	// Robots configuration
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},

	// Open Graph
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "https://thorbis.com",
		siteName: "Thorbis",
		title: "Thorbis - Your Community Business Hub",
		description: "Discover amazing local businesses, events, and connect with your community. Your comprehensive guide to everything local.",
		images: [
			{
				url: `https://thorbis.com/opengraph-image?title=${encodeURIComponent("Thorbis – Your Community Business Hub")}&description=${encodeURIComponent("Discover local businesses, events, and connect with your community.")}`,
				width: 1200,
				height: 630,
				alt: "Thorbis - Community Business Hub",
				type: "image/png",
			},
		],
	},

	// Twitter
	twitter: {
		card: "summary_large_image",
		site: "@byronwade",
		creator: "@byronwade",
		title: "Thorbis - Your Community Business Hub",
		description: "Discover amazing local businesses, events, and connect with your community.",
		images: [`https://thorbis.com/twitter-image?title=${encodeURIComponent("Thorbis – Your Community Business Hub")}`],
	},

	// Icons
	icons: {
		icon: [
			{ url: "/favicon.ico", sizes: "any" },
			{ url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
		],
		apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
		shortcut: "/favicon.ico",
	},

	// Manifest
	manifest: "/manifest.json",

	// Alternates
	alternates: {
		canonical: "https://thorbis.com",
		types: {
			"application/rss+xml": [{ url: "https://thorbis.com/rss.xml", title: "Thorbis RSS Feed" }],
		},
	},

	// Verification
	verification: {
		google: process.env.GOOGLE_VERIFICATION_CODE,
		bing: process.env.BING_VERIFICATION_CODE,
		yandex: process.env.YANDEX_VERIFICATION_CODE,
	},

	// Other meta tags
	other: {
		// Performance and mobile optimization
		"theme-color": "hsl(var(--background))",
		"msapplication-TileColor": "hsl(var(--background))",
		"msapplication-config": "/browserconfig.xml",
		"mobile-web-app-capable": "yes",
		"apple-mobile-web-app-status-bar-style": "default",
		"apple-mobile-web-app-title": "Local Directory",
		"format-detection": "telephone=no",

		// Social media optimization
		"fb:app_id": process.env.FACEBOOK_APP_ID,
		"twitter:domain": "thorbis.com",

		// SEO optimization
		rating: "general",
		distribution: "global",
		"revisit-after": "7 days",
		language: "English",
		"geo.region": "US",
		"geo.placename": "United States",

		// Security headers
		"X-UA-Compatible": "IE=edge",
		"Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://www.google-analytics.com https://vitals.vercel-analytics.com;",

		// Performance hints
		"dns-prefetch": "https://fonts.googleapis.com",
		preconnect: "https://fonts.gstatic.com",
	},
};



/**
 * Development route index for quick navigation
 */
function DevLinks() {
	if (process.env.NODE_ENV === "production") return null;

	const routes = [
		// Core site pages
		"/",
		"/about-us",
		"/accessibility-statement",
		"/ad-choices",
		"/advertise",
		"/affiliates",
		"/blog",
		"/blog/article",
		"/blog/example-post", // from /blog/[slug]
		"/us/ga/jasper/example-biz-abcdefg", // example new pattern
		"/business",
		"/business-certification",
		"/business-story-videos",
		"/business-success-stories",
		"/business-support",
		"/careers",
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
		"/industries",
		"/investor-relations",
		"/learn",
		"/learn/example-course", // from /learn/[courseId]
		"/live-streaming",
		"/localhub",
		"/mobile",
		"/neighborhoods",
		"/news",
		"/partners",
		"/press",
		"/privacy",
		"/restaurant-owners",
		"/rss",
		"/search",
		"/shorts",
		"/support",
		"/table-management",
		"/terms",
		"/trust-safety",

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

		// Auth forms
		"/login",
		"/login-demo",
		"/signup",
		"/password-reset",
		"/otp",
		"/onboarding",
		"/onboarding/business-setup",
		"/unauthorized",
		"/report",
		"/contact",
		"/claim-a-business",
		"/add-a-business",
		"/email-verified",

		// Dashboards (root)
		"/dashboard",

		// User dashboard
		"/dashboard/user",
		"/dashboard/user/settings",
		"/dashboard/user/support",
		"/dashboard/user/reviews",
		"/dashboard/user/reviews/create",
		"/dashboard/user/billing",
		"/dashboard/user/activity",
		"/dashboard/user/jobs",
		"/dashboard/user/jobs/create",

		// Business dashboard
		"/dashboard/business",
		"/dashboard/business/profile",
		"/dashboard/business/settings",
		"/dashboard/business/ads",
		"/dashboard/business/ads/create",

		// Admin dashboard
		"/dashboard/admin",
		"/dashboard/admin/users",
		"/dashboard/admin/customers",
		"/dashboard/admin/billing",
		"/dashboard/admin/reports",
		"/dashboard/admin/support",
		"/dashboard/admin/settings",
		"/dashboard/admin/pro-accounts",

		// Localhub dashboard
		"/dashboard/localhub",
		"/dashboard/localhub/settings",
		"/dashboard/localhub/support",
		"/dashboard/localhub/analytics",
		"/dashboard/localhub/businesses",
		"/dashboard/localhub/customization",
		"/dashboard/localhub/domains",
		"/dashboard/localhub/directories",
		"/dashboard/localhub/create-directory",

		// Academy dashboard
		"/dashboard/academy",
		"/dashboard/academy/courses",

		// Vertical dashboards
		"/dashboard/logistics",
		"/dashboard/construction",
		"/dashboard/property-management",

		// Field management (high-value sections)
		"/dashboard/field-management/analytics",
		"/dashboard/field-management/analytics/dashboard",
		"/dashboard/field-management/analytics/forecasting-predictive",
		"/dashboard/field-management/jobs",
		"/dashboard/field-management/jobs/list",
		"/dashboard/field-management/jobs/scheduling",
		"/dashboard/field-management/jobs/tracking",
		"/dashboard/field-management/communication/inbox",
		"/dashboard/field-management/communication/calls",
		"/dashboard/field-management/automation",
		"/dashboard/field-management/automation/review-requests",
		"/dashboard/field-management/companies",
		"/dashboard/field-management/billing",
		"/dashboard/field-management/performance",
		"/dashboard/field-management/performance/scorecards",
		"/dashboard/field-management/employees",
	];

	return (
		<div id="dev-route-index" className="w-full border-t border-dashed border-yellow-300 bg-yellow-50 text-warning dark:bg-warning/10 dark:text-warning/80">
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

/**
 * Check if current route should include site header/footer
 */
function usePathname() {
	if (typeof window !== 'undefined') {
		return window.location.pathname;
	}
	return '/';
}

function shouldShowSiteLayout(pathname = '/') {
	// Don't show header/footer on dashboard routes or auth forms
	if (pathname.startsWith('/dashboard') || 
		pathname.startsWith('/login') || 
		pathname.startsWith('/signup') || 
		pathname.startsWith('/password-reset') || 
		pathname.startsWith('/otp') || 
		pathname.startsWith('/onboarding') ||
		pathname.startsWith('/auth/') ||  // Any auth routes
		pathname.includes('/forms/') ||   // Form pages
		pathname === '/unauthorized' ||
		pathname === '/support-ticket') {
		return false;
	}
	return true;
}

export default async function RootLayout({ children, params }) {
	const isDev = process.env.NODE_ENV === "development";
	
	// Get locale from headers (set by middleware) or default to English
	const headersList = await headers();
	const locale = headersList.get('x-locale') || 'en';
	const dictionary = await getDictionary(locale);
	
	// Evaluate feature flags once per request (SSR-first approach)
	const ff = await evaluateAllFlags();
	
	// Apply dev-only cookie overrides to SSR flags so client toggles are SEO-safe
	let overridden = { ...ff };
	if (process.env.NODE_ENV !== "production") {
		try {
			const cookieStore = await cookies();
			const raw = cookieStore.get("dev_flag_overrides")?.value;
			if (raw) {
				const parsed = JSON.parse(decodeURIComponent(raw));
				if (parsed && typeof parsed === "object") {
					for (const [k, v] of Object.entries(parsed)) {
						if (typeof v === "boolean" && k in overridden) {
							overridden[k] = v;
						}
					}
				}
			}
		} catch {}
	}
	
	return (
		<html lang={locale} suppressHydrationWarning data-scroll-behavior="smooth" className="dark">
			<HydrationMonitor />
			<head>
				{/* Dark mode script to prevent flash of wrong theme */}
				<script
					dangerouslySetInnerHTML={{
						__html: `
							(function() {
								try {
									const savedTheme = localStorage.getItem('thorbis-theme');
									if (savedTheme === 'light') {
										document.documentElement.classList.remove('dark');
									} else if (savedTheme === 'dark' || !savedTheme) {
										// Keep dark mode as default (already set in className)
									} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
										document.documentElement.classList.add('dark');
									}
								} catch (e) {
									// Fallback: keep existing dark class
								}
							})();
						`,
					}}
				/>

				{/* NextFaster Performance Optimizations */}
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link rel="dns-prefetch" href="https://www.googletagmanager.com" />
				<link rel="dns-prefetch" href="https://www.google-analytics.com" />

				{/* Critical resource prefetching with proper 'as' attributes */}
                <link rel="preload" href="/logos/ThorbisLogo.webp" as="image" />
				<link rel="prefetch" href="/api/categories" as="fetch" crossOrigin="anonymous" />
				<link rel="prefetch" href="/api/businesses/featured" as="fetch" crossOrigin="anonymous" />

				{/* Service Worker registration hint */}
				<link rel="manifest" href="/manifest.json" />
				<meta name="theme-color" content="hsl(var(--background))" />

				{/* Advanced image format support */}
				<meta name="image-formats" content="avif,webp,jpg" />

				{/* Performance hints */}
				<meta name="resource-hints" content="preload,prefetch,preconnect" />

				{/* Organization structured data for global recognition */}
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(
							{
								"@context": "https://schema.org",
								"@type": "Organization",
								name: "ByteRover LLC",
								url: "https://thorbis.com",
								logo: {
									"@type": "ImageObject",
									url: "https://thorbis.com/logos/ThorbisLogo.webp",
									width: 512,
									height: 512,
								},
								description: "Local business directory connecting communities with trusted local businesses and services",
								foundingDate: "2024",
								address: {
									"@type": "PostalAddress",
									addressCountry: "US",
									addressRegion: "California",
								},
								contactPoint: {
									"@type": "ContactPoint",
									telephone: "+1-555-123-4567",
									email: "support@thorbis.com",
									contactType: "Customer Service",
									areaServed: "US",
									availableLanguage: "English",
								},
								sameAs: ["https://twitter.com/byronwade", "https://linkedin.com/company/byronwade"],
							},
							null,
							0
						),
					}}
				/>

				{/* Website structured data */}
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(
							{
								"@context": "https://schema.org",
								"@type": "WebSite",
								name: "Thorbis",
								url: "https://thorbis.com",
								description: "Discover local businesses, events, and community resources in your area",
								potentialAction: {
									"@type": "SearchAction",
									target: {
										"@type": "EntryPoint",
										urlTemplate: "https://thorbis.com/search?q={search_term_string}",
									},
									"query-input": "required name=search_term_string",
								},
								publisher: {
									"@type": "Organization",
									name: "ByteRover LLC",
									url: "https://thorbis.com",
									logo: "https://thorbis.com/logos/ThorbisLogo.webp",
								},
							},
							null,
							0
						),
					}}
				/>

				{/* Site Navigation structured data */}
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(
							{
								"@context": "https://schema.org",
								"@type": "SiteNavigationElement",
								name: ["Home", "Search", "Categories", "LocalHub", "About"],
								url: ["https://thorbis.com/", "https://thorbis.com/search", "https://thorbis.com/categories", "https://thorbis.com/localhub", "https://thorbis.com/about-us"],
							},
							null,
							0
						),
					}}
				/>
			</head>
			{/* Emit ALL feature flags to DOM for Vercel Analytics tracking */}
			<body 
				className={cn("min-h-screen bg-background text-foreground font-sans antialiased", fontSans.variable)}
				style={{ colorScheme: 'dark' }}
				data-flags={JSON.stringify(overridden)}
				{...Object.entries(overridden).reduce((acc, [key, value]) => ({
					...acc,
					[`data-flag-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`]: value ? "1" : "0"
				}), {})}
			>
														<LayoutContent isDev={isDev} overridden={overridden} locale={locale} dictionary={dictionary}>
											{children}
										</LayoutContent>
				{/* Global error handlers and performance optimizations */}
				<script
					dangerouslySetInnerHTML={{
						__html: `
							// In development, ensure no stale service workers keep old chunks cached
							if (typeof window !== 'undefined' && location.hostname === 'localhost' && 'serviceWorker' in navigator) {
								window.addEventListener('load', function() {
									navigator.serviceWorker.getRegistrations().then(function(registrations) {
										registrations.forEach(function(reg) { reg.unregister(); });
										if (navigator.serviceWorker.controller) { navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' }); }
									});
								});
							}
														// Suppress React DevTools warnings and ZodErrors in production
							if (typeof window !== 'undefined') {
								const originalWarn = console.warn;
								const originalLog = console.log;
								const originalError = console.error;

								console.warn = function(...args) {
									if (args[0] && typeof args[0] === 'string') {
										if (args[0].includes('Download the React DevTools') ||
											args[0].includes('ZodError') ||
											args[0].includes('Invalid email')) {
											return;
										}
									}
									originalWarn.apply(console, args);
								};

								console.log = function(...args) {
									if (args[0] && typeof args[0] === 'string' &&
										args[0].includes('Download the React DevTools')) {
										return;
									}
									originalLog.apply(console, args);
								};

								console.error = function(...args) {
									if (args[0] && (
										(typeof args[0] === 'string' && args[0].includes('ZodError')) ||
										(args[0] && args[0].name === 'ZodError') ||
										(typeof args[0] === 'string' && args[0].includes('Invalid email'))
									)) {
										return; // Suppress ZodError from console
									}
									originalError.apply(console, args);
								};
							}

							// Handle uncaught promise rejections (where ZodErrors typically occur)
							window.addEventListener('unhandledrejection', function(event) {
								if (event.reason && event.reason.name === 'ZodError') {
									console.warn('Uncaught ZodError handled globally:', event.reason);
									event.preventDefault(); // Prevent the error from appearing in console
									return;
								}
								
								// Handle other async errors gracefully
								if (event.reason && event.reason.message) {
									console.warn('Uncaught promise rejection:', event.reason.message);
									event.preventDefault();
								}
							});

							// Handle other uncaught errors
							window.addEventListener('error', function(event) {
								if (event.error && event.error.name === 'ZodError') {
									console.warn('Uncaught ZodError handled globally:', event.error);
									event.preventDefault(); // Prevent the error from appearing in console
									return;
								}
								
								// Handle performance warnings
								if (event.message && event.message.includes('Forced reflow')) {
									console.warn('Performance warning handled:', event.message);
									event.preventDefault();
									return;
								}
							});
							
							// Optimize resource loading and prevent preload warnings
							if (typeof window !== 'undefined') {
								// Intelligent preload handler that only preloads when resources will be used
								const intelligentPreloadHandler = function() {
									// Only trigger image preloads when actually needed
									const preloadedImages = document.querySelectorAll('link[rel="preload"][as="image"]');
									preloadedImages.forEach(function(link) {
										// Check if this image will actually be used
										const isThorbisLogo = link.href.includes('ThorbisLogo');
										if (isThorbisLogo) {
											// Create invisible image to satisfy preload requirement
											const img = new Image();
											img.src = link.href;
											img.onload = function() {
												// Image loaded successfully, no action needed
											};
										} else {
											// Remove unused preload links to prevent warnings
											if (link.parentNode) {
												link.parentNode.removeChild(link);
											}
										}
									});

									// Handle API prefetches - only if user is likely to need them
									const isHomePage = window.location.pathname === '/';
									if (!isHomePage) {
										// Remove API prefetches from non-home pages to prevent warnings
										const apiPrefetches = document.querySelectorAll('link[rel="prefetch"][as="fetch"]');
										apiPrefetches.forEach(function(link) {
											if (link.parentNode) {
												link.parentNode.removeChild(link);
											}
										});
									}
								};
								
								if (document.readyState === 'loading') {
									document.addEventListener('DOMContentLoaded', intelligentPreloadHandler);
								} else {
									intelligentPreloadHandler();
								}
							}
						`,
					}}
				/>
			</body>
		</html>
	);
}

/**
 * Inner layout content component to handle conditional site layout
 */
function LayoutContent({ children, isDev, overridden, locale, dictionary }) {
	// Use client-side component for layout decision
	const content = (
		<ConditionalLayoutWrapper isDev={isDev}>
			{children}
		</ConditionalLayoutWrapper>
	);

	return isDev ? (
		<PerformanceProvider enableServiceWorker={process.env.NODE_ENV === "production"} enableMonitoring={true} enableExperimentalAPIs={true} showPerformanceMonitor={process.env.NODE_ENV === "development"} autoOptimize={true}>
			{/* Dev diagnostics to capture chunk errors and environment details */}
			{process.env.NODE_ENV === "development" && <DevDiagnostics />}
			<ThemeProvider>
				<TranslationProvider initialLocale={locale} serverDictionary={dictionary}>
					<AuthProvider>
						<StatsigProvider>
							<VoipProvider>
								<CartProvider>
									<AnalyticsInitializer />
									{/* Compact global site alert above all headers */}
									<SiteWideAlert />
									{content}
									<Toaster />
									<SpeedInsights />
									<Analytics />
									<VercelFlagTracker />
								</CartProvider>
							</VoipProvider>
						</StatsigProvider>
					</AuthProvider>
				</TranslationProvider>
			</ThemeProvider>
		</PerformanceProvider>
	) : (
		<ErrorBoundary>
			<PerformanceProvider enableServiceWorker={process.env.NODE_ENV === "production"} enableMonitoring={true} enableExperimentalAPIs={true} showPerformanceMonitor={process.env.NODE_ENV === "development"} autoOptimize={true}>
				<ThemeProvider>
					<TranslationProvider initialLocale={locale} serverDictionary={dictionary}>
						<AuthProvider>
							<StatsigProvider>
								<VoipProvider>
									<CartProvider>
										<AnalyticsInitializer />
										{/* Compact global site alert above all headers */}
																			<SiteWideAlert />
									{content}
									<Toaster />
										<SpeedInsights />
										<Analytics />
										<VercelFlagTracker />
									</CartProvider>
								</VoipProvider>
							</StatsigProvider>
						</AuthProvider>
					</TranslationProvider>
				</ThemeProvider>
			</PerformanceProvider>
		</ErrorBoundary>
	);
}
