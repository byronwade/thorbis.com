/**
 * Smart Navigation Resolver
 * Intelligent navigation system that adapts based on industry, role, usage, and user preferences
 */

import { BUSINESS_MODULES, INDUSTRY_PRESETS, USER_ROLES } from "../../config/navigation/industry-presets";

/**
 * Navigation usage tracking for intelligent recommendations
 */
export class NavigationUsageTracker {
  constructor() {
    this.storageKey = 'navigation_usage';
    this.sessionKey = 'navigation_session';
  }

  /**
   * Track module access
   */
  trackAccess(moduleId, userId, businessId) {
    try {
      const usage = this.getUsageData();
      const key = `${businessId}_${userId}_${moduleId}`;
      const now = Date.now();
      const today = new Date().toDateString();

      if (!usage[key]) {
        usage[key] = {
          moduleId,
          userId,
          businessId,
          totalAccesses: 0,
          dailyAccesses: {},
          lastAccessed: null,
          avgTimeSpent: 0
        };
      }

      usage[key].totalAccesses++;
      usage[key].dailyAccesses[today] = (usage[key].dailyAccesses[today] || 0) + 1;
      usage[key].lastAccessed = now;

      this.saveUsageData(usage);
    } catch (error) {
      console.warn('Failed to track navigation usage:', error);
    }
  }

  /**
   * Get usage statistics for a user
   */
  getUsageStats(userId, businessId, days = 30) {
    try {
      const usage = this.getUsageData();
      const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
      const stats = [];

      Object.entries(usage).forEach(([key, data]) => {
        if (data.userId === userId && data.businessId === businessId && data.lastAccessed > cutoff) {
          const recentAccesses = Object.entries(data.dailyAccesses)
            .filter(([date]) => new Date(date).getTime() > cutoff)
            .reduce((sum, [, count]) => sum + count, 0);

          stats.push({
            moduleId: data.moduleId,
            totalAccesses: data.totalAccesses,
            recentAccesses,
            lastAccessed: data.lastAccessed,
            score: this.calculateUsageScore(data, days)
          });
        }
      });

      return stats.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.warn('Failed to get usage stats:', error);
      return [];
    }
  }

  /**
   * Calculate usage score for ranking
   */
  calculateUsageScore(data, days) {
    const now = Date.now();
    const recentWeight = 0.7;
    const frequencyWeight = 0.3;

    // Recency score (higher for recently accessed)
    const daysSinceAccess = (now - data.lastAccessed) / (24 * 60 * 60 * 1000);
    const recencyScore = Math.max(0, 1 - (daysSinceAccess / days)) * recentWeight;

    // Frequency score
    const avgDailyAccesses = data.totalAccesses / Math.max(1, 
      Object.keys(data.dailyAccesses).length);
    const frequencyScore = Math.min(1, avgDailyAccesses / 5) * frequencyWeight;

    return recencyScore + frequencyScore;
  }

  /**
   * Get stored usage data
   */
  getUsageData() {
    try {
      if (typeof window !== 'undefined') {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : {};
      }
      return {};
    } catch (error) {
      return {};
    }
  }

  /**
   * Save usage data
   */
  saveUsageData(data) {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
      }
    } catch (error) {
      console.warn('Failed to save usage data:', error);
    }
  }
}

/**
 * Business Navigation Configuration
 * Manages per-business navigation settings
 */
export class BusinessNavigationConfig {
  constructor(businessId) {
    this.businessId = businessId;
    this.storageKey = `nav_config_${businessId}`;
  }

  /**
   * Get navigation configuration for business
   */
  getConfig() {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          return JSON.parse(stored);
        }
      }

      // Return default configuration
      return this.getDefaultConfig();
    } catch (error) {
      return this.getDefaultConfig();
    }
  }

  /**
   * Save navigation configuration
   */
  saveConfig(config) {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify({
          ...config,
          lastUpdated: Date.now()
        }));
      }
    } catch (error) {
      console.warn('Failed to save navigation config:', error);
    }
  }

  /**
   * Default configuration based on field service
   */
  getDefaultConfig() {
    return {
      industryPreset: "field-service",
      enabledModules: INDUSTRY_PRESETS["field-service"].modules,
      pinnedModules: {},
      hiddenModules: {},
      customModules: [],
      smartRecommendations: true,
      maxHeaderItems: 7,
      lastUpdated: Date.now()
    };
  }

  /**
   * Update pinned modules for a role
   */
  updatePinnedModules(role, moduleIds) {
    const config = this.getConfig();
    config.pinnedModules[role] = moduleIds;
    this.saveConfig(config);
    return config;
  }

  /**
   * Toggle module visibility for a role
   */
  toggleModuleVisibility(role, moduleId, visible) {
    const config = this.getConfig();
    
    if (!config.hiddenModules[role]) {
      config.hiddenModules[role] = [];
    }

    if (visible) {
      config.hiddenModules[role] = config.hiddenModules[role].filter(id => id !== moduleId);
    } else {
      if (!config.hiddenModules[role].includes(moduleId)) {
        config.hiddenModules[role].push(moduleId);
      }
    }

    this.saveConfig(config);
    return config;
  }
}

/**
 * Smart Navigation Resolver
 * Main class that resolves navigation based on all factors
 */
export class SmartNavigationResolver {
  constructor(businessId) {
    this.businessId = businessId;
    this.usageTracker = new NavigationUsageTracker();
    this.businessConfig = new BusinessNavigationConfig(businessId);
  }

  /**
   * Resolve navigation for a specific user and role
   */
  resolveNavigation(userId, userRole, options = {}) {
    const {
      includeUsageStats = true,
      maxHeaderItems = 7,
      includeSubNav = true
    } = options;

    // Get business configuration
    const config = this.businessConfig.getConfig();
    const industryPreset = INDUSTRY_PRESETS[config.industryPreset] || INDUSTRY_PRESETS["field-service"];
    
    // Get user role permissions
    const roleConfig = USER_ROLES[userRole] || USER_ROLES.TECHNICIAN;

    // Get available modules for this role
    const availableModules = this.getAvailableModules(config, userRole, roleConfig);

    // Get usage statistics if enabled
    let usageStats = [];
    if (includeUsageStats) {
      usageStats = this.usageTracker.getUsageStats(userId, this.businessId);
    }

    // Resolve header navigation (pinned + recommended)
    const headerNavigation = this.resolveHeaderNavigation(
      availableModules,
      config,
      userRole,
      usageStats,
      maxHeaderItems
    );

    // Resolve app launcher (all available modules not in header)
    const appLauncherModules = this.resolveAppLauncher(
      availableModules,
      headerNavigation,
      usageStats
    );

    return {
      header: headerNavigation,
      appLauncher: appLauncherModules,
      config: {
        industryPreset: config.industryPreset,
        userRole,
        canManageNavigation: roleConfig.canManageNavigation,
        smartRecommendations: config.smartRecommendations
      },
      stats: {
        totalModules: availableModules.length,
        headerItems: headerNavigation.length,
        appLauncherItems: appLauncherModules.length
      }
    };
  }

  /**
   * Get available modules for user role
   */
  getAvailableModules(config, userRole, roleConfig) {
    const industryPreset = INDUSTRY_PRESETS[config.industryPreset] || INDUSTRY_PRESETS["field-service"];
    const allModules = Object.values(BUSINESS_MODULES);
    const enabledModules = new Set(config.enabledModules);
    const hiddenModules = new Set(config.hiddenModules[userRole] || []);

    return allModules
      .filter(module => {
        // Must be enabled for business
        if (!enabledModules.has(module.id)) return false;
        
        // Must not be hidden for this role
        if (hiddenModules.has(module.id)) return false;

        // Check role permissions
        if (roleConfig.canAccessAllModules) return true;
        
        return module.defaultRoles.includes(userRole);
      })
      .map(module => {
        // Update href based on industry base path
        let href = module.href;
        if (industryPreset.basePath && industryPreset.modules?.includes(module.id)) {
          // Replace the base path for industry-specific modules
          href = href.replace('/dashboard/business', industryPreset.basePath);
        }

        return {
          ...module,
          href,
          usage: null, // Will be populated with usage stats
          isShared: industryPreset.sharedModules?.includes(module.id) || false
        };
      });
  }

  /**
   * Resolve header navigation items
   */
  resolveHeaderNavigation(availableModules, config, userRole, usageStats, maxItems) {
    const pinnedModuleIds = new Set(config.pinnedModules[userRole] || []);
    const usageMap = new Map(usageStats.map(stat => [stat.moduleId, stat]));

    // Start with explicitly pinned modules
    const pinnedModules = availableModules
      .filter(module => pinnedModuleIds.has(module.id))
      .map(module => ({
        ...module,
        usage: usageMap.get(module.id) || null,
        isPinned: true,
        reason: 'pinned'
      }));

    // Add recommended modules based on usage and industry defaults
    const remainingSlots = maxItems - pinnedModules.length;
    if (remainingSlots > 0 && config.smartRecommendations) {
      const industryPreset = INDUSTRY_PRESETS[config.industryPreset];
      const industryPinned = new Set(industryPreset?.pinnedModules || []);

      const candidates = availableModules
        .filter(module => 
          !pinnedModuleIds.has(module.id) && // Not already pinned
          (industryPinned.has(module.id) || usageMap.has(module.id)) // Industry default or has usage
        )
        .map(module => {
          const usage = usageMap.get(module.id);
          const isIndustryDefault = industryPinned.has(module.id);
          const usageScore = usage ? usage.score : 0;
          const industryScore = isIndustryDefault ? 0.5 : 0;
          
          return {
            ...module,
            usage,
            isPinned: false,
            reason: usage ? 'frequently-used' : 'industry-default',
            score: usageScore + industryScore
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, remainingSlots);

      pinnedModules.push(...candidates);
    }

    // Ensure core modules (like dashboard) are always included
    const coreModules = availableModules.filter(module => 
      module.isCore && 
      !pinnedModules.some(pinned => pinned.id === module.id)
    );

    if (coreModules.length > 0) {
      // Remove least important items to make room for core modules
      const nonCoreCount = pinnedModules.filter(m => !m.isCore).length;
      const coreCount = coreModules.length;
      
      if (nonCoreCount + coreCount > maxItems) {
        const toRemove = (nonCoreCount + coreCount) - maxItems;
        const nonCoreModules = pinnedModules
          .filter(m => !m.isCore)
          .sort((a, b) => (a.usage?.score || 0) - (b.usage?.score || 0));
        
        // Remove the least used non-core modules
        for (let i = 0; i < toRemove && i < nonCoreModules.length; i++) {
          const index = pinnedModules.findIndex(m => m.id === nonCoreModules[i].id);
          if (index >= 0) {
            pinnedModules.splice(index, 1);
          }
        }
      }

      // Add core modules
      coreModules.forEach(module => {
        pinnedModules.push({
          ...module,
          usage: usageMap.get(module.id) || null,
          isPinned: false,
          reason: 'core-module'
        });
      });
    }

    // Sort final header items by priority and usage
    return pinnedModules
      .sort((a, b) => {
        // Core modules first
        if (a.isCore && !b.isCore) return -1;
        if (b.isCore && !a.isCore) return 1;
        
        // Then by usage score
        const aScore = a.usage?.score || 0;
        const bScore = b.usage?.score || 0;
        if (aScore !== bScore) return bScore - aScore;
        
        // Finally by module priority
        return (a.priority || 50) - (b.priority || 50);
      })
      .slice(0, maxItems);
  }

  /**
   * Resolve app launcher modules
   */
  resolveAppLauncher(availableModules, headerModules, usageStats) {
    const headerModuleIds = new Set(headerModules.map(m => m.id));
    const usageMap = new Map(usageStats.map(stat => [stat.moduleId, stat]));

    const appLauncherModules = availableModules
      .filter(module => !headerModuleIds.has(module.id))
      .map(module => ({
        ...module,
        usage: usageMap.get(module.id) || null
      }));

    // Group modules by category for better organization
    const grouped = {};
    appLauncherModules.forEach(module => {
      if (!grouped[module.category]) {
        grouped[module.category] = [];
      }
      grouped[module.category].push(module);
    });

    // Sort modules within each category by usage then priority
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => {
        const aScore = a.usage?.score || 0;
        const bScore = b.usage?.score || 0;
        if (aScore !== bScore) return bScore - aScore;
        return (a.priority || 50) - (b.priority || 50);
      });
    });

    return grouped;
  }

  /**
   * Track module access
   */
  trackModuleAccess(moduleId, userId) {
    this.usageTracker.trackAccess(moduleId, userId, this.businessId);
  }

  /**
   * Update business configuration
   */
  updateBusinessConfig(updates) {
    const config = this.businessConfig.getConfig();
    const newConfig = { ...config, ...updates };
    this.businessConfig.saveConfig(newConfig);
    return newConfig;
  }

  /**
   * Pin/Unpin module for user role
   */
  toggleModulePin(userRole, moduleId, pinned) {
    const config = this.businessConfig.getConfig();
    const pinnedModules = new Set(config.pinnedModules[userRole] || []);

    if (pinned) {
      pinnedModules.add(moduleId);
    } else {
      pinnedModules.delete(moduleId);
    }

    return this.businessConfig.updatePinnedModules(userRole, Array.from(pinnedModules));
  }

  /**
   * Get module by ID
   */
  getModule(moduleId) {
    return BUSINESS_MODULES[moduleId] || null;
  }
}

/**
 * Utility functions for navigation management
 */
export const NavigationUtils = {
  /**
   * Get industry preset options for business setup
   */
  getIndustryOptions() {
    return Object.entries(INDUSTRY_PRESETS).map(([id, preset]) => ({
      value: id,
      label: preset.name,
      description: preset.description,
      icon: preset.icon,
      moduleCount: preset.modules.length
    }));
  },

  /**
   * Get role options
   */
  getRoleOptions() {
    return Object.entries(USER_ROLES).map(([id, role]) => ({
      value: id,
      label: role.label,
      level: role.level,
      canManageNavigation: role.canManageNavigation
    }));
  },

  /**
   * Format module for display
   */
  formatModuleForDisplay(module, usage = null) {
    return {
      id: module.id,
      label: module.label,
      icon: module.icon,
      href: module.href,
      category: module.category,
      description: module.description,
      usage: usage ? {
        totalAccesses: usage.totalAccesses,
        recentAccesses: usage.recentAccesses,
        lastAccessed: new Date(usage.lastAccessed).toLocaleDateString(),
        score: Math.round(usage.score * 100)
      } : null
    };
  }
};
