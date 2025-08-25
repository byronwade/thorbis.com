"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Plug,
  UserCheck,
  CreditCard,
  Shield,
  Bell,
  FileText as FileTextIcon,
  Download,
  Key,
  Tag,
  MapPin,
  Settings
} from "lucide-react";

export default function SettingsLayout({ children }) {
  const pathname = usePathname();

  // Navigation items for sub-header tabs
  const navigationItems = [
    { name: "Company Info", href: "/dashboard/business/settings/company-info", icon: Building2 },
    { name: "Users & Roles", href: "/dashboard/business/settings/users-roles", icon: UserCheck },
    { name: "Integrations", href: "/dashboard/business/settings", icon: Plug, badge: "Popular" },
    { name: "API Keys", href: "/dashboard/business/settings/api-keys-webhooks", icon: Key },
    { name: "Billing", href: "/dashboard/business/settings/subscription-billing", icon: CreditCard },
    { name: "Tax Zones", href: "/dashboard/business/settings/tax-zones", icon: MapPin },
    { name: "Automation", href: "/dashboard/business/settings/alerts-workflow-rules", icon: Bell },
    { name: "Templates", href: "/dashboard/business/settings/templates-documents", icon: FileTextIcon },
    { name: "Import/Export", href: "/dashboard/business/settings/import-export", icon: Download },
    { name: "Custom Fields", href: "/dashboard/business/settings/custom-fields", icon: Settings },
    { name: "Tags", href: "/dashboard/business/settings/tags", icon: Tag },
    { name: "Security", href: "/dashboard/business/settings/security-logs", icon: Shield },
  ];

  return (
    <div className="w-full">
      {/* Sub-header with Tabs */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                <Settings className="h-3 w-3 text-primary" />
              </div>
              <h1 className="text-lg font-semibold">Settings</h1>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="mt-4 border-b border-border">
            <nav className="flex space-x-8 overflow-x-auto" aria-label="Settings tabs">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center space-x-2 whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
