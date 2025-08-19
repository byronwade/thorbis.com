/**
 * Enhanced Language Switcher Component
 * Modern, accessible, and performant language selection
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe, Check } from 'lucide-react';
import { useLanguageSwitcher } from '@lib/i18n/enhanced-client';
import { cn } from '@lib/utils';

// Main language switcher component
export function LanguageSwitcher({ 
	variant = 'default',
	size = 'md',
	showFlag = true,
	showName = true,
	showNativeName = false,
	placement = 'bottom-end',
	className = '',
	disabled = false
}) {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);
	const buttonRef = useRef(null);
	const { currentLanguage, languages, switchLanguage, isChanging, locale } = useLanguageSwitcher();

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	// Handle keyboard navigation
	useEffect(() => {
		function handleKeyDown(event) {
			if (!isOpen) return;

			switch (event.key) {
				case 'Escape':
					setIsOpen(false);
					buttonRef.current?.focus();
					break;
				case 'ArrowDown':
					event.preventDefault();
					// Focus first item
					const firstItem = dropdownRef.current?.querySelector('[role="menuitem"]');
					firstItem?.focus();
					break;
			}
		}

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [isOpen]);

	const handleLanguageChange = async (newLocale) => {
		setIsOpen(false);
		await switchLanguage(newLocale);
	};

	// Variant styles
	const variantStyles = {
		default: 'bg-white border border-border text-muted-foreground hover:bg-gray-50 shadow-sm',
		outline: 'bg-transparent border border-border text-muted-foreground hover:bg-gray-50',
		ghost: 'bg-transparent border-none text-muted-foreground hover:bg-muted',
		primary: 'bg-primary border border-primary text-primary-foreground hover:bg-primary/90',
		secondary: 'bg-muted border border-border text-white hover:bg-muted',
		minimal: 'bg-transparent border-none text-muted-foreground hover:text-muted-foreground hover:bg-gray-50'
	};

	// Size styles
	const sizeStyles = {
		sm: 'px-2 py-1 text-sm',
		md: 'px-3 py-2 text-sm',
		lg: 'px-4 py-3 text-base'
	};

	// Placement styles
	const placementStyles = {
		'bottom-start': 'top-full left-0 mt-1',
		'bottom-end': 'top-full right-0 mt-1',
		'top-start': 'bottom-full left-0 mb-1',
		'top-end': 'bottom-full right-0 mb-1'
	};

	const buttonClass = cn(
		'relative inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
		variantStyles[variant],
		sizeStyles[size],
		isChanging && 'opacity-50 cursor-wait',
		disabled && 'opacity-50 cursor-not-allowed',
		className
	);

	const dropdownClass = cn(
		'absolute z-50 w-64 rounded-lg bg-white shadow-lg border border-border py-2 max-h-80 overflow-y-auto',
		placementStyles[placement]
	);

	// Compact variant for headers
	if (variant === 'compact') {
		return (
			<div className="relative" ref={dropdownRef}>
				<button
					ref={buttonRef}
					onClick={() => !disabled && !isChanging && setIsOpen(!isOpen)}
					disabled={disabled || isChanging}
					className={cn(
						'flex items-center gap-1.5 px-2 py-1 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
						variant === 'compact' && 'bg-muted text-muted-foreground hover:bg-muted'
					)}
					aria-expanded={isOpen}
					aria-haspopup="menu"
					aria-label={`Current language: ${currentLanguage?.name}. Click to change language`}
				>
					{showFlag && (
						<span className="text-base leading-none">{currentLanguage?.flag}</span>
					)}
					{showName && (
						<span className="hidden sm:inline">{currentLanguage?.name}</span>
					)}
					<ChevronDown className={cn('h-3 w-3 transition-transform', isOpen && 'rotate-180')} />
				</button>

				{isOpen && (
					<div className={dropdownClass}>
						{Object.entries(languages).map(([code, language]) => (
							<button
								key={code}
								onClick={() => handleLanguageChange(code)}
								className={cn(
									'w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none',
									code === locale && 'bg-primary/20 text-primary'
								)}
								role="menuitem"
							>
								<span className="text-base leading-none">{language.flag}</span>
								<div className="flex-1 min-w-0">
									<div className="font-medium">{language.name}</div>
									{showNativeName && language.nativeName !== language.name && (
										<div className="text-xs text-muted-foreground truncate">
											{language.nativeName}
										</div>
									)}
								</div>
								{code === locale && <Check className="h-4 w-4 text-primary" />}
							</button>
						))}
					</div>
				)}
			</div>
		);
	}

	// Default variant
	return (
		<div className="relative" ref={dropdownRef}>
			<button
				ref={buttonRef}
				onClick={() => !disabled && !isChanging && setIsOpen(!isOpen)}
				disabled={disabled || isChanging}
				className={buttonClass}
				aria-expanded={isOpen}
				aria-haspopup="menu"
				aria-label={`Current language: ${currentLanguage?.name}. Click to change language`}
			>
				{variant !== 'minimal' && showFlag && (
					<span className="text-lg leading-none">{currentLanguage?.flag}</span>
				)}
				{variant === 'minimal' && <Globe className="h-4 w-4" />}
				{showName && (
					<span className={cn(
						'font-medium',
						variant === 'minimal' ? 'hidden sm:inline' : ''
					)}>
						{showNativeName ? currentLanguage?.nativeName : currentLanguage?.name}
					</span>
				)}
				<ChevronDown 
					className={cn(
						'h-4 w-4 transition-transform',
						isOpen && 'rotate-180'
					)} 
				/>
			</button>

			{isOpen && (
				<div className={dropdownClass}>
					<div className="px-3 py-2 border-b border-border">
						<div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
							Choose Language
						</div>
					</div>
					
					{Object.entries(languages).map(([code, language]) => (
						<button
							key={code}
							onClick={() => handleLanguageChange(code)}
							className={cn(
								'w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors',
								code === locale && 'bg-primary/20'
							)}
							role="menuitem"
						>
							<span className="text-xl leading-none">{language.flag}</span>
							<div className="flex-1 min-w-0">
								<div className={cn(
									'font-medium',
									code === locale && 'text-primary'
								)}>
									{language.name}
								</div>
								<div className={cn(
									'text-sm truncate',
									code === locale ? 'text-primary' : 'text-muted-foreground'
								)}>
									{language.nativeName}
								</div>
							</div>
							{code === locale && <Check className="h-4 w-4 text-primary" />}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

// Grid layout for settings pages
export function LanguageGrid({ currentLocale, onLanguageChange, className = '' }) {
	const { languages } = useLanguageSwitcher();
	const [changing, setChanging] = useState(null);

	const handleChange = async (locale) => {
		setChanging(locale);
		try {
			await onLanguageChange(locale);
		} finally {
			setChanging(null);
		}
	};

	return (
		<div className={cn(
			'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3',
			className
		)}>
			{Object.entries(languages).map(([code, language]) => (
				<button
					key={code}
					onClick={() => handleChange(code)}
					disabled={changing === code}
					className={cn(
						'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
						code === currentLocale
							? 'border-primary bg-primary/20 shadow-sm'
							: 'border-border bg-white hover:border-border',
						changing === code && 'opacity-50 cursor-wait'
					)}
				>
					<span className="text-2xl leading-none">{language.flag}</span>
					<div className="text-center">
						<div className={cn(
							'font-medium text-sm',
							code === currentLocale ? 'text-primary' : 'text-foreground'
						)}>
							{language.name}
						</div>
						<div className={cn(
							'text-xs',
							code === currentLocale ? 'text-primary' : 'text-muted-foreground'
						)}>
							{language.nativeName}
						</div>
					</div>
					{code === currentLocale && (
						<Check className="h-4 w-4 text-primary" />
					)}
				</button>
			))}
		</div>
	);
}

// Mobile-optimized bottom sheet
export function MobileLanguageSwitcher({ isOpen, onClose, onLanguageChange }) {
	const { currentLanguage, languages, locale } = useLanguageSwitcher();

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 md:hidden">
			{/* Backdrop */}
			<div 
				className="absolute inset-0 bg-black/50" 
				onClick={onClose}
			/>
			
			{/* Sheet */}
			<div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-xl">
				<div className="px-4 py-6">
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-lg font-semibold">Choose Language</h3>
						<button
							onClick={onClose}
							className="p-2 rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
						>
							<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
					
					<div className="space-y-2 max-h-96 overflow-y-auto">
						{Object.entries(languages).map(([code, language]) => (
							<button
								key={code}
								onClick={() => {
									onLanguageChange(code);
									onClose();
								}}
								className={cn(
									'w-full flex items-center gap-4 p-4 rounded-lg text-left transition-colors',
									code === locale
										? 'bg-primary/20 border-2 border-primary/30'
										: 'bg-gray-50 border-2 border-transparent hover:bg-muted'
								)}
							>
								<span className="text-2xl leading-none">{language.flag}</span>
								<div className="flex-1">
									<div className={cn(
										'font-medium',
										code === locale ? 'text-primary' : 'text-foreground'
									)}>
										{language.name}
									</div>
									<div className={cn(
										'text-sm',
										code === locale ? 'text-primary' : 'text-muted-foreground'
									)}>
										{language.nativeName}
									</div>
								</div>
								{code === locale && <Check className="h-5 w-5 text-primary" />}
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

// Export default component
export default LanguageSwitcher;
