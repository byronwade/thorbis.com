"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@components/site/header";
import Footer from "@components/site/footer";
import ProfilerToggle from "@components/debug/profiler-toggle";

// Helper function to determine if site layout should be shown
function shouldShowSiteLayout(pathname = '/') {
	// Don't show header/footer on dashboard routes, auth forms, or full-screen experiences
	if (pathname.startsWith('/dashboard') || 
		pathname.startsWith('/login') || 
		pathname.startsWith('/signup') || 
		pathname.startsWith('/password-reset') || 
		pathname.startsWith('/otp') || 
		pathname.startsWith('/onboarding') ||
		pathname.startsWith('/auth/') ||  // Any auth routes
		pathname.includes('/forms/') ||   // Form pages
		pathname === '/unauthorized' ||
		pathname === '/support-ticket' ||
		pathname === '/search' ||         // Full-screen search experience
		pathname.startsWith('/search/')) { // Search sub-routes
		return false;
	}
	return true;
}

export default function ConditionalLayoutWrapper({ children, isDev }) {
	const pathname = usePathname();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		// Debug logging to help identify issues
		if (process.env.NODE_ENV === 'development') {
			console.log('ConditionalLayoutWrapper mounted', { 
				pathname, 
				showSiteLayout: shouldShowSiteLayout(pathname) 
			});
		}
	}, [pathname]);

	// Determine layout decision consistently
	const showSiteLayout = shouldShowSiteLayout(pathname);

	// Debug logging
	if (process.env.NODE_ENV === 'development' && mounted) {
		console.log('Layout decision', { pathname, showSiteLayout, mounted });
	}

	// Render the same structure on both server and client to prevent hydration mismatch
	// Use suppressHydrationWarning on dynamic content areas
	return (
		<div suppressHydrationWarning>
			{isDev && <ProfilerToggle />}
			{showSiteLayout && <Header />}
			{children}
			{showSiteLayout && <Footer />}
		</div>
	);
}
