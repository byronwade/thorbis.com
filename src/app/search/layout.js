import { getSearchFlags } from "@/lib/flags/server";

export const metadata = {
	title: "Discover Local Businesses - Next-Gen Search | Thorbis",
	description: "Experience the future of business discovery. AI-powered search, real-time insights, and intuitive filtering to find exactly what you need, when you need it.",
	robots: "index, follow",
	keywords: ["AI business search", "smart local discovery", "real-time business data", "contextual recommendations", "voice search", "visual business finder"],
};

export const viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "hsl(var(--background))" },
		{ media: "(prefers-color-scheme: dark)", color: "hsl(var(--background))" },
	],
	colorScheme: "light dark",
	viewportFit: "cover",
};

export default async function SearchLayout({ children }) {
	// Evaluate feature flags once at layout level
	const searchFlags = await getSearchFlags();

	return (
		<>
			<div
				className="w-full min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800 antialiased"
				data-flag-smart-search={searchFlags.smartSearch ? "1" : "0"}
				data-flag-ai-recommendations={searchFlags.aiRecommendations ? "1" : "0"}
				data-flag-visual-search={searchFlags.visualSearch ? "1" : "0"}
				data-flag-voice-search={searchFlags.voiceSearch ? "1" : "0"}
				data-flag-contextual-filters={searchFlags.contextualFilters ? "1" : "0"}
				data-flag-realtime-updates={searchFlags.realTimeUpdates ? "1" : "0"}
				style={{
					// Vercel-style performance optimizations
					fontSmooth: "always",
					WebkitFontSmoothing: "antialiased",
					MozOsxFontSmoothing: "grayscale",
					textRendering: "optimizeLegibility",
					fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1',
					fontVariationSettings: '"wght" 400',

					// GPU acceleration for silky smooth interactions
					transform: "translateZ(0)",
					willChange: "transform",
					backfaceVisibility: "hidden",
					perspective: "1000px",

					// Advanced CSS containment for performance
					contain: "layout style paint",

					// Optimize for 60fps animations
					scrollBehavior: "smooth",

					// Color scheme support
					colorScheme: "light dark",

					// CSS variables for feature flag driven styles
					"--search-transition-duration": searchFlags.smartSearch ? "200ms" : "150ms",
					"--search-border-radius": "12px",
					"--search-shadow": "0 8px 32px -8px hsl(var(--foreground) / 0.08)",
					"--search-shadow-hover": "0 16px 64px -12px hsl(var(--foreground) / 0.12)",
				}}
			>
				{/* Performance-first layout with minimal reflows */}
				<div className="relative w-full h-screen overflow-hidden">
					{/* Background pattern for Vercel-style aesthetics */}
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.05),transparent_50%)]" aria-hidden="true" />

					{/* Grid pattern for depth */}
					<div className="absolute inset-0 bg-[linear-gradient(hsl(var(--foreground)/0.02)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground)/0.02)_1px,transparent_1px)] bg-[length:20px_20px] dark:bg-[linear-gradient(hsl(var(--background)/0.02)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--background)/0.02)_1px,transparent_1px)]" aria-hidden="true" />

					{/* Main content with perfect centering */}
					<div className="relative z-10 w-full h-full">{children}</div>
				</div>


			</div>
		</>
	);
}
