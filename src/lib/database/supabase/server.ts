// REQUIRED: Supabase Server utilities for Next.js 14 (Server Components only)
// Based on: https://www.supaboost.dev/blog/supabase-server-side-rendering-nextjs

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "./client";
import { logger } from "@utils/logger";

// Client cache with short TTL for server-side auth
const serverClientCache = new Map<string, { client: any; expires: number }>();
const CLIENT_CACHE_TTL = 30000; // 30 seconds

/**
 * Validate environment variables required for Supabase
 * Returns false if any required variables are missing
 */
function validateSupabaseEnvironment(): boolean {
	const requiredVars = {
		NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
		NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
	};

	console.log('Validating Supabase environment:', {
		url: requiredVars.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
		key: requiredVars.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
		urlValue: requiredVars.NEXT_PUBLIC_SUPABASE_URL || 'undefined',
		keyValue: requiredVars.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'defined' : 'undefined',
		urlLength: requiredVars.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
		keyLength: requiredVars.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
		urlTruthy: !!requiredVars.NEXT_PUBLIC_SUPABASE_URL,
		keyTruthy: !!requiredVars.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		urlType: typeof requiredVars.NEXT_PUBLIC_SUPABASE_URL,
		keyType: typeof requiredVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
	});

	const missing = Object.entries(requiredVars)
		.filter(([_, value]) => !value)
		.map(([key, _]) => key);

	console.log('Missing variables:', missing);

	if (missing.length > 0) {
		logger.error(`Missing Supabase environment variables: ${missing.join(', ')}`);
		logger.info('Please create .env.local with your Supabase credentials');
		console.log('Environment validation failed, returning false');
		return false;
	}

	console.log('Environment validation passed, returning true');
	return true;
}

/**
 * Create Supabase client for Server Components (App Router)
 * This runs on the server and has access to cookies for auth
 * Implements caching to reduce client creation overhead
 */
export async function createSupabaseServerClient() {
	const startTime = performance.now();

	try {
		// Validate environment first
		if (!validateSupabaseEnvironment()) {
			logger.warn('Supabase environment not configured, returning null client');
			return null;
		}

		const cookieStore = await cookies();
		
		// Create cache key based on auth cookies
		const authCookies = cookieStore.getAll()
			.filter(cookie => cookie.name.startsWith('sb-'))
			.map(cookie => `${cookie.name}=${cookie.value}`)
			.join('|');
		const cacheKey = `server_client_${Buffer.from(authCookies || '').toString('base64').slice(0, 20)}`;
		
		// Check cache
		const cached = serverClientCache.get(cacheKey);
		if (cached && cached.expires > Date.now()) {
			const duration = performance.now() - startTime;
			logger.performance(`Supabase Server Client cached in ${duration.toFixed(2)}ms`);
			return cached.client;
		}

		const client = createServerClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(cookiesToSet) {
					try {
						cookiesToSet.forEach(({ name, value, options }) => {
							cookieStore.set(name, value, options);
						});
					} catch (error) {
						// Server Components cannot set cookies
						// This can happen during static generation
						logger.debug("Cannot set cookies in Server Component");
					}
				},
			},
		});

		// Cache the client
		serverClientCache.set(cacheKey, {
			client,
			expires: Date.now() + CLIENT_CACHE_TTL
		});

		// Clean up old cache entries periodically
		if (serverClientCache.size > 100) {
			const now = Date.now();
			for (const [key, entry] of serverClientCache.entries()) {
				if (entry.expires <= now) {
					serverClientCache.delete(key);
				}
			}
		}

		const duration = performance.now() - startTime;
		logger.performance(`Supabase Server Client created in ${duration.toFixed(2)}ms`);

		return client;
	} catch (error) {
		const duration = performance.now() - startTime;
		logger.error(`Failed to create Supabase server client: ${error.message} (${duration.toFixed(2)}ms)`);
		return null; // Return null instead of throwing to prevent page crashes
	}
}

/**
 * Get current user session on the server
 * Optimized for performance with caching
 */
export async function getServerSession() {
	const startTime = performance.now();

	try {
		const supabase = await createSupabaseServerClient();
		const {
			data: { session },
			error,
		} = await supabase.auth.getSession();

		if (error) {
			logger.error("Session retrieval error:", error);
			return null;
		}

		const duration = performance.now() - startTime;
		logger.performance(`Server session retrieved in ${duration.toFixed(2)}ms`);

		return session;
	} catch (error) {
		logger.error("Failed to get server session:", error);
		return null;
	}
}

/**
 * Get current user on the server
 * Includes user profile data from our database
 */
export async function getServerUser() {
	const startTime = performance.now();

	try {
		const session = await getServerSession();
		if (!session?.user) return null;

		const supabase = await createSupabaseServerClient();

		// Get user profile from our users table
		const { data: userProfile, error } = await supabase.from("users").select("*").eq("id", session.user.id).single();

		if (error) {
			logger.error("User profile retrieval error:", error);
			// Return basic user info from session if profile fetch fails
			return {
				id: session.user.id,
				email: session.user.email,
				name: session.user.user_metadata?.name || null,
			};
		}

		const duration = performance.now() - startTime;
		logger.performance(`Server user retrieved in ${duration.toFixed(2)}ms`);

		return userProfile;
	} catch (error) {
		logger.error("Failed to get server user:", error);
		return null;
	}
}

/**
 * Optimized data fetching for SSR pages
 * Includes intelligent caching and error handling
 */
export async function fetchPageData<T>(
	fetcher: () => Promise<T>,
	cacheKey?: string,
	ttlSeconds: number = 300 // 5 minutes default
): Promise<{ data: T | null; error: string | null }> {
	const startTime = performance.now();

	try {
		// If no cache key provided, execute directly
		if (!cacheKey) {
			const data = await fetcher();
			const duration = performance.now() - startTime;
			logger.performance(`Page data fetched in ${duration.toFixed(2)}ms (no cache)`);
			return { data, error: null };
		}

		// Try to get from cache first
		const { CacheManager } = await import("@utils/cache-manager");
		const cached = CacheManager.memory.get(cacheKey);
		
		if (cached) {
			const duration = performance.now() - startTime;
			logger.performance(`Page data cache hit in ${duration.toFixed(2)}ms: ${cacheKey}`);
			return { data: cached, error: null };
		}

		// Cache miss - fetch fresh data
		const data = await fetcher();
		
		// Cache the result
		const ttlMs = ttlSeconds * 1000;
		CacheManager.memory.set(cacheKey, data, ttlMs);

		const duration = performance.now() - startTime;
		logger.performance(`Page data fetched and cached in ${duration.toFixed(2)}ms: ${cacheKey}`);

		return { data, error: null };
	} catch (error) {
		const duration = performance.now() - startTime;
		
		// Check if this is a "not found" error (common for 404 cases)
		const isNotFoundError = error instanceof Error && (
			error.message.includes('PGRST116') ||
			error.message.includes('not found') ||
			error.message.includes('No rows returned')
		);

		if (isNotFoundError) {
			// Log as debug instead of error for expected 404 cases
			logger.debug(`Page data not found in ${duration.toFixed(2)}ms:`, error.message);
		} else {
			// Log as error for unexpected failures
			logger.error(`Page data fetch failed in ${duration.toFixed(2)}ms:`, error);
		}

		return {
			data: null,
			error: error instanceof Error ? error.message : "Failed to fetch data",
		};
	}
}

/**
 * Common data fetching patterns for business pages
 */
export const BusinessDataFetchers = {
	/**
	 * Check if a string is in UUID format
	 */
	isValidUUID(str: string): boolean {
		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
		return uuidRegex.test(str);
	},

	/**
	 * Get business with full details for business profile page
	 * Handles both UUID and slug-based queries
	 */
	async getBusinessProfile(businessId: string) {
		const supabase = await createSupabaseServerClient();
		console.log(`Supabase client for business ${businessId}:`, supabase ? 'valid' : 'null');

		// Handle case where Supabase client is null (environment not configured)
		if (!supabase) {
			logger.warn("Supabase client is null, returning mock business data");
			const mockData = this.getMockBusinessData(businessId);
			console.log(`Returning mock data for ${businessId}:`, mockData.name);
			return {
				data: mockData,
				error: null
			};
		}

		return fetchPageData(async () => {
			// Determine if businessId is UUID or slug
			const isUUID = this.isValidUUID(businessId);
			const queryField = isUUID ? "id" : "slug";

			logger.debug(`Querying business by ${queryField}: ${businessId}`);

			// First, check if businesses table exists
			try {
				const { error: tableCheckError } = await supabase
					.from("businesses")
					.select("id")
					.limit(1);

				if (tableCheckError) {
					logger.warn("Businesses table not accessible, using mock data:", tableCheckError.message);
					return this.getMockBusinessData(businessId);
				}
			} catch (tableError) {
				logger.warn("Database connection failed, using mock data:", tableError.message);
				return this.getMockBusinessData(businessId);
			}

			// Try the simplified query first
			try {
				const { data: business, error } = await supabase
					.from("businesses")
					.select("*")
					.eq(queryField, businessId)
					.eq("status", "published")
					.single();

				if (error) {
					if (error.code === "PGRST116") {
						// No rows found - return mock data for development
						logger.debug(`No business found for ${businessId}, returning mock data`);
						return this.getMockBusinessData(businessId);
					}
					throw error;
				}

				// If we have basic business data, try to enrich it
				if (business) {
					try {
						const enrichedBusiness = await this.enrichBusinessData(supabase, business);
						return enrichedBusiness;
					} catch (enrichError) {
						logger.warn("Failed to enrich business data, returning basic data:", enrichError.message);
						return business;
					}
				}

				// Fallback to mock data
				return this.getMockBusinessData(businessId);

			} catch (queryError) {
				logger.warn("Business query failed, using mock data:", queryError.message);
				return this.getMockBusinessData(businessId);
			}
		}, `business_profile_${businessId}`);
	},

	/**
	 * Enrich business data with related information using separate queries
	 */
	async enrichBusinessData(supabase: any, business: any) {
		const enrichedBusiness = { ...business };

		// Try to fetch related data separately
		try {
			// Fetch reviews separately (without user join if it fails)
			const { data: reviews } = await supabase.from("reviews").select("*").eq("business_id", business.id).eq("status", "approved").limit(10);

			enrichedBusiness.reviews = reviews || [];
		} catch (reviewError) {
			logger.warn("Could not fetch reviews:", reviewError.message);
			enrichedBusiness.reviews = [];
		}

		try {
			// Fetch business categories separately
			const { data: businessCategories } = await supabase.from("business_categories").select("*, category:categories(*)").eq("business_id", business.id);

			enrichedBusiness.business_categories = businessCategories || [];
		} catch (categoryError) {
			logger.warn("Could not fetch business categories:", categoryError.message);
			enrichedBusiness.business_categories = [];
		}

		try {
			// Fetch business photos separately
			const { data: photos } = await supabase.from("business_photos").select("*").eq("business_id", business.id).order("order", { ascending: true });

			enrichedBusiness.business_photos = photos || [];
		} catch (photoError) {
			logger.warn("Could not fetch business photos:", photoError.message);
			enrichedBusiness.business_photos = [];
		}

		return enrichedBusiness;
	},

	/**
	 * Return mock business data for development when database is not set up
	 */
	getMockBusinessData(businessId: string) {
		// Use the actual businessId as the slug if it's not a UUID
		const isUUID = this.isValidUUID(businessId);
		const slug = isUUID ? "demo-local-business" : businessId;
		const name = isUUID ? "Demo Local Business" : businessId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
		
		return {
			id: businessId,
			name: name,
			slug: slug,
			description: "This is a sample business used for testing the application. The database is not fully configured yet.",
			address: "123 Main Street",
			city: "San Francisco",
			state: "CA",
			zip_code: "94102",
			country: "US",
			latitude: 37.7749,
			longitude: -122.4194,
			phone: "(555) 123-4567",
			email: "info@demolocalbusiness.com",
			website: "https://demolocalbusiness.com",
			hours: {
				monday: { open: "09:00", close: "17:00", closed: false },
				tuesday: { open: "09:00", close: "17:00", closed: false },
				wednesday: { open: "09:00", close: "17:00", closed: false },
				thursday: { open: "09:00", close: "17:00", closed: false },
				friday: { open: "09:00", close: "17:00", closed: false },
				saturday: { open: "10:00", close: "16:00", closed: false },
				sunday: { closed: true },
			},
			rating: 4.5,
			review_count: 42,
			price_range: "$$",
			status: "published",
			verified: true,
			featured: true,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			// Additional fields required by BusinessOverview component
			established: "2020",
			employees: "5-10",
			responseTime: "< 1 hour",
			responseRate: 95,
			serviceArea: {
				primary: "San Francisco Bay Area",
				coverage: "50 mile radius",
				cities: ["San Francisco", "Oakland", "San Jose", "Berkeley", "Palo Alto"],
			},
			social_media: {
				facebook: "https://facebook.com/demolocalbusiness",
				instagram: "https://instagram.com/demolocalbusiness",
			},
			amenities: ["WiFi", "Parking", "Wheelchair Accessible"],
			payment_methods: ["Cash", "Credit Cards", "Mobile Payments"],
			businessHighlights: ["Experienced team with 5+ years in the industry", "Fast response times for all customer inquiries", "High-quality service with attention to detail", "Competitive pricing with transparent billing", "Excellent customer satisfaction rating", "Licensed and insured for your peace of mind"],
			reviews: [
				{
					id: "mock-review-1",
					rating: 5,
					title: "Great place!",
					text: "Really enjoyed the service and atmosphere.",
					created_at: new Date().toISOString(),
					photos: [],
					helpful_count: 5,
					response: null,
					response_date: null,
					user: {
						id: "mock-user-1",
						name: "John Doe",
						avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
					},
				},
			],
			business_categories: [
				{
					id: "mock-bc-1",
					category: {
						id: "mock-cat-1",
						name: "Restaurant",
						slug: "restaurant",
						icon: "🍽️",
					},
				},
			],
			business_photos: [
				{
					id: "mock-photo-1",
					url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
					alt_text: "Business exterior",
					caption: "Welcome to our business",
					is_primary: true,
					order: 1,
				},
			],
		};
	},

	/**
	 * Get mock businesses array for development
	 */
	getMockBusinesses(limit: number = 20) {
		const businesses = [];
		const categories = [
			{ name: "Restaurant", slug: "restaurant", icon: "🍽️" },
			{ name: "Retail", slug: "retail", icon: "🛍️" },
			{ name: "Service", slug: "service", icon: "🔧" },
			{ name: "Healthcare", slug: "healthcare", icon: "⚕️" },
			{ name: "Entertainment", slug: "entertainment", icon: "🎭" },
		];

		for (let i = 1; i <= limit; i++) {
			const category = categories[i % categories.length];
			const lat = 37.7749 + (Math.random() - 0.5) * 0.1;
			const lng = -122.4194 + (Math.random() - 0.5) * 0.1;
			
			businesses.push({
				id: `mock-business-${i}`,
				name: `Demo Business ${i}`,
				slug: `demo-business-${i}`,
				description: `This is sample business ${i} used for testing the application.`,
				address: `${100 + i} Main Street`,
				city: "San Francisco",
				state: "CA",
				zip_code: "94102",
				country: "US",
				latitude: lat,
				longitude: lng,
				phone: `(555) ${100 + i}-${1000 + i}`,
				email: `info@demobusiness${i}.com`,
				website: `https://demobusiness${i}.com`,
				rating: 3.5 + Math.random() * 1.5,
				review_count: Math.floor(Math.random() * 100) + 10,
				price_range: ["$", "$$", "$$$"][Math.floor(Math.random() * 3)],
				status: "published",
				verified: true,
				featured: i <= 5,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				business_categories: [
					{
						id: `mock-bc-${i}`,
						category: category,
					},
				],
				photos: [
					{
						id: `mock-photo-${i}`,
						url: `https://images.unsplash.com/photo-${1500000000000 + i}?w=800&h=600&fit=crop`,
						alt_text: `Business ${i} exterior`,
						caption: `Welcome to Demo Business ${i}`,
						is_primary: true,
						order: 1,
					},
				],
			});
		}

		return businesses;
	},

	/**
	 * Get businesses for home page sections
	 */
	async getHomePageBusinesses() {
		const supabase = await createSupabaseServerClient();

		// Handle case where Supabase client is null (environment not configured)
		if (!supabase) {
			logger.warn("Supabase client is null, returning mock home page businesses");
			return {
				businesses: this.getMockBusinesses(10),
				total: 10,
				hasMore: false,
				error: "Supabase not configured"
			};
		}

		return fetchPageData(async () => {
			const { data: businesses, error } = await supabase
				.from("businesses")
				.select(
					`
          id,
          name,
          slug,
          description,
          city,
          state,
          rating,
          review_count,
          price_range,
          photos,
          business_categories(
            category:categories(name, slug)
          )
        `
				)
				.eq("status", "published")
				.eq("verified", true)
				.order("featured", { ascending: false })
				.order("rating", { ascending: false })
				.limit(200);

			if (error) throw error;
			return businesses;
		}, "home_page_businesses");
	},

	/**
	 * Search businesses with filters
	 */
	async searchBusinesses(params: { 
		query?: string; 
		location?: string; 
		category?: string; 
		rating?: number; 
		priceRange?: string; 
		limit?: number; 
		offset?: number; 
		featured?: boolean;
		intelligent?: boolean;
		includeRealtimeStatus?: boolean;
		semanticSearch?: boolean;
		personalizedRanking?: boolean;
		realTimeFiltering?: boolean;
		contextualSuggestions?: boolean;
	}) {
		const supabase = await createSupabaseServerClient();

		// Handle case where Supabase client is null (environment not configured)
		if (!supabase) {
			logger.warn("Supabase client is null, returning mock data");
			return {
				businesses: this.getMockBusinesses(params.limit || 20),
				total: params.limit || 20,
				hasMore: false,
				error: "Supabase not configured"
			};
		}

		const result = await fetchPageData(
			async () => {
				try {
					// Simplified query first - just get basic business data
					let query = supabase
						.from("businesses")
						.select(
							`
							id,
							name,
							slug,
							description,
							address,
							city,
							state,
							zip_code,
							country,
							rating,
							review_count,
							price_range,
							photos,
							latitude,
							longitude,
							phone,
							website,
							verified,
							featured,
							status
							`,
							{ count: "exact" }
						)
						.eq("status", "published");

					// Apply filters with proper error handling
					if (params.query && params.query.trim()) {
						const searchTerm = params.query.trim();
						query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
					}

					if (params.location && params.location.trim()) {
						const locationTerm = params.location.trim();
						query = query.or(`city.ilike.%${locationTerm}%,state.ilike.%${locationTerm}%,address.ilike.%${locationTerm}%`);
					}

					if (params.rating && !isNaN(params.rating)) {
						query = query.gte("rating", params.rating);
					}

					if (params.priceRange) {
						query = query.eq("price_range", params.priceRange);
					}

					if (params.featured !== undefined) {
						query = query.eq("featured", params.featured);
					}

					// Pagination with bounds checking
					const limit = Math.min(Math.max(parseInt(params.limit?.toString() || "20"), 1), 100);
					const offset = Math.max(parseInt(params.offset?.toString() || "0"), 0);
					
					// Add ordering
					query = query
						.order("featured", { ascending: false })
						.order("rating", { ascending: false, nullsLast: true })
						.order("review_count", { ascending: false, nullsLast: true });

					// Apply pagination
					query = query.range(offset, offset + limit - 1);

					logger.debug(`Executing business search query with params:`, {
						query: params.query,
						location: params.location,
						category: params.category,
						limit,
						offset
					});

					const { data: businesses, error, count } = await query;

					if (error) {
						logger.error("Supabase query error:", error);
						// Return a valid structure even on error
						return {
							businesses: [],
							total: 0,
							hasMore: false,
							error: error.message
						};
					}

					logger.debug(`Found ${businesses?.length || 0} businesses, total: ${count}`);

					// Ensure we return a valid structure
					const result = {
						businesses: businesses || [],
						total: count || 0,
						hasMore: (count || 0) > offset + limit,
					};

					// If no businesses found, try a broader search
					if (result.businesses.length === 0 && (params.query || params.location)) {
						logger.debug("No results found, trying broader search...");
						
						const fallbackQuery = supabase
							.from("businesses")
							.select(
								`
								id,
								name,
								slug,
								description,
								address,
								city,
								state,
								zip_code,
								country,
								rating,
								review_count,
								price_range,
								photos,
								latitude,
								longitude,
								phone,
								website,
								verified,
								featured,
								status
								`,
								{ count: "exact" }
							)
							.eq("status", "published")
							.eq("verified", true)
							.order("featured", { ascending: false })
							.order("rating", { ascending: false, nullsLast: true })
							.limit(20);

						const { data: fallbackBusinesses, error: fallbackError } = await fallbackQuery;
						
						if (!fallbackError && fallbackBusinesses?.length > 0) {
							return {
								businesses: fallbackBusinesses,
								total: fallbackBusinesses.length,
								hasMore: false,
								fallback: true
							};
						}
					}

					return result;

				} catch (queryError) {
					logger.error("Business search error:", queryError);
					// Always return a valid structure
					return {
						businesses: [],
						total: 0,
						hasMore: false,
						error: queryError.message || "Search failed"
					};
				}
			},
			`search_${JSON.stringify(params)}`,
			60 // 1 minute cache
		);

		// Return the data directly, or handle error case
		if (result.error) {
			return {
				businesses: [],
				total: 0,
				hasMore: false,
				error: result.error
			};
		}

		return result.data;
	},
};

/**
 * Common data fetching patterns for other content types
 */
export const JobDataFetchers = {
	/**
	 * Get jobs with company information for jobs listing page
	 */
	async getJobs(
		params: {
			search?: string;
			location?: string;
			jobType?: string;
			remote?: boolean;
			salaryMin?: number;
			limit?: number;
			offset?: number;
		} = {}
	) {
		const supabase = await createSupabaseServerClient();

		return fetchPageData(
			async () => {
				let query = supabase
					.from("jobs")
					.select(
						`
					id,
					title,
					description,
					location,
					remote_ok,
					job_type,
					salary_min,
					salary_max,
					skills_required,
					experience_level,
					status,
					created_at,
					application_deadline,
					benefits,
					requirements,
					companies (
						id,
						name,
						logo_url,
						industry,
						company_size,
						website,
						description
					)
				`,
						{ count: "exact" }
					)
					.eq("status", "published")
					.order("featured", { ascending: false })
					.order("created_at", { ascending: false });

				// Apply search filters
				if (params.search) {
					query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%,skills_required.cs.{${params.search}}`);
				}

				if (params.location) {
					query = query.ilike("location", `%${params.location}%`);
				}

				if (params.jobType) {
					query = query.eq("job_type", params.jobType);
				}

				if (params.remote !== undefined) {
					query = query.eq("remote_ok", params.remote);
				}

				if (params.salaryMin) {
					query = query.gte("salary_min", params.salaryMin);
				}

				// Pagination
				const limit = params.limit || 20;
				const offset = params.offset || 0;
				query = query.range(offset, offset + limit - 1);

				const { data: jobs, error, count } = await query;

				if (error) throw error;

				return {
					jobs,
					total: count || 0,
					hasMore: (count || 0) > offset + limit,
				};
			},
			`jobs_${JSON.stringify(params)}`
		);
	},

	/**
	 * Get job details by ID with company information
	 */
	async getJobById(jobId: string) {
		const supabase = await createSupabaseServerClient();

		return fetchPageData(async () => {
			const { data: job, error } = await supabase
				.from("jobs")
				.select(
					`
					*,
					companies (
						id,
						name,
						logo_url,
						industry,
						company_size,
						website,
						description,
						founded_year,
						headquarters
					),
					job_applications (
						id,
						applicant_id,
						created_at
					)
				`
				)
				.eq("id", jobId)
				.eq("status", "published")
				.single();

			if (error) throw error;
			return job;
		}, `job_${jobId}`);
	},

	/**
	 * Get companies for company listings
	 */
	async getCompanies(
		params: {
			search?: string;
			industry?: string;
			size?: string;
			limit?: number;
			offset?: number;
		} = {}
	) {
		const supabase = await createSupabaseServerClient();

		return fetchPageData(
			async () => {
				let query = supabase
					.from("companies")
					.select(
						`
					id,
					name,
					logo_url,
					industry,
					company_size,
					website,
					description,
					founded_year,
					headquarters,
					jobs (
						id,
						title,
						status
					)
				`,
						{ count: "exact" }
					)
					.order("created_at", { ascending: false });

				// Apply filters
				if (params.search) {
					query = query.ilike("name", `%${params.search}%`);
				}

				if (params.industry) {
					query = query.eq("industry", params.industry);
				}

				if (params.size) {
					query = query.eq("company_size", params.size);
				}

				// Pagination
				const limit = params.limit || 20;
				const offset = params.offset || 0;
				query = query.range(offset, offset + limit - 1);

				const { data: companies, error, count } = await query;

				if (error) throw error;

				return {
					companies,
					total: count || 0,
					hasMore: (count || 0) > offset + limit,
				};
			},
			`companies_${JSON.stringify(params)}`
		);
	},
};

export const ContentDataFetchers = {
	/**
	 * Get blog posts for blog pages
	 */
	async getBlogPosts(
		params: {
			category?: string;
			featured?: boolean;
			limit?: number;
			offset?: number;
		} = {}
	) {
		const supabase = await createSupabaseServerClient();

		return fetchPageData(
			async () => {
				let query = supabase
					.from("blog_posts")
					.select(
						`
          id,
          title,
          slug,
          excerpt,
          content,
          featured_image,
          published_at,
          reading_time,
          view_count,
          like_count,
          tags,
          featured,
          author:users(id, name, avatar_url),
          category:blog_categories(id, name, slug)
        `
					)
					.eq("status", "published")
					.order("published_at", { ascending: false });

				if (params.category) {
					query = query.eq("blog_categories.slug", params.category);
				}

				if (params.featured) {
					query = query.eq("featured", true);
				}

				const limit = params.limit || 12;
				const offset = params.offset || 0;
				query = query.range(offset, offset + limit - 1);

				const { data: posts, error, count } = await query;
				if (error) throw error;

				return {
					posts: posts || [],
					total: count || 0,
					hasMore: (count || 0) > offset + limit,
				};
			},
			`blog_posts_${JSON.stringify(params)}`
		);
	},

	/**
	 * Get single blog post by slug
	 */
	async getBlogPostBySlug(slug: string) {
		const supabase = await createSupabaseServerClient();

		return fetchPageData(async () => {
			const { data: post, error } = await supabase
				.from("blog_posts")
				.select(
					`
          id,
          title,
          slug,
          excerpt,
          content,
          featured_image,
          published_at,
          updated_at,
          reading_time,
          view_count,
          like_count,
          tags,
          featured,
          meta_title,
          meta_description,
          author:users(id, name, avatar_url, bio),
          category:blog_categories(id, name, slug, description)
        `
				)
				.eq("slug", slug)
				.eq("status", "published")
				.single();

			if (error) {
				if (error.code === "PGRST116") {
					return null; // Post not found
				}
				throw error;
			}

			// Increment view count
			await supabase
				.from("blog_posts")
				.update({ view_count: (post.view_count || 0) + 1 })
				.eq("id", post.id);

			return post;
		}, `blog_post_${slug}`);
	},

	/**
	 * Get blog categories
	 */
	async getBlogCategories() {
		const supabase = await createSupabaseServerClient();

		return fetchPageData(async () => {
			const { data: categories, error } = await supabase
				.from("blog_categories")
				.select(
					`
          id,
          name,
          slug,
          description,
          post_count
        `
				)
				.order("name");

			if (error) throw error;
			return categories || [];
		}, "blog_categories");
	},

	/**
	 * Get related blog posts
	 */
	async getRelatedBlogPosts(postId: string, categoryId: string, limit: number = 3) {
		const supabase = await createSupabaseServerClient();

		return fetchPageData(async () => {
			const { data: posts, error } = await supabase
				.from("blog_posts")
				.select(
					`
          id,
          title,
          slug,
          excerpt,
          featured_image,
          published_at,
          reading_time,
          author:users(id, name, avatar_url),
          category:blog_categories(id, name, slug)
        `
				)
				.eq("status", "published")
				.eq("category_id", categoryId)
				.neq("id", postId)
				.order("published_at", { ascending: false })
				.limit(limit);

			if (error) throw error;
			return posts || [];
		}, `related_posts_${postId}_${categoryId}`);
	},

	/**
	 * Get events for events pages
	 */
	async getEvents(
		params: {
			status?: "upcoming" | "ongoing" | "completed";
			limit?: number;
			offset?: number;
		} = {}
	) {
		const supabase = await createSupabaseServerClient();

		return fetchPageData(
			async () => {
				let query = supabase
					.from("events")
					.select(
						`
          id,
          title,
          slug,
          description,
          start_date,
          end_date,
          location,
          venue,
          is_virtual,
          virtual_url,
          price,
          currency,
          max_attendees,
          current_attendees,
          featured_image,
          tags,
          organizer:users(id, name, avatar_url),
          business:businesses(id, name, slug)
        `
					)
					.order("start_date", { ascending: true });

				if (params.status) {
					query = query.eq("status", params.status);
				}

				const limit = params.limit || 12;
				const offset = params.offset || 0;
				query = query.range(offset, offset + limit - 1);

				const { data: events, error } = await query;
				if (error) throw error;

				return events;
			},
			`events_${JSON.stringify(params)}`
		);
	},

	/**
	 * Get jobs for jobs pages
	 */
	async getJobs(
		params: {
			remote?: boolean;
			location?: string;
			type?: string;
			limit?: number;
			offset?: number;
		} = {}
	) {
		const supabase = await createSupabaseServerClient();

		return fetchPageData(
			async () => {
				let query = supabase
					.from("jobs")
					.select(
						`
          id,
          title,
          slug,
          description,
          location,
          remote_ok,
          job_type,
          salary_min,
          salary_max,
          salary_currency,
          experience_level,
          skills,
          application_deadline,
          created_at,
          company:companies(
            id,
            name,
            slug,
            logo_url,
            industry,
            company_size
          )
        `
					)
					.eq("status", "published")
					.order("created_at", { ascending: false });

				if (params.remote !== undefined) {
					query = query.eq("remote_ok", params.remote);
				}

				if (params.location) {
					query = query.ilike("location", `%${params.location}%`);
				}

				if (params.type) {
					query = query.eq("job_type", params.type);
				}

				const limit = params.limit || 20;
				const offset = params.offset || 0;
				query = query.range(offset, offset + limit - 1);

				const { data: jobs, error } = await query;
				if (error) throw error;

				return jobs;
			},
			`jobs_${JSON.stringify(params)}`
		);
	},
};

export type { Database } from "./client";
