/**
 * SEO Metadata Utilities
 * Centralized helpers for generating meta tags, structured data, and Open Graph content
 */

// Base metadata configuration
export const baseMetadata = {
	title: {
		default: "Thorbis - Discover Local Businesses & Community",
		template: "%s | Thorbis",
	},
	description: "Discover the best local businesses, events, and community resources in your area. Connect with your neighborhood and find trusted local services with verified reviews and ratings.",
	keywords: [
		"local business directory", 
		"community events", 
		"neighborhood guide", 
		"local services", 
		"business reviews", 
		"community resources", 
		"local marketplace", 
		"small business", 
		"local economy", 
		"community networking"
	],

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
		nocache: false,
		googleBot: {
			index: true,
			follow: true,
			noimageindex: false,
			"max-video-preview": "standard",
			"max-image-preview": "large",
			"max-snippet": 160,
		},
	},

	// Open Graph
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "https://thorbis.com",
		siteName: "Thorbis",
		title: "Thorbis - Discover Local Businesses & Community",
		description: "Discover the best local businesses, events, and community resources in your area. Connect with your neighborhood and find trusted local services with verified reviews and ratings.",
		images: [
			{
				url: "https://thorbis.com/logos/ThorbisLogo.webp",
				width: 1200,
				height: 630,
				alt: "Thorbis - Local Business Directory",
				type: "image/webp",
			},
		],
	},

	// Twitter
	twitter: {
		card: "summary_large_image",
		title: "Thorbis - Discover Local Businesses & Community",
		description: "Discover the best local businesses, events, and community resources in your area. Connect with your neighborhood and find trusted local services with verified reviews and ratings.",
		site: "@thorbis",
		creator: "@thorbis",
		images: {
			url: "https://thorbis.com/logos/ThorbisLogo.webp",
			alt: "Thorbis - Local Business Directory",
		},
	},

	// App links
	appLinks: {
		web: {
			url: "https://thorbis.com",
			should_fallback: true,
		},
	},

	// Icons
	icons: {
		icon: [
			{ url: "/favicon.ico", sizes: "any" },
			{ url: "/icon.svg", type: "image/svg+xml" },
			{ url: "/icon-192.png", type: "image/png", sizes: "192x192" },
			{ url: "/icon-512.png", type: "image/png", sizes: "512x512" },
		],
		apple: [
			{ url: "/apple-icon-180.png", sizes: "180x180", type: "image/png" },
		],
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
		"theme-color": "#000000",
		"msapplication-TileColor": "#000000",
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
		"Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com https://*.vercel-scripts.com https://maps.googleapis.com; script-src-elem 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com https://*.vercel-scripts.com https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://www.google-analytics.com https://vitals.vercel-analytics.com https://va.vercel-scripts.com https://*.vercel-scripts.com https://maps.googleapis.com https://maps.gstatic.com https://*.googleapis.com https://mapsresources-pa.googleapis.com; worker-src 'self' blob:;",

		// Performance hints
		"dns-prefetch": "https://fonts.googleapis.com",
		preconnect: "https://fonts.gstatic.com",
	},
};

/**
 * Generate page-specific metadata
 */
export function generatePageMetadata({ 
	title, 
	description, 
	keywords = [], 
	path = "", 
	images = [], 
	type = "website" 
}) {
	const fullUrl = `https://thorbis.com${path}`;
	
	return {
		...baseMetadata,
		title,
		description,
		keywords: [...baseMetadata.keywords, ...keywords],
		alternates: {
			...baseMetadata.alternates,
			canonical: fullUrl,
		},
		openGraph: {
			...baseMetadata.openGraph,
			title,
			description,
			url: fullUrl,
			type,
			images: images.length > 0 ? images : baseMetadata.openGraph.images,
		},
		twitter: {
			...baseMetadata.twitter,
			title,
			description,
			images: images.length > 0 ? images[0] : baseMetadata.twitter.images,
		},
	};
}

/**
 * Generate business-specific metadata
 */
export function generateBusinessMetadata(business) {
	const title = `${business.name} - ${business.city}, ${business.state}`;
	const description = business.description || `Find information about ${business.name} in ${business.city}, ${business.state}. View reviews, contact details, and more.`;
	const path = `/business/${business.slug}`;
	
	const images = business.photos?.length > 0 
		? [{ url: business.photos[0].url, alt: business.name }]
		: [];

	return generatePageMetadata({
		title,
		description,
		keywords: [business.name, business.city, business.state, ...(business.categories || [])],
		path,
		images,
		type: "business.business",
	});
}

/**
 * Viewport configuration
 */
export const viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "white" },
		{ media: "(prefers-color-scheme: dark)", color: "black" },
	],
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
	userScalable: true,
	viewportFit: "cover",
};
