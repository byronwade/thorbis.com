// REQUIRED: Supabase SSR utilities for Next.js 14 (Server-only)
// Based on: https://www.supaboost.dev/blog/supabase-server-side-rendering-nextjs

import { createServerClient, createBrowserClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "./client";
import logger from "@lib/utils/logger";

// Global singleton instance to prevent multiple client instances
let supabaseBrowserClient: ReturnType<typeof createBrowserClient> | null = null;
let clientCreationPromise: Promise<ReturnType<typeof createBrowserClient>> | null = null;
let isInitializing = false;

// Type declaration for global flag
declare global {
  interface Window {
    supabaseClientInitialized?: boolean;
  }
}

/**
 * Utility function to clear all Supabase-related storage
 * Useful for handling authentication errors and session cleanup
 */
export function clearSupabaseStorage() {
	if (typeof window === 'undefined') return;

	const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0];
	const storageKeys = [
		`sb-${projectId}-auth-token`,
		'sb-auth-token',
		'sb-access-token',
		'sb-refresh-token'
	];

	// Clear localStorage
	storageKeys.forEach(key => {
		localStorage.removeItem(key);
	});

	// Clear sessionStorage
	storageKeys.forEach(key => {
		sessionStorage.removeItem(key);
	});

	// Clear any Supabase-related cookies by setting them to expire
	if (document) {
		storageKeys.forEach(key => {
			document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
		});
	}

	logger.debug("🧹 Cleared all Supabase storage");
}

/**
 * Create Supabase client for Client Components (Singleton Pattern)
 * This runs in the browser and handles auth state
 * Uses singleton pattern to prevent multiple client instances
 */
export async function createSupabaseBrowserClient() {
	const startTime = performance.now();

	try {
		// Return existing instance if it exists
		if (supabaseBrowserClient) {
			logger.debug("🔄 Using existing Supabase Browser Client instance");
			return supabaseBrowserClient;
		}

		// Return existing promise if client is being created
		if (clientCreationPromise) {
			logger.debug("🔄 Waiting for existing Supabase Browser Client creation");
			return await clientCreationPromise;
		}

		// Prevent multiple simultaneous initializations
		if (isInitializing) {
			logger.debug("🔄 Client initialization already in progress, waiting...");
			while (isInitializing) {
				await new Promise(resolve => setTimeout(resolve, 10));
			}
			if (supabaseBrowserClient) {
				return supabaseBrowserClient;
			}
		}

		isInitializing = true;

		// Create promise to prevent multiple simultaneous creations
		clientCreationPromise = (async () => {
			const client = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
			auth: {
				autoRefreshToken: true,
				persistSession: true,
				detectSessionInUrl: true,
				flowType: 'pkce', // Use PKCE for better security
				storageKey: `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`, // Dynamic storage key based on project
			},
			global: {
				headers: {
					// Fix 406 Not Acceptable errors for browser client
					Accept: "application/json",
					"Content-Type": "application/json",
					"Cache-Control": "public, max-age=300, stale-while-revalidate=600",
				},
			},
			});

			const duration = performance.now() - startTime;
			logger.performance(`Supabase Browser Client created in ${duration.toFixed(2)}ms`);

			supabaseBrowserClient = client;
			isInitializing = false;

			return client;
		})();

		return await clientCreationPromise;
	} catch (error) {
		logger.error("Failed to create Supabase browser client:", error);
		clientCreationPromise = null; // Reset on error
		isInitializing = false;

		throw error;
	}
}

/**
 * Create Supabase client for Route Handlers (API routes)
 * This handles cookies and can both read and write them
 */
export async function createSupabaseRouteHandlerClient(request: NextRequest, response: NextResponse) {
	const startTime = performance.now();

	try {
		const client = createServerClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value, options }) => {
						request.cookies.set(name, value);
						response.cookies.set(name, value, options);
					});
				},
			},
		});

		const duration = performance.now() - startTime;
		logger.performance(`Supabase Route Handler Client created in ${duration.toFixed(2)}ms`);

		return client;
	} catch (error) {
		logger.error("Failed to create Supabase route handler client:", error);
		throw error;
	}
}

/**
 * Create Supabase client for Middleware
 * This is optimized for middleware performance
 */
export function createSupabaseMiddlewareClient(request: NextRequest) {
	const startTime = performance.now();

	try {
		const response = NextResponse.next({
			request: {
				headers: request.headers,
			},
		});

		const client = createServerClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value, options }) => {
						request.cookies.set(name, value);
						response.cookies.set(name, value, options);
					});
				},
			},
		});

		const duration = performance.now() - startTime;
		logger.performance(`Supabase Middleware Client created in ${duration.toFixed(2)}ms`);

		return { client, response };
	} catch (error) {
		logger.error("Failed to create Supabase middleware client:", error);
		throw error;
	}
}

export type { Database } from "./client";
