/**
 * Global Metadata Configuration for Next.js App Router
 * Enterprise-level SEO optimization with performance-first approach
 */

export const metadata = {
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
		"Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com https://*.vercel-scripts.com https://vercel.live https://api.mapbox.com; script-src-elem 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com https://*.vercel-scripts.com https://vercel.live https://api.mapbox.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.mapbox.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob: https://*.tiles.mapbox.com https://api.mapbox.com; connect-src 'self' https://www.google-analytics.com https://vitals.vercel-analytics.com https://va.vercel-scripts.com https://*.vercel-scripts.com https://vercel.live https://api.mapbox.com https://*.tiles.mapbox.com https://events.mapbox.com; worker-src 'self' blob: https://api.mapbox.com;",

		// Performance hints
		"dns-prefetch": "https://fonts.googleapis.com",
		preconnect: "https://fonts.gstatic.com",
	},
};

export const viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
	userScalable: true,
	viewportFit: "cover",
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "hsl(var(--background))" },
		{ media: "(prefers-color-scheme: dark)", color: "hsl(var(--background))" },
	],
};
