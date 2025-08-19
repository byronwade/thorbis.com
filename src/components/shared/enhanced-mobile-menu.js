"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { 
  X, 
  Menu, 
  ChevronDown, 
  ChevronRight,
  User,
  Settings,
  LogOut,
  HelpCircle,
  CreditCard,
  Home,
  Building2,
  Shield,
  Monitor,
  Truck,
  Crown,
  GraduationCap,
  Book,
  TrendingUp,
  Calculator,
  Package,
  MessageSquare,
  Briefcase,
  Plus,
  Bell,
  Search,
  FileText,
  Receipt,
  Megaphone,
  Brain,
  Target,
  Key,
  Zap,
  Clock,
  DollarSign,
  Activity,
  Users,
  Calendar,
  BarChart3
} from "lucide-react";
import { useAuth } from "@context/auth-context";
import { cn } from "@lib/utils";

/**
 * Enhanced Mobile Menu Component
 * Features:
 * - Overlays the header completely
 * - Full-screen mobile experience
 * - Smooth native-like animations
 * - Scrollable content
 * - Prevents background scrolling
 * - Native mobile feel with proper touch interactions
 */
export default function EnhancedMobileMenu({ 
  isOpen, 
  onClose, 
  dashboardType = "business",
  navigationItems = [],
  activeNavKey = "",
  config = {},
  businessSubNavItems = {},
  showAuthButtons = false
}) {
  const pathname = usePathname();
  const { user, logout, getDisplayName, getAvatarUrl } = useAuth();
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden', 'fixed', 'w-full', 'h-full');
    } else {
      document.body.classList.remove('overflow-hidden', 'fixed', 'w-full', 'h-full');
    }

    return () => {
      document.body.classList.remove('overflow-hidden', 'fixed', 'w-full', 'h-full');
    };
  }, [isOpen]);

  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Touch handlers for swipe-to-close
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50; // Minimum swipe distance
    
    if (isLeftSwipe) {
      onClose();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Keyboard handler for escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionKey)) {
        newSet.delete(sectionKey);
      } else {
        newSet.add(sectionKey);
      }
      return newSet;
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLinkClick = () => {
    // Add a small delay to allow for visual feedback
    setTimeout(() => {
      onClose();
    }, 100);
  };

  // Get sub-navigation items for current section
  const getSubNavItems = (sectionKey) => {
    return businessSubNavItems[dashboardType]?.[sectionKey] || [];
  };

  // Performance optimization: Memoize navigation items
  const memoizedNavigationItems = React.useMemo(() => {
    return navigationItems.map((item) => ({
      ...item,
      hasSubItems: getSubNavItems(item.key).length > 0,
      isActive: activeNavKey === item.key,
      isExpanded: expandedSections.has(item.key)
    }));
  }, [navigationItems, activeNavKey, expandedSections, businessSubNavItems, dashboardType]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998] transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      {/* Mobile Menu Container - Full Width */}
      <div 
        className={cn(
          "fixed inset-0 z-[9999] flex flex-col bg-background transform transition-transform duration-300 ease-out w-full h-full",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{ 
          width: '100vw', 
          height: '100vh',
          maxWidth: '100vw',
          maxHeight: '100vh'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card/95 backdrop-blur-md w-full">
          <div className="flex items-center space-x-3">
            {dashboardType === "site" ? (
              <>
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">T</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Thorbis</p>
                  <p className="text-sm text-muted-foreground">Local Business Directory</p>
                </div>
              </>
            ) : (
              <>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={getAvatarUrl()} alt={getDisplayName()} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getDisplayName().charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{getDisplayName()}</p>
                  <p className="text-sm text-muted-foreground">{config.title}</p>
                </div>
              </>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={onClose}
            className="h-12 w-12 hover:bg-muted border-border bg-background/80 backdrop-blur-sm"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain scroll-smooth w-full">
          <div className="p-4 space-y-6 w-full">
            {/* Auth Buttons - Show only for site header */}
            {showAuthButtons && (
              <div className="flex flex-col space-y-3 pb-4 border-b border-border">
                <Link href="/login" onClick={handleLinkClick}>
                  <Button variant="outline" className="w-full justify-center py-3">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" onClick={handleLinkClick}>
                  <Button className="w-full justify-center py-3">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Main Navigation */}
            <nav className="space-y-1">
              {memoizedNavigationItems.map((item) => (
                <div key={item.key} className="space-y-1">
                  <div className="flex items-center">
                    <Link
                      href={item.href}
                      onClick={handleLinkClick}
                      className={cn(
                        "flex-1 flex items-center justify-between text-sm font-medium rounded-lg min-h-[44px] px-4 py-3 transition-all duration-200 select-none",
                        item.isActive 
                          ? "bg-primary/20 text-primary border border-primary/20" 
                          : "hover:bg-primary/10 hover:text-primary"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span>{item.text}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs bg-success/10 text-success">
                            {item.badge}
                          </Badge>
                        )}
                        {item.hasSubItems && (
                          <ChevronDown 
                            className={cn(
                              "h-4 w-4 transition-transform duration-200",
                              item.isExpanded ? "rotate-90" : ""
                            )} 
                          />
                        )}
                      </div>
                    </Link>
                    {item.hasSubItems && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleSection(item.key)}
                        className="h-10 w-10 ml-1 hover:bg-muted"
                      >
                        <ChevronRight 
                          className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            item.isExpanded ? "rotate-90" : ""
                          )} 
                        />
                      </Button>
                    )}
                  </div>

                  {/* Sub-navigation items */}
                  {item.hasSubItems && item.isExpanded && (
                    <div className="ml-8 space-y-1 animate-in slide-in-from-left duration-200">
                      {getSubNavItems(item.key).map((subItem, index) => (
                        <Link
                          key={index}
                          href={subItem.href}
                          onClick={handleLinkClick}
                          className={cn(
                            "block px-4 py-2 text-sm rounded-lg transition-colors",
                            pathname === subItem.href
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          )}
                        >
                          {subItem.text}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-border">
              <h3 className="px-4 text-sm font-medium text-muted-foreground mb-3">
                Quick Actions
              </h3>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start px-4 py-3 h-auto"
                  onClick={() => {
                    // Add search functionality
                    onClose();
                  }}
                >
                  <Search className="mr-3 h-4 w-4" />
                  <span>Search</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-4 py-3 h-auto"
                  onClick={() => {
                    // Add notifications functionality
                    onClose();
                  }}
                >
                  <Bell className="mr-3 h-4 w-4" />
                  <span>Notifications</span>
                </Button>
              </div>
            </div>

            {/* User Actions - Only show for dashboard types */}
            {dashboardType !== "site" && (
              <>
                <div className="pt-4 border-t border-border">
                  <h3 className="px-4 text-sm font-medium text-muted-foreground mb-3">
                    Account
                  </h3>
                  <div className="space-y-1">
                    <Link
                      href="/dashboard/user/settings"
                      onClick={handleLinkClick}
                      className="flex items-center px-4 py-3 text-sm text-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <User className="mr-3 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      href="/dashboard/user/billing"
                      onClick={handleLinkClick}
                      className="flex items-center px-4 py-3 text-sm text-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <CreditCard className="mr-3 h-4 w-4" />
                      <span>Billing</span>
                    </Link>
                    <Link
                      href="/dashboard/user/settings"
                      onClick={handleLinkClick}
                      className="flex items-center px-4 py-3 text-sm text-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Settings className="mr-3 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        // Add support functionality
                        onClose();
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm text-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <HelpCircle className="mr-3 h-4 w-4" />
                      <span>Support</span>
                    </button>
                  </div>
                </div>

                {/* Logout */}
                <div className="pt-4 border-t border-border">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-sm text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>Log out</span>
                  </button>
                </div>
              </>
            )}

            {/* Bottom Close Button - Mobile Accessibility */}
            <div className="pt-6 pb-4 border-t border-border">
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full py-4 text-base font-medium border-border bg-background/80 backdrop-blur-sm"
                aria-label="Close menu"
              >
                <X className="mr-2 h-5 w-5" />
                Close Menu
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
