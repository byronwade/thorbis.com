"use client";

import React, { useState } from "react";
import {
  Building2,
  Plug,
  BarChart3,
  Users,
  Search,
  CreditCard,
  FileText,
  Phone,
  DollarSign,
  Truck,
  Wrench,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Zap,
  Grid3X3,
  Filter,
  Star
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Switch } from "@components/ui/switch";
import { Badge } from "@components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { useIntegrations } from "@lib/hooks/business/use-integrations";
import UnifiedDashboardLayout from "@components/shared/layouts/UnifiedDashboardLayout";

function IntegrationCard({ integration, onToggle }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success border-green-200';
      case 'setup': return 'bg-warning/10 text-warning border-yellow-200';
      case 'inactive': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-primary/10 text-primary border-primary/30';
    }
  };

  const getIcon = (type) => {
    const iconMap = {
      field_management: Wrench,
      fleet_management: Truck,
      voip: Phone,
      crm: Users,
      analytics: BarChart3,
      payment: CreditCard,
      inventory: Grid3X3,
      accounting: FileText,
      marketing: Zap
    };
    const IconComponent = iconMap[type] || Plug;
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-2 hover:border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              {getIcon(integration.type)}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg">{integration.name}</h3>
                {integration.featured && (
                  <Badge variant="secondary" className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {integration.new && (
                  <Badge className="text-xs bg-success">New</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {integration.description}
              </p>
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <span>Provider: {integration.provider}</span>
                <span>•</span>
                <span>Version: {integration.version}</span>
              </div>
              {integration.capabilities && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {integration.capabilities.slice(0, 3).map((cap, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {cap}
                    </Badge>
                  ))}
                  {integration.capabilities.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{integration.capabilities.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end space-y-3">
            <Badge className={`text-xs ${getStatusColor(integration.status)}`}>
              {integration.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
              {integration.status === 'setup' && <AlertCircle className="h-3 w-3 mr-1" />}
              {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
            </Badge>
            <Switch 
              checked={integration.enabled} 
              onCheckedChange={() => onToggle(integration.id)}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>
        
        {integration.enabled && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>Last sync: {integration.lastSync || 'Never'}</span>
                {integration.health && (
                  <span className={`flex items-center ${
                    integration.health === 'healthy' ? 'text-success' : 'text-warning'
                  }`}>
                    <div className={`h-2 w-2 rounded-full mr-1 ${
                      integration.health === 'healthy' ? 'bg-success' : 'bg-warning'
                    }`} />
                    {integration.health}
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Configure
                </Button>
                {integration.setupRequired && (
                  <Button size="sm">
                    Complete Setup
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CategorySection({ title, icon: Icon, description, integrations, onToggle, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 pb-2 border-b">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {integrations.map((integration) => (
          <IntegrationCard 
            key={integration.id} 
            integration={integration} 
            onToggle={onToggle}
          />
        ))}
      </div>
      {children}
    </div>
  );
}

export default function EnhancedSettingsPage() {
  return (
    <UnifiedDashboardLayout dashboardType="business">
      <div className="w-full space-y-8">
        <SettingsContent />
      </div>
    </UnifiedDashboardLayout>
  );
}

function SettingsContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const { pendingChanges, filteredFeatures, handleFeatureToggle, saveChanges, getFeatureStatus } = useIntegrations();

  // Enhanced integrations data with new fleet management and field management
  const [integrations, setIntegrations] = useState({
    // Business Operations (Primary)
    field_management: {
      id: 'field_management',
      name: 'Field Service Management',
      description: 'Complete field service operations with job scheduling, technician dispatch, and mobile workforce management',
      provider: 'Thorbis',
      version: '2.0.0',
      type: 'field_management',
      category: 'operations',
      enabled: true,
      status: 'active',
      featured: true,
      new: false,
      lastSync: '2 minutes ago',
      health: 'healthy',
      capabilities: ['scheduling', 'dispatch', 'tracking', 'mobile', 'reporting'],
      setupRequired: false
    },
    fleet_management: {
      id: 'fleet_management',
      name: 'Fleet Management',
      description: 'Advanced vehicle tracking, maintenance scheduling, fuel monitoring, and driver management system',
      provider: 'Thorbis',
      version: '1.0.0',
      type: 'fleet_management',
      category: 'operations',
      enabled: false,
      status: 'setup',
      featured: true,
      new: true,
      lastSync: null,
      health: null,
      capabilities: ['gps_tracking', 'maintenance', 'fuel_monitoring', 'driver_management', 'geofencing'],
      setupRequired: true
    },
    
    // Communication
    voip: {
      id: 'voip',
      name: 'VoIP Phone System',
      description: 'Unified calling, recordings, and call routing integrated with CRM and job management',
      provider: 'Generic',
      version: '1.5.0',
      type: 'voip',
      category: 'communication',
      enabled: true,
      status: 'active',
      featured: false,
      new: false,
      lastSync: '1 hour ago',
      health: 'healthy',
      capabilities: ['calling', 'recording', 'routing', 'crm_integration'],
      setupRequired: false
    },
    
    // Business Management
    crm: {
      id: 'crm',
      name: 'Customer Relationship Management',
      description: 'Complete customer lifecycle management with contact management and communication history',
      provider: 'HubSpot',
      version: '3.2.1',
      type: 'crm',
      category: 'business',
      enabled: true,
      status: 'active',
      featured: false,
      new: false,
      lastSync: '30 minutes ago',
      health: 'healthy',
      capabilities: ['contact_management', 'lead_tracking', 'automation', 'reporting'],
      setupRequired: false
    },
    
    // Analytics & Reporting
    analytics: {
      id: 'analytics',
      name: 'Advanced Analytics',
      description: 'Comprehensive business analytics with custom dashboards and automated reporting',
      provider: 'Google Analytics',
      version: '4.0.0',
      type: 'analytics',
      category: 'analytics',
      enabled: false,
      status: 'inactive',
      featured: false,
      new: false,
      lastSync: null,
      health: null,
      capabilities: ['reporting', 'dashboards', 'automation', 'export'],
      setupRequired: true
    },
    
    // Financial
    payment: {
      id: 'payment',
      name: 'Payment Processing',
      description: 'Secure payment processing with subscription management and automated billing',
      provider: 'Stripe',
      version: '2.1.0',
      type: 'payment',
      category: 'financial',
      enabled: true,
      status: 'active',
      featured: false,
      new: false,
      lastSync: '5 minutes ago',
      health: 'healthy',
      capabilities: ['processing', 'subscriptions', 'automation', 'security'],
      setupRequired: false
    },
    
    accounting: {
      id: 'accounting',
      name: 'Accounting Integration',
      description: 'Automated bookkeeping with invoice generation and financial reporting',
      provider: 'QuickBooks',
      version: '1.8.0',
      type: 'accounting',
      category: 'financial',
      enabled: false,
      status: 'setup',
      featured: false,
      new: false,
      lastSync: null,
      health: null,
      capabilities: ['bookkeeping', 'invoicing', 'reporting', 'tax_management'],
      setupRequired: true
    }
  });

  const toggleIntegration = (integrationId) => {
    setIntegrations(prev => ({
      ...prev,
      [integrationId]: {
        ...prev[integrationId],
        enabled: !prev[integrationId].enabled,
        status: !prev[integrationId].enabled ? 'setup' : 'inactive'
      }
    }));
  };

  const categories = {
    all: { name: 'All Integrations', icon: Grid3X3 },
    operations: { name: 'Operations', icon: Wrench },
    communication: { name: 'Communication', icon: Phone },
    business: { name: 'Business Management', icon: Building2 },
    financial: { name: 'Financial', icon: DollarSign },
    analytics: { name: 'Analytics', icon: BarChart3 }
  };

  const filteredIntegrations = Object.values(integrations).filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || integration.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const integrationsByCategory = Object.entries(categories).reduce((acc, [key, category]) => {
    if (key === 'all') return acc;
    acc[key] = filteredIntegrations.filter(integration => integration.category === key);
    return acc;
  }, {});

  const enabledCount = Object.values(integrations).filter(i => i.enabled).length;
  const totalCount = Object.values(integrations).length;

  return (
    		<div className="w-full space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Integration Center</h1>
            <p className="text-muted-foreground">
              Connect and manage your business tools and services
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="text-sm">
              {enabledCount} of {totalCount} enabled
            </Badge>
            <Button>
              <ExternalLink className="h-4 w-4 mr-2" />
              Browse Marketplace
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
                <Input
                  placeholder="Search integrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {Object.entries(categories).map(([key, category]) => {
            const Icon = category.icon;
            return (
              <TabsTrigger key={key} value={key} className="flex items-center space-x-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* All Integrations */}
        <TabsContent value="all" className="space-y-8">
          {Object.entries(integrationsByCategory).map(([categoryKey, categoryIntegrations]) => {
            if (categoryIntegrations.length === 0) return null;
            const category = categories[categoryKey];
            return (
              <CategorySection
                key={categoryKey}
                title={category.name}
                icon={category.icon}
                description={`Manage your ${category.name.toLowerCase()} integrations`}
                integrations={categoryIntegrations}
                onToggle={toggleIntegration}
              />
            );
          })}
        </TabsContent>

        {/* Individual Category Tabs */}
        {Object.entries(categories).map(([key, category]) => {
          if (key === 'all') return null;
          const categoryIntegrations = integrationsByCategory[key] || [];
          
          return (
            <TabsContent key={key} value={key} className="space-y-6">
              <CategorySection
                title={category.name}
                icon={category.icon}
                description={`Manage your ${category.name.toLowerCase()} integrations`}
                integrations={categoryIntegrations}
                onToggle={toggleIntegration}
              >
                {categoryIntegrations.length === 0 && (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <category.icon className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-2">No {category.name} integrations</h3>
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        {searchTerm 
                          ? `No integrations match "${searchTerm}" in this category.`
                          : `Browse our marketplace to find ${category.name.toLowerCase()} integrations.`
                        }
                      </p>
                      <Button>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Browse {category.name}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </CategorySection>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium">Active Integrations</p>
                <p className="text-2xl font-bold">{enabledCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Plug className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Total Available</p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <AlertCircle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium">Setup Required</p>
                <p className="text-2xl font-bold">
                  {Object.values(integrations).filter(i => i.setupRequired).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Star className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Featured</p>
                <p className="text-2xl font-bold">
                  {Object.values(integrations).filter(i => i.featured).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
