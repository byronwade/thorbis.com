"use client";

import React, { useState } from "react";
import {
  Building2,
  Bell,
  Plug,
  BarChart3,
  Clock,
  Shield,
  Users,
  Menu,
  X,
  Settings,
  CreditCard,
  Lock,
  FileText,
  UserCheck,
  Receipt,
  MapPin,
  Phone,
  Ticket,
  DollarSign,
  Truck,
  Search,
  ExternalLink,
  Star,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Wrench,
  Zap,
  Grid3X3,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Switch } from "@components/ui/switch";
import { Textarea } from "@components/ui/textarea";
import { Badge } from "@components/ui/badge";
import { useIntegrations } from "@lib/hooks/business/use-integrations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import IntegrationMarketplace from "@components/dashboard/business/integrations/IntegrationMarketplace";

function IntegrationCard({ integration, onToggle }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'setup': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
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
                  <Badge className="text-xs bg-green-500">New</Badge>
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
                    integration.health === 'healthy' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    <div className={`h-2 w-2 rounded-full mr-1 ${
                      integration.health === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'
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

function IntegrationCenter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("operations");

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
      setupRequired: false
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
    operations: { name: 'Operations', icon: Wrench },
    communication: { name: 'Communication', icon: Phone },
    business: { name: 'Business Management', icon: Building2 },
    financial: { name: 'Financial', icon: DollarSign },
    analytics: { name: 'Analytics', icon: BarChart3 }
  };

  const filteredIntegrations = Object.values(integrations).filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = integration.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const enabledCount = Object.values(integrations).filter(i => i.enabled).length;
  const totalCount = Object.values(integrations).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="hidden lg:block">
          <h2 className="text-2xl lg:text-3xl font-bold mb-2">Integration Center</h2>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Connect and manage your business tools and services
            </p>
            <Badge variant="outline" className="text-sm">
              {enabledCount} of {totalCount} enabled
            </Badge>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
              <Input
                placeholder="Search integrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 rounded-lg border bg-muted/30">
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

        {Object.entries(categories).map(([key, category]) => (
          <TabsContent key={key} value={key} className="space-y-4">
            <div className="grid gap-6 lg:grid-cols-1">
              {filteredIntegrations.map((integration) => (
                <IntegrationCard 
                  key={integration.id} 
                  integration={integration} 
                  onToggle={toggleIntegration}
                />
              ))}
            </div>
            
            {filteredIntegrations.length === 0 && (
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
                    Browse Marketplace
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
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

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("business");
  const { pendingChanges, filteredFeatures, handleFeatureToggle, saveChanges, getFeatureStatus } = useIntegrations();
  const [integrations, setIntegrations] = useState({
    voip: true,
    email: false,
    sms: true,
    crm: true,
    analytics: false,
    payment: true,
    inventory: false,
    shipping: true,
    accounting: false,
    marketing: true,
  });

  const toggleIntegration = (key) => {
    setIntegrations((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sections = [
    { id: "business", label: "Business Profile", icon: Building2 },
    { id: "integrations", label: "Integration Center", icon: Plug },
    { id: "marketplace", label: "Integration Marketplace", icon: Zap, new: true },
    { id: "field-service", label: "Field Service", icon: MapPin },
    { id: "fleet-management", label: "Fleet Management", icon: Truck, new: true },
    { id: "communications", label: "Communications", icon: Phone },
    { id: "ticketing", label: "Ticketing System", icon: Ticket },
    { id: "invoicing", label: "Invoicing & Estimates", icon: FileText },
    { id: "employee", label: "Employee Management", icon: UserCheck },
    { id: "payroll", label: "Payroll & Commissions", icon: DollarSign },
    { id: "time-tracking", label: "Time Tracking", icon: Clock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security & Privacy", icon: Shield },
    { id: "billing", label: "Billing & Payments", icon: CreditCard },
    { id: "team", label: "Team Management", icon: Users },
    { id: "operations", label: "Operations", icon: Settings },
    { id: "analytics", label: "Analytics & Reports", icon: BarChart3 },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Dashboard Header - consistent with other pages */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Business Settings</h1>
          <p className="text-muted-foreground">Manage your business preferences and configuration</p>
        </div>
      </div>

      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <div
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 lg:w-72 bg-card border-r border-border transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 lg:p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h1 className="text-xl lg:text-2xl font-bold">Settings</h1>
                <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Manage your business preferences</p>
            </div>

            <nav className="flex-1 p-4 lg:p-6 space-y-2 overflow-y-auto">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? "bg-muted/60 text-foreground border border-primary/30"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <div className="flex items-center justify-between flex-1">
                      <span className="font-medium text-sm lg:text-base">{section.label}</span>
                      {section.new && (
                        <Badge className="text-xs bg-green-500 ml-2">New</Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border lg:hidden">
            <div className="flex items-center gap-4 p-4">
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-4 w-4" />
              </Button>
              <h2 className="font-semibold capitalize">{sections.find((s) => s.id === activeSection)?.label}</h2>
            </div>
          </div>

          <div className="p-4 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
              {/* Business Profile Section */}
              {activeSection === "business" && (
                <div className="space-y-4 lg:space-y-6">
                  <div className="hidden lg:block">
                    <h2 className="text-2xl lg:text-3xl font-bold mb-2">Business Profile</h2>
                    <p className="text-muted-foreground">Manage your business details and branding.</p>
                  </div>

                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                        <Building2 className="h-5 w-5" />
                        Company Information
                      </CardTitle>
                      <CardDescription>Update your business details and contact information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 lg:space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="company-name">Company Name *</Label>
                          <Input id="company-name" placeholder="Acme Corporation" className="h-10" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="legal-name">Legal Business Name</Label>
                          <Input id="legal-name" placeholder="Acme Corporation LLC" className="h-10" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="industry">Industry *</Label>
                          <Select>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technology">Technology</SelectItem>
                              <SelectItem value="finance">Finance</SelectItem>
                              <SelectItem value="healthcare">Healthcare</SelectItem>
                              <SelectItem value="retail">Retail</SelectItem>
                              <SelectItem value="manufacturing">Manufacturing</SelectItem>
                              <SelectItem value="consulting">Consulting</SelectItem>
                              <SelectItem value="education">Education</SelectItem>
                              <SelectItem value="hospitality">Hospitality</SelectItem>
                              <SelectItem value="real-estate">Real Estate</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company-size">Company Size</Label>
                          <Select>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1-10">1-10 employees</SelectItem>
                              <SelectItem value="11-50">11-50 employees</SelectItem>
                              <SelectItem value="51-200">51-200 employees</SelectItem>
                              <SelectItem value="201-500">201-500 employees</SelectItem>
                              <SelectItem value="500+">500+ employees</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Company Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Brief description of your business, products, and services..."
                          className="min-h-[100px] resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Primary Phone *</Label>
                          <Input id="phone" placeholder="+1 (555) 123-4567" className="h-10" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Business Email *</Label>
                          <Input id="email" type="email" placeholder="contact@company.com" className="h-10" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <Input id="website" placeholder="https://www.company.com" className="h-10" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tax-id">Tax ID / EIN</Label>
                          <Input id="tax-id" placeholder="12-3456789" className="h-10" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Business Address *</Label>
                        <Textarea
                          id="address"
                          placeholder="123 Business St, Suite 100, City, State 12345, Country"
                          className="min-h-[80px] resize-none"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Notifications Section */}
              {activeSection === "notifications" && (
                <div className="space-y-4 lg:space-y-6">
                  <div className="hidden lg:block">
                    <h2 className="text-2xl lg:text-3xl font-bold mb-2">Notifications</h2>
                    <p className="text-muted-foreground">Configure notification preferences and alerts.</p>
                  </div>

                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                        <Bell className="h-5 w-5" />
                        Email Notifications
                      </CardTitle>
                      <CardDescription>Choose which emails you want to receive</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 lg:space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-base font-medium">New Reviews</Label>
                            <p className="text-sm text-muted-foreground">Get notified when customers leave reviews</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-base font-medium">Job Applications</Label>
                            <p className="text-sm text-muted-foreground">Receive notifications for new job applications</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-base font-medium">Partnership Requests</Label>
                            <p className="text-sm text-muted-foreground">Get notified about partnership opportunities</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-base font-medium">Platform Updates</Label>
                            <p className="text-sm text-muted-foreground">Receive updates about new features</p>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                        <Phone className="h-5 w-5" />
                        Push Notifications
                      </CardTitle>
                      <CardDescription>Manage your browser and mobile notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 lg:space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-base font-medium">Browser Notifications</Label>
                            <p className="text-sm text-muted-foreground">Show notifications in your browser</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-base font-medium">Sound Alerts</Label>
                            <p className="text-sm text-muted-foreground">Play sounds for new notifications</p>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Security Section */}
              {activeSection === "security" && (
                <div className="space-y-4 lg:space-y-6">
                  <div className="hidden lg:block">
                    <h2 className="text-2xl lg:text-3xl font-bold mb-2">Security & Privacy</h2>
                    <p className="text-muted-foreground">Protect your business data and manage access controls.</p>
                  </div>

                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                        <Lock className="h-5 w-5" />
                        Account Security
                      </CardTitle>
                      <CardDescription>Manage your account security settings and authentication</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 lg:space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Current Password</Label>
                          <Input id="current-password" type="password" placeholder="Enter current password" className="h-10" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <Input id="new-password" type="password" placeholder="Enter new password" className="h-10" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-border rounded-lg">
                          <div className="space-y-1">
                            <div className="font-medium">SMS Authentication</div>
                            <div className="text-sm text-muted-foreground">Receive codes via text message</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-border rounded-lg">
                          <div className="space-y-1">
                            <div className="font-medium">Authenticator App</div>
                            <div className="text-sm text-muted-foreground">Use Google Authenticator or similar apps</div>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Enhanced Integration Center */}
              {activeSection === "integrations" && (
                <IntegrationCenter />
              )}

              {/* Integration Marketplace */}
              {activeSection === "marketplace" && (
                <div className="space-y-4 lg:space-y-6">
                  <div className="hidden lg:block">
                    <h2 className="text-2xl lg:text-3xl font-bold mb-2">
                      Integration Marketplace
                      <Badge className="ml-3 bg-green-500">New</Badge>
                    </h2>
                    <p className="text-muted-foreground">Discover and install powerful integrations to supercharge your business</p>
                  </div>
                  <IntegrationMarketplace />
                </div>
              )}

              {/* Fleet Management Section */}
              {activeSection === "fleet-management" && (
                <div className="space-y-4 lg:space-y-6">
                  <div className="hidden lg:block">
                    <h2 className="text-2xl lg:text-3xl font-bold mb-2">
                      Fleet Management
                      <Badge className="ml-3 bg-green-500">New</Badge>
                    </h2>
                    <p className="text-muted-foreground">Configure your fleet operations, vehicle tracking, and driver management.</p>
                  </div>

                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                        <Truck className="h-5 w-5" />
                        Vehicle Management
                      </CardTitle>
                      <CardDescription>Manage your fleet vehicles and tracking settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 lg:space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>GPS Tracking Interval</Label>
                          <Select defaultValue="60">
                            <SelectTrigger className="h-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">Every 30 seconds</SelectItem>
                              <SelectItem value="60">Every 1 minute</SelectItem>
                              <SelectItem value="120">Every 2 minutes</SelectItem>
                              <SelectItem value="300">Every 5 minutes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Speed Limit Threshold (mph)</Label>
                          <Input type="number" defaultValue="80" min="1" max="200" className="h-10" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Idle Time Alert (minutes)</Label>
                          <Input type="number" defaultValue="15" min="5" max="60" className="h-10" />
                        </div>
                        <div className="space-y-2">
                          <Label>Geofence Radius (meters)</Label>
                          <Input type="number" defaultValue="500" min="50" max="5000" className="h-10" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium">Fleet Features</h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                            <div className="space-y-1">
                              <div className="font-medium">Maintenance Alerts</div>
                              <div className="text-sm text-muted-foreground">Get notified about scheduled maintenance</div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                            <div className="space-y-1">
                              <div className="font-medium">Fuel Tracking</div>
                              <div className="text-sm text-muted-foreground">Monitor fuel consumption and costs</div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                            <div className="space-y-1">
                              <div className="font-medium">Driver Scorecards</div>
                              <div className="text-sm text-muted-foreground">Track driver performance metrics</div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                            <div className="space-y-1">
                              <div className="font-medium">Real-time Tracking</div>
                              <div className="text-sm text-muted-foreground">Live GPS tracking for all vehicles</div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                        <Users className="h-5 w-5" />
                        Driver Management
                      </CardTitle>
                      <CardDescription>Configure driver settings and permissions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 lg:space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>License Expiry Reminders (days before)</Label>
                          <Input type="number" defaultValue="30" min="1" max="365" className="h-10" />
                        </div>
                        <div className="space-y-2">
                          <Label>Performance Review Frequency</Label>
                          <Select defaultValue="monthly">
                            <SelectTrigger className="h-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium">Driver Features</h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                            <div className="space-y-1">
                              <div className="font-medium">Mobile App Access</div>
                              <div className="text-sm text-muted-foreground">Allow drivers to use mobile app</div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                            <div className="space-y-1">
                              <div className="font-medium">Route Optimization</div>
                              <div className="text-sm text-muted-foreground">Automatic route optimization</div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                            <div className="space-y-1">
                              <div className="font-medium">Emergency Alerts</div>
                              <div className="text-sm text-muted-foreground">Panic button and emergency notifications</div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                            <div className="space-y-1">
                              <div className="font-medium">Time Tracking</div>
                              <div className="text-sm text-muted-foreground">Automatic time tracking for payroll</div>
                            </div>
                            <Switch />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                        <Settings className="h-5 w-5" />
                        Fleet Settings
                      </CardTitle>
                      <CardDescription>Advanced fleet management configuration</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 lg:space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Integration Settings</h4>
                          <Button variant="outline" size="sm">
                            Configure API
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                            <div className="space-y-1">
                              <div className="font-medium">Field Service Integration</div>
                              <div className="text-sm text-muted-foreground">Link vehicles to field service jobs</div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                            <div className="space-y-1">
                              <div className="font-medium">Payroll Integration</div>
                              <div className="text-sm text-muted-foreground">Sync driving hours with payroll</div>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                            <div className="space-y-1">
                              <div className="font-medium">Fuel Card Integration</div>
                              <div className="text-sm text-muted-foreground">Connect with fuel card providers</div>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                            <div className="space-y-1">
                              <div className="font-medium">Maintenance Scheduling</div>
                              <div className="text-sm text-muted-foreground">Automated maintenance scheduling</div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Billing Section */}
              {activeSection === "billing" && (
                <div className="space-y-4 lg:space-y-6">
                  <div className="hidden lg:block">
                    <h2 className="text-2xl lg:text-3xl font-bold mb-2">Billing & Payments</h2>
                    <p className="text-muted-foreground">Manage your subscription, payment methods, and billing preferences.</p>
                  </div>

                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                        <CreditCard className="h-5 w-5" />
                        Payment Methods
                      </CardTitle>
                      <CardDescription>Manage your payment methods and billing information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 lg:space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Saved Payment Methods</h4>
                          <Button variant="outline" size="sm">
                            Add New Method
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                                VISA
                              </div>
                              <div>
                                <div className="font-medium">•••• •••• •••• 4242</div>
                                <div className="text-sm text-muted-foreground">Expires 12/25</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">Primary</Badge>
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-6 bg-red-600 rounded flex items-center justify-center text-white text-xs font-bold">
                                MC
                              </div>
                              <div>
                                <div className="font-medium">•••• •••• •••• 8888</div>
                                <div className="text-sm text-muted-foreground">Expires 08/26</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                        <Receipt className="h-5 w-5" />
                        Subscription & Usage
                      </CardTitle>
                      <CardDescription>View your current plan and usage details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 lg:space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="p-4 bg-muted/30 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Current Plan</span>
                              <Badge variant="default">Professional</Badge>
                            </div>
                            <div className="text-2xl font-bold">$49/month</div>
                            <div className="text-sm text-muted-foreground">Billed monthly</div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Next billing date</span>
                              <span>March 15, 2024</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Payment method</span>
                              <span>•••• 4242</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-medium">Usage This Month</h4>
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>API Calls</span>
                                <span>8,432 / 10,000</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full" style={{ width: "84%" }}></div>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Storage</span>
                                <span>2.1 GB / 5 GB</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full" style={{ width: "42%" }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button variant="outline" className="flex-1 bg-transparent">
                          Change Plan
                        </Button>
                        <Button variant="outline" className="flex-1 bg-transparent">
                          View Usage History
                        </Button>
                        <Button variant="outline" className="flex-1 bg-transparent">
                          Download Invoices
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Team Management Section */}
              {activeSection === "team" && (
                <div className="space-y-4 lg:space-y-6">
                  <div className="hidden lg:block">
                    <h2 className="text-2xl lg:text-3xl font-bold mb-2">Team Management</h2>
                    <p className="text-muted-foreground">Manage team members, roles, and permissions.</p>
                  </div>

                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                        <Users className="h-5 w-5" />
                        Team Members
                      </CardTitle>
                      <CardDescription>Manage your team members and their access levels</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 lg:space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">3 of 5 team members</div>
                        <Button size="sm">Invite Member</Button>
                      </div>

                      <div className="space-y-3">
                        {[
                          {
                            name: "John Doe",
                            email: "john@company.com",
                            role: "Owner",
                            status: "Active",
                            lastActive: "2 hours ago",
                          },
                          {
                            name: "Sarah Wilson",
                            email: "sarah@company.com",
                            role: "Admin",
                            status: "Active",
                            lastActive: "1 day ago",
                          },
                          {
                            name: "Mike Johnson",
                            email: "mike@company.com",
                            role: "Editor",
                            status: "Pending",
                            lastActive: "Never",
                          },
                        ].map((member, index) => (
                          <div
                            key={index}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-border rounded-lg"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center font-medium">
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium">{member.name}</div>
                                <div className="text-sm text-muted-foreground">{member.email}</div>
                                <div className="text-xs text-muted-foreground">Last active: {member.lastActive}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant={member.status === "Active" ? "secondary" : "outline"}>
                                {member.status}
                              </Badge>
                              <Badge variant="outline">{member.role}</Badge>
                              {member.role !== "Owner" && (
                                <Button variant="ghost" size="sm">
                                  Edit
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Save Button - Always visible and responsive */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 lg:pt-6 sticky bottom-4 lg:static bg-background/95 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none p-4 lg:p-0 -mx-4 lg:mx-0 border-t lg:border-t-0">
                <Button size="lg" className="flex-1 sm:flex-initial sm:px-8">
                  Save Changes
                </Button>
                <Button variant="outline" size="lg" className="flex-1 sm:flex-initial sm:px-8 bg-transparent">
                  Reset to Defaults
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


