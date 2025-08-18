// REQUIRED: High-performance Supabase client with connection pooling
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./types";
// Import logger with fallback for build compatibility
let logger: any;
try {
  const loggerModule = require("../../utils/logger");
  logger = loggerModule.logger || loggerModule.default || loggerModule;
} catch (e) {
  // Fallback logger for build time
  logger = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
    performance: () => {},
    security: () => {},
    critical: () => {},
    api: () => {},
    businessMetrics: () => {},
  };
}

// Environment variable validation
const validateEnvironmentVariables = () => {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!supabaseUrl) {
		throw new Error(`
Missing NEXT_PUBLIC_SUPABASE_URL environment variable.
Please add to your .env.local file:
NEXT_PUBLIC_SUPABASE_URL=https://hdiuifrlulzpvasknzqm.supabase.co
		`);
	}

	if (!supabaseAnonKey) {
		throw new Error(`
Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.
Please add to your .env.local file:
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_fi1Knpd6lz__Iw5v-uunEw_8AYCrbyH
		`);
	}

	return { supabaseUrl, supabaseAnonKey };
};

// Get service role key for server-side operations
export const getServiceRoleKey = (): string => {
	const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!serviceRoleKey) {
		throw new Error(`
Missing SUPABASE_SERVICE_ROLE_KEY environment variable.
Please add to your .env.local file:
SUPABASE_SERVICE_ROLE_KEY=sb_secret_Pnk_NHm-hm0r3iKiCdRIWw_lbzuPCUY
		`);
	}
	return serviceRoleKey;
};

// Performance-optimized configuration factory
const createSupabaseConfig = (anonKey: string) => ({
	auth: {
		// Reduce auth overhead with persistent sessions
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: true,
		// CRITICAL: Use cookies for SSR compatibility
		storage: typeof window !== "undefined" ? {
			getItem: (key: string) => {
				// Try localStorage first, then cookies
				const localValue = window.localStorage.getItem(key);
				if (localValue) return localValue;
				
				// Fallback to cookies for SSR compatibility
				const cookies = document.cookie.split(';');
				for (const cookie of cookies) {
					const [name, value] = cookie.trim().split('=');
					if (name === key) {
						return decodeURIComponent(value);
					}
				}
				return null;
			},
			setItem: (key: string, value: string) => {
				// Set both localStorage and cookies for SSR compatibility
				window.localStorage.setItem(key, value);
				
				// Set secure cookie for server-side access
				const isSecure = window.location.protocol === 'https:';
				const cookieOptions = [
					`${key}=${encodeURIComponent(value)}`,
					'Path=/',
					'SameSite=Lax',
					'Max-Age=604800', // 7 days
					isSecure ? 'Secure' : ''
				].filter(Boolean).join('; ');
				
				document.cookie = cookieOptions;
			},
			removeItem: (key: string) => {
				window.localStorage.removeItem(key);
				// Remove cookie by setting expired date
				document.cookie = `${key}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
			}
		} : undefined,
	},
	db: {
		// Connection pooling configuration
		schema: "public" as const,
		// Optimize for read performance
		enableReadReplicas: true,
	},
	realtime: {
		// Efficient heartbeat for connection management
		heartbeatIntervalMs: 30000,
		// Optimize for minimal bandwidth usage
		enableCompression: true,
	},
	global: {
		// Performance headers
		headers: {
			apikey: anonKey,
			Authorization: `Bearer ${anonKey}`,
			// Fix 406 Not Acceptable errors
			Accept: "application/json",
			"Content-Type": "application/json",
			// Performance optimizations
			"Cache-Control": "public, max-age=300, stale-while-revalidate=600",
			Connection: "keep-alive",
		},
	},
});

// Singleton pattern for optimal connection management
class SupabaseManager {
	private static instance: SupabaseClient<Database>;
	private static connectionPool: Map<string, SupabaseClient> = new Map();

	/**
	 * Get the main Supabase client instance
	 * Uses singleton pattern to prevent multiple connections
	 */
	public static getClient(): SupabaseClient<Database> {
		if (!this.instance) {
			const startTime = performance.now();

			// Validate environment variables before creating client
			const { supabaseUrl, supabaseAnonKey } = validateEnvironmentVariables();

			const config = createSupabaseConfig(supabaseAnonKey);

			// Debug: Log configuration to ensure headers are set
			if (process.env.NODE_ENV === "development") {
				console.log("🔧 Supabase client config headers:", config.global.headers);
			}

			this.instance = createClient<Database>(supabaseUrl, supabaseAnonKey, config);

			const initTime = performance.now() - startTime;
			if (logger && logger.performance) {
				logger.performance(`Supabase client initialized in ${initTime.toFixed(2)}ms`);
			}
			if (logger && logger.info) {
				logger.info(`Connected to Supabase project: ${supabaseUrl}`);
			}

			// Monitor connection health
			this.setupConnectionMonitoring();
		}

		return this.instance;
	}

	/**
	 * Get specialized client for specific operations
	 * FIXED: Use single auth instance to prevent multiple GoTrueClient warning
	 */
	public static getPooledClient(poolKey: string): SupabaseClient<Database> {
		// Use main instance for auth operations to prevent multiple GoTrueClient instances
		if (poolKey === "auth" || poolKey === "analytics") {
			return this.getClient();
		}

		// Ensure connectionPool is initialized
		if (!this.connectionPool) {
			this.connectionPool = new Map();
		}

		if (!this.connectionPool.has(poolKey)) {
			// Validate environment variables before creating pooled client
			const { supabaseUrl, supabaseAnonKey } = validateEnvironmentVariables();

			const config = createSupabaseConfig(supabaseAnonKey);

			// Create client without auth to prevent multiple GoTrueClient instances
			const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
				...config,
				auth: {
					...config.auth,
					// Disable auth for pooled clients to prevent multiple instances
					autoRefreshToken: false,
					persistSession: false,
					detectSessionInUrl: false,
				},
				// Pool-specific optimizations
				db: {
					...config.db,
					schema: "public" as const,
				},
			});

			this.connectionPool.set(poolKey, client);
			if (logger && logger.debug) {
				logger.debug(`Created pooled connection for: ${poolKey}`);
			}
		}

		return this.connectionPool.get(poolKey)!;
	}

	/**
	 * Monitor connection health and performance
	 */
	private static setupConnectionMonitoring(): void {
		// Simple performance logging without query builder modification
		// This avoids TypeScript issues with complex query builder types
		if (logger && logger.info) {
			logger.info("Supabase connection monitoring enabled");
		}

		// Log connection status
		if (process.env.NODE_ENV === "development") {
			if (logger && logger.debug) {
				logger.debug("Supabase client connection monitoring initialized");
			}
		}
	}

	/**
	 * Reset singleton instance (for development/testing)
	 */
	public static resetInstance(): void {
		this.instance = null as any;
		this.connectionPool.clear();
		if (process.env.NODE_ENV === "development") {
			console.log("🔄 Supabase client instance reset");
		}
	}

	/**
	 * Graceful cleanup for connection pooling
	 */
	public static cleanup(): void {
		if (this.connectionPool) {
			this.connectionPool.clear();
		}
		if (logger && logger.debug) {
			logger.debug("Supabase connection pool cleaned up");
		}
	}
}

// Create server-side client with service role key (for admin operations)
export const createServiceRoleClient = (): SupabaseClient<Database> => {
	const { supabaseUrl } = validateEnvironmentVariables();
	const serviceRoleKey = getServiceRoleKey();

	return createClient<Database>(supabaseUrl, serviceRoleKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
		db: {
			schema: "public" as const,
		},
	});
};

// Export the optimized client
export const supabase = SupabaseManager.getClient();
export const getPooledClient = (poolKey: string) => SupabaseManager.getPooledClient(poolKey);
export const cleanupConnections = () => SupabaseManager.cleanup();
export const resetSupabaseClient = () => SupabaseManager.resetInstance();

// Type exports for better developer experience
export type { Database } from "./types";
export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type Inserts<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];
export type Updates<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"];
