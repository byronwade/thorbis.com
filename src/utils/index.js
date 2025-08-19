// Utilities Barrel Export
// All utility functions and helpers organized by category

// Accessibility Utilities
export * from "./accessibility-utils.js";

// Cache Management
export * from "./cache-manager.js";

// Dynamic Imports (Client-side only - import directly when needed)
// export * from "./dynamic-imports.js"; // Commented out to prevent server-side issues

// Error Handling
export * from "./error-handler.js";

// Logging
export { default as logger } from "./logger.js";

// Email Rendering
export * from "./render-email.js";

// Secure Storage
export * from "./secure-storage.js";

// SEO Utilities
export * from "./seo-utils.js";

// Sorting Utilities
export * from "./sorting.js";

// State Abbreviations
export * from "./state-abbreviations.js";

// Web Vitals Performance Monitoring
export * from "./web-vitals.js";

// Tailwind CSS utility (cn function)
export { cn } from "./cn.js";

// URL helpers for canonical paths
export function toKebabCase(input) {
	if (!input) return "";
	
	return String(input)
		.toLowerCase()
		.replace(/&/g, " and ")
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.trim();
}

export function buildBusinessUrl({ country, state, city, name, shortId }) {
	// Validate required parameters
	if (!country || !state || !city || !name) {
		console.warn('buildBusinessUrl: Missing required parameters', { country, state, city, name });
		return '/';
	}
	
	const countryPart = toKebabCase(country);
	const statePart = toKebabCase(state);
	const cityPart = toKebabCase(city);
	const namePart = toKebabCase(name);
	const suffix = shortId ? `-${shortId}` : "";

	// Build URL parts, filtering out empty segments
	const urlParts = [countryPart, statePart, cityPart, namePart].filter(part => part && part.length > 0);

	return `/${urlParts.join("/")}${suffix}`;
}

export function buildCityUrl({ country, state, city }) {
  // Validate required parameters
  if (!country || !state || !city) {
    console.warn('buildCityUrl: Missing required parameters', { country, state, city });
    return '/';
  }
  
  const countryPart = toKebabCase(country);
  const statePart = toKebabCase(state);
  const cityPart = toKebabCase(city);
  
  // Build URL parts, filtering out empty segments
  const urlParts = [countryPart, statePart, cityPart].filter(part => part && part.length > 0);
  
  return `/${urlParts.join("/")}`;
}

export function buildCityCategoryUrl({ country, state, city, category }) {
  // Validate required parameters
  if (!country || !state || !city || !category) {
    console.warn('buildCityCategoryUrl: Missing required parameters', { country, state, city, category });
    return '/';
  }
  
  const countryPart = toKebabCase(country);
  const statePart = toKebabCase(state);
  const cityPart = toKebabCase(city);
  const categoryPart = toKebabCase(category);
  
  // Build URL parts, filtering out empty segments
  const urlParts = [countryPart, statePart, cityPart, categoryPart].filter(part => part && part.length > 0);
  
  return `/${urlParts.join("/")}`;
}

export function buildCategoryUrl(category) {
  return `/${toKebabCase(category)}`;
}

// Helper function to build fallback URL safely
export function buildFallbackBusinessUrl(business) {
  if (!business) return "/";
  
  // Validate required business data
  if (!business.country || !business.state || !business.city || !business.name) {
    console.warn('buildFallbackBusinessUrl: Missing required business data', { 
      country: business.country, 
      state: business.state, 
      city: business.city, 
      name: business.name 
    });
    return "/";
  }
  
  const country = toKebabCase(business.country);
  const state = toKebabCase(business.state);
  const city = toKebabCase(business.city);
  const name = toKebabCase(business.name);
  const shortId = business.short_id || business.shortId || "";
  
  // Build URL parts, filtering out empty segments
  const urlParts = [country, state, city, name].filter(part => part && part.length > 0);
  const suffix = shortId ? `-${shortId}` : "";
  
  return `/${urlParts.join("/")}${suffix}`;
}

// Convenience: build from a business-like object
export function buildBusinessUrlFrom(business) {
	if (!business) return "/";
	
	// Validate required business data
	if (!business.country || !business.state || !business.city || !business.name) {
		console.warn('buildBusinessUrlFrom: Missing required business data', { 
			country: business.country, 
			state: business.state, 
			city: business.city, 
			name: business.name 
		});
		return "/";
	}
	
	const country = toKebabCase(business.country);
	const state = business.state || "";
	const city = business.city || "";
	const name = business.name || business.slug || "";
	const shortId = business.short_id || business.shortId || undefined;
	
	return buildBusinessUrl({ country, state, city, name, shortId });
}

// Country validation and utilities
export function validateCountry(country) {
  if (!country) return false;
  
  // ISO 3166-1 alpha-2 country codes (most common)
  const validCountries = [
    'us', 'ca', 'mx', 'uk', 'de', 'fr', 'es', 'it', 'nl', 'be', 'ch', 'at', 'se', 'no', 'dk', 'fi',
    'au', 'nz', 'jp', 'kr', 'cn', 'in', 'br', 'ar', 'cl', 'co', 'pe', 've', 'uy', 'py', 'bo', 'ec',
    'gy', 'sr', 'gf', 'fk', 'gs', 'io', 'sh', 'ac', 'ta', 'bv', 'hm', 'tf', 'yt', 're', 'bl', 'mf',
    'pm', 'wf', 'nc', 'pf', 'ck', 'nu', 'tk', 'to', 'ws', 'fj', 'vu', 'nc', 'pf', 'ck', 'nu', 'tk',
    'to', 'ws', 'fj', 'vu', 'nc', 'pf', 'ck', 'nu', 'tk', 'to', 'ws', 'fj', 'vu', 'nc', 'pf', 'ck'
  ];
  
  return validCountries.includes(country.toLowerCase());
}

export function getDefaultCountry() {
  // Can be configured via environment variable or user preference
  return process.env.NEXT_PUBLIC_DEFAULT_COUNTRY || 'us';
}

export function normalizeCountry(country) {
  if (!country) return getDefaultCountry();
  return toKebabCase(country);
}

// Backward compatibility for existing hardcoded "us" references
export function buildBusinessUrlWithFallback({ country, state, city, name, shortId }) {
  const normalizedCountry = normalizeCountry(country);
  return buildBusinessUrl({ country: normalizedCountry, state, city, name, shortId });
}

export function buildCityUrlWithFallback({ country, state, city }) {
  const normalizedCountry = normalizeCountry(country);
  return buildCityUrl({ country: normalizedCountry, state, city });
}

export function buildCityCategoryUrlWithFallback({ country, state, city, category }) {
  const normalizedCountry = normalizeCountry(country);
  return buildCityCategoryUrl({ country: normalizedCountry, state, city, category });
}
