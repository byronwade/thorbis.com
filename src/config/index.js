// Centralized Configuration Management
// All application configuration in one place

const isDev = process.env.NODE_ENV === "development";
const isProd = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================

export const env = {
	NODE_ENV: process.env.NODE_ENV || "development",
	PORT: parseInt(process.env.PORT || "3000", 10),
	HOST: process.env.HOST || "localhost",

	// Application URLs
	APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
	API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",

	// Feature Flags
	FEATURES: {
		AI_CHAT: process.env.NEXT_PUBLIC_FEATURE_AI_CHAT === "true",
		REAL_TIME_SEARCH: process.env.NEXT_PUBLIC_FEATURE_REAL_TIME_SEARCH === "true",
		BUSINESS_CLUSTERING: process.env.NEXT_PUBLIC_FEATURE_BUSINESS_CLUSTERING === "true",
		ADVANCED_FILTERS: process.env.NEXT_PUBLIC_FEATURE_ADVANCED_FILTERS === "true",
		SOCIAL_LOGIN: process.env.NEXT_PUBLIC_FEATURE_SOCIAL_LOGIN === "true",
		REVIEW_PHOTOS: process.env.NEXT_PUBLIC_FEATURE_REVIEW_PHOTOS === "true",
	},

	// Debug Settings
	DEBUG: process.env.DEBUG === "true" || isDev,
	VERBOSE_LOGGING: process.env.VERBOSE_LOGGING === "true",
};

// ============================================================================
// DATABASE CONFIGURATION
// ============================================================================

export const database = {
	// Supabase Configuration
	supabase: {
		url: process.env.NEXT_PUBLIC_SUPABASE_URL,
		anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,

		// Connection Pool Settings
		pool: {
			min: parseInt(process.env.DB_POOL_MIN || "2", 10),
			max: parseInt(process.env.DB_POOL_MAX || "10", 10),
			acquireTimeoutMillis: parseInt(process.env.DB_ACQUIRE_TIMEOUT || "60000", 10),
			idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || "600000", 10),
		},

		// Real-time Configuration
		realtime: {
			enabled: process.env.SUPABASE_REALTIME_ENABLED !== "false",
			heartbeatIntervalMs: parseInt(process.env.SUPABASE_REALTIME_HEARTBEAT || "30000", 10),
			enableCompression: process.env.SUPABASE_REALTIME_COMPRESSION !== "false",
		},
	},
};

// ============================================================================
// AUTHENTICATION CONFIGURATION
// ============================================================================

export const auth = {
	// Session Configuration
	session: {
		timeout: parseInt(process.env.AUTH_SESSION_TIMEOUT || "86400", 10), // 24 hours
		refreshThreshold: parseInt(process.env.AUTH_REFRESH_THRESHOLD || "300", 10), // 5 minutes
		autoRefresh: process.env.AUTH_AUTO_REFRESH !== "false",
	},

	// JWT Configuration
	jwt: {
		secret: process.env.JWT_SECRET,
		expiresIn: process.env.JWT_EXPIRES_IN || "24h",
		algorithm: process.env.JWT_ALGORITHM || "HS256",
	},

	// OAuth Providers
	oauth: {
		google: {
			enabled: process.env.OAUTH_GOOGLE_ENABLED === "true",
			clientId: process.env.OAUTH_GOOGLE_CLIENT_ID,
			clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET,
		},
		facebook: {
			enabled: process.env.OAUTH_FACEBOOK_ENABLED === "true",
			clientId: process.env.OAUTH_FACEBOOK_CLIENT_ID,
			clientSecret: process.env.OAUTH_FACEBOOK_CLIENT_SECRET,
		},
		apple: {
			enabled: process.env.OAUTH_APPLE_ENABLED === "true",
			clientId: process.env.OAUTH_APPLE_CLIENT_ID,
			keyId: process.env.OAUTH_APPLE_KEY_ID,
			teamId: process.env.OAUTH_APPLE_TEAM_ID,
			privateKey: process.env.OAUTH_APPLE_PRIVATE_KEY,
		},
	},

	// Password Policy
	password: {
		minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || "8", 10),
		requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE !== "false",
		requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE !== "false",
		requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS !== "false",
		requireSymbols: process.env.PASSWORD_REQUIRE_SYMBOLS === "true",
	},
};

// ============================================================================
// API CONFIGURATION
// ============================================================================

export const api = {
	// Rate Limiting
	rateLimit: {
		windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || "900000", 10), // 15 minutes
		max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
		standardPoints: parseInt(process.env.RATE_LIMIT_STANDARD || "100", 10),
		premiumPoints: parseInt(process.env.RATE_LIMIT_PREMIUM || "500", 10),

		// Per-endpoint limits
		search: parseInt(process.env.RATE_LIMIT_SEARCH || "30", 10),
		auth: parseInt(process.env.RATE_LIMIT_AUTH || "5", 10),
		upload: parseInt(process.env.RATE_LIMIT_UPLOAD || "10", 10),
	},

	// Request Configuration
	request: {
		timeout: parseInt(process.env.API_TIMEOUT || "30000", 10),
		maxBodySize: process.env.API_MAX_BODY_SIZE || "10mb",
		maxFileSize: process.env.API_MAX_FILE_SIZE || "5mb",
	},

	// CORS Configuration
	cors: {
		origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"],
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
		credentials: true,
	},

	// Pagination Defaults
	pagination: {
		defaultLimit: parseInt(process.env.PAGINATION_DEFAULT_LIMIT || "20", 10),
		maxLimit: parseInt(process.env.PAGINATION_MAX_LIMIT || "100", 10),
	},
};

// ============================================================================
// EXTERNAL SERVICE CONFIGURATION
// ============================================================================

export const services = {
	// Email Service (Resend)
	email: {
		provider: process.env.EMAIL_PROVIDER || "resend",
		resend: {
			apiKey: process.env.RESEND_API_KEY,
			fromEmail: process.env.EMAIL_FROM || "noreply@thorbis.com",
			fromName: process.env.EMAIL_FROM_NAME || "Thorbis",
		},
		templates: {
			welcome: process.env.EMAIL_TEMPLATE_WELCOME,
			passwordReset: process.env.EMAIL_TEMPLATE_PASSWORD_RESET,
			emailVerification: process.env.EMAIL_TEMPLATE_EMAIL_VERIFICATION,
			businessClaimed: process.env.EMAIL_TEMPLATE_BUSINESS_CLAIMED,
		},
	},

	// AI/LLM Services
	openai: {
		apiKey: process.env.OPENAI_API_KEY,
		model: process.env.OPENAI_MODEL || "gpt-4",
		maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || "2000", 10),
		temperature: parseFloat(process.env.OPENAI_TEMPERATURE || "0.7"),
		timeout: parseInt(process.env.OPENAI_TIMEOUT || "30000", 10),
	},

	// Maps & Geolocation
	maps: {
		provider: process.env.MAPS_PROVIDER || "mapbox",
		mapbox: {
			accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
			styleUrl: process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL || "mapbox://styles/mapbox/streets-v12",
		},
		google: {
			apiKey: process.env.GOOGLE_MAPS_API_KEY,
			libraries: ["places", "geometry"],
		},
	},

	// Search Service (Algolia)
	search: {
		provider: process.env.SEARCH_PROVIDER || "algolia",
		algolia: {
			appId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
			apiKey: process.env.ALGOLIA_API_KEY,
			searchKey: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY,
			indexName: process.env.ALGOLIA_INDEX_NAME || "businesses",
		},
	},

	// File Storage
	storage: {
		provider: process.env.STORAGE_PROVIDER || "supabase",
		supabase: {
			bucket: process.env.SUPABASE_STORAGE_BUCKET || "public",
			url: process.env.SUPABASE_STORAGE_URL,
		},
		maxFileSize: parseInt(process.env.STORAGE_MAX_FILE_SIZE || "5242880", 10), // 5MB
		allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
	},

	// Analytics
	analytics: {
		providers: {
			posthog: {
				enabled: process.env.POSTHOG_ENABLED === "true",
				apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
				host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
			},
			googleAnalytics: {
				enabled: process.env.GA_ENABLED === "true",
				measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
			},
			statsig: {
				enabled: process.env.STATSIG_ENABLED === "true",
				clientApiKey: process.env.NEXT_PUBLIC_STATSIG_CLIENT_API_KEY || "client-VsAq7asJFuh6SPJcpxzF9ylksLIeeqlHdA7phaHzwbj",
				sessionReplay: {
					enabled: process.env.STATSIG_SESSION_REPLAY_ENABLED === "true",
					sampleRate: parseFloat(process.env.STATSIG_SESSION_REPLAY_SAMPLE_RATE || "0.1"), // 10% sample rate
				},
				webAnalytics: {
					enabled: process.env.STATSIG_WEB_ANALYTICS_ENABLED === "true",
					autoCapture: process.env.STATSIG_AUTO_CAPTURE_ENABLED === "true",
				},
				performanceBudget: {
					maxInitTime: parseInt(process.env.STATSIG_MAX_INIT_TIME || "100", 10), // 100ms
					maxEventProcessingTime: parseInt(process.env.STATSIG_MAX_EVENT_TIME || "50", 10), // 50ms
				},
			},
		},
		// Performance configuration for all analytics providers
		performance: {
			batchEvents: process.env.ANALYTICS_BATCH_EVENTS === "true",
			batchSize: parseInt(process.env.ANALYTICS_BATCH_SIZE || "10", 10),
			flushInterval: parseInt(process.env.ANALYTICS_FLUSH_INTERVAL || "5000", 10), // 5 seconds
			maxRetries: parseInt(process.env.ANALYTICS_MAX_RETRIES || "3", 10),
		},
	},

	// Monitoring & Error Tracking
	monitoring: {
		sentry: {
			enabled: process.env.SENTRY_ENABLED === "true",
			dsn: process.env.SENTRY_DSN,
			environment: process.env.SENTRY_ENVIRONMENT || env.NODE_ENV,
			tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || "0.1"),
		},
	},
};

// ============================================================================
// PERFORMANCE CONFIGURATION
// ============================================================================

export const performance = {
	// Caching
	cache: {
		redis: {
			enabled: process.env.REDIS_ENABLED === "true",
			url: process.env.REDIS_URL,
			ttl: parseInt(process.env.CACHE_TTL || "3600", 10), // 1 hour
		},
		memory: {
			enabled: true,
			maxSize: parseInt(process.env.MEMORY_CACHE_MAX_SIZE || "100", 10), // 100MB
			ttl: parseInt(process.env.MEMORY_CACHE_TTL || "600", 10), // 10 minutes
		},
	},

	// Bundle Analysis
	bundle: {
		analyze: process.env.ANALYZE === "true",
		maxAssetSize: parseInt(process.env.MAX_ASSET_SIZE || "250000", 10), // 250KB
		maxEntrypointSize: parseInt(process.env.MAX_ENTRYPOINT_SIZE || "500000", 10), // 500KB
	},

	// Image Optimization
	images: {
		domains: process.env.IMAGE_DOMAINS?.split(",") || ["thorbis.com"],
		formats: ["image/webp", "image/avif"],
		quality: parseInt(process.env.IMAGE_QUALITY || "75", 10),
		sizes: [16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
	},
};

// ============================================================================
// LOGGING CONFIGURATION
// ============================================================================

export const logging = {
	level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
	format: process.env.LOG_FORMAT || (isDev ? "pretty" : "json"),

	// Log Destinations
	destinations: {
		console: {
			enabled: true,
			level: process.env.LOG_CONSOLE_LEVEL || process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
		},
		file: {
			enabled: process.env.LOG_FILE_ENABLED === "true",
			filename: process.env.LOG_FILE_NAME || "app.log",
			maxSize: process.env.LOG_FILE_MAX_SIZE || "10m",
			maxFiles: parseInt(process.env.LOG_FILE_MAX_FILES || "5", 10),
		},
		remote: {
			enabled: process.env.LOG_REMOTE_ENABLED === "true",
			endpoint: process.env.LOG_REMOTE_ENDPOINT,
			apiKey: process.env.LOG_REMOTE_API_KEY,
		},
	},

	// Structured Logging Fields
	fields: {
		service: "thorbis-api",
		version: process.env.npm_package_version || "1.0.0",
		environment: env.NODE_ENV,
	},
};

// ============================================================================
// BUSINESS LOGIC CONFIGURATION
// ============================================================================

export const business = {
	// Search Configuration
	search: {
		defaultRadius: parseInt(process.env.SEARCH_DEFAULT_RADIUS || "25", 10), // 25km
		maxRadius: parseInt(process.env.SEARCH_MAX_RADIUS || "100", 10), // 100km
		resultsPerPage: parseInt(process.env.SEARCH_RESULTS_PER_PAGE || "20", 10),
		maxResults: parseInt(process.env.SEARCH_MAX_RESULTS || "1000", 10),
	},

	// Review Configuration
	reviews: {
		minRating: parseInt(process.env.REVIEW_MIN_RATING || "1", 10),
		maxRating: parseInt(process.env.REVIEW_MAX_RATING || "5", 10),
		maxPhotos: parseInt(process.env.REVIEW_MAX_PHOTOS || "5", 10),
		moderationEnabled: process.env.REVIEW_MODERATION_ENABLED !== "false",
		autoApprove: process.env.REVIEW_AUTO_APPROVE === "true",
	},

	// Business Verification
	verification: {
		required: process.env.BUSINESS_VERIFICATION_REQUIRED === "true",
		methods: ["phone", "email", "document"],
		autoVerify: process.env.BUSINESS_AUTO_VERIFY === "true",
	},
};

// ============================================================================
// SECURITY CONFIGURATION
// ============================================================================

export const security = {
	// Content Security Policy
	csp: {
		enabled: process.env.CSP_ENABLED !== "false",
		reportOnly: process.env.CSP_REPORT_ONLY === "true",
		directives: {
			defaultSrc: ["'self'"],
			scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://va.vercel-scripts.com", "https://*.vercel-scripts.com"],
			scriptSrcElem: ["'self'", "'unsafe-inline'", "https://va.vercel-scripts.com", "https://*.vercel-scripts.com"],
			styleSrc: ["'self'", "'unsafe-inline'"],
			imgSrc: ["'self'", "data:", "https:"],
			fontSrc: ["'self'", "https:"],
			connectSrc: ["'self'", "https:", "https://va.vercel-scripts.com", "https://*.vercel-scripts.com"],
		},
	},

	// HTTPS Configuration
	https: {
		enforceInProduction: process.env.ENFORCE_HTTPS !== "false",
		hstsMaxAge: parseInt(process.env.HSTS_MAX_AGE || "31536000", 10), // 1 year
	},

	// Input Validation
	validation: {
		maxStringLength: parseInt(process.env.MAX_STRING_LENGTH || "1000", 10),
		maxArrayLength: parseInt(process.env.MAX_ARRAY_LENGTH || "100", 10),
		allowedImageTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
		maxImageSize: parseInt(process.env.MAX_IMAGE_SIZE || "5242880", 10), // 5MB
	},
};

// ============================================================================
// DEVELOPMENT CONFIGURATION
// ============================================================================

export const development = {
	// Hot Reload
	hotReload: isDev && process.env.HOT_RELOAD !== "false",

	// Source Maps
	sourceMaps: isDev || process.env.SOURCE_MAPS === "true",

	// Mock Services
	mock: {
		enabled: process.env.MOCK_SERVICES === "true" || isTest,
		delay: parseInt(process.env.MOCK_DELAY || "100", 10),
	},

	// Debug Tools
	debug: {
		queries: process.env.DEBUG_QUERIES === "true",
		performance: process.env.DEBUG_PERFORMANCE === "true",
		api: process.env.DEBUG_API === "true",
	},
};

// ============================================================================
// CONFIGURATION VALIDATION
// ============================================================================

function validateConfig() {
	const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];

	const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);

	if (missing.length > 0) {
		throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
	}

	// Validate Supabase URL format
	if (database.supabase.url && !database.supabase.url.includes("supabase.co")) {
		console.warn("Warning: Supabase URL does not appear to be valid");
	}

	// Validate rate limiting configuration
	if (api.rateLimit.max < 1) {
		throw new Error("Rate limit max must be greater than 0");
	}

	// Validate pagination limits
	if (api.pagination.maxLimit < api.pagination.defaultLimit) {
		throw new Error("Max pagination limit must be greater than or equal to default limit");
	}
}

// Validate configuration on import
if (typeof window === "undefined") {
	validateConfig();
}

// ============================================================================
// EXPORT CONFIGURATION
// ============================================================================

const config = {
	env,
	database,
	auth,
	api,
	services,
	performance,
	logging,
	business,
	security,
	development,

	// Utility functions
	isDev,
	isProd,
	isTest,

	// Configuration validation
	validate: validateConfig,
};

export default config;
