import { getDictionary, languages } from '@lib/i18n/dictionaries';

// Generate internationalized metadata
export async function generateMetadata({ params, searchParams }) {
	const locale = 'en'; // Default to English for now
	const dict = await getDictionary(locale);
	
	// Get business translations with fallbacks
	const businessTranslations = dict.business?.profile || {};
	const commonTranslations = dict.common || {};
	
	const title = businessTranslations.hero?.title || "Grow Your Business with Thorbis - Free Business Listings & Marketing Tools";
	const description = businessTranslations.hero?.subtitle || "Claim your free business page on Thorbis and connect with millions of potential customers. Manage reviews, track analytics, and grow your local business.";
	
	// Generate alternate language URLs
	const alternateLanguages = {};
	Object.keys(languages).forEach(lang => {
		alternateLanguages[`${lang}-${lang.toUpperCase()}`] = `https://thorbis.com/${lang}/business`;
	});

	return {
		title: title,
		description: description,
		keywords: ["business listings", "free business page", "local business marketing", "customer reviews", "business analytics", "claim business"],
		alternates: { 
			canonical: `https://thorbis.com/${locale}/business`,
			languages: alternateLanguages,
		},
		openGraph: {
			title: title,
			description: description,
			url: `https://thorbis.com/${locale}/business`,
			siteName: "Thorbis",
			images: [
				{
					url: `https://thorbis.com/opengraph-image?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`,
					width: 1200,
					height: 630,
					alt: title,
				},
			],
			locale: `${locale}_${locale.toUpperCase()}`,
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: title,
			description: description,
			images: [`https://thorbis.com/twitter-image?title=${encodeURIComponent(title)}`],
		},
	};
}

export default function BusinessLayout({ children }) {
	return <>{children}</>;
}
