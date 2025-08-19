/**
 * Application Constants
 * Centralized constants used throughout the application
 */

// HTTP Status Codes
export const HTTP_STATUS = {
	OK: 200,
	CREATED: 201,
	NO_CONTENT: 204,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	METHOD_NOT_ALLOWED: 405,
	CONFLICT: 409,
	UNPROCESSABLE_ENTITY: 422,
	TOO_MANY_REQUESTS: 429,
	INTERNAL_SERVER_ERROR: 500,
	BAD_GATEWAY: 502,
	SERVICE_UNAVAILABLE: 503,
};

// API Response Messages
export const API_MESSAGES = {
	SUCCESS: "Operation completed successfully",
	CREATED: "Resource created successfully",
	UPDATED: "Resource updated successfully",
	DELETED: "Resource deleted successfully",
	NOT_FOUND: "Resource not found",
	UNAUTHORIZED: "Authentication required",
	FORBIDDEN: "Access denied",
	VALIDATION_ERROR: "Validation failed",
	RATE_LIMITED: "Rate limit exceeded",
	SERVER_ERROR: "Internal server error",
	BAD_REQUEST: "Invalid request",
};

// User Roles and Permissions
export const USER_ROLES = {
	SUPER_ADMIN: "super_admin",
	ADMIN: "admin",
	MODERATOR: "moderator",
	BUSINESS_OWNER: "business_owner",
	USER: "user",
	GUEST: "guest",
};

export const PERMISSIONS = {
	// Business permissions
	CREATE_BUSINESS: "create_business",
	UPDATE_BUSINESS: "update_business",
	DELETE_BUSINESS: "delete_business",
	VERIFY_BUSINESS: "verify_business",
	FEATURE_BUSINESS: "feature_business",
	
	// User permissions
	MANAGE_USERS: "manage_users",
	BAN_USERS: "ban_users",
	VIEW_USER_DATA: "view_user_data",
	
	// Content permissions
	MODERATE_REVIEWS: "moderate_reviews",
	DELETE_CONTENT: "delete_content",
	EDIT_CONTENT: "edit_content",
	
	// System permissions
	ACCESS_ADMIN: "access_admin",
	VIEW_ANALYTICS: "view_analytics",
	MANAGE_CATEGORIES: "manage_categories",
	SYSTEM_CONFIG: "system_config",
};

// Business Status Types
export const BUSINESS_STATUS = {
	PENDING: "pending",
	APPROVED: "approved",
	REJECTED: "rejected",
	SUSPENDED: "suspended",
	CLOSED: "closed",
};

// Business Types/Categories
export const BUSINESS_TYPES = {
	RESTAURANT: "restaurant",
	RETAIL: "retail",
	SERVICE: "service",
	HEALTHCARE: "healthcare",
	AUTOMOTIVE: "automotive",
	BEAUTY: "beauty",
	FITNESS: "fitness",
	EDUCATION: "education",
	ENTERTAINMENT: "entertainment",
	PROFESSIONAL: "professional",
	HOME_SERVICES: "home_services",
	TRAVEL: "travel",
	NONPROFIT: "nonprofit",
	OTHER: "other",
};

// Review Status
export const REVIEW_STATUS = {
	PENDING: "pending",
	APPROVED: "approved",
	REJECTED: "rejected",
	FLAGGED: "flagged",
};

// Rating Scale
export const RATING_SCALE = {
	MIN: 1,
	MAX: 5,
	DEFAULT: 0,
	STEP: 0.5,
};

// Form Validation Patterns
export const VALIDATION_PATTERNS = {
	EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
	PHONE: /^[\+]?[1-9][\d]{0,15}$/,
	URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
	PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
	SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
	ZIP_CODE: /^\d{5}(-\d{4})?$/,
	COORDINATES: /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/,
};

// File Upload Constants
export const FILE_UPLOAD = {
	MAX_SIZE: 10 * 1024 * 1024, // 10MB
	ALLOWED_TYPES: {
		IMAGES: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"],
		DOCUMENTS: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
		ALL: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "application/pdf"],
	},
	QUALITY: {
		THUMBNAIL: 0.7,
		MEDIUM: 0.8,
		HIGH: 0.9,
	},
};

// Pagination Constants
export const PAGINATION = {
	DEFAULT_PAGE: 1,
	DEFAULT_LIMIT: 20,
	MAX_LIMIT: 100,
	MIN_LIMIT: 1,
};

// Cache Keys
export const CACHE_KEYS = {
	BUSINESSES: "businesses",
	CATEGORIES: "categories",
	FEATURED_BUSINESSES: "featured_businesses",
	USER_PROFILE: "user_profile",
	BUSINESS_REVIEWS: "business_reviews",
	SEARCH_RESULTS: "search_results",
	ANALYTICS: "analytics",
};

// Cache TTL (Time To Live) in milliseconds
export const CACHE_TTL = {
	SHORT: 5 * 60 * 1000, // 5 minutes
	MEDIUM: 30 * 60 * 1000, // 30 minutes
	LONG: 2 * 60 * 60 * 1000, // 2 hours
	VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
};

// Analytics Event Types
export const ANALYTICS_EVENTS = {
	PAGE_VIEW: "page_view",
	BUSINESS_VIEW: "business_view",
	BUSINESS_CLICK: "business_click",
	SEARCH: "search",
	FILTER_APPLIED: "filter_applied",
	USER_SIGNUP: "user_signup",
	USER_LOGIN: "user_login",
	REVIEW_SUBMITTED: "review_submitted",
	BUSINESS_CLAIMED: "business_claimed",
	CONTACT_BUSINESS: "contact_business",
	DIRECTION_CLICKED: "direction_clicked",
	PHONE_CLICKED: "phone_clicked",
	WEBSITE_CLICKED: "website_clicked",
};

// Notification Types
export const NOTIFICATION_TYPES = {
	SUCCESS: "success",
	ERROR: "error",
	WARNING: "warning",
	INFO: "info",
};

// Toast Configuration
export const TOAST_CONFIG = {
	DURATION: {
		SHORT: 3000,
		MEDIUM: 5000,
		LONG: 8000,
		PERMANENT: 0,
	},
	POSITION: {
		TOP_LEFT: "top-left",
		TOP_CENTER: "top-center",
		TOP_RIGHT: "top-right",
		BOTTOM_LEFT: "bottom-left",
		BOTTOM_CENTER: "bottom-center",
		BOTTOM_RIGHT: "bottom-right",
	},
};

// Map Configuration
export const MAP_CONFIG = {
	DEFAULT_ZOOM: 12,
	MIN_ZOOM: 3,
	MAX_ZOOM: 18,
	DEFAULT_CENTER: {
		lat: 39.8283, // Geographic center of USA
		lng: -98.5795,
	},
	MARKER_COLORS: {
		DEFAULT: "hsl(var(--primary))", // Blue
		FEATURED: "hsl(var(--accent))", // Amber
		SELECTED: "hsl(var(--destructive))", // Error red
		VERIFIED: "hsl(var(--muted-foreground))", // Green
	},
};

// Time Formats
export const TIME_FORMATS = {
	DATE: "MM/DD/YYYY",
	TIME: "h:mm A",
	DATETIME: "MM/DD/YYYY h:mm A",
	ISO: "YYYY-MM-DDTHH:mm:ss.sssZ",
	RELATIVE: "relative", // "2 hours ago"
};

// Error Messages
export const ERROR_MESSAGES = {
	GENERIC: "Something went wrong. Please try again.",
	NETWORK: "Network error. Please check your connection.",
	TIMEOUT: "Request timed out. Please try again.",
	VALIDATION: "Please check your input and try again.",
	UNAUTHORIZED: "You must be logged in to perform this action.",
	FORBIDDEN: "You don't have permission to perform this action.",
	NOT_FOUND: "The requested resource was not found.",
	SERVER_ERROR: "Server error. Our team has been notified.",
	RATE_LIMITED: "Too many requests. Please wait before trying again.",
	
	// Form-specific errors
	REQUIRED_FIELD: "This field is required",
	INVALID_EMAIL: "Please enter a valid email address",
	INVALID_PHONE: "Please enter a valid phone number",
	INVALID_URL: "Please enter a valid URL",
	PASSWORD_TOO_WEAK: "Password must be at least 8 characters with uppercase, lowercase, number and special character",
	PASSWORDS_DONT_MATCH: "Passwords do not match",
	FILE_TOO_LARGE: "File size is too large",
	INVALID_FILE_TYPE: "Invalid file type",
};

// Success Messages
export const SUCCESS_MESSAGES = {
	BUSINESS_CREATED: "Business created successfully!",
	BUSINESS_UPDATED: "Business updated successfully!",
	BUSINESS_CLAIMED: "Business claim submitted successfully!",
	REVIEW_SUBMITTED: "Review submitted successfully!",
	PROFILE_UPDATED: "Profile updated successfully!",
	EMAIL_VERIFIED: "Email verified successfully!",
	PASSWORD_RESET: "Password reset email sent!",
	SETTINGS_SAVED: "Settings saved successfully!",
	FILE_UPLOADED: "File uploaded successfully!",
	ACCOUNT_CREATED: "Account created successfully!",
	LOGIN_SUCCESS: "Welcome back!",
	LOGOUT_SUCCESS: "Logged out successfully!",
};

// Social Media Platforms
export const SOCIAL_PLATFORMS = {
	FACEBOOK: "facebook",
	TWITTER: "twitter",
	INSTAGRAM: "instagram",
	LINKEDIN: "linkedin",
	YOUTUBE: "youtube",
	TIKTOK: "tiktok",
	PINTEREST: "pinterest",
};

// Days of the Week
export const DAYS_OF_WEEK = {
	MONDAY: "monday",
	TUESDAY: "tuesday",
	WEDNESDAY: "wednesday",
	THURSDAY: "thursday",
	FRIDAY: "friday",
	SATURDAY: "saturday",
	SUNDAY: "sunday",
};

// Operating Hours
export const OPERATING_HOURS = {
	CLOSED: "closed",
	TWENTY_FOUR_HOURS: "24_hours",
	BY_APPOINTMENT: "by_appointment",
};

// Price Ranges
export const PRICE_RANGES = {
	BUDGET: "$",
	MODERATE: "$$",
	EXPENSIVE: "$$$",
	LUXURY: "$$$$",
};

// Contact Methods
export const CONTACT_METHODS = {
	PHONE: "phone",
	EMAIL: "email",
	WEBSITE: "website",
	SOCIAL: "social",
	IN_PERSON: "in_person",
};

// Export all constants
export default {
	HTTP_STATUS,
	API_MESSAGES,
	USER_ROLES,
	PERMISSIONS,
	BUSINESS_STATUS,
	BUSINESS_TYPES,
	REVIEW_STATUS,
	RATING_SCALE,
	VALIDATION_PATTERNS,
	FILE_UPLOAD,
	PAGINATION,
	CACHE_KEYS,
	CACHE_TTL,
	ANALYTICS_EVENTS,
	NOTIFICATION_TYPES,
	TOAST_CONFIG,
	MAP_CONFIG,
	TIME_FORMATS,
	ERROR_MESSAGES,
	SUCCESS_MESSAGES,
	SOCIAL_PLATFORMS,
	DAYS_OF_WEEK,
	OPERATING_HOURS,
	PRICE_RANGES,
	CONTACT_METHODS,
};
