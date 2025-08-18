import { Login } from "@features/auth";
import { getDictionary, languages } from '@lib/i18n/dictionaries';

// Generate internationalized metadata
export async function generateMetadata({ params, searchParams }) {
	// Auto-detect locale from browser or use default
	const locale = 'en'; // For now, default to English - can be enhanced later
	const dict = await getDictionary(locale);
	
	// Get auth translations with fallbacks
	const authTranslations = dict.auth?.login || {};
	const commonTranslations = dict.common || {};
	
	const title = authTranslations.title || "Welcome Back";
	const description = "Log in to your Thorbis account to post jobs and connect with professional service providers easily.";
	
	// Generate alternate language URLs
	const alternateLanguages = {};
	Object.keys(languages).forEach(lang => {
		alternateLanguages[`${lang}-${lang.toUpperCase()}`] = `https://thorbis.com/${lang}/login`;
	});

	return {
		title: `${title} - Thorbis`,
		description: description,
		robots: { index: false, follow: false },
		keywords: [
			"Thorbis", 
			authTranslations.email || "login", 
			authTranslations.signIn || "log in", 
			commonTranslations.navigation?.login || "account access", 
			"find business", 
			"contractors", 
			"home improvement"
		],
		openGraph: {
			title: `${title} - Thorbis`,
			description: description,
			url: `https://thorbis.com/${locale}/login`,
			siteName: "Thorbis",
			images: [
				{
					url: "https://thorbis.com/logos/ThorbisLogo.webp",
					width: 800,
					height: 600,
					alt: title,
				},
			],
			locale: `${locale}_${locale.toUpperCase()}`,
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: `${title} - Thorbis`,
			description: description,
			images: ["https://thorbis.com/logos/ThorbisLogo.webp"],
		},
		alternates: {
			canonical: `https://thorbis.com/${locale}/login`,
			languages: alternateLanguages,
		},
	};
}

// Generate internationalized JSON-LD schema
async function generateJsonLd(locale = 'en') {
	const dict = await getDictionary(locale);
	const authTranslations = dict.auth?.login || {};
	
	const title = authTranslations.title || "Welcome Back";
	const description = "Log in to your Thorbis account to post jobs and connect with professional service providers easily.";
	const signInText = authTranslations.signIn || "Login to Thorbis";

	return {
		"@context": "https://schema.org",
		"@type": "WebPage",
		url: `https://thorbis.com/${locale}/login`,
		name: `${title} - Thorbis`,
		inLanguage: locale,
		description: description,
		publisher: {
			"@type": "Organization",
			name: "Thorbis",
			logo: {
				"@type": "ImageObject",
				url: "https://thorbis.com/logos/ThorbisLogo.webp",
			},
		},
		primaryImageOfPage: {
			"@type": "ImageObject",
			url: "https://thorbis.com/logos/ThorbisLogo.webp",
		},
		potentialAction: {
			"@type": "LoginAction",
			target: `https://thorbis.com/${locale}/login`,
			name: signInText,
		},
		// Add breadcrumb navigation
		breadcrumb: {
			"@type": "BreadcrumbList",
			itemListElement: [
				{
					"@type": "ListItem",
					position: 1,
					name: "Home",
					item: `https://thorbis.com/${locale}`
				},
				{
					"@type": "ListItem",
					position: 2,
					name: title,
					item: `https://thorbis.com/${locale}/login`
				}
			]
		}
	};
}

export default async function LoginPage() {
	const locale = 'en'; // For now, default to English - can be enhanced later
	const jsonLdData = await generateJsonLd(locale);

	return (
		<>
			<Login />
			<script 
				type="application/ld+json" 
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }} 
			/>
		</>
	);
}
