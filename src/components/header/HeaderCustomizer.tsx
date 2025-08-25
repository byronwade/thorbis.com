"use client";

import React, { useState, useEffect } from 'react';
import { X, Settings, RotateCcw, Save, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { 
  Business, 
  HeaderPrefs, 
  IndustryConfig, 
  CapabilityKey,
  NAV_REGISTRY 
} from '@/types/header';
import { INDUSTRY_PRESETS, QUICK_ACTIONS } from '@/config/industry-presets';
import { deriveNavigation } from '@/lib/header/nav-derivation';
import { useHeaderPrefs } from '@/hooks/use-header-prefs';

interface HeaderCustomizerProps {
  business: Business;
  isOpen: boolean;
  onClose: () => void;
}

export function HeaderCustomizer({ business, isOpen, onClose }: HeaderCustomizerProps) {
  const {
    prefs,
    isLoaded,
    updatePrefs,
    resetPrefs,
    applyQuickAction,
    toggleCapability,
    getEffectiveConfig
  } = useHeaderPrefs(business);

  const [previewState, setPreviewState] = useState<any>(null);

  // Generate preview when prefs change
  useEffect(() => {
    if (isLoaded && business) {
      const effectiveConfig = getEffectiveConfig();
      if (effectiveConfig) {
        const layoutPreset = prefs.layoutPreset || business.layout;
        const navigation = deriveNavigation(
          effectiveConfig,
          prefs,
          layoutPreset,
          prefs.pinnedItems || []
        );
        setPreviewState(navigation);
      }
    }
  }, [prefs, business, isLoaded, getEffectiveConfig]);

  if (!isLoaded) {
    return null;
  }

  const effectiveConfig = getEffectiveConfig();
  const industryPreset = INDUSTRY_PRESETS[business.industry];

  const getCapabilityState = (capability: CapabilityKey) => {
    if (prefs.overrides[capability] !== undefined) {
      return prefs.overrides[capability] ? 'on' : 'off';
    }
    return 'inherit';
  };

  const getCapabilityDescription = (capability: CapabilityKey) => {
    const descriptions: Record<CapabilityKey, string> = {
      home: 'Main dashboard and overview',
      dashboard: 'Business analytics and insights',
      inbox: 'Message inbox and communications',
      comms: 'Team communications and messaging',
      devices: 'IoT device management',
      reporting: 'Business reports and analytics',
      business: 'Business profile and settings',
      settings: 'System configuration',
      payroll: 'Employee payroll management',
      schedule: 'Job scheduling and calendar',
      customers: 'Customer management',
      pipeline: 'Sales pipeline and leads',
      estimates: 'Job estimates and quotes',
      invoices: 'Invoice management',
      jobs: 'Job management and tracking',
      dispatch: 'Field service dispatch',
      inventory: 'Inventory management',
      payments: 'Payment processing',
      pos: 'Point of sale system',
      orders: 'Order management',
      tables: 'Table management',
      reservations: 'Reservation system',
      menu: 'Menu management',
      staff: 'Staff management',
      suppliers: 'Supplier management',
      kitchen: 'Kitchen display system',
      tips: 'Tip management',
      loyalty: 'Customer loyalty program'
    };
    return descriptions[capability] || 'Module functionality';
  };

  const capabilityGroups = {
    core: ['home', 'dashboard', 'inbox', 'comms', 'devices', 'payroll', 'reporting', 'business', 'settings'],
    field: ['schedule', 'customers', 'pipeline', 'estimates', 'invoices', 'jobs', 'dispatch', 'inventory', 'payments'],
    restaurant: ['pos', 'orders', 'tables', 'reservations', 'menu', 'staff', 'suppliers', 'kitchen', 'tips'],
    retail: ['loyalty']
  };

  const groupLabels = {
    core: 'Core',
    field: 'Field Service',
    restaurant: 'Restaurant',
    retail: 'Retail'
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[800px] sm:max-w-[800px] overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl font-semibold">Header Settings</SheetTitle>
              <SheetDescription>
                Customize your dashboard header navigation and layout
              </SheetDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Preset Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Preset & Quick Actions
              </CardTitle>
              <CardDescription>
                Current configuration and quick optimization options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">Industry: {industryPreset?.id.replace('_', ' ').toUpperCase()}</div>
                  <div className="text-sm text-muted-foreground">Layout: {prefs.layoutPreset || business.layout}</div>
                </div>
                <Badge variant="outline">{business.industry}</Badge>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {Object.entries(QUICK_ACTIONS).map(([key, action]) => (
                  <Button
                    key={key}
                    variant="outline"
                    className="justify-start h-auto p-4"
                    onClick={() => applyQuickAction(key as keyof typeof QUICK_ACTIONS)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{action.name}</div>
                      <div className="text-sm text-muted-foreground">{action.description}</div>
                    </div>
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={resetPrefs}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">Reset to Industry Preset</div>
                    <div className="text-sm text-muted-foreground">Restore default configuration</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Modules */}
          <Card>
            <CardHeader>
              <CardTitle>Modules</CardTitle>
              <CardDescription>
                Enable or disable specific modules in your header navigation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(capabilityGroups).map(([groupKey, capabilities]) => (
                <div key={groupKey} className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                    {groupLabels[groupKey as keyof typeof groupLabels]}
                  </h4>
                  <div className="space-y-3">
                    {capabilities.map((capability) => {
                      const state = getCapabilityState(capability);
                      const isEnabled = effectiveConfig?.capabilities[capability] || false;
                      const registryItem = NAV_REGISTRY[capability];
                      
                      return (
                        <div
                          key={capability}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{registryItem?.label}</span>
                              {state === 'inherit' && (
                                <Badge variant="secondary" className="text-xs">
                                  Inherit ({isEnabled ? 'On' : 'Off'})
                                </Badge>
                              )}
                              {state === 'on' && (
                                <Badge variant="default" className="text-xs">On</Badge>
                              )}
                              {state === 'off' && (
                                <Badge variant="destructive" className="text-xs">Off</Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {getCapabilityDescription(capability)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={(checked) => toggleCapability(capability, checked)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {groupKey !== 'retail' && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Labels & Behavior */}
          <Card>
            <CardHeader>
              <CardTitle>Labels & Behavior</CardTitle>
              <CardDescription>
                Customize how navigation items are labeled and behave
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">Unify Home + Dashboard</div>
                  <div className="text-sm text-muted-foreground">
                    Combine home and dashboard into a single tab
                  </div>
                </div>
                <Switch
                  checked={prefs.unifyHomeAndDashboard ?? industryPreset?.unifyHomeAndDashboard ?? false}
                  onCheckedChange={(checked) => updatePrefs({ unifyHomeAndDashboard: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">Call Inbox "Communications"</div>
                  <div className="text-sm text-muted-foreground">
                    Rename inbox to communications for better clarity
                  </div>
                </div>
                <Switch
                  checked={prefs.renameInboxToComms ?? industryPreset?.renameInboxToComms ?? false}
                  onCheckedChange={(checked) => updatePrefs({ renameInboxToComms: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Layout Preset */}
          <Card>
            <CardHeader>
              <CardTitle>Layout Preset</CardTitle>
              <CardDescription>
                Choose a layout that prioritizes different types of operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'default', name: 'Default', description: 'Standard layout' },
                  { id: 'ops', name: 'Operations', description: 'Field operations focus' },
                  { id: 'sales', name: 'Sales', description: 'Sales and pipeline focus' },
                  { id: 'kitchen', name: 'Kitchen', description: 'Restaurant kitchen focus' }
                ].map((layout) => (
                  <Button
                    key={layout.id}
                    variant={prefs.layoutPreset === layout.id ? 'default' : 'outline'}
                    className="h-auto p-4 flex flex-col items-start"
                    onClick={() => updatePrefs({ layoutPreset: layout.id as any })}
                  >
                    <div className="font-medium">{layout.name}</div>
                    <div className="text-sm text-muted-foreground">{layout.description}</div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {previewState && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Preview
                </CardTitle>
                <CardDescription>
                  Live preview of your header configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <div className="flex items-center space-x-2 overflow-x-auto">
                    {previewState.visible.map((item: any) => (
                      <div
                        key={item.id}
                        className="px-3 py-2 bg-background border rounded text-sm font-medium whitespace-nowrap"
                      >
                        {item.label}
                      </div>
                    ))}
                    {previewState.overflowed.length > 0 && (
                      <div className="px-3 py-2 bg-primary text-primary-foreground rounded text-sm font-medium">
                        More ({previewState.overflowed.length})
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={resetPrefs}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={onClose}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
