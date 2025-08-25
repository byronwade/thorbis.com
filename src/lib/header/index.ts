/**
 * Header utility system for modular navigation management
 * Handles industry presets, progressive disclosure, role permissions, and module management
 */

import { INDUSTRY_PRESETS, ROLE_PERMISSIONS, DISCLOSURE_RULES, NavigationModule, IndustryPreset } from '../../config/industry-presets';

export interface HeaderConfig {
  preset: IndustryPreset;
  visibleModules: NavigationModule[];
  hiddenModules: NavigationModule[];
  userRole: string;
  subscriptionPlan: 'basic' | 'pro' | 'enterprise';
  isNewUser: boolean;
  customizations?: {
    pinnedModules: string[];
    hiddenModuleIds: string[];
    customOrder: string[];
  };
}

export interface LayoutConfig {
  topNav: NavigationModule[];
  moreMenu: NavigationModule[];
  quickActions: NavigationModule[];
}

export class HeaderManager {
  private config: HeaderConfig;

  constructor(config: HeaderConfig) {
    this.config = config;
  }

  /**
   * Get industry preset by ID
   */
  static getIndustryPreset(industryId: string): IndustryPreset {
    return INDUSTRY_PRESETS.find(preset => preset.id === industryId) || INDUSTRY_PRESETS[2]; // default to general
  }

  /**
   * Get all available industry presets
   */
  static getAvailablePresets(): IndustryPreset[] {
    return INDUSTRY_PRESETS;
  }

  /**
   * Filter modules based on user permissions
   */
  private filterModulesByPermissions(modules: NavigationModule[]): NavigationModule[] {
    const userPermissions = ROLE_PERMISSIONS[this.config.userRole as keyof typeof ROLE_PERMISSIONS] || ROLE_PERMISSIONS.viewer;
    
    // If user has wildcard permission, show all
    if (userPermissions.includes('*')) {
      return modules;
    }

    return modules.filter(module => {
      // Check if module has role restrictions
      if (module.roles && module.roles.length > 0) {
        return module.roles.some(role => userPermissions.includes(role));
      }
      
      // Check if user has permission for this module
      return userPermissions.includes(module.id);
    });
  }

  /**
   * Apply progressive disclosure rules
   */
  private applyProgressiveDisclosure(modules: NavigationModule[]): { visible: NavigationModule[], hidden: NavigationModule[] } {
    let visibleModules = modules;
    let hiddenModules: NavigationModule[] = [];

    // New user restrictions
    if (this.config.isNewUser) {
      const newUserRules = DISCLOSURE_RULES.newUser;
      visibleModules = modules.filter(m => newUserRules.visibleModules.includes(m.id));
      hiddenModules = modules.filter(m => !newUserRules.visibleModules.includes(m.id));
    }

    // Subscription plan restrictions
    const planRules = DISCLOSURE_RULES[`${this.config.subscriptionPlan}Plan` as keyof typeof DISCLOSURE_RULES];
    if (planRules) {
      const planHidden = modules.filter(m => planRules.hiddenModules?.includes(m.id));
      hiddenModules = [...hiddenModules, ...planHidden];
      visibleModules = visibleModules.filter(m => !planRules.hiddenModules?.includes(m.id));
    }

    // Apply custom hide/show preferences
    if (this.config.customizations) {
      const customHidden = modules.filter(m => this.config.customizations!.hiddenModuleIds.includes(m.id));
      hiddenModules = [...hiddenModules, ...customHidden];
      visibleModules = visibleModules.filter(m => !this.config.customizations!.hiddenModuleIds.includes(m.id));
    }

    return { visible: visibleModules, hidden: hiddenModules };
  }

  /**
   * Get layout configuration based on preset and user preferences
   */
  getLayoutConfig(): LayoutConfig {
    const { visible: visibleModules } = this.applyProgressiveDisclosure(
      this.filterModulesByPermissions(this.config.preset.modules)
    );

    // Start with preset default layout
    const { defaultLayout } = this.config.preset;
    
    // Apply custom ordering if available
    const moduleOrder = this.config.customizations?.customOrder || defaultLayout.topNav;
    
    // Get modules for each section
    const topNavModules = this.getModulesByIds(visibleModules, moduleOrder);
    const moreMenuIds = defaultLayout.moreMenu.filter(id => 
      !moduleOrder.includes(id) && visibleModules.some(m => m.id === id)
    );
    const moreMenuModules = this.getModulesByIds(visibleModules, moreMenuIds);
    const quickActionModules = this.getModulesByIds(visibleModules, defaultLayout.quickActions);

    // Apply pinned modules priority
    if (this.config.customizations?.pinnedModules) {
      const pinnedModules = this.getModulesByIds(visibleModules, this.config.customizations.pinnedModules);
      return {
        topNav: [...pinnedModules, ...topNavModules.filter(m => !this.config.customizations!.pinnedModules.includes(m.id))],
        moreMenu: moreMenuModules,
        quickActions: quickActionModules
      };
    }

    return {
      topNav: topNavModules,
      moreMenu: moreMenuModules,
      quickActions: quickActionModules
    };
  }

  /**
   * Get modules by their IDs in the specified order
   */
  private getModulesByIds(modules: NavigationModule[], ids: string[]): NavigationModule[] {
    return ids.map(id => modules.find(m => m.id === id)).filter(Boolean) as NavigationModule[];
  }

  /**
   * Get all visible modules organized by category
   */
  getModulesByCategory(): Record<string, NavigationModule[]> {
    const { visible: visibleModules } = this.applyProgressiveDisclosure(
      this.filterModulesByPermissions(this.config.preset.modules)
    );

    return visibleModules.reduce((acc, module) => {
      const category = module.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(module);
      return acc;
    }, {} as Record<string, NavigationModule[]>);
  }

  /**
   * Get suggested next modules for progressive disclosure
   */
  getSuggestedModules(): NavigationModule[] {
    if (this.config.isNewUser) {
      const suggestedIds = DISCLOSURE_RULES.newUser.suggestedNext;
      return this.getModulesByIds(this.config.preset.modules, suggestedIds);
    }
    return [];
  }

  /**
   * Get modules that require subscription upgrade
   */
  getUpgradePromptModules(): NavigationModule[] {
    const planRules = DISCLOSURE_RULES[`${this.config.subscriptionPlan}Plan` as keyof typeof DISCLOSURE_RULES];
    if (planRules && 'upgradePrompts' in planRules) {
      return this.getModulesByIds(this.config.preset.modules, planRules.upgradePrompts || []);
    }
    return [];
  }

  /**
   * Check if user can access a specific module
   */
  canAccessModule(moduleId: string): boolean {
    const userPermissions = ROLE_PERMISSIONS[this.config.userRole as keyof typeof ROLE_PERMISSIONS] || ROLE_PERMISSIONS.viewer;
    
    if (userPermissions.includes('*')) {
      return true;
    }

    const module = this.config.preset.modules.find(m => m.id === moduleId);
    if (!module) {
      return false;
    }

    // Check role permissions
    if (module.roles && module.roles.length > 0) {
      return module.roles.some(role => userPermissions.includes(role));
    }

    return userPermissions.includes(moduleId);
  }

  /**
   * Update user customizations
   */
  updateCustomizations(customizations: Partial<HeaderConfig['customizations']>): HeaderManager {
    const newConfig = {
      ...this.config,
      customizations: {
        ...this.config.customizations,
        ...customizations
      }
    };

    return new HeaderManager(newConfig);
  }

  /**
   * Switch to different industry preset
   */
  switchPreset(presetId: string): HeaderManager {
    const newPreset = HeaderManager.getIndustryPreset(presetId);
    const newConfig = {
      ...this.config,
      preset: newPreset
    };

    return new HeaderManager(newConfig);
  }

  /**
   * Get current configuration
   */
  getConfig(): HeaderConfig {
    return { ...this.config };
  }
}