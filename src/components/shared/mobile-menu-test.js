"use client";

import React, { useState } from "react";
import { Button } from "@components/ui/button";
import { Menu, X } from "lucide-react";
import EnhancedMobileMenu from "./enhanced-mobile-menu";

/**
 * Simple test component to verify mobile menu functionality
 */
export default function MobileMenuTest() {
  const [isOpen, setIsOpen] = useState(false);

  const testNavigationItems = [
    { key: "home", text: "Home", href: "/", icon: null },
    { key: "about", text: "About", href: "/about", icon: null },
    { key: "contact", text: "Contact", href: "/contact", icon: null },
  ];

  return (
    <div className="fixed top-4 right-4 z-[10000]">
      {/* Test Mobile Menu Button */}
      <Button 
        variant="outline" 
        size="sm" 
        className="mobile-menu-button flex items-center justify-center h-10 w-10 border-border bg-background hover:bg-muted transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-5 w-5 text-foreground" />
      </Button>
      
      {/* Test Mobile Menu */}
      <EnhancedMobileMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        dashboardType="test"
        navigationItems={testNavigationItems}
        activeNavKey="home"
        config={{ title: "Test Menu" }}
        businessSubNavItems={{}}
      />
    </div>
  );
}
