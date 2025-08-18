/**
 * Application Configuration
 * Centralized configuration management for the application
 */

// Environment detection
export const isDev = process.env.NODE_ENV === "development";
export const isProd = process.env.NODE_ENV === "production";
export const isTest = process.env.NODE_ENV === "test";

// Application URLs
export const APP_CONFIG = {
	name: "Thorbis",
	domain: "thorbis.com",
	url: isProd ? "https://thorbis.com" : "http://localhost:3000",
	description: "Discover Local Businesses & Community",
	version: process.env.npm_package_version || "1.0.0",
};

// API Configuration
export const API_CONFIG = {
	baseUrl: isProd ? "https://thorbis.com/api" : "http://localhost:3000/api",
	timeout: 10000, // 10 seconds
	retries: 3,
	rateLimit: {
		requests: 100,
		windowMs: 15 * 60 * 1000, // 15 minutes
	},
};

// Database Configuration
export const DATABASE_CONFIG = {
	supabase: {
		url: process.env.NEXT_PUBLIC_SUPABASE_URL,
		anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
	},
	connectionPool: {
		min: 2,
		max: 10,
		acquireTimeoutMillis: 30000,
		idleTimeoutMillis: 30000,
	},
};

// Authentication Configuration
export const AUTH_CONFIG = {
	providers: {
		google: {
			enabled: !!process.env.GOOGLE_CLIENT_ID,
			clientId: process.env.GOOGLE_CLIENT_ID,
		},
		github: {
			enabled: !!process.env.GITHUB_CLIENT_ID,
			clientId: process.env.GITHUB_CLIENT_ID,
		},
		linkedin: {
			enabled: !!process.env.LINKEDIN_CLIENT_ID,
			clientId: process.env.LINKEDIN_CLIENT_ID,
		},
	},
	session: {
		maxAge: 30 * 24 * 60 * 60, // 30 days
		updateAge: 24 * 60 * 60, // 24 hours
	},
	security: {
		passwordMinLength: 8,
		requireUppercase: true,
		requireLowercase: true,
		requireNumbers: true,
		requireSpecialChars: true,
		maxLoginAttempts: 5,
		lockoutDuration: 15 * 60 * 1000, // 15 minutes
	},
};

// Feature Flags
export const FEATURE_FLAGS = {
	enableAnalytics: isProd,
	enableErrorReporting: isProd,
	enablePerformanceMonitoring: true,
	enableA11yChecks: isDev,
	enableDevTools: isDev,
	enableBetaFeatures: false,
	enableRealtime: true,
	enableCaching: true,
	enableCompression: isProd,
};

// Performance Configuration
export const PERFORMANCE_CONFIG = {
	caching: {
		defaultTTL: 5 * 60 * 1000, // 5 minutes
		maxSize: 100, // Max cache entries
		strategies: {
			api: "stale-while-revalidate",
			static: "cache-first",
			user: "network-first",
		},
	},
	monitoring: {
		enableWebVitals: true,
		enableResourceTiming: true,
		enableUserTiming: isDev,
		sampleRate: isProd ? 0.1 : 1.0,
	},
	optimization: {
		enableImageOptimization: true,
		enablePrefetching: true,
		enableLazyLoading: true,
		enableCodeSplitting: true,
	},
};

// External Services Configuration
export const SERVICES_CONFIG = {
	analytics: {
		google: {
			enabled: !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
			measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
		},
		vercel: {
			enabled: isProd,
		},
	},
	maps: {
		google: {
			enabled: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
			apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
		},
	},
	email: {
		resend: {
			enabled: !!process.env.RESEND_API_KEY,
			apiKey: process.env.RESEND_API_KEY,
			fromEmail: "noreply@thorbis.com",
		},
	},
	storage: {
		supabase: {
			bucket: "uploads",
			maxFileSize: 10 * 1024 * 1024, // 10MB
			allowedTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
		},
	},
};

// Security Configuration
export const SECURITY_CONFIG = {
	cors: {
		origin: isProd 
			? ["https://thorbis.com", "https://www.thorbis.com"]
			: ["http://localhost:3000"],
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	},
	headers: {
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.googletagmanager.com", "https://va.vercel-scripts.com", "https://*.vercel-scripts.com"],
				scriptSrcElem: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com", "https://va.vercel-scripts.com", "https://*.vercel-scripts.com"],
				styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
				fontSrc: ["'self'", "https://fonts.gstatic.com"],
				imgSrc: ["'self'", "data:", "https:", "blob:"],
				connectSrc: ["'self'", "https://www.google-analytics.com", "https://va.vercel-scripts.com", "https://*.vercel-scripts.com"],
			},
		},
		hsts: {
			maxAge: 31536000,
			includeSubDomains: true,
			preload: true,
		},
	},
	rateLimit: {
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 100, // limit each IP to 100 requests per windowMs
		standardHeaders: true,
		legacyHeaders: false,
	},
};

// Logging Configuration
export const LOGGING_CONFIG = {
	level: isDev ? "debug" : "info",
	format: isDev ? "pretty" : "json",
	destinations: {
		console: true,
		file: isProd,
		external: isProd && !!process.env.LOG_SERVICE_URL,
	},
	sampling: {
		error: 1.0,
		warn: 1.0,
		info: isProd ? 0.1 : 1.0,
		debug: isDev ? 1.0 : 0.0,
	},
};

// Business Logic Configuration
export const BUSINESS_CONFIG = {
	validation: {
		maxNameLength: 100,
		maxDescriptionLength: 1000,
		maxAddressLength: 200,
		maxPhoneLength: 20,
		maxEmailLength: 100,
		maxWebsiteLength: 200,
	},
	defaults: {
		rating: 0,
		reviewCount: 0,
		featured: false,
		verified: false,
		status: "pending",
	},
	categories: {
		maxPerBusiness: 5,
		requireAtLeastOne: true,
	},
	photos: {
		maxCount: 10,
		maxSizeBytes: 5 * 1024 * 1024, // 5MB
		allowedFormats: ["jpg", "jpeg", "png", "webp"],
		thumbnailSizes: [150, 300, 600],
	},
};

// Export combined configuration
export const CONFIG = {
	app: APP_CONFIG,
	api: API_CONFIG,
	database: DATABASE_CONFIG,
	auth: AUTH_CONFIG,
	features: FEATURE_FLAGS,
	performance: PERFORMANCE_CONFIG,
	services: SERVICES_CONFIG,
	security: SECURITY_CONFIG,
	logging: LOGGING_CONFIG,
	business: BUSINESS_CONFIG,
	env: {
		isDev,
		isProd,
		isTest,
	},
};

export default CONFIG;
