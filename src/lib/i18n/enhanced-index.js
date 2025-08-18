/**
 * Enhanced Internationalization System - Main Entry Point
 * Comprehensive i18n solution with SSR support, performance optimization, and complete language coverage
 */

// Server-side exports (for App Router and middleware)
export {
	getDictionary,
	t as serverT,
	generateI18nMetadata,
	detectLocaleFromRequest,
	generateLocalizedSitemapEntries,
	validateTranslations,
	formatCurrency,
	formatDate,
	formatNumber,
	supportedLanguages,
	clearTranslationCache
} from './server.js';

// Client-side exports (for React components)
export {
	TranslationProvider,
	useTranslation,
	useAuthTranslation,
	useBusinessTranslation,
	useDashboardTranslation,
	useNavigationTranslation,
	useFormTranslation,
	useStatusTranslation,
	useLanguageSwitcher,
	useBrowserLanguage,
	useRTL,
	useTranslationLoader
} from './enhanced-client.js';

// UI Components
export {
	LanguageSwitcher,
	LanguageGrid,
	MobileLanguageSwitcher
} from '../components/shared/enhanced-language-switcher.js';

// Core translations and utilities
export {
	default as coreTranslations,
	getTranslation,
	getLanguageMetadata,
	interpolate
} from './enhanced-translations.js';

// Backward compatibility exports
import { getDictionary } from './server.js';
import { supportedLanguages } from './enhanced-translations.js';

// Legacy compatibility
export const languages = supportedLanguages;
export { getDictionary };

// Default export for easy importing
export default {
	// Server
	getDictionary,
	generateI18nMetadata,
	detectLocaleFromRequest,
	
	// Client
	TranslationProvider,
	useTranslation,
	LanguageSwitcher,
	
	// Core
	supportedLanguages,
	getTranslation
};
