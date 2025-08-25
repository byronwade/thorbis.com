'use client';

// Simple, robust translation system to avoid .call() errors
const fallbackTranslations = {
	en: {
		auth: {
			login: {
				title: "Sign In",
				email: "Email",
				password: "Password",
				submit: "Sign In",
				error: "Invalid credentials"
			},
			signup: {
				title: "Create Account",
				email: "Email",
				password: "Password",
				submit: "Sign Up",
				error: "Account creation failed"
			}
		},
		common: {
			loading: "Loading...",
			error: "An error occurred",
			success: "Success"
		}
	}
};

// Simple translation function
const translate = (key, options = {}) => {
	const keys = key.split('.');
	let value = fallbackTranslations.en;
	
	for (const k of keys) {
		if (value && typeof value === 'object' && k in value) {
			value = value[k];
		} else {
			return options.fallback || key;
		}
	}
	
	return typeof value === 'string' ? value : (options.fallback || key);
};

// Main useTranslation hook
export function useTranslation() {
	return {
		locale: 'en',
		translations: fallbackTranslations.en,
		setLocale: () => {},
		t: translate,
		isLoading: false,
		// Additional helpers
		changeLanguage: () => {},
		setLanguage: () => {},
		dictionary: fallbackTranslations.en
	};
}

// Specialized hooks for different sections
export function useAuthTranslation() {
	return {
		locale: 'en',
		translations: fallbackTranslations.en,
		setLocale: () => {},
		t: (key, options = {}) => translate(`auth.${key}`, options),
		isLoading: false,
		// Convenience methods
		tLogin: (key, options = {}) => translate(`auth.login.${key}`, options),
		tSignup: (key, options = {}) => translate(`auth.signup.${key}`, options),
		tProfile: (key, options = {}) => translate(`auth.profile.${key}`, options),
		tBusiness: (key, options = {}) => translate(`auth.business.${key}`, options),
		tCommon: (key, options = {}) => translate(`auth.common.${key}`, options)
	};
}

export function useBusinessTranslation() {
	return {
		locale: 'en',
		translations: fallbackTranslations.en,
		setLocale: () => {},
		t: (key, options = {}) => translate(`business.${key}`, options),
		isLoading: false,
		// Convenience methods
		tProfile: (key, options = {}) => translate(`business.profile.${key}`, options),
		tReviews: (key, options = {}) => translate(`business.reviews.${key}`, options),
		tSearch: (key, options = {}) => translate(`business.search.${key}`, options),
		tDirectory: (key, options = {}) => translate(`business.directory.${key}`, options),
		tManagement: (key, options = {}) => translate(`business.management.${key}`, options),
		tStore: (key, options = {}) => translate(`business.store.${key}`, options),
		tJobs: (key, options = {}) => translate(`business.jobs.${key}`, options)
	};
}

export function useDashboardTranslation() {
	return {
		locale: 'en',
		translations: fallbackTranslations.en,
		setLocale: () => {},
		t: (key, options = {}) => translate(`dashboard.${key}`, options),
		isLoading: false,
		// Convenience methods
		tNav: (key, options = {}) => translate(`dashboard.navigation.${key}`, options),
		tBusiness: (key, options = {}) => translate(`dashboard.business.${key}`, options),
		tUser: (key, options = {}) => translate(`dashboard.user.${key}`, options),
		tAdmin: (key, options = {}) => translate(`dashboard.admin.${key}`, options),
		tLocalHub: (key, options = {}) => translate(`dashboard.localhub.${key}`, options),
		tDeveloper: (key, options = {}) => translate(`dashboard.developer.${key}`, options),
		tActions: (key, options = {}) => translate(`dashboard.actions.${key}`, options),
		tStatus: (key, options = {}) => translate(`dashboard.status.${key}`, options)
	};
}

export function useCommonTranslation() {
	return {
		locale: 'en',
		translations: fallbackTranslations.en,
		setLocale: () => {},
		t: (key, options = {}) => translate(`common.${key}`, options),
		isLoading: false,
		// Convenience methods
		tNav: (key, options = {}) => translate(`common.navigation.${key}`, options),
		tActions: (key, options = {}) => translate(`common.actions.${key}`, options),
		tStatus: (key, options = {}) => translate(`common.status.${key}`, options),
		tTime: (key, options = {}) => translate(`common.time.${key}`, options),
		tDays: (key, options = {}) => translate(`common.days.${key}`, options),
		tMonths: (key, options = {}) => translate(`common.months.${key}`, options),
		tForms: (key, options = {}) => translate(`common.forms.${key}`, options),
		tValidation: (key, options = {}) => translate(`common.validation.${key}`, options),
		tPagination: (key, options = {}) => translate(`common.pagination.${key}`, options),
		tSearch: (key, options = {}) => translate(`common.search.${key}`, options),
		tErrors: (key, options = {}) => translate(`common.errors.${key}`, options),
		tUnits: (key, options = {}) => translate(`common.units.${key}`, options)
	};
}

export function usePagesTranslation() {
	return {
		locale: 'en',
		translations: fallbackTranslations.en,
		setLocale: () => {},
		t: (key, options = {}) => translate(`pages.${key}`, options),
		isLoading: false,
		// Convenience methods
		tHelp: (key, options = {}) => translate(`pages.help.${key}`, options),
		tLegal: (key, options = {}) => translate(`pages.legal.${key}`, options),
		tCompany: (key, options = {}) => translate(`pages.company.${key}`, options),
		tResources: (key, options = {}) => translate(`pages.resources.${key}`, options),
		tPricing: (key, options = {}) => translate(`pages.pricing.${key}`, options),
		tDiscover: (key, options = {}) => translate(`pages.discover.${key}`, options),
		tPartners: (key, options = {}) => translate(`pages.partners.${key}`, options),
		tDevelopers: (key, options = {}) => translate(`pages.developers.${key}`, options),
		tAdvertise: (key, options = {}) => translate(`pages.advertise.${key}`, options)
	};
}

export function useLandingPagesTranslation() {
	return {
		locale: 'en',
		translations: fallbackTranslations.en,
		setLocale: () => {},
		t: (key, options = {}) => translate(`landingPages.${key}`, options),
		isLoading: false,
		// Convenience methods
		tCommon: (key, options = {}) => translate(`landingPages.common.${key}`, options),
		tField: (key, options = {}) => translate(`landingPages.fieldManagement.${key}`, options),
		tBusiness: (key, options = {}) => translate(`landingPages.businessManagement.${key}`, options),
		tAcademy: (key, options = {}) => translate(`landingPages.academy.${key}`, options),
		tAlternatives: (key, options = {}) => translate(`landingPages.alternatives.${key}`, options),
		tAutomotive: (key, options = {}) => translate(`landingPages.automotive.${key}`, options),
		tHealthcare: (key, options = {}) => translate(`landingPages.healthcare.${key}`, options),
		tRestaurant: (key, options = {}) => translate(`landingPages.restaurant.${key}`, options),
		tProperty: (key, options = {}) => translate(`landingPages.property.${key}`, options),
		tTestimonials: (key, options = {}) => translate(`landingPages.testimonials.${key}`, options),
		tPricing: (key, options = {}) => translate(`landingPages.pricing.${key}`, options),
		tFaq: (key, options = {}) => translate(`landingPages.faq.${key}`, options),
		tCta: (key, options = {}) => translate(`landingPages.cta.${key}`, options)
	};
}

// Utility function to get translation outside of React components
export async function getTranslation(locale, key, options = {}) {
	return translate(key, options);
}

// Language detection utility
export function detectLanguage() {
	return 'en';
}

// Save language preference
export function saveLanguagePreference(locale) {
	// No-op for now
}