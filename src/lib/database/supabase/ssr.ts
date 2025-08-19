// REQUIRED: Supabase SSR utilities for Next.js 14 (Server-only)
// Based on: https://www.supaboost.dev/blog/supabase-server-side-rendering-nextjs

import { createServerClient, createBrowserClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "./client";
import logger from "@lib/utils/logger";

/**
 * Create Supabase client for Client Components
 * This runs in the browser and handles auth state
 */
export function createSupabaseBrowserClient() {
	const startTime = performance.now();

	try {
		const client = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
			global: {
				headers: {
					// Fix 406 Not Acceptable errors for browser client
					Accept: "application/json",
					"Content-Type": "application/json",
				},
			},
		});

		const duration = performance.now() - startTime;
		logger.performance(`Supabase Browser Client created in ${duration.toFixed(2)}ms`);

		return client;
	} catch (error) {
		logger.error("Failed to create Supabase browser client:", error);
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
