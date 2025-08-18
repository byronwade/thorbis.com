"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getDictionary, languages } from "@lib/i18n/dictionaries";
import { detectLanguage, saveLanguagePreference } from "@lib/i18n/useTranslation";

const LanguageContext = createContext();

export const useLanguage = () => {
	const context = useContext(LanguageContext);
	if (!context) {
		// Return a fallback context instead of throwing an error
		console.warn("useLanguage used outside LanguageProvider, using fallback");
		return {
			locale: 'en',
			dictionary: {},
			loading: false,
			changeLanguage: () => {},
			t: (key, options = {}) => options.fallback || key,
			setLocale: () => {}
		};
	}
	return context;
};

// Enhanced LanguageProvider that works with the new i18n system
export const LanguageProvider = ({ children, initialLocale = "en" }) => {
	// Auto-detect language if no initial locale provided
	const [locale, setLocale] = useState(() => {
		if (initialLocale !== "en") return initialLocale;
		
		// Try to get from localStorage or browser detection
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('thorbis_locale');
			if (saved) return saved;
			return detectLanguage();
		}
		return initialLocale;
	});
	
	const [dictionary, setDictionary] = useState(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		const loadDictionary = async () => {
			setLoading(true);
			try {
				const dict = await getDictionary(locale);
				setDictionary(dict);
			} catch (error) {
				console.error("Error loading dictionary:", error);
				// Fallback to English
				const fallbackDict = await getDictionary("en");
				setDictionary(fallbackDict);
			} finally {
				setLoading(false);
			}
		};

		loadDictionary();
	}, [locale]);

	const changeLanguage = async (newLocale) => {
		if (newLocale === locale) return;

		setLocale(newLocale);
		
		// Save preference using the new i18n system
		saveLanguagePreference(newLocale);

		// Update URL to reflect new locale
		const currentPath = pathname;
		const pathWithoutLocale = currentPath.replace(/^\/[a-z]{2}/, "");
		const newPath = newLocale === "en" ? pathWithoutLocale : `/${newLocale}${pathWithoutLocale}`;

		router.push(newPath);
	};

	// Translation helper function for backward compatibility
	const translate = (key, options = {}) => {
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
			return Object.keys(options.interpolation).reduce((text, placeholder) => {
				const regex = new RegExp(`{${placeholder}}`, 'g');
				return text.replace(regex, options.interpolation[placeholder]);
			}, value);
		}
		
		return value;
	};

	const value = {
		locale,
		dictionary,
		loading,
		changeLanguage,
		languages,
		// Add new translation function for enhanced compatibility
		t: translate,
		translate,
		// Add setLocale for direct access
		setLocale: (newLocale) => {
			setLocale(newLocale);
			saveLanguagePreference(newLocale);
		}
	};

	return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
