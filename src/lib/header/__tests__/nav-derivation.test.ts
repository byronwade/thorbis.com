import { deriveNavigation } from '../nav-derivation';
import { INDUSTRY_PRESETS } from '@/config/industry-presets';
import { HeaderPrefs } from '@/types/header';

describe('Navigation Derivation', () => {
  const mockBusiness = {
    id: 'test-business',
    name: 'Test Business',
    industry: 'restaurant' as const,
    layout: 'kitchen' as const
  };

  const emptyPrefs: HeaderPrefs = {
    overrides: {},
    renameInboxToComms: null,
    unifyHomeAndDashboard: null,
    layoutPreset: null,
    pinnedItems: []
  };

  test('should derive restaurant navigation correctly', () => {
    const config = INDUSTRY_PRESETS.restaurant;
    const result = deriveNavigation(config, emptyPrefs, 'kitchen');
    
    expect(result.visible).toBeDefined();
    expect(result.overflowed).toBeDefined();
    expect(result.visible.length).toBeGreaterThan(0);
    
    // Restaurant should have POS, Orders, Menu, Kitchen prioritized
    const visibleLabels = result.visible.map(item => item.label);
    expect(visibleLabels).toContain('POS');
    expect(visibleLabels).toContain('Orders');
    expect(visibleLabels).toContain('Menu');
    expect(visibleLabels).toContain('Kitchen');
  });

  test('should handle unify home and dashboard', () => {
    const config = INDUSTRY_PRESETS.restaurant;
    const prefsWithUnify: HeaderPrefs = {
      ...emptyPrefs,
      unifyHomeAndDashboard: true
    };
    
    const result = deriveNavigation(config, prefsWithUnify, 'kitchen');
    const visibleIds = result.visible.map(item => item.id);
    
    // Should not have both home and dashboard
    expect(visibleIds.includes('home') && visibleIds.includes('dashboard')).toBe(false);
  });

  test('should handle rename inbox to comms', () => {
    const config = INDUSTRY_PRESETS.restaurant;
    const prefsWithRename: HeaderPrefs = {
      ...emptyPrefs,
      renameInboxToComms: true
    };
    
    const result = deriveNavigation(config, prefsWithRename, 'kitchen');
    const visibleLabels = result.visible.map(item => item.label);
    
    // Should have Communications, not Inbox
    expect(visibleLabels).toContain('Communications');
    expect(visibleLabels).not.toContain('Inbox');
  });

  test('should apply capability overrides', () => {
    const config = INDUSTRY_PRESETS.restaurant;
    const prefsWithOverrides: HeaderPrefs = {
      ...emptyPrefs,
      overrides: {
        pos: false,
        orders: false
      }
    };
    
    const result = deriveNavigation(config, prefsWithOverrides, 'kitchen');
    const visibleLabels = result.visible.map(item => item.label);
    
    // POS and Orders should be disabled
    expect(visibleLabels).not.toContain('POS');
    expect(visibleLabels).not.toContain('Orders');
  });

  test('should prioritize pinned items', () => {
    const config = INDUSTRY_PRESETS.restaurant;
    const prefsWithPinned: HeaderPrefs = {
      ...emptyPrefs,
      pinnedItems: ['menu', 'kitchen']
    };
    
    const result = deriveNavigation(config, prefsWithPinned, 'kitchen');
    
    // Pinned items should appear first
    const firstTwoIds = result.visible.slice(0, 2).map(item => item.id);
    expect(firstTwoIds).toContain('menu');
    expect(firstTwoIds).toContain('kitchen');
  });

  test('should handle field service industry', () => {
    const config = INDUSTRY_PRESETS.field_service;
    const result = deriveNavigation(config, emptyPrefs, 'ops');
    
    const visibleLabels = result.visible.map(item => item.label);
    
    // Field service should have Jobs, Schedule, Dispatch prioritized
    expect(visibleLabels).toContain('Jobs');
    expect(visibleLabels).toContain('Schedule');
    expect(visibleLabels).toContain('Dispatch');
    
    // Restaurant-specific items should not be present
    expect(visibleLabels).not.toContain('POS');
    expect(visibleLabels).not.toContain('Kitchen');
  });

  test('should handle retail industry', () => {
    const config = INDUSTRY_PRESETS.retail;
    const result = deriveNavigation(config, emptyPrefs, 'sales');
    
    const allLabels = [...result.visible.map(item => item.label), ...result.overflowed.map(item => item.label)];
    
    // Retail should have POS, Orders, Inventory, Loyalty (may be in overflow)
    expect(allLabels).toContain('POS');
    expect(allLabels).toContain('Orders');
    expect(allLabels).toContain('Inventory');
    expect(allLabels).toContain('Loyalty');
    
    // Field service items should not be present
    expect(allLabels).not.toContain('Jobs');
    expect(allLabels).not.toContain('Dispatch');
  });
});
