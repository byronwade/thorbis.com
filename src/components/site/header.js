"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@components/ui/dropdown-menu";
import { 
  MapPin, 
  Building2, 
  Users, 
  Star, 
  TrendingUp, 
  Plus, 
  ChevronDown, 
  Menu, 
  User,
  ShoppingCart,
  Bell,
  Settings,
  HelpCircle,
  BookOpen,
  Target,
  Zap,
  Shield,
  Globe,
  Award,
  Briefcase,
  Home,
  Utensils,
  Wrench,
  Car,
  Stethoscope,
  Scissors,
  Palette,
  Store,
  LogOut,
  Search
} from "lucide-react";
import { useAuth } from "@context/auth-context";
import AdvancedSearchHeader from "@components/shared/advanced-search-header";
import SubHeaderToolbar from "./sub-header-toolbar";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, getDisplayName } = useAuth();
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  
  // Hide header on slideshow route
  if (pathname === "/slideshow") {
    return null;
  }

  // Determine if we're on store pages to show cart
  const isStorePage = pathname.startsWith("/store");

  // Business categories for directory
  const businessCategories = [
    { name: "Restaurants", icon: Utensils, href: "/category/restaurants", count: "2,847" },
    { name: "Plumbers", icon: Wrench, href: "/category/plumbers", count: "1,234" },
    { name: "Auto Repair", icon: Car, href: "/category/auto-repair", count: "956" },
    { name: "Healthcare", icon: Stethoscope, href: "/category/healthcare", count: "1,567" },
    { name: "Beauty Salons", icon: Scissors, href: "/category/beauty", count: "789" },
    { name: "Contractors", icon: Building2, href: "/category/contractors", count: "1,123" },
    { name: "Lawyers", icon: Briefcase, href: "/category/lawyers", count: "456" },
    { name: "Artists", icon: Palette, href: "/category/artists", count: "234" },
    { name: "Retail", icon: Store, href: "/category/retail", count: "3,456" },
    { name: "Home Services", icon: Home, href: "/category/home-services", count: "2,789" }
  ];

  return (
    <header className="sticky top-0 z-50 bg-neutral-950 text-white border-b border-neutral-800">
      {/* Top Bar - Business Directory & Listings */}
      <div className="bg-neutral-900 border-b border-neutral-800">
        <div className="px-4 py-2 lg:px-24">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <Link href="/directory" className="flex items-center space-x-2 hover:text-primary transition-colors">
                <Building2 className="w-4 h-4" />
                <span>Business Directory</span>
                <Badge variant="secondary" className="text-xs">2,847+</Badge>
              </Link>
              <Link href="/listings" className="flex items-center space-x-2 hover:text-primary transition-colors">
                <Users className="w-4 h-4" />
                <span>Featured Listings</span>
                <Badge variant="secondary" className="text-xs">New</Badge>
              </Link>
              <Link href="/add-business" className="flex items-center space-x-2 hover:text-primary transition-colors">
                <Plus className="w-4 h-4" />
                <span>List Your Business</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/help" className="hover:text-primary transition-colors">
                <HelpCircle className="w-4 h-4" />
              </Link>
              <Link href="/contact" className="hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="px-4 py-4 lg:px-24">
        <div className="flex items-center justify-between">
          {/* Left Section - Logo Only */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <Image
                src="/logos/ThorbisLogo.webp"
                alt="Thorbis"
                width={40}
                height={40}
                className="w-10 h-10 group-hover:scale-105 transition-transform"
              />
              <div>
                <h1 className="text-xl font-bold">Thorbis</h1>
                <p className="text-xs text-neutral-400">Local Business Directory</p>
              </div>
            </Link>
          </div>

          {/* Right Section - Navigation, Search & User Controls */}
          <div className="flex items-center space-x-6">
            {/* Main Navigation - Moved to Right */}
            <nav className="hidden lg:flex items-center space-x-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white hover:text-primary hover:bg-neutral-800">
                    Categories
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-96 bg-neutral-900 border-neutral-700">
                  <DropdownMenuLabel className="text-white">Browse Categories</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-neutral-700" />
                  <div className="grid grid-cols-2 gap-2 p-2">
                    {businessCategories.map((category) => (
                      <DropdownMenuItem key={category.name} asChild className="hover:bg-neutral-800">
                        <Link href={category.href} className="flex items-center space-x-3 p-2 rounded">
                          <category.icon className="w-4 h-4 text-primary" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">{category.name}</div>
                            <div className="text-xs text-neutral-400">{category.count} businesses</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link href="/discover" className="text-white hover:text-primary transition-colors">
                Discover
              </Link>
              <Link href="/reviews" className="text-white hover:text-primary transition-colors">
                Reviews
              </Link>
              <Link href="/events" className="text-white hover:text-primary transition-colors">
                Events
              </Link>
              <Link href="/deals" className="text-white hover:text-primary transition-colors">
                Deals
              </Link>
            </nav>

            {/* Search Bar - Moved to Right */}
            <div className="hidden lg:block w-80">
              <AdvancedSearchHeader 
                onSearch={(query, location) => {
                  console.log('Header search', { query, location });
                  if (query.trim()) {
                    router.push(`/search?q=${encodeURIComponent(query)}${location ? `&location=${encodeURIComponent(location)}` : ''}`);
                  }
                }}
                placeholder="Search for restaurants, services, businesses..."
                className="w-full"
                showAiMode={true}
                showVoiceSearch={true}
                showLocationSelector={true}
              />
            </div>

            {/* User Controls */}
            <div className="flex items-center space-x-4">
              {/* Store Cart */}
              {isStorePage && (
                <Button variant="ghost" size="sm" className="relative text-white hover:text-primary hover:bg-neutral-800">
                  <ShoppingCart className="w-5 h-5" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 text-xs">3</Badge>
                </Button>
              )}

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative text-white hover:text-primary hover:bg-neutral-800">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 text-xs bg-red-500">2</Badge>
              </Button>

              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-white hover:text-primary hover:bg-neutral-800">
                      <User className="w-5 h-5 mr-2" />
                      {getDisplayName()}
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 bg-neutral-900 border-neutral-700">
                    <DropdownMenuLabel className="text-white">Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-neutral-700" />
                    <DropdownMenuItem asChild className="hover:bg-neutral-800">
                      <Link href="/dashboard" className="text-white">
                        <Settings className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="hover:bg-neutral-800">
                      <Link href="/profile" className="text-white">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="hover:bg-neutral-800">
                      <Link href="/my-businesses" className="text-white">
                        <Building2 className="w-4 h-4 mr-2" />
                        My Businesses
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-neutral-700" />
                    <DropdownMenuItem className="hover:bg-neutral-800 text-white">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" className="text-white hover:text-primary hover:bg-neutral-800">
                    Sign In
                  </Button>
                  <Button className="bg-primary hover:bg-primary/90">
                    Sign Up
                  </Button>
                </div>
              )}

              {/* Mobile Search Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="lg:hidden text-white hover:text-primary hover:bg-neutral-800"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* Mobile Menu */}
              <Button variant="ghost" size="sm" className="lg:hidden text-white hover:text-primary hover:bg-neutral-800">
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showMobileSearch && (
        <div className="lg:hidden px-4 py-3 bg-neutral-900 border-t border-neutral-800">
          <AdvancedSearchHeader 
            onSearch={(query, location) => {
              console.log('Mobile header search', { query, location });
              if (query.trim()) {
                router.push(`/search?q=${encodeURIComponent(query)}${location ? `&location=${encodeURIComponent(location)}` : ''}`);
                setShowMobileSearch(false);
              }
            }}
            placeholder="Search for restaurants, services, businesses..."
            className="w-full"
            showAiMode={false}
            showVoiceSearch={true}
            showLocationSelector={true}
          />
        </div>
      )}
      
      {/* Sub-Header Toolbar - Only show on relevant pages */}
      {(pathname.includes('/dashboard') || pathname.includes('/settings') || pathname.includes('/business')) && (
        <SubHeaderToolbar />
      )}
    </header>
  );
}