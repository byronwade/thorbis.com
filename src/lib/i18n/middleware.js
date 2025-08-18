/**
 * i18n Middleware for Next.js App Router
 * Handles language detection, routing, and SEO-friendly URL structure
 */

import { NextResponse } from 'next/server';
import { supportedLanguages } from './enhanced-translations.js';
import { detectLocaleFromRequest } from './server.js';

// Configuration
const defaultLocale = 'en';
const locales = Object.keys(supportedLanguages);

// Paths that should not be processed by i18n middleware
const ignoredPaths = [
	'/api',
	'/admin',
	'/_next',
	'/_vercel',
	'/favicon.ico',
	'/robots.txt',
	'/sitemap.xml',
	'/manifest.json',
	'/sw.js',
	'/images',
	'/icons',
	'/assets'
];

/**
 * Main i18n middleware function
 * Handles locale detection and URL rewriting
 */
export function createI18nMiddleware(config = {}) {
	const {
		defaultLocale: configDefault = defaultLocale,
		locales: configLocales = locales,
		ignoredPaths: configIgnored = ignoredPaths,
		redirectRoot = true,
		cookieName = 'thorbis_locale'
	} = config;

	return function i18nMiddleware(request) {
		const { pathname } = request.nextUrl;
		
		// Skip middleware for ignored paths
		if (configIgnored.some(path => pathname.startsWith(path))) {
			return NextResponse.next();
		}

		// Skip if path has file extension
		if (pathname.includes('.') && !pathname.endsWith('/')) {
			return NextResponse.next();
		}

		// Check if pathname already includes a locale
		const pathnameHasLocale = configLocales.some(locale => 
			pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
		);

		// If pathname already has a locale, rewrite the URL to remove the locale prefix
		if (pathnameHasLocale) {
			const locale = pathname.split('/')[1];
			const pathWithoutLocale = '/' + pathname.split('/').slice(2).join('/');
			
			// Rewrite the URL to remove the locale prefix
			const response = NextResponse.rewrite(new URL(pathWithoutLocale, request.url));
			
			// Set locale cookie for consistency
			response.cookies.set(cookieName, locale, {
				maxAge: 60 * 60 * 24 * 365, // 1 year
				sameSite: 'lax',
				secure: process.env.NODE_ENV === 'production'
			});

			// Add locale headers for server components
			response.headers.set('x-locale', locale);
			response.headers.set('x-pathname', pathname);
			
			return response;
		}

		// Detect user's preferred locale
		const detectedLocale = detectLocaleFromRequest(request);
		
		// Don't redirect English to /en path for cleaner URLs
		if (detectedLocale === configDefault && redirectRoot) {
			const response = NextResponse.next();
			
			// Set default locale cookie
			response.cookies.set(cookieName, configDefault, {
				maxAge: 60 * 60 * 24 * 365,
				sameSite: 'lax',
				secure: process.env.NODE_ENV === 'production'
			});

			// Add headers for server components
			response.headers.set('x-locale', configDefault);
			response.headers.set('x-pathname', pathname);
			
			return response;
		}

		// For non-default locales, instead of redirecting to localized URLs that don't exist,
		// serve the English version with the appropriate locale headers and cookies
		if (detectedLocale !== configDefault) {
			const response = NextResponse.next();
			
			// Set locale cookie
			response.cookies.set(cookieName, detectedLocale, {
				maxAge: 60 * 60 * 24 * 365,
				sameSite: 'lax',
				secure: process.env.NODE_ENV === 'production'
			});

			// Add locale headers for server components
			response.headers.set('x-locale', detectedLocale);
			response.headers.set('x-pathname', pathname);
			
			return response;
		}

		return NextResponse.next();
	};
}

/**
 * Locale extraction utility
 * Gets the current locale from pathname or headers
 */
export function getLocaleFromPath(pathname) {
	const segments = pathname.split('/');
	const potentialLocale = segments[1];
	
	if (potentialLocale && supportedLanguages[potentialLocale]) {
		return potentialLocale;
	}
	
	return defaultLocale;
}

/**
 * Path without locale utility
 * Removes locale segment from pathname
 */
export function getPathWithoutLocale(pathname) {
	const segments = pathname.split('/');
	const potentialLocale = segments[1];
	
	if (potentialLocale && supportedLanguages[potentialLocale]) {
		return '/' + segments.slice(2).join('/');
	}
	
	return pathname;
}

/**
 * Localized path builder
 * Adds locale to pathname if not default
 */
export function getLocalizedPath(pathname, locale = defaultLocale) {
	// Don't add locale prefix for default locale
	if (locale === defaultLocale) {
		return pathname;
	}
	
	// Remove existing locale if present
	const pathWithoutLocale = getPathWithoutLocale(pathname);
	
	// Add new locale
	return `/${locale}${pathWithoutLocale}`;
}

/**
 * Alternate URLs generator
 * Creates hreflang URLs for all supported locales
 */
export function generateAlternateUrls(pathname, baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://thorbis.com') {
	const pathWithoutLocale = getPathWithoutLocale(pathname);
	const alternates = {};
	
	// Add URL for each supported locale
	Object.keys(supportedLanguages).forEach(locale => {
		const localizedPath = getLocalizedPath(pathWithoutLocale, locale);
		alternates[locale] = `${baseUrl}${localizedPath}`;
	});
	
	// Add x-default for SEO
	alternates['x-default'] = `${baseUrl}${pathWithoutLocale}`;
	
	return alternates;
}

/**
 * Redirect with locale preservation
 * Maintains current locale when redirecting
 */
export function createLocalizedRedirect(targetPath, currentPathname) {
	const currentLocale = getLocaleFromPath(currentPathname);
	const localizedTarget = getLocalizedPath(targetPath, currentLocale);
	
	return NextResponse.redirect(localizedTarget);
}

/**
 * Language switcher URL generator
 * Creates URLs for language switcher component
 */
export function generateLanguageSwitcherUrls(currentPathname, baseUrl = '') {
	const pathWithoutLocale = getPathWithoutLocale(currentPathname);
	const urls = {};
	
	Object.keys(supportedLanguages).forEach(locale => {
		const localizedPath = getLocalizedPath(pathWithoutLocale, locale);
		urls[locale] = `${baseUrl}${localizedPath}`;
	});
	
	return urls;
}

/**
 * Middleware configuration matcher
 * Defines which paths should be processed by i18n middleware
 */
export const i18nMatcher = [
	// Match all pathnames except for:
	// - API routes
	// - Static files
	// - Images and assets
	'/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|sw.js|images|icons|assets).*)',
];

/**
 * Default middleware configuration
 */
export const defaultMiddlewareConfig = {
	defaultLocale: 'en',
	locales: Object.keys(supportedLanguages),
	ignoredPaths,
	redirectRoot: true,
	cookieName: 'thorbis_locale'
};

/**
 * Create complete middleware with i18n support
 */
export function createMiddleware(customConfig = {}) {
	const config = { ...defaultMiddlewareConfig, ...customConfig };
	const i18nMiddleware = createI18nMiddleware(config);
	
	return function middleware(request) {
		// Add security headers
		const response = i18nMiddleware(request) || NextResponse.next();
		
		// Add security headers
		response.headers.set('X-Frame-Options', 'DENY');
		response.headers.set('X-Content-Type-Options', 'nosniff');
		response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
		
		// Add locale information to response headers
		const locale = getLocaleFromPath(request.nextUrl.pathname);
		response.headers.set('X-Locale', locale);
		
		return response;
	};
}

// Export default configuration
export default {
	createI18nMiddleware,
	createMiddleware,
	getLocaleFromPath,
	getPathWithoutLocale,
	getLocalizedPath,
	generateAlternateUrls,
	generateLanguageSwitcherUrls,
	i18nMatcher,
	defaultMiddlewareConfig
};
