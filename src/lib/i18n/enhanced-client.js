/**
 * Enhanced Client-side Internationalization System
 * Optimized React hooks with SSR compatibility and caching
 */

'use client';

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import coreTranslations, { 
	supportedLanguages, 
	getTranslation, 
	getLanguageMetadata,
	interpolate 
} from './enhanced-translations.js';

// Create translation context
const TranslationContext = createContext(null);

// Enhanced provider with performance optimizations
export function TranslationProvider({ children, initialLocale = 'en', serverDictionary = null }) {
	const [locale, setLocale] = useState(initialLocale);
	const [dictionary, setDictionary] = useState(serverDictionary || coreTranslations[initialLocale] || coreTranslations.en);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const pathname = usePathname();

	// Auto-detect locale from browser/localStorage on client side
	useEffect(() => {
		if (typeof window !== 'undefined' && !serverDictionary) {
			const savedLocale = localStorage.getItem('thorbis_locale');
			const browserLocale = navigator.language.split('-')[0];
			const detectedLocale = supportedLanguages[savedLocale] ? savedLocale : 
								  supportedLanguages[browserLocale] ? browserLocale : 'en';
			
			if (detectedLocale !== locale) {
				setLocale(detectedLocale);
			}
		}
	}, []);

	// Load dictionary when locale changes
	useEffect(() => {
		const loadDictionary = async () => {
			if (!supportedLanguages[locale]) return;
			
			setIsLoading(true);
			try {
				// Use client-side translations for now
				const dict = coreTranslations[locale] || coreTranslations.en;
				setDictionary(dict);
				
				// Save to localStorage
				if (typeof window !== 'undefined') {
					localStorage.setItem('thorbis_locale', locale);
				}
			} catch (error) {
				console.error('Failed to load dictionary:', error);
				// Fallback to English
				setDictionary(coreTranslations.en);
			} finally {
				setIsLoading(false);
			}
		};

		loadDictionary();
	}, [locale]);

	// Memoized translation function
	const translate = useCallback((key, options = {}) => {
		if (!dictionary || !key) return options.fallback || key;
		
		const keys = key.split('.');
		let value = dictionary;
		
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
	}, [dictionary]);

	// Change language function with URL update
	const changeLanguage = useCallback(async (newLocale) => {
		if (!supportedLanguages[newLocale] || newLocale === locale) return;
		
		setLocale(newLocale);
		
		// Save language preference to localStorage
		if (typeof window !== 'undefined') {
			localStorage.setItem('thorbis_locale', newLocale);
		}
		
		// Don't navigate to localized URLs since they don't exist in the directory structure
		// Instead, just update the locale state and let the middleware handle the rest
		// The middleware will set the appropriate cookies and headers
	}, [locale]);

	// Get language metadata
	const languageInfo = useMemo(() => getLanguageMetadata(locale), [locale]);

	// Context value with memoization for performance
	const contextValue = useMemo(() => ({
		locale,
		dictionary,
		isLoading,
		translate,
		t: translate,
		changeLanguage,
		setLocale: changeLanguage,
		languages: supportedLanguages,
		languageInfo,
		// Currency helpers
		formatCurrency: (amount) => {
			const currency = languageInfo.currency || '$';
			try {
				return new Intl.NumberFormat(locale, {
					style: 'currency',
					currency: currency === '$' ? 'USD' : currency === '€' ? 'EUR' : 'USD'
				}).format(amount);
			} catch {
				return `${currency}${amount}`;
			}
		},
		// Date helpers
		formatDate: (date, options = {}) => {
			try {
				return new Intl.DateTimeFormat(locale, {
					dateStyle: 'medium',
					...options
				}).format(new Date(date));
			} catch {
				return new Date(date).toLocaleDateString();
			}
		}
	}), [locale, dictionary, isLoading, translate, changeLanguage, languageInfo]);

	return (
		<TranslationContext.Provider value={contextValue}>
			{children}
		</TranslationContext.Provider>
	);
}

// Main translation hook
export function useTranslation() {
	const context = useContext(TranslationContext);
	
	if (!context) {
		// Provide fallback for components used outside provider
		console.warn('useTranslation used outside TranslationProvider');
		return {
			locale: 'en',
			dictionary: coreTranslations.en,
			isLoading: false,
			translate: (key, options = {}) => options.fallback || key,
			t: (key, options = {}) => options.fallback || key,
			changeLanguage: () => {},
			setLocale: () => {},
			languages: supportedLanguages,
			languageInfo: supportedLanguages.en,
			formatCurrency: (amount) => `$${amount}`,
			formatDate: (date) => new Date(date).toLocaleDateString()
		};
	}
	
	return context;
}

// Specialized hooks for different sections
export function useAuthTranslation() {
	const { t, ...rest } = useTranslation();
	
	return {
		...rest,
		t: (key, options) => t(`auth.${key}`, options),
		tLogin: (key, options) => t(`auth.login.${key}`, options),
		tSignup: (key, options) => t(`auth.signup.${key}`, options),
		tReset: (key, options) => t(`auth.passwordReset.${key}`, options),
		tProfile: (key, options) => t(`auth.profile.${key}`, options)
	};
}

export function useBusinessTranslation() {
	const { t, ...rest } = useTranslation();
	
	return {
		...rest,
		t: (key, options) => t(`business.${key}`, options),
		tProfile: (key, options) => t(`business.profile.${key}`, options),
		tReviews: (key, options) => t(`business.reviews.${key}`, options),
		tSearch: (key, options) => t(`business.search.${key}`, options),
		tDirectory: (key, options) => t(`business.directory.${key}`, options),
		tManagement: (key, options) => t(`business.management.${key}`, options)
	};
}

export function useDashboardTranslation() {
	const { t, ...rest } = useTranslation();
	
	return {
		...rest,
		t: (key, options) => t(`dashboard.${key}`, options),
		tNav: (key, options) => t(`dashboard.navigation.${key}`, options),
		tBusiness: (key, options) => t(`dashboard.business.${key}`, options),
		tUser: (key, options) => t(`dashboard.user.${key}`, options),
		tAdmin: (key, options) => t(`dashboard.admin.${key}`, options),
		tSettings: (key, options) => t(`dashboard.settings.${key}`, options)
	};
}

export function useNavigationTranslation() {
	const { t, ...rest } = useTranslation();
	
	return {
		...rest,
		t: (key, options) => t(`nav.${key}`, options),
		tNav: (key, options) => t(`nav.${key}`, options)
	};
}

export function useFormTranslation() {
	const { t, ...rest } = useTranslation();
	
	return {
		...rest,
		t: (key, options) => t(`forms.${key}`, options),
		tValidation: (key, options) => t(`validation.${key}`, options),
		tActions: (key, options) => t(`actions.${key}`, options)
	};
}

export function useStatusTranslation() {
	const { t, ...rest } = useTranslation();
	
	return {
		...rest,
		t: (key, options) => t(`status.${key}`, options),
		tStatus: (key, options) => t(`status.${key}`, options)
	};
}

// Language switcher hook with optimizations
export function useLanguageSwitcher() {
	const { locale, changeLanguage, languages } = useTranslation();
	const [isChanging, setIsChanging] = useState(false);
	
	const switchLanguage = useCallback(async (newLocale) => {
		if (isChanging || newLocale === locale) return;
		
		setIsChanging(true);
		try {
			await changeLanguage(newLocale);
		} finally {
			// Small delay to allow navigation to complete
			setTimeout(() => setIsChanging(false), 500);
		}
	}, [locale, changeLanguage, isChanging]);
	
	const currentLanguage = useMemo(() => languages[locale], [locale, languages]);
	
	return {
		currentLanguage,
		locale,
		languages,
		switchLanguage,
		isChanging
	};
}

// Browser detection hook
export function useBrowserLanguage() {
	const [browserLanguage, setBrowserLanguage] = useState(null);
	
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const lang = navigator.language.split('-')[0];
			setBrowserLanguage(supportedLanguages[lang] ? lang : 'en');
		}
	}, []);
	
	return browserLanguage;
}

// RTL detection hook
export function useRTL() {
	const { languageInfo } = useTranslation();
	return languageInfo.dir === 'rtl';
}

// Translation loading hook for dynamic imports
export function useTranslationLoader() {
	const [loadingKeys, setLoadingKeys] = useState(new Set());
	
	const loadTranslation = useCallback(async (module) => {
		const key = `module_${module}`;
		if (loadingKeys.has(key)) return;
		
		setLoadingKeys(prev => new Set([...prev, key]));
		
		try {
			// Placeholder for dynamic translation loading
			await new Promise(resolve => setTimeout(resolve, 100));
		} finally {
			setLoadingKeys(prev => {
				const newSet = new Set(prev);
				newSet.delete(key);
				return newSet;
			});
		}
	}, [loadingKeys]);
	
	return {
		loadTranslation,
		isLoading: loadingKeys.size > 0
	};
}

// Export all hooks as default
export default {
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
};
