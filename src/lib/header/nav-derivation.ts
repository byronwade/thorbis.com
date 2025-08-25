import { 
  IndustryConfig, 
  HeaderPrefs, 
  NavItem, 
  HeaderState, 
  CapabilityKey,
  NAV_REGISTRY,
  LAYOUT_PRIORITIES
} from '@/types/header';
import { LAYOUT_PRIORITIES as LAYOUT_PRIORITIES_CONFIG } from '@/config/industry-presets';

/**
 * Derivation Algorithm for Building Navigation
 * As specified in the text spec section 4
 */
export function deriveNavigation(
  config: IndustryConfig,
  prefs: HeaderPrefs,
  layoutPreset: string,
  pinnedItems: string[] = [],
  roleCapabilities?: Record<string, boolean>
): HeaderState {
  
  // Step 1: Apply prefs to get merged config
  const mergedConfig = applyPreferences(config, prefs);
  
  // Step 2: Collect candidate IDs
  const candidateIds = collectCandidateIds(mergedConfig);
  
  // Step 3: Map to NavItems using registry + label overrides
  const navItems = mapToNavItems(candidateIds, mergedConfig);
  
  // Step 4: Apply priority adjustments by layout
  const prioritizedItems = applyLayoutPriorities(navItems, layoutPreset);
  
  // Step 5: Apply pinned items priority boost
  const pinnedItemsWithPriority = applyPinnedPriority(prioritizedItems, pinnedItems);
  
  // Step 6: Sort by priority
  const sortedItems = sortByPriority(pinnedItemsWithPriority);
  
  // Step 7: Apply role-based filtering
  const filteredItems = applyRoleFiltering(sortedItems, roleCapabilities);
  
  // Step 8: Priority+ overflow (simplified for now)
  const { visible, overflowed } = applyOverflow(filteredItems);
  
  return { visible, overflowed };
}

function applyPreferences(config: IndustryConfig, prefs: HeaderPrefs): IndustryConfig {
  const mergedCapabilities = { ...config.capabilities };
  
  // Apply overrides
  Object.entries(prefs.overrides || {}).forEach(([key, value]) => {
    if (value !== undefined) {
      mergedCapabilities[key as CapabilityKey] = value;
    }
  });
  
  return {
    ...config,
    capabilities: mergedCapabilities,
    unifyHomeAndDashboard: prefs.unifyHomeAndDashboard ?? config.unifyHomeAndDashboard,
    renameInboxToComms: prefs.renameInboxToComms ?? config.renameInboxToComms
  };
}

function collectCandidateIds(config: IndustryConfig): string[] {
  const ids: string[] = [];
  
  // Core capabilities in order
  const coreOrder = ['home', 'dashboard', 'inbox', 'comms', 'devices', 'payroll', 'reporting', 'business', 'settings'];
  
  coreOrder.forEach(id => {
    if (config.capabilities[id as CapabilityKey]) {
      // Handle unify home and dashboard
      if (id === 'dashboard' && config.unifyHomeAndDashboard) {
        return; // Skip dashboard if unified
      }
      
      // Handle inbox vs comms
      if (id === 'inbox' && config.renameInboxToComms) {
        return; // Skip inbox if renamed to comms
      }
      if (id === 'comms' && !config.renameInboxToComms) {
        return; // Skip comms if not renamed
      }
      
      ids.push(id);
    }
  });
  
  // Field capabilities
  const fieldCapabilities = ['schedule', 'customers', 'pipeline', 'estimates', 'invoices', 'jobs', 'dispatch', 'inventory', 'payments'];
  fieldCapabilities.forEach(id => {
    if (config.capabilities[id as CapabilityKey]) {
      ids.push(id);
    }
  });
  
  // Restaurant capabilities
  const restaurantCapabilities = ['pos', 'orders', 'tables', 'reservations', 'menu', 'staff', 'suppliers', 'kitchen', 'tips'];
  restaurantCapabilities.forEach(id => {
    if (config.capabilities[id as CapabilityKey]) {
      ids.push(id);
    }
  });
  
  // Retail capabilities
  const retailCapabilities = ['loyalty'];
  retailCapabilities.forEach(id => {
    if (config.capabilities[id as CapabilityKey]) {
      ids.push(id);
    }
  });
  
  // De-duplicate
  return [...new Set(ids)];
}

function mapToNavItems(ids: string[], config: IndustryConfig): NavItem[] {
  return ids.map(id => {
    const registryItem = NAV_REGISTRY[id as CapabilityKey];
    if (!registryItem) {
      throw new Error(`Unknown navigation item: ${id}`);
    }
    
    // Apply label overrides
    const label = config.labelOverrides[id as CapabilityKey] || registryItem.label;
    
    return {
      ...registryItem,
      label,
      priority: 0 // Will be adjusted later
    };
  });
}

function applyLayoutPriorities(items: NavItem[], layoutPreset: string): NavItem[] {
  const priorities = LAYOUT_PRIORITIES_CONFIG[layoutPreset as keyof typeof LAYOUT_PRIORITIES_CONFIG] || {};
  
  return items.map(item => ({
    ...item,
    priority: priorities[item.capability] || 0
  }));
}

function applyPinnedPriority(items: NavItem[], pinnedItems: string[]): NavItem[] {
  return items.map(item => ({
    ...item,
    priority: pinnedItems.includes(item.id) ? item.priority - 3 : item.priority
  }));
}

function sortByPriority(items: NavItem[]): NavItem[] {
  return [...items].sort((a, b) => {
    // Sort by priority (ascending), then by label (ascending)
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return a.label.localeCompare(b.label);
  });
}

function applyRoleFiltering(items: NavItem[], roleCapabilities?: Record<string, boolean>): NavItem[] {
  if (!roleCapabilities) return items;
  
  return items.filter(item => {
    return roleCapabilities[item.capability] !== false;
  });
}

function applyOverflow(items: NavItem[]): HeaderState {
  // Simplified overflow logic - in practice this would measure container width
  // For now, show first 6 items, rest go to overflow
  const maxVisible = 6;
  
  if (items.length <= maxVisible) {
    return {
      visible: items,
      overflowed: []
    };
  }
  
  return {
    visible: items.slice(0, maxVisible),
    overflowed: items.slice(maxVisible)
  };
}

/**
 * Get sub-navigation items for a given route
 */
export function getSubNavigation(pathname: string): any[] {
  // This would be expanded with a proper sub-navigation registry
  // For now, return empty array
  return [];
}

/**
 * Export quick actions for use in the customizer
 */
export const QUICK_ACTIONS = {
  restaurantFocus: {
    name: 'Restaurant Focus',
    description: 'Optimize for restaurant operations',
    overrides: {
      jobs: false, dispatch: false, schedule: false, pipeline: false,
      pos: true, orders: true, tables: true, reservations: true, menu: true, staff: true, suppliers: true, kitchen: true, tips: true
    },
    layoutPreset: 'kitchen' as const,
    unifyHomeAndDashboard: true,
    renameInboxToComms: true
  },

  fieldOpsFocus: {
    name: 'Field Operations Focus',
    description: 'Optimize for field service operations',
    overrides: {
      jobs: true, dispatch: true, schedule: true, pipeline: true, customers: true, estimates: true, invoices: true, inventory: true, payments: true,
      pos: false, orders: false, tables: false, reservations: false, menu: false, staff: false, suppliers: false, kitchen: false, tips: false
    },
    layoutPreset: 'ops' as const,
    unifyHomeAndDashboard: false,
    renameInboxToComms: false
  },

  retailFocus: {
    name: 'Retail Focus',
    description: 'Optimize for retail operations',
    overrides: {
      pos: true, orders: true, inventory: true, loyalty: true,
      jobs: false, dispatch: false, schedule: false, pipeline: false,
      tables: false, reservations: false, menu: false, staff: false, suppliers: false, kitchen: false, tips: false
    },
    layoutPreset: 'sales' as const,
    unifyHomeAndDashboard: false,
    renameInboxToComms: false
  }
};
