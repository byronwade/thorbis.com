/**
 * Hook for managing header preferences and industry presets
 * Handles user customizations, progressive disclosure, and preset switching
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { HeaderManager, HeaderConfig, LayoutConfig } from '../lib/header';
import { IndustryPreset } from '../config/industry-presets';
import { useAuth } from '../context/auth-context';

interface UseHeaderPrefsOptions {
  dashboardType?: 'business' | 'user' | 'admin' | 'academy' | 'localhub' | 'developers' | 'gofor';
  industryOverride?: string;
  enablePersistence?: boolean;
}

interface HeaderPreferences {
  industryPreset: string;
  pinnedModules: string[];
  hiddenModuleIds: string[];
  customOrder: string[];
  lastUsedModules: string[];
}

const STORAGE_KEY = 'thorbis:header-prefs';

export function useHeaderPrefs(options: UseHeaderPrefsOptions = {}) {
  const { dashboardType = 'business', industryOverride, enablePersistence = true } = options;
  const { user, userRoles } = useAuth();

  // Local state for preferences
  const [preferences, setPreferences] = useState<HeaderPreferences>({
    industryPreset: industryOverride || 'general',
    pinnedModules: [],
    hiddenModuleIds: [],
    customOrder: [],
    lastUsedModules: []
  });

  const [isNewUser, setIsNewUser] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (!enablePersistence || typeof window === 'undefined') return;

    try {
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-${dashboardType}`);
      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs);
        setPreferences(prev => ({ ...prev, ...parsed }));
      }

      // Check if user is new (first time seeing dashboard)
      const hasVisited = localStorage.getItem(`visited-${dashboardType}`);
      if (!hasVisited) {
        setIsNewUser(true);
        localStorage.setItem(`visited-${dashboardType}`, 'true');
      }
    } catch (error) {
      console.warn('Failed to load header preferences:', error);
    }
  }, [dashboardType, enablePersistence]);

  // Save preferences to localStorage
  const savePreferences = useCallback((newPrefs: Partial<HeaderPreferences>) => {
    if (!enablePersistence || typeof window === 'undefined') return;

    try {
      const updated = { ...preferences, ...newPrefs };
      setPreferences(updated);
      localStorage.setItem(`${STORAGE_KEY}-${dashboardType}`, JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save header preferences:', error);
    }
  }, [preferences, dashboardType, enablePersistence]);

  // Determine user subscription plan (you may want to get this from your auth context)
  const subscriptionPlan = useMemo(() => {
    // This should come from your actual subscription system
    // For now, we'll use a simple role-based mapping
    if (userRoles?.includes('enterprise')) return 'enterprise';
    if (userRoles?.includes('pro')) return 'pro';
    return 'basic';
  }, [userRoles]);

  // Get user role for permissions
  const userRole = useMemo(() => {
    if (userRoles?.includes('owner')) return 'owner';
    if (userRoles?.includes('manager')) return 'manager';
    if (userRoles?.includes('employee')) return 'employee';
    return 'viewer';
  }, [userRoles]);

  // Create header manager instance
  const headerManager = useMemo(() => {
    const preset = HeaderManager.getIndustryPreset(preferences.industryPreset);
    
    const config: HeaderConfig = {
      preset,
      visibleModules: [],
      hiddenModules: [],
      userRole,
      subscriptionPlan: subscriptionPlan as 'basic' | 'pro' | 'enterprise',
      isNewUser,
      customizations: {
        pinnedModules: preferences.pinnedModules,
        hiddenModuleIds: preferences.hiddenModuleIds,
        customOrder: preferences.customOrder
      }
    };

    return new HeaderManager(config);
  }, [preferences, userRole, subscriptionPlan, isNewUser]);

  // Get layout configuration
  const layoutConfig: LayoutConfig = useMemo(() => {
    return headerManager.getLayoutConfig();
  }, [headerManager]);

  // Get modules organized by category
  const modulesByCategory = useMemo(() => {
    return headerManager.getModulesByCategory();
  }, [headerManager]);

  // Get suggested modules for new users
  const suggestedModules = useMemo(() => {
    return headerManager.getSuggestedModules();
  }, [headerManager]);

  // Get modules that require upgrade
  const upgradePromptModules = useMemo(() => {
    return headerManager.getUpgradePromptModules();
  }, [headerManager]);

  // Actions for updating preferences
  const actions = useMemo(() => ({
    // Switch industry preset
    switchPreset: (presetId: string) => {
      savePreferences({ industryPreset: presetId, customOrder: [] }); // Reset custom order when switching
    },

    // Pin/unpin module
    togglePinModule: (moduleId: string) => {
      const pinnedModules = preferences.pinnedModules.includes(moduleId)
        ? preferences.pinnedModules.filter(id => id !== moduleId)
        : [...preferences.pinnedModules, moduleId];
      
      savePreferences({ pinnedModules });
    },

    // Hide/show module
    toggleHideModule: (moduleId: string) => {
      const hiddenModuleIds = preferences.hiddenModuleIds.includes(moduleId)
        ? preferences.hiddenModuleIds.filter(id => id !== moduleId)
        : [...preferences.hiddenModuleIds, moduleId];
      
      savePreferences({ hiddenModuleIds });
    },

    // Update custom navigation order
    updateOrder: (newOrder: string[]) => {
      savePreferences({ customOrder: newOrder });
    },

    // Track module usage
    recordModuleUsage: (moduleId: string) => {
      const lastUsedModules = [
        moduleId,
        ...preferences.lastUsedModules.filter(id => id !== moduleId)
      ].slice(0, 10); // Keep last 10

      savePreferences({ lastUsedModules });
    },

    // Reset to defaults
    resetToDefaults: () => {
      const preset = HeaderManager.getIndustryPreset(preferences.industryPreset);
      setPreferences({
        industryPreset: preferences.industryPreset, // Keep current preset
        pinnedModules: [],
        hiddenModuleIds: [],
        customOrder: preset.defaultLayout.topNav,
        lastUsedModules: []
      });
      
      if (enablePersistence) {
        localStorage.removeItem(`${STORAGE_KEY}-${dashboardType}`);
      }
    },

    // Mark user as no longer new
    dismissNewUserState: () => {
      setIsNewUser(false);
    }
  }), [preferences, savePreferences, enablePersistence, dashboardType]);

  // Check if user can access specific module
  const canAccessModule = useCallback((moduleId: string) => {
    return headerManager.canAccessModule(moduleId);
  }, [headerManager]);

  // Get available industry presets
  const availablePresets = useMemo(() => {
    return HeaderManager.getAvailablePresets();
  }, []);

  return {
    // Configuration
    currentPreset: headerManager.getConfig().preset,
    layoutConfig,
    modulesByCategory,
    suggestedModules,
    upgradePromptModules,
    availablePresets,
    
    // State
    preferences,
    isNewUser,
    userRole,
    subscriptionPlan,
    
    // Actions
    ...actions,
    canAccessModule,
    
    // Utils
    headerManager
  };
}

