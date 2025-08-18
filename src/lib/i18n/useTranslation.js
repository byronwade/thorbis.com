'use client';

import { useLanguage } from '@context/language-context';

// Main useTranslation hook - now uses the existing LanguageProvider
export function useTranslation() {
	const { locale, dictionary, loading, changeLanguage, t, setLocale } = useLanguage();

	return {
		locale,
		translations: dictionary || {},
		setLocale: changeLanguage,
		t: t || ((key, options = {}) => options.fallback || key),
		isLoading: loading,
		// Additional helpers
		changeLanguage,
		setLanguage: changeLanguage,
		dictionary
	};
}

// Specialized hooks for different sections
export function useAuthTranslation() {
	const { t, ...rest } = useTranslation();
	
	return {
		...rest,
		t: (key, options) => t(`auth.${key}`, options),
		// Convenience methods
		tLogin: (key, options) => t(`auth.login.${key}`, options),
		tSignup: (key, options) => t(`auth.signup.${key}`, options),
		tProfile: (key, options) => t(`auth.profile.${key}`, options),
		tBusiness: (key, options) => t(`auth.business.${key}`, options),
		tCommon: (key, options) => t(`auth.common.${key}`, options)
	};
}

export function useBusinessTranslation() {
	const { t, ...rest } = useTranslation();
	
	return {
		...rest,
		t: (key, options) => t(`business.${key}`, options),
		// Convenience methods
		tProfile: (key, options) => t(`business.profile.${key}`, options),
		tReviews: (key, options) => t(`business.reviews.${key}`, options),
		tSearch: (key, options) => t(`business.search.${key}`, options),
		tDirectory: (key, options) => t(`business.directory.${key}`, options),
		tManagement: (key, options) => t(`business.management.${key}`, options),
		tStore: (key, options) => t(`business.store.${key}`, options),
		tJobs: (key, options) => t(`business.jobs.${key}`, options)
	};
}

export function useDashboardTranslation() {
	const { t, ...rest } = useTranslation();
	
	return {
		...rest,
		t: (key, options) => t(`dashboard.${key}`, options),
		// Convenience methods
		tNav: (key, options) => t(`dashboard.navigation.${key}`, options),
		tBusiness: (key, options) => t(`dashboard.business.${key}`, options),
		tUser: (key, options) => t(`dashboard.user.${key}`, options),
		tAdmin: (key, options) => t(`dashboard.admin.${key}`, options),
		tLocalHub: (key, options) => t(`dashboard.localhub.${key}`, options),
		tDeveloper: (key, options) => t(`dashboard.developer.${key}`, options),
		tActions: (key, options) => t(`dashboard.actions.${key}`, options),
		tStatus: (key, options) => t(`dashboard.status.${key}`, options)
	};
}

export function useCommonTranslation() {
	const { t, ...rest } = useTranslation();
	
	return {
		...rest,
		t: (key, options) => t(`common.${key}`, options),
		// Convenience methods
		tNav: (key, options) => t(`common.navigation.${key}`, options),
		tActions: (key, options) => t(`common.actions.${key}`, options),
		tStatus: (key, options) => t(`common.status.${key}`, options),
		tTime: (key, options) => t(`common.time.${key}`, options),
		tDays: (key, options) => t(`common.days.${key}`, options),
		tMonths: (key, options) => t(`common.months.${key}`, options),
		tForms: (key, options) => t(`common.forms.${key}`, options),
		tValidation: (key, options) => t(`common.validation.${key}`, options),
		tPagination: (key, options) => t(`common.pagination.${key}`, options),
		tSearch: (key, options) => t(`common.search.${key}`, options),
		tErrors: (key, options) => t(`common.errors.${key}`, options),
		tUnits: (key, options) => t(`common.units.${key}`, options)
	};
}

export function usePagesTranslation() {
	const { t, ...rest } = useTranslation();
	
	return {
		...rest,
		t: (key, options) => t(`pages.${key}`, options),
		// Convenience methods
		tHelp: (key, options) => t(`pages.help.${key}`, options),
		tLegal: (key, options) => t(`pages.legal.${key}`, options),
		tCompany: (key, options) => t(`pages.company.${key}`, options),
		tResources: (key, options) => t(`pages.resources.${key}`, options),
		tPricing: (key, options) => t(`pages.pricing.${key}`, options),
		tDiscover: (key, options) => t(`pages.discover.${key}`, options),
		tPartners: (key, options) => t(`pages.partners.${key}`, options),
		tDevelopers: (key, options) => t(`pages.developers.${key}`, options),
		tAdvertise: (key, options) => t(`pages.advertise.${key}`, options)
	};
}

export function useLandingPagesTranslation() {
	const { t, ...rest } = useTranslation();
	
	return {
		...rest,
		t: (key, options) => t(`landingPages.${key}`, options),
		// Convenience methods
		tCommon: (key, options) => t(`landingPages.common.${key}`, options),
		tField: (key, options) => t(`landingPages.fieldManagement.${key}`, options),
		tBusiness: (key, options) => t(`landingPages.businessManagement.${key}`, options),
		tAcademy: (key, options) => t(`landingPages.academy.${key}`, options),
		tAlternatives: (key, options) => t(`landingPages.alternatives.${key}`, options),
		tAutomotive: (key, options) => t(`landingPages.automotive.${key}`, options),
		tHealthcare: (key, options) => t(`landingPages.healthcare.${key}`, options),
		tRestaurant: (key, options) => t(`landingPages.restaurant.${key}`, options),
		tProperty: (key, options) => t(`landingPages.property.${key}`, options),
		tTestimonials: (key, options) => t(`landingPages.testimonials.${key}`, options),
		tPricing: (key, options) => t(`landingPages.pricing.${key}`, options),
		tFaq: (key, options) => t(`landingPages.faq.${key}`, options),
		tCta: (key, options) => t(`landingPages.cta.${key}`, options)
	};
}

// Utility function to get translation outside of React components
export async function getTranslation(locale, key, options = {}) {
	try {
		const { getDictionary } = await import('./index.js');
		const translations = await getDictionary(locale);
		const keys = key.split('.');
		let value = translations;

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
			return Object.keys(options.interpolation).reduce((text, placeholder) => {
				const regex = new RegExp(`{${placeholder}}`, 'g');
				return text.replace(regex, options.interpolation[placeholder]);
			}, value);
		}

		return value;
	} catch (error) {
		console.error('Failed to get translation:', error);
		return options.fallback || key;
	}
}

// Language detection utility
export function detectLanguage() {
	if (typeof window === 'undefined') return 'en';
	
	// Check localStorage first
	const savedLocale = localStorage.getItem('thorbis_locale');
	if (savedLocale) return savedLocale;
	
	// Check browser language
	const browserLang = navigator.language.substring(0, 2);
	const supportedLangs = ['en', 'es', 'fr', 'de', 'pt', 'it', 'nl', 'ja', 'ko', 'zh', 'ru', 'ar', 'hi'];
	
	return supportedLangs.includes(browserLang) ? browserLang : 'en';
}

// Save language preference
export function saveLanguagePreference(locale) {
	if (typeof window !== 'undefined') {
		localStorage.setItem('thorbis_locale', locale);
	}
}