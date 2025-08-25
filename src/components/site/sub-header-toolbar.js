"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import {
  Settings,
  Wrench,
  Calendar,
  Package,
  Truck,
  Users,
  DollarSign,
  Mail,
  Shield,
  Globe,
  Database,
  ChevronRight,
  MoreHorizontal
} from "lucide-react";

export default function SubHeaderToolbar() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  // Define the toolbar sections
  const toolbarSections = [
    { id: 'general', name: 'General', icon: Settings, href: '/dashboard/business/general' },
    { id: 'operations', name: 'Operations', icon: Wrench, href: '/dashboard/business/operations' },
    { id: 'scheduling', name: 'Scheduling', icon: Calendar, href: '/dashboard/business/scheduling' },
    { id: 'inventory', name: 'Inventory', icon: Package, href: '/dashboard/business/inventory' },
    { id: 'fleet', name: 'Fleet', icon: Truck, href: '/dashboard/business/fleet' },
    { id: 'customers', name: 'Customers', icon: Users, href: '/dashboard/business/customers' },
    { id: 'financial', name: 'Financial', icon: DollarSign, href: '/dashboard/business/financial' },
    { id: 'communication', name: 'Communication', icon: Mail, href: '/dashboard/business/communication' },
    { id: 'safety', name: 'Safety & Compliance', icon: Shield, href: '/dashboard/business/safety' },
    { id: 'integrations', name: 'Integrations', icon: Globe, href: '/dashboard/business/integrations' },
    { id: 'advanced', name: 'Advanced', icon: Database, href: '/dashboard/business/advanced' }
  ];

  // Determine which sections to show based on current page
  const getVisibleSections = () => {
    // For dashboard pages, show all sections
    if (pathname.includes('/dashboard/business')) {
      return toolbarSections;
    }
    
    // For settings pages, show all sections
    if (pathname.includes('/settings')) {
      return toolbarSections;
    }
    
    // For other pages, show a subset of most common sections
    return [
      toolbarSections[0], // General
      toolbarSections[1], // Operations
      toolbarSections[2], // Scheduling
      toolbarSections[5], // Customers
      toolbarSections[6], // Financial
      toolbarSections[7], // Communication
    ];
  };

  const visibleSections = getVisibleSections();
  const hasMoreSections = visibleSections.length < toolbarSections.length;

  // Check if current path matches any section
  const isActiveSection = (sectionId) => {
    return pathname.includes(`/dashboard/business/${sectionId}`) || 
           pathname.includes(`/settings/${sectionId}`);
  };

  // Get current active section
  const getCurrentSection = () => {
    return toolbarSections.find(section => isActiveSection(section.id));
  };

  const currentSection = getCurrentSection();

  return (
    <div className="sticky top-14 z-40 bg-neutral-900 border-b border-neutral-800 shadow-sm">
      <div className="px-4 lg:px-24">
        {/* Breadcrumb Indicator */}
        {currentSection && (
          <div className="flex items-center py-1 text-xs text-neutral-400">
            <span>Current Section:</span>
            <ChevronRight className="w-3 h-3 mx-1" />
            <span className="text-white font-medium">{currentSection.name}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between h-12">
          {/* Left - Toolbar Sections */}
          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide flex-1 min-w-0">
            {visibleSections.map((section) => {
              const Icon = section.icon;
              const isActive = isActiveSection(section.id);
              
              return (
                <Link key={section.id} href={section.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`h-8 px-3 text-xs font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                        : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    <Icon className="w-3 h-3 mr-1.5" />
                    {section.name}
                    {isActive && (
                      <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-xs">
                        Active
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Right - More Options & Quick Actions */}
          <div className="flex items-center space-x-2 ml-4">
            {/* Context-Aware Quick Actions */}
            <div className="hidden sm:flex items-center space-x-1">
              {currentSection && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-neutral-300 hover:text-white hover:bg-neutral-800"
                  title={`${currentSection.name} Settings`}
                >
                  <Settings className="w-3 h-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-neutral-300 hover:text-white hover:bg-neutral-800"
                title="Quick Help"
              >
                <Users className="w-3 h-3" />
              </Button>
            </div>

            {/* Mobile Quick Actions */}
            <div className="sm:hidden flex items-center space-x-1">
              {hasMoreSections && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMore(!showMore)}
                  className="h-8 px-2 text-neutral-300 hover:text-white hover:bg-neutral-800"
                  title="Show More Sections"
                >
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Expanded More Sections */}
        {showMore && hasMoreSections && (
          <div className="border-t border-neutral-800 bg-neutral-900">
            <div className="flex items-center space-x-1 py-2 overflow-x-auto scrollbar-hide">
              {toolbarSections.slice(6).map((section) => {
                const Icon = section.icon;
                const isActive = isActiveSection(section.id);
                
                return (
                  <Link key={section.id} href={section.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={`h-7 px-2 text-xs font-medium transition-all duration-200 ${
                        isActive 
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                          : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                      }`}
                    >
                      <Icon className="w-3 h-3 mr-1" />
                      {section.name}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
