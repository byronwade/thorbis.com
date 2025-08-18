/**
 * Server-side Internationalization System
 * SSR-optimized translation system with caching and metadata generation
 * Compatible with Next.js App Router and middleware
 */

import { cache } from 'react';
import coreTranslations, { 
	supportedLanguages, 
	getTranslation, 
	getLanguageMetadata,
	interpolate 
} from './enhanced-translations.js';

// Performance-optimized translation cache
const translationCache = new Map();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

/**
 * Cached dictionary getter for server-side rendering
 * Uses React's cache() for per-request deduplication
 */
export const getDictionary = cache(async (locale) => {
	const normalizedLocale = locale && supportedLanguages[locale] ? locale : 'en';
	
	// Check cache first
	const cacheKey = `dict_${normalizedLocale}`;
	const cached = translationCache.get(cacheKey);
	
	if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
		return cached.data;
	}
	
	try {
		// Get core translations
		const dictionary = coreTranslations[normalizedLocale] || coreTranslations.en;
		
		// Cache the result
		translationCache.set(cacheKey, {
			data: dictionary,
			timestamp: Date.now()
		});
		
		return dictionary;
	} catch (error) {
		console.error(`Failed to load dictionary for locale ${normalizedLocale}:`, error);
		// Fallback to English
		return coreTranslations.en;
	}
});

/**
 * Server-side translation function with interpolation
 * Optimized for server components and route handlers
 */
export const t = cache(async (locale, key, options = {}) => {
	try {
		const dictionary = await getDictionary(locale);
		const keys = key.split('.');
		let value = dictionary;

		// Navigate through nested object
		for (const k of keys) {
			if (value && typeof value === 'object' && k in value) {
				value = value[k];
			} else {
				return options.fallback || key;
			}
		}

		if (typeof value !== 'string') {
			return options.fallback || key;
		}

		// Handle interpolation
		if (options.interpolation) {
			return interpolate(value, options.interpolation);
		}

		return value;
	} catch (error) {
		console.error('Translation error:', error);
		return options.fallback || key;
	}
});

/**
 * Generate localized metadata for SEO
 * Creates proper meta tags, hreflang, and JSON-LD
 */
export async function generateI18nMetadata(locale, page, customMeta = {}) {
	const langMeta = getLanguageMetadata(locale);
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://thorbis.com';
	
	// Get page-specific translations
	const title = await t(locale, `${page}.meta.title`, { fallback: customMeta.title });
	const description = await t(locale, `${page}.meta.description`, { fallback: customMeta.description });
	
	// Generate alternate language URLs
	const alternates = {
		canonical: `${baseUrl}/${locale === 'en' ? '' : locale}${customMeta.path || ''}`,
		languages: {}
	};

	// Add hreflang for all supported languages
	for (const [code] of Object.entries(supportedLanguages)) {
		const path = code === 'en' ? '' : `/${code}`;
		alternates.languages[code] = `${baseUrl}${path}${customMeta.path || ''}`;
	}

	// OpenGraph metadata
	const openGraph = {
		title: title,
		description: description,
		url: alternates.canonical,
		siteName: await t(locale, 'site.name', { fallback: 'Thorbis' }),
		locale: locale,
		type: 'website',
		...customMeta.openGraph
	};

	// Twitter metadata
	const twitter = {
		card: 'summary_large_image',
		title: title,
		description: description,
		...customMeta.twitter
	};

	// JSON-LD structured data
	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: title,
		description: description,
		url: alternates.canonical,
		inLanguage: locale,
		isPartOf: {
			'@type': 'WebSite',
			name: await t(locale, 'site.name', { fallback: 'Thorbis' }),
			url: baseUrl
		},
		...customMeta.jsonLd
	};

	return {
		title,
		description,
		alternates,
		openGraph,
		twitter,
		other: {
			'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION,
			'language': locale,
			'content-language': locale,
			'http-equiv': langMeta.dir === 'rtl' ? 'Content-Type' : undefined,
			...(langMeta.dir === 'rtl' && { dir: 'rtl' })
		},
		// Return JSON-LD separately for manual injection
		jsonLd
	};
}

/**
 * Middleware helper for locale detection
 * Detects user's preferred language from headers and cookies
 */
export function detectLocaleFromRequest(request) {
	// Check URL first
	const pathname = request.nextUrl?.pathname || '';
	const pathnameLocale = pathname.split('/')[1];
	
	if (supportedLanguages[pathnameLocale]) {
		return pathnameLocale;
	}
	
	// Check cookie
	const cookieLocale = request.cookies?.get('locale')?.value;
	if (supportedLanguages[cookieLocale]) {
		return cookieLocale;
	}
	
	// Check Accept-Language header
	const acceptLanguage = request.headers?.get('accept-language') || '';
	const preferredLangs = acceptLanguage
		.split(',')
		.map(lang => lang.split(';')[0].trim().split('-')[0])
		.filter(lang => supportedLanguages[lang]);
	
	if (preferredLangs.length > 0) {
		return preferredLangs[0];
	}
	
	return 'en'; // Default fallback
}

/**
 * Generate sitemap entries for all localized pages
 * Helps with SEO and search engine indexing
 */
export function generateLocalizedSitemapEntries(pages) {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://thorbis.com';
	const entries = [];
	
	pages.forEach(page => {
		Object.keys(supportedLanguages).forEach(locale => {
			const path = locale === 'en' ? page.path : `/${locale}${page.path}`;
			
			entries.push({
				url: `${baseUrl}${path}`,
				lastModified: page.lastModified || new Date(),
				changeFrequency: page.changeFreq || 'weekly',
				priority: page.priority || 0.8,
				alternateRefs: Object.keys(supportedLanguages).map(altLocale => ({
					href: `${baseUrl}${altLocale === 'en' ? page.path : `/${altLocale}${page.path}`}`,
					hreflang: altLocale
				}))
			});
		});
	});
	
	return entries;
}

/**
 * Translation validation helper
 * Checks for missing translations during build time
 */
export function validateTranslations(requiredKeys = []) {
	const missingTranslations = {};
	
	requiredKeys.forEach(key => {
		Object.keys(supportedLanguages).forEach(locale => {
			const translation = getTranslation(locale, key);
			if (translation === key) { // Translation not found
				if (!missingTranslations[locale]) {
					missingTranslations[locale] = [];
				}
				missingTranslations[locale].push(key);
			}
		});
	});
	
	return missingTranslations;
}

/**
 * Currency formatter with locale support
 */
export function formatCurrency(amount, locale) {
	const langMeta = getLanguageMetadata(locale);
	const currencyMap = {
		'$': 'USD',
		'€': 'EUR',
		'¥': 'JPY',
		'₩': 'KRW',
		'₽': 'RUB',
		'﷼': 'SAR',
		'₹': 'INR'
	};
	
	const currency = currencyMap[langMeta.currency] || 'USD';
	
	try {
		return new Intl.NumberFormat(locale, {
			style: 'currency',
			currency: currency
		}).format(amount);
	} catch {
		return `${langMeta.currency}${amount}`;
	}
}

/**
 * Date formatter with locale support
 */
export function formatDate(date, locale, options = {}) {
	try {
		return new Intl.DateTimeFormat(locale, {
			dateStyle: 'medium',
			timeStyle: options.includeTime ? 'short' : undefined,
			...options
		}).format(new Date(date));
	} catch {
		return new Date(date).toLocaleDateString();
	}
}

/**
 * Number formatter with locale support
 */
export function formatNumber(number, locale, options = {}) {
	try {
		return new Intl.NumberFormat(locale, options).format(number);
	} catch {
		return number.toString();
	}
}

/**
 * Clear translation cache (useful for development)
 */
export function clearTranslationCache() {
	translationCache.clear();
}

// Export supported languages for external use
export { supportedLanguages };

// Default export for backward compatibility
export default {
	getDictionary,
	t,
	generateI18nMetadata,
	detectLocaleFromRequest,
	generateLocalizedSitemapEntries,
	validateTranslations,
	formatCurrency,
	formatDate,
	formatNumber,
	supportedLanguages
};
