"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  Users,
  Plug,
  Star,
  Key,
  CreditCard,
  Tag,
  MapPin,
  Receipt,
  Zap,
  FileText,
  Download,
  Upload,
  Shield,
  Settings
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Switch } from "@components/ui/switch";
import { HydrationSafeInput, HydrationSafeForm } from "@components/ui/hydration-safe-input";
import { Badge } from "@components/ui/badge";
import Link from "next/link";



export default function BusinessSettings() {
  const searchParams = useSearchParams();
  const settingsSections = [
    // Business
    { id: "company-info", label: "Company Info", icon: Building2, category: "Business" },
    { id: "users-roles", label: "Users & Roles", icon: Users, category: "Business" },

    // Integrations
    { id: "integrations", label: "Integrations", icon: Plug, category: "Integrations" },
    { id: "popular", label: "Popular", icon: Star, category: "Integrations" },

    // API & Security
    { id: "api-keys", label: "API Keys", icon: Key, category: "API & Security" },
    { id: "billing", label: "Billing", icon: CreditCard, category: "API & Security" },

    // Configuration
    { id: "tax-zones", label: "Tax Zones", icon: MapPin, category: "Configuration" },
    { id: "automation", label: "Automation", icon: Zap, category: "Configuration" },

    // Templates & Data
    { id: "templates", label: "Templates", icon: FileText, category: "Templates & Data" },
    { id: "import-export", label: "Import/Export", icon: Download, category: "Templates & Data" },

    // Advanced
    { id: "custom-fields", label: "Custom Fields", icon: Settings, category: "Advanced" },
    { id: "tags", label: "Tags", icon: Tag, category: "Advanced" },
    { id: "security", label: "Security", icon: Shield, category: "Advanced" },
  ];

  // Verify data structure
  const uniqueCategories = [...new Set(settingsSections.map(s => s.category))];
  console.log('Unique Categories:', uniqueCategories);

  const [activeSection, setActiveSection] = useState("company-info");

  useEffect(() => {
    document.title = "Business Settings - Dashboard - Thorbis";

    // Handle URL parameter for section navigation
    const sectionParam = searchParams.get('section');
    if (sectionParam && settingsSections.find(section => section.id === sectionParam)) {
      setActiveSection(sectionParam);
    }
  }, [searchParams]);

  const renderSection = () => {
    switch (activeSection) {
      case "company-info":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Update your business details and company information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <HydrationSafeForm>
                  <div className="grid grid-cols-2 gap-4">
                    <HydrationSafeInput 
                      id="companyName" 
                      label="Company Name"
                      defaultValue="Thorbis Inc." 
                    />
                    <HydrationSafeInput 
                      id="businessType" 
                      label="Business Type"
                      defaultValue="Technology Services" 
                    />
                  </div>
                  <HydrationSafeInput 
                    id="address" 
                    label="Business Address"
                    defaultValue="123 Business St, Suite 100" 
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <HydrationSafeInput 
                      id="city" 
                      label="City"
                      defaultValue="New York" 
                    />
                    <HydrationSafeInput 
                      id="state" 
                      label="State/Province"
                      defaultValue="NY" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <HydrationSafeInput 
                      id="zipCode" 
                      label="ZIP/Postal Code"
                      defaultValue="10001" 
                    />
                    <HydrationSafeInput 
                      id="country" 
                      label="Country"
                      defaultValue="United States" 
                    />
                  </div>
                </HydrationSafeForm>
              </CardContent>
              <CardContent className="border-t pt-6">
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </div>
        );

      case "users-roles":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Users & Roles</CardTitle>
                <CardDescription>Manage team members and their access permissions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">John Doe</p>
                      <p className="text-xs text-muted-foreground">Owner • john@company.com</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Owner</Badge>
                </div>
                <Button variant="outline">Invite Team Member</Button>
              </CardContent>
            </Card>
          </div>
        );

      case "integrations":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>Connect your business tools and services.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <Button variant="outline" className="justify-start" asChild>
                    <Link href="/dashboard/business/settings/integrations">
                      <Plug className="w-4 h-4 mr-2" />
                      Manage Integrations
                    </Link>
                  </Button>
                  <Button variant="outline" className="justify-start" asChild>
                    <Link href="/dashboard/business/settings/integrations">
                      <Star className="w-4 h-4 mr-2" />
                      Browse Popular Apps
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "popular":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Popular Integrations</CardTitle>
                <CardDescription>Most commonly used integrations for businesses like yours.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">QuickBooks</p>
                        <p className="text-xs text-muted-foreground">Accounting & Invoicing</p>
                      </div>
                    </div>
                    <Button size="sm">Install</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Stripe</p>
                        <p className="text-xs text-muted-foreground">Payment Processing</p>
                      </div>
                    </div>
                    <Button size="sm">Install</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "api-keys":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>Manage your API keys and access tokens.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Production API Key</p>
                    <p className="text-xs text-muted-foreground">sk-••••••••••••••••••••••••••••••••</p>
                  </div>
                  <Button variant="outline" size="sm">Regenerate</Button>
                </div>
                <Button variant="outline">Create New API Key</Button>
              </CardContent>
            </Card>
          </div>
        );

      case "billing":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing & Subscription</CardTitle>
                <CardDescription>Manage your billing information and subscription plan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Current Plan: Professional</p>
                  <p className="text-xs text-muted-foreground">$99/month • Next billing: Dec 15, 2024</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-renewal</Label>
                    <p className="text-sm text-muted-foreground">Automatically renew subscription</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
              <CardContent className="border-t pt-6">
                <Button>Update Billing</Button>
              </CardContent>
            </Card>
          </div>
        );

      case "tax-zones":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tax Zones</CardTitle>
                <CardDescription>Configure tax rates for different regions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">California</p>
                    <p className="text-xs text-muted-foreground">8.25% Sales Tax</p>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
                <Button variant="outline">Add Tax Zone</Button>
              </CardContent>
            </Card>
          </div>
        );

      case "automation":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Automation</CardTitle>
                <CardDescription>Automate business processes and workflows.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send automated emails for key events</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Invoice Reminders</Label>
                    <p className="text-sm text-muted-foreground">Automatically send payment reminders</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "templates":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Templates</CardTitle>
                <CardDescription>Manage document and email templates.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Invoice Template</p>
                    <p className="text-xs text-muted-foreground">Professional invoice layout</p>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
                <Button variant="outline">Create New Template</Button>
              </CardContent>
            </Card>
          </div>
        );

      case "import-export":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Import/Export</CardTitle>
                <CardDescription>Import data or export your business information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <Button variant="outline" className="justify-start">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "custom-fields":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Custom Fields</CardTitle>
                <CardDescription>Create custom fields for your business forms.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Project Code</p>
                    <p className="text-xs text-muted-foreground">Text field for project tracking</p>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
                <Button variant="outline">Add Custom Field</Button>
              </CardContent>
            </Card>
          </div>
        );

      case "tags":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <CardDescription>Organize your business data with tags and labels.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">High Priority</Badge>
                  <Badge variant="secondary">Client Work</Badge>
                  <Badge variant="secondary">Internal</Badge>
                </div>
                <Button variant="outline">Manage Tags</Button>
              </CardContent>
            </Card>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Configure security preferences and access controls.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Login Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified of new logins</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  // Group settings by category for display
  const groupedSettings = settingsSections.reduce((acc, section) => {
    if (!acc[section.category]) {
      acc[section.category] = [];
    }
    acc[section.category].push(section);
    return acc;
  }, {});

  // Debug: Log the grouped settings
  console.log('🎯 BUSINESS SETTINGS PAGE LOADED!');
  console.log('📋 Categories found:', Object.keys(groupedSettings));

  return (
    <div className="w-full px-4 lg:px-24 py-16 space-y-8 bg-white dark:bg-neutral-900">
      <div className="grid w-full gap-2">
        <h1 className="text-4xl">Settings</h1>
        <p className="text-muted-foreground">Manage your business settings and preferences.</p>
      </div>

      <div className="grid w-full items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
        <nav className="grid gap-4 text-sm text-muted-foreground">
          {/* Debug: Show raw groupedSettings */}
          <div className="p-2 bg-red-100 text-red-800 text-xs">
            <strong>Debug:</strong> {Object.keys(groupedSettings).length} categories found
            <br />
            <strong>Categories:</strong> {Object.keys(groupedSettings).join(', ')}
          </div>

          {/* Show all categories dynamically - this should work */}
          {Object.keys(groupedSettings).length > 0 ? (
            Object.entries(groupedSettings).map(([category, sections]) => (
              <div key={category} className="space-y-2">
                <h3 className="font-semibold text-foreground px-3 py-1 text-xs uppercase tracking-wider bg-blue-100">
                  {category} ({sections.length} items)
                </h3>
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors w-full text-left ${
                        activeSection === section.id
                          ? "font-semibold text-primary bg-primary/5 border border-primary/20"
                          : "hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{section.label}</span>
                    </button>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="p-2 bg-yellow-100 text-yellow-800 text-xs">
              <strong>No categories found!</strong>
            </div>
          )}
        </nav>

        <div className="grid gap-6">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}
