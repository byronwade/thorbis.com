export default function manifest() {
	return {
		name: "Thorbis",
		short_name: "Thorbis",
		description: "Discover local businesses, events, and community resources.",
		start_url: "/",
		display: "standalone",
		background_color: "#000000",
		theme_color: "#000000",
		icons: [
			{
				src: "/favicon-32x32.png",
				sizes: "32x32",
				type: "image/png",
			},
			{
				src: "/favicon-16x16.png",
				sizes: "16x16",
				type: "image/png",
			},
			{
				src: "/logos/ThorbisLogo.webp",
				sizes: "192x192",
				type: "image/webp",
				purpose: "any",
			},
			{
				src: "/logos/ThorbisLogo.webp",
				sizes: "512x512",
				type: "image/webp",
				purpose: "any maskable",
			},
		],
	};
}
