'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation, saveLanguagePreference } from '@lib/i18n/useTranslation';
import { languages } from '@lib/i18n';
import { Button } from './button';
import { Card, CardContent } from './card';
import { ChevronDown, Globe, Check } from 'lucide-react';

export function LanguageSwitcher({ 
	variant = 'default', 
	showFlag = true, 
	showName = true,
	placement = 'bottom-end',
	className = ''
}) {
	const { locale, setLocale } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);
	const buttonRef = useRef(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
				buttonRef.current && !buttonRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	// Handle language change
	const handleLanguageChange = (newLocale) => {
		setLocale(newLocale);
		saveLanguagePreference(newLocale);
		setIsOpen(false);
		
		// Optional: Reload page to apply language changes
		// You might want to remove this if using client-side routing
		if (typeof window !== 'undefined') {
			window.location.reload();
		}
	};

	// Get current language info
	const currentLanguage = languages[locale] || languages.en;

	// Render trigger button based on variant
	const renderTrigger = () => {
		const content = (
			<>
				{showFlag && <span className="text-sm">{currentLanguage.flag}</span>}
				{showName && (
					<span className="text-sm font-medium">
						{variant === 'compact' ? locale.toUpperCase() : currentLanguage.name}
					</span>
				)}
				<ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
			</>
		);

		if (variant === 'minimal') {
			return (
				<button
					ref={buttonRef}
					onClick={() => setIsOpen(!isOpen)}
					className={`flex items-center gap-2 p-1 rounded hover:bg-muted transition-colors ${className}`}
					aria-label="Select language"
					aria-expanded={isOpen}
				>
					<Globe className="w-4 h-4" />
					{showFlag && <span className="text-sm">{currentLanguage.flag}</span>}
				</button>
			);
		}

		return (
			<Button
				ref={buttonRef}
				variant={variant === 'compact' ? 'ghost' : 'outline'}
				size={variant === 'compact' ? 'sm' : 'default'}
				onClick={() => setIsOpen(!isOpen)}
				className={`flex items-center gap-2 ${className}`}
				aria-label="Select language"
				aria-expanded={isOpen}
			>
				{content}
			</Button>
		);
	};

	return (
		<div className="relative">
			{renderTrigger()}
			
			{isOpen && (
				<div 
					ref={dropdownRef}
					className={`absolute z-50 mt-1 ${getPlacementClasses(placement)}`}
				>
					<Card className="w-48 shadow-lg border">
						<CardContent className="p-1">
							<div className="space-y-1">
								{Object.entries(languages).map(([code, language]) => (
									<button
										key={code}
										onClick={() => handleLanguageChange(code)}
										className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-muted transition-colors ${
											locale === code ? 'bg-muted font-medium' : ''
										}`}
									>
										<span className="text-base">{language.flag}</span>
										<span className="flex-1 text-left">{language.name}</span>
										<span className="text-xs text-muted-foreground uppercase">{code}</span>
										{locale === code && (
											<Check className="w-3 h-3 text-primary" />
										)}
									</button>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}

// Compact version for mobile/header use
export function CompactLanguageSwitcher(props) {
	return <LanguageSwitcher {...props} variant="compact" />;
}

// Minimal version for footer or subtle placement
export function MinimalLanguageSwitcher(props) {
	return <LanguageSwitcher {...props} variant="minimal" showName={false} />;
}

// Language grid for settings pages
export function LanguageGrid({ onLanguageChange, currentLocale }) {
	const handleChange = (newLocale) => {
		saveLanguagePreference(newLocale);
		if (onLanguageChange) {
			onLanguageChange(newLocale);
		}
	};

	return (
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
			{Object.entries(languages).map(([code, language]) => (
				<button
					key={code}
					onClick={() => handleChange(code)}
					className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-sm ${
						currentLocale === code 
							? 'border-primary bg-primary/5 shadow-sm' 
							: 'border-border hover:border-muted-foreground/50'
					}`}
				>
					<span className="text-lg">{language.flag}</span>
					<div className="flex-1 text-left">
						<div className="font-medium text-sm">{language.name}</div>
						<div className="text-xs text-muted-foreground">{language.nativeName}</div>
					</div>
					{currentLocale === code && (
						<Check className="w-4 h-4 text-primary" />
					)}
				</button>
			))}
		</div>
	);
}

// Language selector for forms
export function LanguageSelect({ value, onValueChange, placeholder = "Select language" }) {
	return (
		<select
			value={value}
			onChange={(e) => onValueChange(e.target.value)}
			className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
		>
			<option value="">{placeholder}</option>
			{Object.entries(languages).map(([code, language]) => (
				<option key={code} value={code}>
					{language.flag} {language.name}
				</option>
			))}
		</select>
	);
}

// Helper function to get placement classes
function getPlacementClasses(placement) {
	switch (placement) {
		case 'bottom-start':
			return 'left-0';
		case 'bottom-end':
			return 'right-0';
		case 'top-start':
			return 'left-0 bottom-full mb-1';
		case 'top-end':
			return 'right-0 bottom-full mb-1';
		default:
			return 'right-0';
	}
}

// Hook for detecting browser language
export function useBrowserLanguage() {
	const [detectedLanguage, setDetectedLanguage] = useState('en');

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const browserLang = navigator.language.substring(0, 2);
			const supportedLangs = Object.keys(languages);
			
			if (supportedLangs.includes(browserLang)) {
				setDetectedLanguage(browserLang);
			}
		}
	}, []);

	return detectedLanguage;
}
