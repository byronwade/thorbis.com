"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { 
  Menu,
  Plus,
  BarChart3,
  Megaphone,
  GraduationCap,
  ShoppingCart,
  Building2,
  Truck,
  Briefcase,
  Calculator,
  Monitor,
  HelpCircle,
  ChevronDown
} from "lucide-react";

export function SubHeaderNavigation() {
  const [isAllMenuOpen, setIsAllMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const allMenuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (allMenuRef.current && !allMenuRef.current.contains(event.target as Node)) {
        setIsAllMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navigationItems = [
    { name: "For Business", href: "/business" },
    { name: "Store", href: "/store" },
    { name: "LocalHub", href: "/localhub" },
    { name: "Fleet", href: "/fleet" }, 
    { name: "Jobs", href: "/jobs" },
    { name: "Academy", href: "/academy" },
    { name: "Advertise", href: "/advertise" },
    { name: "Pricing", href: "/pricing" },
    { name: "API", href: "/developers" },
    { name: "Help", href: "/help" }
  ];

  const allMenuItems = [
    {
      category: "For Business",
      items: [
        { name: "List Business", href: "/add-a-business", icon: Plus, color: "text-success bg-success/10" },
        { name: "Dashboard", href: "/dashboard/business", icon: BarChart3, color: "text-primary bg-primary/10" },
        { name: "Advertise", href: "/advertise", icon: Megaphone, color: "text-warning bg-warning/10" },
        { name: "Academy", href: "/academy", icon: GraduationCap, color: "text-emerald-500 bg-emerald-500/10" }
      ]
    },
    {
      category: "Platform",
      items: [
        { name: "Store", href: "/store", icon: ShoppingCart, color: "text-blue-500 bg-blue-500/10" },
        { name: "LocalHub", href: "/localhub", icon: Building2, color: "text-indigo-500 bg-indigo-500/10" },
        { name: "Fleet", href: "/fleet", icon: Truck, color: "text-orange-500 bg-orange-500/10" },
        { name: "Jobs", href: "/jobs", icon: Briefcase, color: "text-purple-500 bg-purple-500/10" }
      ]
    },
    {
      category: "Resources", 
      items: [
        { name: "Pricing", href: "/pricing", icon: Calculator, color: "text-cyan-500 bg-cyan-500/10" },
        { name: "API", href: "/developers", icon: Monitor, color: "text-gray-500 bg-gray-500/10" },
        { name: "Help", href: "/help", icon: HelpCircle, color: "text-amber-500 bg-amber-500/10" }
      ]
    }
  ];

  return (
    <nav className="border-t border-neutral-800/50 bg-neutral-900/95 backdrop-blur-sm z-50">
      <div className="px-2 sm:px-4 h-12 flex items-center">
        
        {/* All Categories Button */}
        <div className="relative shrink-0 mr-4" ref={allMenuRef}>
          <button
            ref={buttonRef}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white hover:bg-neutral-800/60 rounded-md transition-colors duration-200 h-8"
            type="button"
            aria-haspopup="dialog"
            aria-expanded={isAllMenuOpen}
            onClick={() => setIsAllMenuOpen(!isAllMenuOpen)}
          >
            <Menu className="w-4 h-4" />
            <span className="font-medium">All</span>
            <ChevronDown className={'w-3 h-3 transition-transform duration-200 ${isAllMenuOpen ? 'rotate-180' : '}'} />
          </button>
          
        </div>

        {/* Horizontal Navigation Items */}
        <div className="flex-1 overflow-hidden">
          <div className="relative group">
            {/* Scrollable container */}
            <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide scroll-smooth" style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}>
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm text-neutral-400 hover:text-white py-2 px-3 shrink-0 transition-colors duration-200 hover:bg-neutral-800/40 rounded-md whitespace-nowrap touch-manipulation"
                >
                  {item.name}
                </Link>
              ))}
            </div>
            
            {/* Fade gradients for scroll indication - shown on hover/scroll */}
            <div className="absolute left-0 top-0 w-8 h-full bg-gradient-to-r from-neutral-900 via-neutral-900/80 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 sm:block hidden" />
            <div className="absolute right-0 top-0 w-8 h-full bg-gradient-to-l from-neutral-900 via-neutral-900/80 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 sm:block hidden" />
          </div>
        </div>
      </div>
      
      {/* Portal-based dropdown to ensure it appears above all content */}
      {mounted && isAllMenuOpen && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[99998]"
            onClick={() => setIsAllMenuOpen(false)}
          />
          {/* Dropdown */}
          <div 
            className="fixed top-[85px] left-4 w-[600px] max-w-[calc(100vw-2rem)] bg-neutral-950 border border-neutral-800 rounded-lg shadow-2xl z-[99999] overflow-hidden"
            style={{
              // Calculate position relative to button if needed
              top: buttonRef.current ? buttonRef.current.getBoundingClientRect().bottom + 4 : '85px'
            }}
          >
            <div className="p-4">
              <div className="grid grid-cols-3 gap-6">
                {allMenuItems.map((section) => (
                  <div key={section.category}>
                    <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
                      {section.category}
                    </div>
                    <div className="space-y-2">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-neutral-800/50 transition-colors group"
                            onClick={() => setIsAllMenuOpen(false)}
                          >
                            <div className={'w-6 h-6 rounded-md flex items-center justify-center group-hover:bg-opacity-30 transition-colors ${item.color}'}>
                              <Icon className="h-3 w-3" />
                            </div>
                            <span className="text-sm font-medium text-white">{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Action Buttons */}
              <div className="border-t border-neutral-800/50 mt-4 pt-4 flex gap-2">
                <Link
                  href="/add-a-business"
                  className="flex-1 flex items-center justify-center gap-2 h-9 px-3 rounded-md border border-neutral-700 bg-neutral-800/30 hover:bg-neutral-700/50 text-white font-medium text-sm transition-colors"
                  onClick={() => setIsAllMenuOpen(false)}
                >
                  <Plus className="h-3 w-3" />
                  List Business
                </Link>
                <Link
                  href="/pricing"
                  className="flex-1 flex items-center justify-center gap-2 h-9 px-3 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
                  onClick={() => setIsAllMenuOpen(false)}
                >
                  <Calculator className="h-3 w-3" />
                  View Pricing
                </Link>
                <Link
                  href="/help"
                  className="flex-1 flex items-center justify-center gap-2 h-9 px-3 rounded-md border border-neutral-700 bg-neutral-800/30 hover:bg-neutral-700/50 text-white font-medium text-sm transition-colors"
                  onClick={() => setIsAllMenuOpen(false)}
                >
                  <HelpCircle className="h-3 w-3" />
                  Get Help
                </Link>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </nav>
  );
}