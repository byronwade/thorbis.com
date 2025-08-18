
import React from "react";
import { ThemeProvider } from "@context/theme-context";
import { TranslationProvider } from "@lib/i18n/enhanced-client";
import { getDictionary } from "@lib/i18n/server";
import { AuthProvider } from "@context/auth-context";
import { Toaster } from "@components/ui/toaster";
import ErrorBoundary from "@components/shared/error-boundary";

export default async function AuthGroupLayout({ children, params }) {
	// Get locale from params or default to English
	const locale = params?.locale || 'en';
	const dictionary = await getDictionary(locale);
	return (
		<ErrorBoundary>
			<ThemeProvider>
				<TranslationProvider initialLocale={locale} serverDictionary={dictionary}>
					<AuthProvider>
						<div className="min-h-screen bg-background text-foreground">
							{children}
							<Toaster />
						</div>
					</AuthProvider>
				</TranslationProvider>
			</ThemeProvider>
		</ErrorBoundary>
	);
}
