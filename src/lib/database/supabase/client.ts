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

// Singleton instances to prevent multiple GoTrueClient instances
let clientInstance: SupabaseClient<Database> | null = null;
let serviceClientInstance: SupabaseClient<Database> | null = null;

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
		// Provide a more helpful error message
		const errorMessage = `
Missing SUPABASE_SERVICE_ROLE_KEY environment variable.

Please add to your .env.local file:
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

You can find your service role key in your Supabase project dashboard:
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the "service_role" key (not the anon key)
4. Add it to your .env.local file

Note: The service role key should be kept secret and only used server-side.
		`;
		throw new Error(errorMessage);
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
				// Remove from both localStorage and cookies
				window.localStorage.removeItem(key);
				
				// Remove cookie
				document.cookie = `${key}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
			}
		} : undefined,
	},
	global: {
		headers: {
			'X-Client-Info': 'thorbis-web@1.0.0',
		},
	},
	// Optimize for performance
	db: {
		schema: 'public',
	},
	// Real-time configuration
	realtime: {
		params: {
			eventsPerSecond: 10,
		},
	},
});

// Singleton client factory
export const createSupabaseClient = (): SupabaseClient<Database> => {
	if (clientInstance) {
		return clientInstance;
	}

	try {
		const { supabaseUrl, supabaseAnonKey } = validateEnvironmentVariables();
		const config = createSupabaseConfig(supabaseAnonKey);
		
		clientInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, config);
		
		logger.debug("Supabase client created successfully");
		return clientInstance;
	} catch (error) {
		logger.error("Failed to create Supabase client:", error);
		throw error;
	}
};

// Singleton service client factory
export const createServiceSupabaseClient = (): SupabaseClient<Database> => {
	if (serviceClientInstance) {
		return serviceClientInstance;
	}

	try {
		const { supabaseUrl } = validateEnvironmentVariables();
		const serviceRoleKey = getServiceRoleKey();
		
		serviceClientInstance = createClient<Database>(supabaseUrl, serviceRoleKey, {
			auth: {
				persistSession: false,
			},
			global: {
				headers: {
					'X-Client-Info': 'thorbis-service@1.0.0',
				},
			},
		});
		
		logger.debug("Supabase service client created successfully");
		return serviceClientInstance;
	} catch (error) {
		logger.error("Failed to create Supabase service client:", error);
		throw error;
	}
};

// Export singleton instances
export const supabase = createSupabaseClient();

// Lazy service client - only created when accessed
let _serviceSupabase: SupabaseClient<Database> | null = null;
export const serviceSupabase = (): SupabaseClient<Database> => {
	if (!_serviceSupabase) {
		try {
			_serviceSupabase = createServiceSupabaseClient();
		} catch (error) {
			// In development, fallback to regular client if service role key is not available
			if (process.env.NODE_ENV === 'development') {
				logger.warn("Service role key not available, falling back to regular client for development");
				_serviceSupabase = createSupabaseClient();
			} else {
				throw error;
			}
		}
	}
	return _serviceSupabase;
};

// Type exports for better developer experience
export type { Database } from "./types";
export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type Inserts<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];
export type Updates<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"];
