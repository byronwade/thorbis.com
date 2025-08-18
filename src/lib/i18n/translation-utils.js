/**
 * Translation Utilities
 * Tools for managing, extracting, and maintaining translation keys
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

/**
 * Extract translation keys from code
 * Finds t(), useTranslation(), and other translation function calls
 */
export function extractTranslationKeys(filePath) {
	const content = fs.readFileSync(filePath, 'utf8');
	const keys = new Set();

	// Patterns to match translation function calls
	const patterns = [
		// t('key.path')
		/\bt\s*\(\s*['"`]([^'"`]+)['"`]/g,
		// useTranslation().t('key.path')
		/\.t\s*\(\s*['"`]([^'"`]+)['"`]/g,
		// serverT(locale, 'key.path')
		/serverT\s*\(\s*[^,]+,\s*['"`]([^'"`]+)['"`]/g,
		// getTranslation(locale, 'key.path')
		/getTranslation\s*\(\s*[^,]+,\s*['"`]([^'"`]+)['"`]/g,
		// Custom hook methods tLogin('key')
		/t[A-Z]\w*\s*\(\s*['"`]([^'"`]+)['"`]/g,
	];

	patterns.forEach(pattern => {
		let match;
		while ((match = pattern.exec(content)) !== null) {
			keys.add(match[1]);
		}
	});

	return Array.from(keys);
}

/**
 * Scan entire codebase for translation keys
 */
export async function scanCodebaseForKeys(srcPath = 'src') {
	const files = await glob(`${srcPath}/**/*.{js,jsx,ts,tsx}`, {
		ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**']
	});

	const allKeys = new Map();

	files.forEach(file => {
		const keys = extractTranslationKeys(file);
		if (keys.length > 0) {
			allKeys.set(file, keys);
		}
	});

	return allKeys;
}

/**
 * Find missing translation keys
 * Compares extracted keys with existing translations
 */
export function findMissingKeys(extractedKeys, translations) {
	const missingKeys = {};
	const flatKeys = new Set();

	// Flatten all extracted keys
	extractedKeys.forEach(keys => {
		keys.forEach(key => flatKeys.add(key));
	});

	// Check each language for missing keys
	Object.keys(translations).forEach(locale => {
		const missing = [];
		
		flatKeys.forEach(key => {
			if (!getNestedValue(translations[locale], key)) {
				missing.push(key);
			}
		});

		if (missing.length > 0) {
			missingKeys[locale] = missing;
		}
	});

	return missingKeys;
}

/**
 * Get nested object value by dot notation
 */
function getNestedValue(obj, path) {
	return path.split('.').reduce((current, key) => {
		return current && current[key] !== undefined ? current[key] : null;
	}, obj);
}

/**
 * Set nested object value by dot notation
 */
function setNestedValue(obj, path, value) {
	const keys = path.split('.');
	const lastKey = keys.pop();
	
	let current = obj;
	keys.forEach(key => {
		if (!current[key] || typeof current[key] !== 'object') {
			current[key] = {};
		}
		current = current[key];
	});
	
	current[lastKey] = value;
}

/**
 * Generate translation scaffolding
 * Creates empty translation objects for missing keys
 */
export function generateTranslationScaffolding(missingKeys) {
	const scaffolding = {};

	Object.keys(missingKeys).forEach(locale => {
		scaffolding[locale] = {};
		
		missingKeys[locale].forEach(key => {
			setNestedValue(scaffolding[locale], key, `[MISSING] ${key}`);
		});
	});

	return scaffolding;
}

/**
 * Auto-translate using a translation service (placeholder)
 * In real implementation, this would use Google Translate API or similar
 */
export async function autoTranslate(text, targetLanguage, sourceLanguage = 'en') {
	// Placeholder implementation - would integrate with actual translation service
	const translationMap = {
		es: { hello: 'hola', world: 'mundo', welcome: 'bienvenido' },
		fr: { hello: 'bonjour', world: 'monde', welcome: 'bienvenue' },
		de: { hello: 'hallo', world: 'welt', welcome: 'willkommen' }
	};

	const words = text.toLowerCase().split(' ');
	const translated = words.map(word => 
		translationMap[targetLanguage]?.[word] || word
	);

	return translated.join(' ');
}

/**
 * Validate translation completeness
 * Checks if all languages have the same keys
 */
export function validateTranslationCompleteness(translations) {
	const languages = Object.keys(translations);
	const referenceKeys = getAllKeys(translations[languages[0]]);
	const issues = [];

	languages.slice(1).forEach(lang => {
		const langKeys = getAllKeys(translations[lang]);
		
		// Check for missing keys
		const missing = referenceKeys.filter(key => !langKeys.includes(key));
		if (missing.length > 0) {
			issues.push({
				language: lang,
				type: 'missing',
				keys: missing
			});
		}

		// Check for extra keys
		const extra = langKeys.filter(key => !referenceKeys.includes(key));
		if (extra.length > 0) {
			issues.push({
				language: lang,
				type: 'extra',
				keys: extra
			});
		}
	});

	return {
		isComplete: issues.length === 0,
		issues
	};
}

/**
 * Get all keys from nested object as dot notation paths
 */
function getAllKeys(obj, prefix = '') {
	const keys = [];
	
	Object.keys(obj).forEach(key => {
		const path = prefix ? `${prefix}.${key}` : key;
		
		if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
			keys.push(...getAllKeys(obj[key], path));
		} else {
			keys.push(path);
		}
	});
	
	return keys;
}

/**
 * Generate translation report
 * Creates a comprehensive report of translation status
 */
export async function generateTranslationReport(srcPath = 'src', translations) {
	const extractedKeys = await scanCodebaseForKeys(srcPath);
	const missingKeys = findMissingKeys(extractedKeys, translations);
	const validation = validateTranslationCompleteness(translations);

	const report = {
		timestamp: new Date().toISOString(),
		summary: {
			totalFiles: extractedKeys.size,
			totalKeys: new Set(Array.from(extractedKeys.values()).flat()).size,
			languages: Object.keys(translations),
			completeness: validation.isComplete
		},
		extractedKeys: Object.fromEntries(extractedKeys),
		missingKeys,
		validation,
		recommendations: []
	};

	// Generate recommendations
	if (Object.keys(missingKeys).length > 0) {
		report.recommendations.push({
			type: 'missing_keys',
			priority: 'high',
			description: 'Add missing translation keys',
			action: 'Run generateTranslationScaffolding() to create templates'
		});
	}

	if (!validation.isComplete) {
		report.recommendations.push({
			type: 'incomplete_translations',
			priority: 'medium',
			description: 'Some languages are missing translations',
			action: 'Review validation issues and add missing translations'
		});
	}

	return report;
}

/**
 * Export translations to different formats
 */
export function exportTranslations(translations, format = 'json') {
	switch (format) {
		case 'json':
			return JSON.stringify(translations, null, 2);
		
		case 'csv':
			return exportToCsv(translations);
		
		case 'xlsx':
			return exportToExcel(translations);
		
		default:
			throw new Error(`Unsupported export format: ${format}`);
	}
}

/**
 * Export to CSV format
 */
function exportToCsv(translations) {
	const languages = Object.keys(translations);
	const allKeys = getAllKeys(translations[languages[0]]);
	
	let csv = 'key,' + languages.join(',') + '\n';
	
	allKeys.forEach(key => {
		const row = [key];
		languages.forEach(lang => {
			const value = getNestedValue(translations[lang], key) || '';
			// Escape commas and quotes in CSV
			const escaped = `"${value.replace(/"/g, '""')}"`;
			row.push(escaped);
		});
		csv += row.join(',') + '\n';
	});
	
	return csv;
}

/**
 * Merge translation files
 * Combines multiple translation objects safely
 */
export function mergeTranslations(...translationObjects) {
	return translationObjects.reduce((merged, current) => {
		Object.keys(current).forEach(locale => {
			if (!merged[locale]) {
				merged[locale] = {};
			}
			merged[locale] = deepMerge(merged[locale], current[locale]);
		});
		return merged;
	}, {});
}

/**
 * Deep merge utility
 */
function deepMerge(target, source) {
	const result = { ...target };
	
	Object.keys(source).forEach(key => {
		if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
			result[key] = deepMerge(result[key] || {}, source[key]);
		} else {
			result[key] = source[key];
		}
	});
	
	return result;
}

/**
 * Watch for changes and update translations
 */
export function watchTranslations(callback, watchPath = 'src') {
	if (typeof fs.watch !== 'function') return;

	fs.watch(watchPath, { recursive: true }, (eventType, filename) => {
		if (filename && /\.(js|jsx|ts|tsx)$/.test(filename)) {
			callback(eventType, filename);
		}
	});
}

// Default export with all utilities
export default {
	extractTranslationKeys,
	scanCodebaseForKeys,
	findMissingKeys,
	generateTranslationScaffolding,
	autoTranslate,
	validateTranslationCompleteness,
	generateTranslationReport,
	exportTranslations,
	mergeTranslations,
	watchTranslations
};
