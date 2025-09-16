/**
 * Portal Theme Demo Page
 * Demonstrates the theming system and customization capabilities
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Palette,
  Monitor,
  Smartphone,
  Tablet,
  Sun,
  Moon,
  Contrast,
  Home,
  Car,
  Store,
  Utensils,
  Settings,
  Eye,
  RefreshCw
} from 'lucide-react';
import { PortalThemeProvider, usePortalTheme } from '@/components/portals/shared/PortalThemeProvider';
import { PortalThemeCustomizer } from '@/components/portals/shared/PortalThemeCustomizer';
import { PortalHeader } from '@/components/portals/shared/PortalHeader';
import { PortalFooter } from '@/components/portals/shared/PortalFooter';
import AutoPortalDashboard from '@/components/portals/auto/AutoPortalDashboard';
import RetailPortalDashboard from '@/components/portals/retail/RetailPortalDashboard';
import HomeServicesPortalDashboard from '@/components/portals/hs/HomeServicesPortalDashboard';

interface ThemePreviewProps {
  portalType: 'restaurant' | 'auto' | 'retail' | 'hs';
  isActive: boolean;
}

function ThemePreview({ portalType, isActive }: ThemePreviewProps) {
  const mockCustomer = {
    id: 'cust_demo_123',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-123-4567',
    company_name: 'Demo Customer',
    customer_type: 'residential' as const,
  };

  const mockPortalAccess = {
    id: 'access_demo_123',
    customer_id: 'cust_demo_123',
    organization_id: 'org_demo_123',
    access_token: 'demo_token',
    is_active: true,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    permissions: {
      can_view_orders: true,
      can_place_orders: true,
      can_view_history: true,
      can_manage_account: true,
      can_receive_notifications: true,
    },
    branding: Record<string, unknown>,
    customer: mockCustomer,
  };

  const getPortalIcon = () => {
    switch (portalType) {
      case 'restaurant': return <Utensils className="h-4 w-4" />;
      case 'auto': return <Car className="h-4 w-4" />;
      case 'retail': return <Store className="h-4 w-4" />;
      case 'hs': return <Home className="h-4 w-4" />;
    }
  };

  const getPortalName = () => {
    switch (portalType) {
      case 'restaurant': return 'Restaurant Portal';
      case 'auto': return 'Auto Services Portal';
      case 'retail': return 'Retail Portal';
      case 'hs': return 'Home Services Portal';
    }
  };

  const renderDashboard = () => {
    switch (portalType) {
      case 'auto':
        return <AutoPortalDashboard portalAccess={mockPortalAccess} customer={mockCustomer} accessToken="demo_token" />;
      case 'retail':
        return <RetailPortalDashboard portalAccess={mockPortalAccess} customer={mockCustomer} accessToken="demo_token" />;
      case 'hs':
        return <HomeServicesPortalDashboard portalAccess={mockPortalAccess} customer={mockCustomer} accessToken="demo_token" />;
      default:
        return (
          <div className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Restaurant Portal Dashboard</h3>
            <p className="text-muted-foreground">Dashboard component coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className={'border rounded-lg overflow-hidden ${isActive ? 'ring-2 ring-blue-500' : '}'}>
      <div className="bg-neutral-50 dark:bg-neutral-900 p-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getPortalIcon()}
            <span className="font-medium text-sm">{getPortalName()}</span>
          </div>
          <Badge variant={isActive ? 'default' : 'outline'} size="sm">
            {isActive ? 'Active' : 'Preview'}
          </Badge>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        <PortalHeader
          customerName="John Doe"
          portalType={portalType}
          permissions={mockPortalAccess.permissions}
        />
        
        <div className="p-4">
          {renderDashboard()}
        </div>
        
        <PortalFooter
          portalType={portalType}
          organizationId="org_demo_123"
        />
      </div>
    </div>
  );
}

function ThemeDemoContent() {
  const { theme, branding, updateBranding, resetTheme, toggleDarkMode, toggleHighContrast } = usePortalTheme();
  const [selectedPortal, setSelectedPortal] = useState<'restaurant' | 'auto' | 'retail' | 'hs'>('hs');
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const portalTypes = [
    { id: 'restaurant' as const, name: 'Restaurant', icon: <Utensils className="h-4 w-4" /> },
    { id: 'auto' as const, name: 'Auto Services', icon: <Car className="h-4 w-4" /> },
    { id: 'retail' as const, name: 'Retail', icon: <Store className="h-4 w-4" /> },
    { id: 'hs' as const, name: 'Home Services', icon: <Home className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Portal Theme System Demo</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Explore and customize the appearance of customer portals across different industries
          </p>
          
          <Alert className="mb-6">
            <Palette className="h-4 w-4" />
            <AlertTitle>Interactive Demo</AlertTitle>
            <AlertDescription>
              This demo showcases the complete theming system. Changes made here are for demonstration only and won't be saved.
            </AlertDescription>
          </Alert>
        </div>

        {/* Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Demo Controls
            </CardTitle>
            <CardDescription>
              Switch between portal types and view modes to see the theming in action
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Portal Type Selector */}
              <div>
                <label className="text-sm font-medium mb-2 block">Portal Type</label>
                <Select value={selectedPortal} onValueChange={setSelectedPortal}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {portalTypes.map((portal) => (
                      <SelectItem key={portal.id} value={portal.id}>
                        <div className="flex items-center gap-2">
                          {portal.icon}
                          {portal.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* View Mode Selector */}
              <div>
                <label className="text-sm font-medium mb-2 block">View Mode</label>
                <div className="flex gap-1">
                  <Button
                    variant={viewMode === 'desktop' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('desktop')}
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'tablet' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('tablet')}
                  >
                    <Tablet className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'mobile' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('mobile')}
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Theme Controls */}
              <div>
                <label className="text-sm font-medium mb-2 block">Theme Options</label>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={toggleDarkMode}>
                    <Moon className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={toggleHighContrast}>
                    <Contrast className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={resetTheme}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="text-sm font-medium mb-2 block">Quick Presets</label>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateBranding({ primary_color: '#FF6B35' })}
                  >
                    Orange
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateBranding({ primary_color: '#059669' })}
                  >
                    Green
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateBranding({ primary_color: '#DC2626' })}
                  >
                    Red
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Demo Area */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Customization Panel */}
          <div className="xl:col-span-2">
            <PortalThemeCustomizer
              portalType={selectedPortal}
              organizationId="demo_org_123"
              onSave={(branding) => {
                console.log('Theme saved:', branding);
                alert('Theme configuration saved! (Demo only)');
              }}
              onPreview={(branding) => {
                console.log('Theme preview:', branding);
              }}
            />
          </div>

          {/* Live Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Live Preview
                </CardTitle>
                <CardDescription>
                  Real-time preview of your portal customizations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={'${viewMode === 'mobile' ? 'max-w-sm' : viewMode === 'tablet' ? 'max-w-md' : 'max-w-full'} mx-auto'}>
                  <ThemePreview portalType={selectedPortal} isActive={true} />
                </div>
              </CardContent>
            </Card>

            {/* Theme Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Theme</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {theme && (
                  <>
                    <div className="text-sm">
                      <span className="font-medium">Theme ID:</span>
                      <br />
                      <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                        {theme.id}
                      </code>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Portal Type:</span>
                      <br />
                      <Badge variant="outline" className="mt-1">
                        {theme.portal_type}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Primary Color:</span>
                      <br />
                      <div className="flex items-center gap-2 mt-1">
                        <div 
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: branding.primary_color }}
                        />
                        <code className="text-xs">{branding.primary_color}</code>
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Company Name:</span>
                      <br />
                      <span className="text-muted-foreground">
                        {branding.company_name || 'Default Portal Name'}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* All Portal Types Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">All Portal Types</CardTitle>
                <CardDescription>
                  See how your theme looks across different industries
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {portalTypes.map((portal) => (
                  <div key={portal.id} className="scale-75 origin-top-left">
                    <ThemePreview
                      portalType={portal.id}
                      isActive={portal.id === selectedPortal}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ThemeDemoPage() {
  return (
    <PortalThemeProvider
      portalType="hs"
      organizationId="demo_org_123"
      initialBranding={{
        company_name: 'Demo Company',
        welcome_message: 'Welcome to our themed portal demo',
        show_logo: true,
        primary_color: '#2563EB',
        secondary_color: '#6B7280',
        accent_color: '#F59E0B',
      }}
    >
      <ThemeDemoContent />
    </PortalThemeProvider>
  );
}