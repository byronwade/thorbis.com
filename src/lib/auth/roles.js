// REQUIRED: Advanced Role-Based Access Control System
// Implements comprehensive permission management with performance optimization

import logger from "@lib/utils/logger";
import { SecureStorage } from "@utils/secure-storage";

/**
 * Role definitions with hierarchical permissions
 * Based on enterprise-grade RBAC patterns
 */
export const ROLES = {
	// Regular user - basic access
	USER: {
		name: "user",
		displayName: "User",
		level: 1,
		permissions: ["profile.read", "profile.update", "business.search", "business.view", "review.create", "review.read", "review.update_own", "review.delete_own"],
	},

	// Business owner - manage owned businesses
	BUSINESS_OWNER: {
		name: "business_owner",
		displayName: "Business Owner",
		level: 2,
		permissions: [
			// Inherit user permissions
			...["profile.read", "profile.update", "business.search", "business.view", "review.create", "review.read", "review.update_own", "review.delete_own"],
			// Business management
			"business.create",
			"business.update_own",
			"business.claim",
			"business.manage_own",
			"business.manage", // Added missing permission for business dashboard access
			"business.analytics_own",
			"business.respond_reviews",
			// Enhanced profile
			"profile.business_info",
		],
	},

	// Moderator - content moderation
	MODERATOR: {
		name: "moderator",
		displayName: "Moderator",
		level: 3,
		permissions: [
			// Inherit business owner permissions
			...["profile.read", "profile.update", "business.search", "business.view", "review.create", "review.read", "review.update_own", "review.delete_own", "business.create", "business.update_own", "business.claim", "business.manage_own", "business.analytics_own", "business.respond_reviews", "profile.business_info"],
			// Moderation capabilities
			"review.moderate",
			"review.approve",
			"review.reject",
			"business.moderate",
			"business.approve",
			"business.reject",
			"content.moderate",
			"user.view_basic",
			"reports.handle",
		],
	},

	// Admin - administrative access
	ADMIN: {
		name: "admin",
		displayName: "Administrator",
		level: 4,
		permissions: [
			// Inherit moderator permissions
			...["profile.read", "profile.update", "business.search", "business.view", "review.create", "review.read", "review.update_own", "review.delete_own", "business.create", "business.update_own", "business.claim", "business.manage_own", "business.analytics_own", "business.respond_reviews", "profile.business_info", "review.moderate", "review.approve", "review.reject", "business.moderate", "business.approve", "business.reject", "content.moderate", "user.view_basic", "reports.handle"],
			// Administrative capabilities
			"user.manage",
			"user.delete",
			"user.impersonate",
			"business.manage_all",
			"business.delete",
			"analytics.view_all",
			"system.configure",
			"roles.manage",
			"audit.view",
		],
	},

	// Super Admin - full system access
	SUPER_ADMIN: {
		name: "super_admin",
		displayName: "Super Administrator",
		level: 5,
		permissions: [
			// Full access - all permissions
			"*", // Wildcard permission
		],
	},
};

/**
 * Permission categories for organized access control
 */
export const PERMISSION_CATEGORIES = {
	PROFILE: "profile",
	BUSINESS: "business",
	REVIEW: "review",
	USER: "user",
	CONTENT: "content",
	ANALYTICS: "analytics",
	SYSTEM: "system",
	AUDIT: "audit",
	REPORTS: "reports",
	ROLES: "roles",
};

/**
 * Role-Based Access Control Manager
 * Provides comprehensive permission checking and role management
 */
export class RoleManager {
	// Cache for role permissions to improve performance
	static permissionCache = new Map();
	static cacheTimeout = 5 * 60 * 1000; // 5 minutes

	/**
	 * Check if user has specific permission
	 */
	static hasPermission(userRoles, permission) {
		const startTime = performance.now();

		try {
			if (!userRoles || userRoles.length === 0) {
				return false;
			}

			// Check cache first
			const cacheKey = `${userRoles.join(",")}_${permission}`;
			const cached = this.permissionCache.get(cacheKey);
			if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
				return cached.result;
			}

			// Get highest role level
			const highestRole = this.getHighestRole(userRoles);

			// Super admin has all permissions
			if (highestRole === ROLES.SUPER_ADMIN.name) {
				this.cachePermission(cacheKey, true);
				return true;
			}

			// Check specific permissions
			const hasPermission = userRoles.some((roleName) => {
				const role = this.getRole(roleName);
				if (!role) return false;

				// Check for wildcard permission
				if (role.permissions.includes("*")) return true;

				// Check for specific permission
				if (role.permissions.includes(permission)) return true;

				// Check for category wildcard (e.g., "business.*")
				const category = permission.split(".")[0];
				if (role.permissions.includes(`${category}.*`)) return true;

				return false;
			});

			// Cache result
			this.cachePermission(cacheKey, hasPermission);

			const duration = performance.now() - startTime;
			logger.performance(`Permission check completed in ${duration.toFixed(2)}ms`);

			return hasPermission;
		} catch (error) {
			logger.error("Permission check failed:", error);
			return false;
		}
	}

	/**
	 * Check if user has any of the specified permissions
	 */
	static hasAnyPermission(userRoles, permissions) {
		return permissions.some((permission) => this.hasPermission(userRoles, permission));
	}

	/**
	 * Check if user has all specified permissions
	 */
	static hasAllPermissions(userRoles, permissions) {
		return permissions.every((permission) => this.hasPermission(userRoles, permission));
	}

	/**
	 * Check if user has role
	 */
	static hasRole(userRoles, roleName) {
		return userRoles.includes(roleName);
	}

	/**
	 * Check if user has any of the specified roles
	 */
	static hasAnyRole(userRoles, roleNames) {
		return roleNames.some((roleName) => this.hasRole(userRoles, roleName));
	}

	/**
	 * Get the highest role level
	 */
	static getHighestRole(userRoles) {
		let highestLevel = 0;
		let highestRole = null;

		userRoles.forEach((roleName) => {
			const role = this.getRole(roleName);
			if (role && role.level > highestLevel) {
				highestLevel = role.level;
				highestRole = role.name;
			}
		});

		return highestRole;
	}

	/**
	 * Get role definition
	 */
	static getRole(roleName) {
		return Object.values(ROLES).find((role) => role.name === roleName);
	}

	/**
	 * Get all permissions for user roles
	 */
	static getAllPermissions(userRoles) {
		const permissions = new Set();

		userRoles.forEach((roleName) => {
			const role = this.getRole(roleName);
			if (role) {
				role.permissions.forEach((permission) => permissions.add(permission));
			}
		});

		return Array.from(permissions);
	}

	/**
	 * Check if user can access resource
	 */
	static canAccessResource(userRoles, resource, action = "read") {
		const permission = `${resource}.${action}`;
		return this.hasPermission(userRoles, permission);
	}

	/**
	 * Get filtered data based on permissions
	 */
	static filterDataByPermissions(userRoles, data, resourceType) {
		if (this.hasPermission(userRoles, `${resourceType}.view_all`)) {
			return data; // Admin can see all
		}

		if (this.hasPermission(userRoles, `${resourceType}.view_own`)) {
			// Filter to user's own data
			return data.filter((item) => {
				return item.user_id === userRoles.userId || item.owner_id === userRoles.userId;
			});
		}

		if (this.hasPermission(userRoles, `${resourceType}.read`)) {
			// Basic read access - filter sensitive data
			return data.map((item) => {
				const filtered = { ...item };
				// Remove sensitive fields
				delete filtered.private_notes;
				delete filtered.internal_data;
				delete filtered.email;
				delete filtered.phone;
				return filtered;
			});
		}

		return []; // No access
	}

	/**
	 * Validate role assignment
	 */
	static canAssignRole(assignerRoles, targetRole) {
		const assignerLevel = this.getHighestRoleLevel(assignerRoles);
		const targetRoleLevel = this.getRole(targetRole)?.level || 0;

		// Can only assign roles at same level or lower
		return assignerLevel >= targetRoleLevel;
	}

	/**
	 * Get highest role level for user
	 */
	static getHighestRoleLevel(userRoles) {
		let highestLevel = 0;

		userRoles.forEach((roleName) => {
			const role = this.getRole(roleName);
			if (role && role.level > highestLevel) {
				highestLevel = role.level;
			}
		});

		return highestLevel;
	}

	/**
	 * Cache permission result
	 */
	static cachePermission(key, result) {
		this.permissionCache.set(key, {
			result,
			timestamp: Date.now(),
		});

		// Clean old cache entries
		if (this.permissionCache.size > 1000) {
			this.cleanPermissionCache();
		}
	}

	/**
	 * Clean expired cache entries
	 */
	static cleanPermissionCache() {
		const now = Date.now();
		for (const [key, value] of this.permissionCache.entries()) {
			if (now - value.timestamp > this.cacheTimeout) {
				this.permissionCache.delete(key);
			}
		}
	}

	/**
	 * Clear permission cache
	 */
	static clearPermissionCache() {
		this.permissionCache.clear();
		logger.debug("Permission cache cleared");
	}

	/**
	 * Get user's effective permissions (with caching)
	 */
	static getUserPermissions(userRoles) {
		const cacheKey = `user_permissions_${userRoles.join(",")}`;
		const cached = SecureStorage.getItem(cacheKey);

		if (cached) {
			return cached;
		}

		const permissions = this.getAllPermissions(userRoles);
		const userPermissions = {
			roles: userRoles,
			permissions,
			highestRole: this.getHighestRole(userRoles),
			level: this.getHighestRoleLevel(userRoles),
			generatedAt: Date.now(),
		};

		// Cache for 10 minutes
		SecureStorage.setItem(cacheKey, userPermissions, {
			expiry: 10 * 60 * 1000,
		});

		return userPermissions;
	}

	/**
	 * Log permission checks for audit trail
	 */
	static logPermissionCheck(userId, permission, granted, context = {}) {
		logger.security({
			action: "permission_check",
			userId,
			permission,
			granted,
			context,
			timestamp: Date.now(),
		});
	}

	/**
	 * Middleware helper for route protection
	 */
	static createPermissionMiddleware(requiredPermission, options = {}) {
		return (userRoles, userId) => {
			const granted = this.hasPermission(userRoles, requiredPermission);

			// Log the check
			this.logPermissionCheck(userId, requiredPermission, granted, {
				middleware: true,
				...options,
			});

			if (!granted && options.fallbackPermissions) {
				// Try fallback permissions
				return this.hasAnyPermission(userRoles, options.fallbackPermissions);
			}

			return granted;
		};
	}

	/**
	 * Role hierarchy check - can role A manage role B
	 */
	static canManageRole(managerRoles, targetRole) {
		const managerLevel = this.getHighestRoleLevel(managerRoles);
		const targetRoleData = this.getRole(targetRole);

		if (!targetRoleData) return false;

		// Must be higher level to manage
		return managerLevel > targetRoleData.level;
	}

	/**
	 * Get available actions for user on resource
	 */
	static getAvailableActions(userRoles, resourceType) {
		const actions = ["create", "read", "update", "delete", "manage"];
		const availableActions = [];

		actions.forEach((action) => {
			if (this.hasPermission(userRoles, `${resourceType}.${action}`)) {
				availableActions.push(action);
			}
		});

		return availableActions;
	}
}

/**
 * Permission constants for easy reference
 */
export const PERMISSIONS = {
	// Profile permissions
	PROFILE_READ: "profile.read",
	PROFILE_UPDATE: "profile.update",
	PROFILE_DELETE: "profile.delete",
	PROFILE_BUSINESS_INFO: "profile.business_info",

	// Business permissions
	BUSINESS_CREATE: "business.create",
	BUSINESS_READ: "business.read",
	BUSINESS_UPDATE: "business.update",
	BUSINESS_DELETE: "business.delete",
	BUSINESS_MANAGE: "business.manage",
	BUSINESS_CLAIM: "business.claim",
	BUSINESS_APPROVE: "business.approve",
	BUSINESS_MODERATE: "business.moderate",

	// Review permissions
	REVIEW_CREATE: "review.create",
	REVIEW_READ: "review.read",
	REVIEW_UPDATE: "review.update",
	REVIEW_DELETE: "review.delete",
	REVIEW_MODERATE: "review.moderate",
	REVIEW_APPROVE: "review.approve",

	// User management permissions
	USER_VIEW: "user.view",
	USER_MANAGE: "user.manage",
	USER_DELETE: "user.delete",
	USER_IMPERSONATE: "user.impersonate",

	// System permissions
	SYSTEM_CONFIGURE: "system.configure",
	ANALYTICS_VIEW: "analytics.view",
	AUDIT_VIEW: "audit.view",
	ROLES_MANAGE: "roles.manage",
};

/**
 * Route permission mappings
 */
export const ROUTE_PERMISSIONS = {
	// Dashboard routes
	"/dashboard": [PERMISSIONS.PROFILE_READ],
	"/dashboard/business": [PERMISSIONS.BUSINESS_MANAGE],
	"/dashboard/admin": [PERMISSIONS.USER_MANAGE],
	"/dashboard/analytics": [PERMISSIONS.ANALYTICS_VIEW],

	// Business routes
	"/business/create": [PERMISSIONS.BUSINESS_CREATE],
	"/business/*/edit": [PERMISSIONS.BUSINESS_UPDATE],
	"/business/*/manage": [PERMISSIONS.BUSINESS_MANAGE],

	// Admin routes
	"/admin": [PERMISSIONS.USER_MANAGE],
	"/admin/users": [PERMISSIONS.USER_MANAGE],
	"/admin/businesses": [PERMISSIONS.BUSINESS_MODERATE],
	"/admin/reviews": [PERMISSIONS.REVIEW_MODERATE],
	"/admin/analytics": [PERMISSIONS.ANALYTICS_VIEW],
	"/admin/system": [PERMISSIONS.SYSTEM_CONFIGURE],
};

export default RoleManager;
