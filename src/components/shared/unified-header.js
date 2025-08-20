"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuGroup 
} from "@components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@components/ui/sheet";
import EnhancedMobileMenu from "./enhanced-mobile-menu";
import {
  BarChart3,
  Building2,
  Calendar,
  Settings,
  LogOut,
  User,
  Users,
  Home,
  MapPin,
  Crown,
  GraduationCap,
  Book,
  TrendingUp,
  Calculator,
  Package,
  MessageSquare,
  CreditCard,
  Briefcase,
  Plus,
  ChevronDown,
  Menu,
  Shield,
  Truck,
  Monitor,
  ShoppingCart,
  HelpCircle,
  Star,
  Inbox,
  Mail,
  Send,
  Search,
  ArrowLeft,
  FileText,
  Receipt,
  Megaphone,
  Brain,
  Target,
  Key,
  Zap,
  Clock,
  DollarSign,
  Activity
} from "lucide-react";

import { RiComputerFill } from "react-icons/ri";
import { useTheme } from "next-themes";
import { useAuth } from "@context/auth-context";
import { useCartStore } from "@store/cart";
import logger from "@lib/utils/logger";
import { readFlagFromDOM } from "@lib/flags/client";
import AdvancedSearch from "./advanced-search";
import AdvancedSearchHeader from "./advanced-search-header";
import RealTimeNotifications from "./real-time-notifications";
import KeyboardShortcuts from "./keyboard-shortcuts";

import DarkModeToggle from "@components/ui/dark-mode-toggle";
import ClientOnlyWrapper from "./client-only-wrapper";

// Development Auth Tools Component for auth pages
function DevAuthTools() {
  const [enabled, setEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (process.env.NODE_ENV === "development") {
      setEnabled(localStorage.getItem("thorbis_auth_dev_disabled") === "1");
    }
  }, []);

  if (!mounted || process.env.NODE_ENV !== "development") return null;

  const toggle = () => {
    const now = localStorage.getItem("thorbis_auth_dev_disabled") === "1";
    if (now) {
      localStorage.removeItem("thorbis_auth_dev_disabled");
      document.cookie = "dev_auth_off=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      setEnabled(false);
    } else {
      localStorage.setItem("thorbis_auth_dev_disabled", "1");
      document.cookie = "dev_auth_off=1; path=/;";
      setEnabled(true);
    }
  };

  return (
    <div className="relative group">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={toggle}
        className={`h-8 px-2 text-xs font-medium transition-all duration-200 rounded-md border ${
          enabled 
            ? 'bg-red-50 hover:bg-destructive/10 border-red-200 text-destructive dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:border-red-800 dark:text-destructive/90' 
            : 'bg-green-50 hover:bg-success/10 border-green-200 text-success dark:bg-success/20 dark:hover:bg-success/30 dark:border-green-800 dark:text-success/90'
        }`}
        title={`Development Auth is currently ${enabled ? 'OFF' : 'ON'}`}
      >
        <Shield className="w-3 h-3 mr-1" />
        {enabled ? 'OFF' : 'ON'}
      </Button>
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs text-muted-foreground whitespace-nowrap">
        Dev Auth
      </div>
    </div>
  );
}

/**
 * Unified Header Component - Consistent across all dashboard types and site pages
 * Features: Mobile responsive, professional dropdowns, configurable for different contexts
 * Performance: Optimized with memoization and efficient re-renders
 */
export default function UnifiedHeader({ 
  dashboardType = "business",
  showCompanySelector = true,
  showSearch = false,
  showCart = false,
  customNavItems = null,
  customNotifications = null,
  customTitle = null,
  customSubtitle = null,
  backHref = "/"
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentCompanyId, setCurrentCompanyId] = useState("1");
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const { totalItems, openCart } = useCartStore();
  const [moreFilter, setMoreFilter] = useState("");
  
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  
  const { 
    user, 
    userRoles, 
    logout, 
    loading, 
    isInitialized,
    isAuthenticated,
    getDisplayName, 
    getAvatarUrl 
  } = useAuth();

  // Check auth bypass flag for development/testing
  const authBypass = readFlagFromDOM('data-flag-auth-bypass');

  // Performance tracking
  const startTime = performance.now();

  // Fallback mobile menu button for testing - only show when no other mobile menu is available
  const FallbackMobileMenu = () => {
    // Only show fallback if we're on a page that doesn't have its own mobile menu
    const shouldShowFallback = dashboardType === "site" && !showSearch;
    
    if (!shouldShowFallback) return null;
    
    return (
      <div className="fixed top-4 right-4 z-[10000] lg:hidden">
        <Button 
          variant="outline" 
          size="sm" 
          className="mobile-menu-button flex items-center justify-center h-12 w-12 border-border/50 bg-background/90 backdrop-blur-md hover:bg-muted/80 transition-all duration-200 shadow-lg"
          onClick={() => setMobileMenuOpen(true)}
          style={{ display: 'flex' }}
        >
          <Menu className="h-6 w-6 text-foreground" />
        </Button>
      </div>
    );
  };

  // Mock companies data (in production, this would come from context/API)
  const mockCompanies = useMemo(() => [
    {
      id: "1",
      name: "Wade's Plumbing & Septic",
      industry: "Plumbing Services",
      status: "active",
      subscription: "Pro",
      location: "Raleigh, NC",
    },
    {
      id: "2", 
      name: "Downtown Coffee Co.",
      industry: "Food & Beverage",
      status: "active",
      subscription: "Basic",
      location: "Durham, NC",
    }
  ], []);

  // Dashboard configurations
  const dashboardConfigs = useMemo(() => ({
    business: {
      title: customTitle || "Business Dashboard",
      subtitle: customSubtitle || "Manage your business operations",
      primaryColor: "blue"
    },
    user: {
      title: customTitle || "User Dashboard", 
      subtitle: customSubtitle || "Your personal space",
      primaryColor: "green"
    },
    admin: {
      title: customTitle || "Admin Dashboard",
      subtitle: customSubtitle || "System administration",
      primaryColor: "red"
    },
    academy: {
      title: customTitle || "Academy Dashboard",
      subtitle: customSubtitle || "Learning & Development",
      primaryColor: "purple"
    },
    localhub: {
      title: customTitle || "LocalHub Dashboard",
      subtitle: customSubtitle || "Community Management",
      primaryColor: "orange"
    },
    developers: {
      title: customTitle || "Developer Dashboard",
      subtitle: customSubtitle || "API & Integration Management",
      primaryColor: "gray"
    },
    gofor: {
      title: customTitle || "GoFor Dashboard",
      subtitle: customSubtitle || "Delivery Management",
      primaryColor: "indigo"
    },
    jobs: {
      title: customTitle || "Jobs",
      subtitle: customSubtitle || "Find Your Next Opportunity",
      primaryColor: "blue"
    },
    site: {
      title: customTitle || "Thorbis",
      subtitle: customSubtitle || "Local Business Directory",
      primaryColor: "blue"
    }
  }), [customTitle, customSubtitle]);

  const config = dashboardConfigs[dashboardType] || dashboardConfigs.business;

  // Navigation items by dashboard type
  const getNavigationItems = useMemo(() => {
    if (customNavItems) return customNavItems;

    const navConfigs = {
      business: [
        { key: "dashboard", text: "Overview", icon: BarChart3, href: "/dashboard/business" },
        { key: "profile", text: "Profile", icon: Building2, href: "/dashboard/business/profile" },
        { key: "schedule", text: "Schedule", icon: Calendar, href: "/dashboard/business/schedule" },
        { key: "customers", text: "Customers", icon: Users, href: "/dashboard/business/customers" },
        { key: "estimates", text: "Estimates", icon: FileText, href: "/dashboard/business/estimates" },
        { key: "invoices", text: "Invoices", icon: Receipt, href: "/dashboard/business/invoices" },
        { key: "inventory", text: "Inventory", icon: Package, href: "/dashboard/business/inventory" },
        { key: "employees", text: "Team", icon: Users, href: "/dashboard/business/employees" },
        { key: "communication", text: "Messages", icon: MessageSquare, href: "/dashboard/business/communication" },
        { key: "analytics", text: "Analytics", icon: BarChart3, href: "/dashboard/business/analytics" },
        { key: "marketing", text: "Marketing", icon: TrendingUp, href: "/dashboard/business/marketing" },
        { key: "accounting", text: "Accounting", icon: Calculator, href: "/dashboard/business/accounting" },
      ],
      user: [
        { key: "dashboard", text: "Dashboard", icon: BarChart3, href: "/dashboard/user" },
        { key: "jobs", text: "Jobs", icon: Briefcase, href: "/dashboard/user/jobs" },
        { key: "reviews", text: "Reviews", icon: Star, href: "/dashboard/user/reviews" },
        { key: "activity", text: "Activity", icon: Activity, href: "/dashboard/user/activity" },
        { key: "referral", text: "Referrals", icon: Users, href: "/dashboard/user/referral" },
        { key: "billing", text: "Billing", icon: CreditCard, href: "/dashboard/user/billing" },
        { key: "support", text: "Support", icon: MessageSquare, href: "/dashboard/user/support" },
        { key: "settings", text: "Settings", icon: Settings, href: "/dashboard/user/settings" },
      ],
      admin: [
        { key: "dashboard", text: "Dashboard", icon: BarChart3, href: "/dashboard/admin" },
        { key: "users", text: "Users", icon: Users, href: "/dashboard/admin/users" },
        { key: "customers", text: "Customers", icon: Users, href: "/dashboard/admin/customers" },
        { key: "billing", text: "Billing", icon: CreditCard, href: "/dashboard/admin/billing" },
        { key: "pro-accounts", text: "Pro Accounts", icon: Crown, href: "/dashboard/admin/pro-accounts" },
        { key: "reports", text: "Reports", icon: BarChart3, href: "/dashboard/admin/reports" },
        { key: "support", text: "Support", icon: MessageSquare, href: "/dashboard/admin/support" },
        { key: "settings", text: "Settings", icon: Settings, href: "/dashboard/admin/settings" },
      ],
      academy: [
        { key: "dashboard", text: "Dashboard", icon: BarChart3, href: "/dashboard/academy" },
        { key: "courses", text: "Courses", icon: Book, href: "/dashboard/academy/courses" },
        { key: "progress", text: "Progress", icon: TrendingUp, href: "/dashboard/academy/progress" },
        { key: "certifications", text: "Certificates", icon: Crown, href: "/dashboard/academy/certifications" },
        { key: "ai-tutor", text: "AI Tutor", icon: Brain, href: "/dashboard/academy/ai-tutor" },
        { key: "practice", text: "Practice Tests", icon: Target, href: "/dashboard/academy/practice" },
      ],
      localhub: [
        { key: "dashboard", text: "Hub Dashboard", icon: Home, href: "/dashboard/localhub" },
        { key: "businesses", text: "Directory Businesses", icon: Building2, href: "/dashboard/localhub/businesses" },
        { key: "analytics", text: "Community Analytics", icon: BarChart3, href: "/dashboard/localhub/analytics" },
        { key: "directories", text: "Manage Directories", icon: MapPin, href: "/dashboard/localhub/directories" },
        { key: "customization", text: "Hub Customization", icon: Settings, href: "/dashboard/localhub/customization" },
        { key: "domains", text: "Domain Management", icon: Monitor, href: "/dashboard/localhub/domains" },
        { key: "marketing", text: "Marketing", icon: TrendingUp, href: "/dashboard/localhub/marketing" },
        { key: "create", text: "Create Directory", icon: Plus, href: "/dashboard/localhub/create-directory" },
      ],
      developers: [
        { key: "dashboard", text: "Dashboard", icon: BarChart3, href: "/dashboard/developers" },
        { key: "api-docs", text: "API Documentation", icon: Book, href: "/dashboard/developers/docs" },
        { key: "api-keys", text: "API Keys", icon: Key, href: "/dashboard/developers/keys" },
        { key: "webhooks", text: "Webhooks", icon: Zap, href: "/dashboard/developers/webhooks" },
        { key: "applications", text: "Applications", icon: Monitor, href: "/dashboard/developers/applications" },
        { key: "settings", text: "Settings", icon: Settings, href: "/dashboard/developers/settings" },
      ],
      gofor: [
        { key: "dashboard", text: "Dashboard", icon: BarChart3, href: "/dashboard/gofor" },
        { key: "requests", text: "Delivery Requests", icon: Truck, href: "/dashboard/gofor/requests" },
        { key: "history", text: "Delivery History", icon: Clock, href: "/dashboard/gofor/history" },
        { key: "earnings", text: "Earnings", icon: DollarSign, href: "/dashboard/gofor/earnings" },
        { key: "settings", text: "Settings", icon: Settings, href: "/dashboard/gofor/settings" },
      ],
      jobs: [
        { key: "find-jobs", text: "Find Jobs", icon: Briefcase, href: "/jobs" },
        { key: "company-reviews", text: "Company Reviews", icon: Star, href: "/reviews" },
        { key: "salary-guide", text: "Salary Guide", icon: DollarSign, href: "/salary" },
        { key: "post-job", text: "Post Job", icon: Plus, href: "/jobs/post" },
      ],
      site: [
        { key: "home", text: "Home", icon: Home, href: "/" },
        { key: "discover", text: "Discover", icon: Star, href: "/discover" },
        { key: "categories", text: "Categories", icon: MapPin, href: "/categories" },
        { key: "jobs", text: "Jobs", icon: Briefcase, href: "/jobs" },
        { key: "store", text: "Store", icon: ShoppingCart, href: "/store" },
        { key: "localhub", text: "LocalHub", icon: Building2, href: "/localhub" },
        { key: "academy", text: "Academy", icon: GraduationCap, href: "/academy" },
        ...(readFlagFromDOM('data-flag-fleet-management') ? [{ key: "fleet", text: "Fleet", icon: Truck, href: "/fleet" }] : []),
        { key: "pricing", text: "Pricing", icon: Calculator, href: "/pricing" },
        { key: "advertise", text: "Advertise", icon: TrendingUp, href: "/advertise" },
        { key: "developers", text: "API", icon: Monitor, href: "/developers" },
      ],
    };

    return navConfigs[dashboardType] || navConfigs.business;
  }, [dashboardType, customNavItems]);

  // Handle logout with performance tracking
  const handleLogout = async () => {
    const logoutStart = performance.now();
    try {
      await logout();
      const logoutTime = performance.now() - logoutStart;
      logger.performance(`Logout completed in ${logoutTime.toFixed(2)}ms`);
      logger.debug('User logout', {
        dashboardType,
        userRoles,
        sessionDuration: performance.now() - startTime
      });
      router.push('/');
    } catch (error) {
      logger.error('Logout failed', error);
    }
  };

  // Get active navigation key based on current path
  const activeNavKey = useMemo(() => {
    const currentPath = pathname;
    
    // For dashboard paths, get the section after /dashboard/[type]/
    if (currentPath.startsWith('/dashboard/')) {
      const pathParts = currentPath.split('/');
      if (pathParts.length >= 4) {
        return pathParts[3]; // e.g., /dashboard/business/schedule -> "schedule"
      }
      return 'dashboard';
    }
    
    // For site pages, match exact paths
    const matchedItem = getNavigationItems.find(item => 
      item.href === currentPath || currentPath.startsWith(item.href + '/')
    );
    return matchedItem?.key || 'home';
  }, [pathname, getNavigationItems]);

  // Sub-navigation configurations
  const businessSubNavItems = useMemo(() => {
    return {
      // Business Dashboard Sub-Navigation
      business: {
        dashboard: [
          { text: "Overview", href: "/dashboard/business" },
          { text: "Real-time Insights", href: "/dashboard/business/dashboard/real-time-insights" },
        ],
        profile: [
          { text: "Business Profile", href: "/dashboard/business/profile" },
          { text: "Photos & Media", href: "/dashboard/business/profile/media" },
          { text: "Business Hours", href: "/dashboard/business/profile/hours" },
          { text: "Service Areas", href: "/dashboard/business/profile/areas" },
        ],
        schedule: [
          { text: "Calendar View", href: "/dashboard/business/schedule/calendar" },
          { text: "New Job", href: "/dashboard/business/schedule/new-job" },
          { text: "Route Planner", href: "/dashboard/business/schedule/route-planner" },
          { text: "Recurring Jobs", href: "/dashboard/business/schedule/recurring-jobs" },
        ],
        customers: [
          { text: "Customer List", href: "/dashboard/business/customers/list" },
          { text: "Customer Details", href: "/dashboard/business/customers/details" },
          { text: "Service History", href: "/dashboard/business/customers/service-history" },
          { text: "Messages Log", href: "/dashboard/business/customers/messages-log" },
        ],
        estimates: [
          { text: "Create Estimate", href: "/dashboard/business/estimates/create" },
          { text: "Estimate List", href: "/dashboard/business/estimates/list" },
          { text: "Templates", href: "/dashboard/business/estimates/templates" },
          { text: "Follow-ups", href: "/dashboard/business/estimates/follow-ups" },
        ],
        invoices: [
          { text: "Create Invoice", href: "/dashboard/business/invoices/create" },
          { text: "Invoice List", href: "/dashboard/business/invoices/list" },
          { text: "Payments", href: "/dashboard/business/invoices/payments" },
          { text: "Accounting Sync", href: "/dashboard/business/invoices/accounting-sync" },
        ],
        inventory: [
          { text: "Stock List", href: "/dashboard/business/inventory/stock-list" },
          { text: "Purchase Orders", href: "/dashboard/business/inventory/purchase-orders" },
          { text: "Vendors", href: "/dashboard/business/inventory/vendors" },
          { text: "Parts Usage", href: "/dashboard/business/inventory/parts-usage" },
        ],
        employees: [
          { text: "Staff List", href: "/dashboard/business/employees/staff-list" },
          { text: "Roles & Skills", href: "/dashboard/business/employees/roles-skills" },
          { text: "Onboarding", href: "/dashboard/business/employees/onboarding" },
          { text: "Vehicle Tracking", href: "/dashboard/business/employees/vehicle-tracking" },
        ],
        communication: [
          { text: "Inbox", href: "/dashboard/business/communication/inbox" },
          { text: "Team Chat", href: "/dashboard/business/communication/team-chat" },
          { text: "Calls", href: "/dashboard/business/communication/calls" },
          { text: "VoIP Management", href: "/dashboard/business/communication/voip-management" },
        ],
        analytics: [
          { text: "Dashboard", href: "/dashboard/business/analytics/dashboard" },
          { text: "Job Profit Analysis", href: "/dashboard/business/analytics/job-profit-analysis" },
          { text: "Marketing Attribution", href: "/dashboard/business/analytics/marketing-attribution" },
          { text: "Geo Heatmaps", href: "/dashboard/business/analytics/geo-heatmaps" },
        ],
        marketing: [
          { text: "Campaigns", href: "/dashboard/business/marketing/campaigns" },
          { text: "Reviews", href: "/dashboard/business/marketing/reviews" },
          { text: "Online Booking", href: "/dashboard/business/marketing/online-booking" },
          { text: "Website Builder", href: "/dashboard/business/marketing/website-builder" },
        ],
      },

      // User Dashboard Sub-Navigation
      user: {
        dashboard: [
          { text: "My Activity", href: "/dashboard/user/activity" },
          { text: "Recommendations", href: "/dashboard/user/recommendations" },
        ],
        jobs: [
          { text: "Job Applications", href: "/dashboard/user/jobs" },
          { text: "Create Job Post", href: "/dashboard/user/jobs/create" },
          { text: "Saved Jobs", href: "/dashboard/user/jobs/saved" },
          { text: "Application History", href: "/dashboard/user/jobs/history" },
        ],
        reviews: [
          { text: "My Reviews", href: "/dashboard/user/reviews" },
          { text: "Write Review", href: "/dashboard/user/reviews/create" },
          { text: "Review History", href: "/dashboard/user/reviews/history" },
        ],
        activity: [
          { text: "Recent Activity", href: "/dashboard/user/activity" },
          { text: "Interaction History", href: "/dashboard/user/activity/history" },
        ],
        referral: [
          { text: "Referral Program", href: "/dashboard/user/referral" },
          { text: "My Referrals", href: "/dashboard/user/referral/list" },
        ],
        billing: [
          { text: "Billing Overview", href: "/dashboard/user/billing" },
          { text: "Payment Methods", href: "/dashboard/user/billing/methods" },
          { text: "Transaction History", href: "/dashboard/user/billing/history" },
        ],
        settings: [
          { text: "Profile Settings", href: "/dashboard/user/settings" },
          { text: "Privacy Settings", href: "/dashboard/user/settings/privacy" },
          { text: "Notification Settings", href: "/dashboard/user/settings/notifications" },
        ],
      },

      // Admin Dashboard Sub-Navigation
      admin: {
        dashboard: [
          { text: "System Overview", href: "/dashboard/admin" },
          { text: "Recent Activities", href: "/dashboard/admin/activities" },
          { text: "System Health", href: "/dashboard/admin/health" },
        ],
        users: [
          { text: "All Users", href: "/dashboard/admin/users" },
          { text: "User Roles", href: "/dashboard/admin/users/roles" },
          { text: "Pending Approvals", href: "/dashboard/admin/users/pending" },
          { text: "User Analytics", href: "/dashboard/admin/users/analytics" },
        ],
        customers: [
          { text: "Customer List", href: "/dashboard/admin/customers" },
          { text: "Support Tickets", href: "/dashboard/admin/customers/support" },
          { text: "Billing Issues", href: "/dashboard/admin/customers/billing" },
        ],
        billing: [
          { text: "Revenue Dashboard", href: "/dashboard/admin/billing" },
          { text: "Subscription Management", href: "/dashboard/admin/billing/subscriptions" },
          { text: "Payment Processing", href: "/dashboard/admin/billing/payments" },
        ],
        "pro-accounts": [
          { text: "Pro Account Management", href: "/dashboard/admin/pro-accounts" },
          { text: "Feature Access", href: "/dashboard/admin/pro-accounts/features" },
          { text: "Upgrade Requests", href: "/dashboard/admin/pro-accounts/upgrades" },
        ],
        reports: [
          { text: "System Reports", href: "/dashboard/admin/reports" },
          { text: "User Analytics", href: "/dashboard/admin/reports/users" },
          { text: "Revenue Reports", href: "/dashboard/admin/reports/revenue" },
        ],
        support: [
          { text: "Support Dashboard", href: "/dashboard/admin/support" },
          { text: "Ticket Management", href: "/dashboard/admin/support/tickets" },
          { text: "Knowledge Base", href: "/dashboard/admin/support/kb" },
        ],
        settings: [
          { text: "System Settings", href: "/dashboard/admin/settings" },
          { text: "Feature Flags", href: "/dashboard/admin/settings/features" },
          { text: "API Configuration", href: "/dashboard/admin/settings/api" },
        ],
      },

      // Academy Dashboard Sub-Navigation
      academy: {
        dashboard: [
          { text: "Learning Path", href: "/dashboard/academy" },
          { text: "Recent Activity", href: "/dashboard/academy/activity" },
        ],
        courses: [
          { text: "All Courses", href: "/dashboard/academy/courses" },
          { text: "In Progress", href: "/dashboard/academy/courses/progress" },
          { text: "Completed", href: "/dashboard/academy/courses/completed" },
          { text: "Recommended", href: "/dashboard/academy/courses/recommended" },
        ],
        progress: [
          { text: "Learning Analytics", href: "/dashboard/academy/progress" },
          { text: "Skill Assessment", href: "/dashboard/academy/progress/skills" },
          { text: "Study Schedule", href: "/dashboard/academy/progress/schedule" },
        ],
        certifications: [
          { text: "My Certificates", href: "/dashboard/academy/certifications" },
          { text: "Available Certs", href: "/dashboard/academy/certifications/available" },
          { text: "Cert Requirements", href: "/dashboard/academy/certifications/requirements" },
        ],
      },

      // LocalHub Dashboard Sub-Navigation
      localhub: {
        dashboard: [
          { text: "Hub Overview", href: "/dashboard/localhub" },
          { text: "Community Stats", href: "/dashboard/localhub/analytics" },
        ],
        businesses: [
          { text: "Directory Businesses", href: "/dashboard/localhub/businesses" },
          { text: "Business Management", href: "/dashboard/localhub/businesses" },
        ],
        analytics: [
          { text: "Community Analytics", href: "/dashboard/localhub/analytics" },
          { text: "Performance Metrics", href: "/dashboard/localhub/analytics" },
        ],
        directories: [
          { text: "Manage Directories", href: "/dashboard/localhub/directories" },
          { text: "Directory Settings", href: "/dashboard/localhub/directories" },
        ],
        customization: [
          { text: "Hub Customization", href: "/dashboard/localhub/customization" },
          { text: "Theme Settings", href: "/dashboard/localhub/customization/theme" },
        ],
        domains: [
          { text: "Domain Management", href: "/dashboard/localhub/domains" },
          { text: "DNS Settings", href: "/dashboard/localhub/domains/dns" },
        ],
        create: [
          { text: "Create Directory", href: "/dashboard/localhub/create-directory" },
          { text: "Directory Templates", href: "/dashboard/localhub/create-directory/templates" },
        ],
      },

      // Developers Dashboard Sub-Navigation  
      developers: {
        dashboard: [
          { text: "Developer Overview", href: "/dashboard/developers" },
          { text: "API Usage", href: "/dashboard/developers/usage" },
        ],
        "api-docs": [
          { text: "API Documentation", href: "/dashboard/developers/docs" },
          { text: "Getting Started", href: "/dashboard/developers/docs/getting-started" },
          { text: "API Reference", href: "/dashboard/developers/docs/reference" },
        ],
        "api-keys": [
          { text: "Manage API Keys", href: "/dashboard/developers/keys" },
          { text: "Create New Key", href: "/dashboard/developers/keys/create" },
        ],
        webhooks: [
          { text: "Webhook Management", href: "/dashboard/developers/webhooks" },
          { text: "Event Logs", href: "/dashboard/developers/webhooks/logs" },
        ],
        settings: [
          { text: "Developer Settings", href: "/dashboard/developers/settings" },
          { text: "Account Configuration", href: "/dashboard/developers/settings/account" },
        ],
      },

      // GoFor Dashboard Sub-Navigation
      gofor: {
        dashboard: [
          { text: "Delivery Overview", href: "/dashboard/gofor" },
          { text: "Active Requests", href: "/dashboard/gofor/active" },
        ],
        requests: [
          { text: "All Requests", href: "/dashboard/gofor/requests" },
          { text: "Available Jobs", href: "/dashboard/gofor/requests/available" },
          { text: "My Deliveries", href: "/dashboard/gofor/requests/mine" },
        ],
        history: [
          { text: "Delivery History", href: "/dashboard/gofor/history" },
          { text: "Performance Stats", href: "/dashboard/gofor/history/stats" },
        ],
        earnings: [
          { text: "Earnings Overview", href: "/dashboard/gofor/earnings" },
          { text: "Payment History", href: "/dashboard/gofor/earnings/payments" },
        ],
        settings: [
          { text: "Driver Settings", href: "/dashboard/gofor/settings" },
          { text: "Vehicle Information", href: "/dashboard/gofor/settings/vehicle" },
        ],
      },
    };
  }, []);

  // Auth Header (Login/Signup pages) - Redesigned with back button next to logo
  if (dashboardType === "auth") {
    return (
      <header className="sticky top-0 left-0 right-0 z-[60] bg-background/95 backdrop-blur-sm border-b border-border/40">
        <div className="flex items-center justify-between px-6 py-4 sm:px-8 sm:py-5">
          {/* Left Section - Back Button, Logo, and Title */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              asChild
              className="h-10 w-10 p-0 rounded-full hover:bg-muted/60 transition-all duration-200 group"
              title="Go back"
            >
              <Link href={backHref} className="flex items-center justify-center">
                <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
            </Button>
            
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center group" title="Home">
                <Image 
                  src="/logos/ThorbisLogo.webp" 
                  alt={customTitle || config.title}
                  width={32} 
                  height={32} 
                  className="w-8 h-8 transition-all duration-200 group-hover:scale-105" 
                />
              </Link>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-foreground">
                  {customTitle || config.title}
                </h1>
                <p className="text-xs text-muted-foreground -mt-0.5">
                  Authentication
                </p>
              </div>
            </div>
          </div>

          {/* Right Section - Controls */}
          <div className="flex items-center space-x-2">
            <DevAuthTools />
            <DarkModeToggle />
          </div>
        </div>
      </header>
    );
  }

  // Marketing Header (Site pages) - Professional two-section layout
  if (dashboardType === "site") {
    return (
      <>
        <FallbackMobileMenu />
        <div className="sticky top-0 z-[9999] bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-800 border-b border-neutral-800/50 shadow-lg backdrop-blur-md">
        {/* Main Header */}
        <div className="flex items-center w-full py-3 px-4 sm:py-4 sm:px-6 lg:px-8">
          {/* Left Section - Logo & Search */}
          <div className="flex items-center space-x-3 sm:space-x-6 flex-1 min-w-0">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0 group">
              <Image
                src="/logos/ThorbisLogo.webp"
                alt={config.title}
                width={32}
                height={32}
                className="h-7 w-auto sm:h-8 object-contain transition-transform duration-200 group-hover:scale-105"
              />
              <span className="ml-2 text-lg font-bold text-white hidden sm:block">Thorbis</span>
            </Link>

            {/* Enhanced Search Bar */}
            {showSearch && (
              <div className="flex-1 max-w-xl hidden sm:block">
                <div className="relative">
                  <AdvancedSearchHeader 
                    onSearch={(query, location) => {
                      logger.debug('Site search', { query, location });
                      if (query.trim()) {
                        router.push(`/search?q=${encodeURIComponent(query)}${location ? `&location=${encodeURIComponent(location)}` : ''}`);
                      }
                    }}
                    placeholder="Find restaurants, services, and more..."
                    className="w-full"
                    showAiMode={false}
                    showVoiceSearch={true}
                    showLocationSelector={true}
                  />
                  {/* Search Bar Enhancement Overlay */}
                  <div className="absolute inset-0 pointer-events-none rounded-lg bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            )}
          </div>

          {/* Right Section - Navigation & User Controls */}
          <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6 flex-shrink-0">
            {/* Navigation Menu (Desktop) */}
            <nav className="hidden lg:flex items-center">
              <div className="flex space-x-1 items-center">
                {/* Show first 4 main navigation items */}
                {getNavigationItems.slice(0, 4).map((item) => {
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link key={item.key} href={item.href}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`px-3 py-2 text-sm font-medium relative transition-all duration-200 ${
                          isActive 
                            ? "bg-primary/20 text-primary/90 border-primary shadow-sm" 
                            : "text-white hover:text-primary/90 hover:bg-primary/20"
                        }`}
                      >
                        {item.text}
                        {item.badge && (
                          <Badge variant="secondary" className="ml-2 text-xs bg-success/10 text-success dark:bg-success/20 dark:text-success/90">
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  );
                })}

                                {/* Unified Menu Dropdown */}
                <ClientOnlyWrapper>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-white hover:text-primary/90 hover:bg-primary/20 px-3 py-2 text-sm font-medium transition-all duration-200"
                      >
                        <span className="flex items-center space-x-1">
                          <span>Menu</span>
                          <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" side="top" className="w-[600px] p-4 z-[10000]">
                    <div className="grid grid-cols-3 gap-6">
                      {/* Business Section */}
                      <div>
                        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                          For Business
                        </DropdownMenuLabel>
                        <div className="space-y-2">
                          <DropdownMenuItem asChild className="p-0">
                            <Link 
                              href="/add-a-business"
                              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                            >
                              <div className="w-6 h-6 bg-success/10 rounded-md flex items-center justify-center group-hover:bg-success/20 transition-colors">
                                <Plus className="h-3 w-3 text-success" />
                              </div>
                              <span className="text-sm font-medium">List Business</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="p-0">
                            <Link 
                              href="/dashboard/business"
                              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                            >
                              <div className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <BarChart3 className="h-3 w-3 text-primary" />
                              </div>
                              <span className="text-sm font-medium">Dashboard</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="p-0">
                            <Link 
                              href="/advertise"
                              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                            >
                              <div className="w-6 h-6 bg-warning/10 rounded-md flex items-center justify-center group-hover:bg-warning/20 transition-colors">
                                <Megaphone className="h-3 w-3 text-warning" />
                              </div>
                              <span className="text-sm font-medium">Advertise</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="p-0">
                            <Link 
                              href="/academy"
                              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                            >
                              <div className="w-6 h-6 bg-emerald-500/10 rounded-md flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                                <GraduationCap className="h-3 w-3 text-emerald-500" />
                              </div>
                              <span className="text-sm font-medium">Academy</span>
                            </Link>
                          </DropdownMenuItem>
                        </div>
                      </div>

                      {/* Platform Features */}
                      <div>
                        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                          Platform
                        </DropdownMenuLabel>
                        <div className="space-y-2">
                          <DropdownMenuItem asChild className="p-0">
                            <Link 
                              href="/store"
                              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                            >
                              <div className="w-6 h-6 bg-blue-500/10 rounded-md flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                <ShoppingCart className="h-3 w-3 text-blue-500" />
                              </div>
                              <span className="text-sm font-medium">Store</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="p-0">
                            <Link 
                              href="/localhub"
                              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                            >
                              <div className="w-6 h-6 bg-indigo-500/10 rounded-md flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                                <Building2 className="h-3 w-3 text-indigo-500" />
                              </div>
                              <span className="text-sm font-medium">LocalHub</span>
                            </Link>
                          </DropdownMenuItem>
                          {readFlagFromDOM('data-flag-fleet-management') && (
                            <DropdownMenuItem asChild className="p-0">
                              <Link 
                                href="/fleet"
                                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                              >
                                <div className="w-6 h-6 bg-orange-500/10 rounded-md flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                                  <Truck className="h-3 w-3 text-orange-500" />
                                </div>
                                <span className="text-sm font-medium">Fleet</span>
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem asChild className="p-0">
                            <Link 
                              href="/jobs"
                              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                            >
                              <div className="w-6 h-6 bg-purple-500/10 rounded-md flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                                <Briefcase className="h-3 w-3 text-purple-500" />
                              </div>
                              <span className="text-sm font-medium">Jobs</span>
                            </Link>
                          </DropdownMenuItem>
                        </div>
                      </div>

                      {/* Resources */}
                      <div>
                        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                          Resources
                        </DropdownMenuLabel>
                        <div className="space-y-2">
                          <DropdownMenuItem asChild className="p-0">
                            <Link 
                              href="/pricing"
                              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                            >
                              <div className="w-6 h-6 bg-cyan-500/10 rounded-md flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                                <Calculator className="h-3 w-3 text-cyan-500" />
                              </div>
                              <span className="text-sm font-medium">Pricing</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="p-0">
                            <Link 
                              href="/developers"
                              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                            >
                              <div className="w-6 h-6 bg-gray-500/10 rounded-md flex items-center justify-center group-hover:bg-gray-500/20 transition-colors">
                                <Monitor className="h-3 w-3 text-gray-500" />
                              </div>
                              <span className="text-sm font-medium">API</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="p-0">
                            <Link 
                              href="/help"
                              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                            >
                              <div className="w-6 h-6 bg-amber-500/10 rounded-md flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                                <HelpCircle className="h-3 w-3 text-amber-500" />
                              </div>
                              <span className="text-sm font-medium">Help</span>
                            </Link>
                          </DropdownMenuItem>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions Footer */}
                    <div className="border-t border-muted mt-4 pt-4 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 h-9 font-medium"
                        asChild
                      >
                        <Link href="/add-a-business">
                          <Plus className="h-3 w-3 mr-2" />
                          List Business
                        </Link>
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 h-9 font-medium"
                        asChild
                      >
                        <Link href="/pricing">
                          <Calculator className="h-3 w-3 mr-2" />
                          View Pricing
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 h-9 font-medium"
                        asChild
                      >
                        <Link href="/help">
                          <HelpCircle className="h-3 w-3 mr-2" />
                          Get Help
                        </Link>
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                </ClientOnlyWrapper>
              </div>
            </nav>

            {/* User Controls */}
            <div className="flex items-center space-x-3">
              {/* Cart (always shown) */}
              <Button
                variant="ghost"
                size="sm"
                onClick={openCart}
                className="relative flex items-center justify-center h-10 w-10 hover:bg-muted transition-colors"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full text-xs text-white flex items-center justify-center">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Button>

              {/* Advanced Search Trigger (if search not shown) */}
              {!showSearch && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvancedSearch(true)}
                  className="relative flex items-center justify-center h-10 w-10 hover:bg-muted transition-colors"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                </Button>
              )}

              {/* User Profile */}
              {(user && isAuthenticated && !authBypass) ? (
                <ClientOnlyWrapper>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={getAvatarUrl()} alt={getDisplayName()} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getDisplayName()?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 z-[10000]" align="end" side="top" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {/* Dashboard Switcher */}
                    <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                      Switch Dashboard
                    </DropdownMenuLabel>
                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/user" className={dashboardType === 'user' ? 'bg-accent' : ''}>
                          <User className="mr-2 h-4 w-4" />
                          <span>User Dashboard</span>
                          {dashboardType === 'user' && <Badge variant="secondary" className="ml-auto text-xs">Current</Badge>}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/business" className={dashboardType === 'business' ? 'bg-accent' : ''}>
                          <Building2 className="mr-2 h-4 w-4" />
                          <span>Business Dashboard</span>
                          {dashboardType === 'business' && <Badge variant="secondary" className="ml-auto text-xs">Current</Badge>}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/academy" className={dashboardType === 'academy' ? 'bg-accent' : ''}>
                          <GraduationCap className="mr-2 h-4 w-4" />
                          <span>Academy Dashboard</span>
                          {dashboardType === 'academy' && <Badge variant="secondary" className="ml-auto text-xs">Current</Badge>}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/localhub" className={dashboardType === 'localhub' ? 'bg-accent' : ''}>
                          <Home className="mr-2 h-4 w-4" />
                          <span>LocalHub Dashboard</span>
                          {dashboardType === 'localhub' && <Badge variant="secondary" className="ml-auto text-xs">Current</Badge>}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/gofor" className={dashboardType === 'gofor' ? 'bg-accent' : ''}>
                          <Truck className="mr-2 h-4 w-4" />
                          <span>GoFor Dashboard</span>
                          {dashboardType === 'gofor' && <Badge variant="secondary" className="ml-auto text-xs">Current</Badge>}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/admin" className={dashboardType === 'admin' ? 'bg-accent' : ''}>
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin Dashboard</span>
                          {dashboardType === 'admin' && <Badge variant="secondary" className="ml-auto text-xs">Current</Badge>}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/developers" className={dashboardType === 'developers' ? 'bg-accent' : ''}>
                          <Monitor className="mr-2 h-4 w-4" />
                          <span>Developers Dashboard</span>
                          {dashboardType === 'developers' && <Badge variant="secondary" className="ml-auto text-xs">Current</Badge>}
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />

                    {/* Profile Actions */}
                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/user/settings">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/user/billing">
                          <CreditCard className="mr-2 h-4 w-4" />
                          <span>Billing</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/user/settings">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Support</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                </ClientOnlyWrapper>
              ) : (
                !authBypass && (
                  <div className="hidden lg:flex items-center space-x-2">
                    <Link href="/login">
                      <Button variant="ghost" size="sm">Sign In</Button>
                    </Link>
                    <Link href="/signup">
                      <Button size="sm">Sign Up</Button>
                    </Link>
                  </div>
                )
              )}

              {/* Auth Bypass Indicator */}
              {authBypass && (
                <div className="flex items-center px-2 py-1 bg-warning/10 dark:bg-warning/20 text-warning dark:text-warning/80 rounded-md text-xs font-medium">
                  <Key className="h-3 w-3 mr-1" />
                  Auth Bypass
                </div>
              )}

              {/* Mobile Search Button */}
              {showSearch && (
                <Button
                  variant="outline"
                  size="sm"
                  className="sm:hidden flex items-center justify-center h-10 w-10 border-border/50 bg-background/80 backdrop-blur-sm hover:bg-muted/80 transition-all duration-200 shadow-sm"
                  onClick={() => {
                    // Trigger search focus or open search modal
                    router.push('/search');
                  }}
                >
                  <Search className="h-5 w-5 text-foreground" />
                </Button>
              )}

              {/* Dark Mode Toggle for Site Header */}
              <div className="hidden sm:block">
                <DarkModeToggle />
              </div>

              {/* Mobile Menu */}
              <ClientOnlyWrapper>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="lg:hidden mobile-menu-button flex items-center justify-center h-10 w-10 border-border/50 bg-background/80 backdrop-blur-sm hover:bg-muted/80 transition-all duration-200 shadow-sm"
                  onClick={() => setMobileMenuOpen(true)}

                >
                  <Menu className="h-5 w-5 text-foreground" />
                </Button>
                
                <EnhancedMobileMenu
                  isOpen={mobileMenuOpen}
                  onClose={() => setMobileMenuOpen(false)}
                  dashboardType={dashboardType}
                  navigationItems={getNavigationItems}
                  activeNavKey={activeNavKey}
                  config={config}
                  businessSubNavItems={businessSubNavItems}
                  showAuthButtons={dashboardType === "site"}
                />
              </ClientOnlyWrapper>
            </div>
          </div>
        </div>

        {/* Advanced Search Dialog */}
        {showAdvancedSearch && (
          <AdvancedSearch 
            dashboardType={dashboardType}
            onSearchSelect={() => setShowAdvancedSearch(false)}
            isOpen={showAdvancedSearch}
            onClose={() => setShowAdvancedSearch(false)}
          />
        )}
      </div>
        </>
    );
  }

  // Dashboard Headers (business, user, admin, etc.) - Show sub-navigation
  return (
    <>
      <div className="sticky top-0 z-[9999] bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-800 border-b border-neutral-800/50 shadow-lg backdrop-blur-md">
      {/* Main Header */}
      <div className="flex items-center justify-between py-3 px-4 sm:py-4 sm:px-6 lg:px-8">
        {/* Left - Navigation & Search */}
        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
          <nav className="hidden lg:flex items-center space-x-1">
            {getNavigationItems.slice(0, 6).map((item) => {
              const isActive = activeNavKey === item.key;
              
              return (
                <Link key={item.key} href={item.href}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? "bg-primary/20 text-primary/90 shadow-sm" 
                        : "text-white hover:text-primary/90 hover:bg-primary/20"
                    }`}
                  >
                    {item.text}
                    {item.badge && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}

            {/* "Explore" Dropdown for additional nav items */}
            <ClientOnlyWrapper>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-sm font-medium text-white hover:text-primary/90 hover:bg-primary/20 px-3 py-2 transition-all duration-200"
                  >
                    <span className="flex items-center space-x-1">
                      <span>Explore</span>
                      <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                    </span>
                  </Button>
                </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top" className="w-80 p-4 z-[10000]">
                <div className="space-y-4">
                  {/* Additional Dashboard Features */}
                  <div>
                    <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      More Features
                    </DropdownMenuLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {getNavigationItems.slice(6).map((item) => (
                        <DropdownMenuItem key={item.key} asChild className="p-0">
                          <Link 
                            href={item.href}
                            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                          >
                            <div className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <item.icon className="h-3 w-3 text-primary" />
                            </div>
                            <span className="text-xs font-medium">{item.text}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </div>

                  {/* Platform Links */}
                  <div className="border-t border-muted pt-3">
                    <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      Platform
                    </DropdownMenuLabel>
                    <div className="grid grid-cols-2 gap-2">
                      <DropdownMenuItem asChild className="p-0">
                        <Link 
                          href="/store"
                          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          <div className="w-6 h-6 bg-blue-500/10 rounded-md flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                            <ShoppingCart className="h-3 w-3 text-blue-500" />
                          </div>
                          <span className="text-xs font-medium">Store</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="p-0">
                        <Link 
                          href="/jobs"
                          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          <div className="w-6 h-6 bg-purple-500/10 rounded-md flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                            <Briefcase className="h-3 w-3 text-purple-500" />
                          </div>
                          <span className="text-xs font-medium">Jobs</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="p-0">
                        <Link 
                          href="/academy"
                          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          <div className="w-6 h-6 bg-emerald-500/10 rounded-md flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                            <GraduationCap className="h-3 w-3 text-emerald-500" />
                          </div>
                          <span className="text-xs font-medium">Academy</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="p-0">
                        <Link 
                          href="/help"
                          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          <div className="w-6 h-6 bg-amber-500/10 rounded-md flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                            <HelpCircle className="h-3 w-3 text-amber-500" />
                          </div>
                          <span className="text-xs font-medium">Help</span>
                        </Link>
                      </DropdownMenuItem>
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            </ClientOnlyWrapper>
          </nav>
        </div>

        {/* Right - User Controls */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <RealTimeNotifications dashboardType={dashboardType} />
          <KeyboardShortcuts dashboardType={dashboardType} />
          
          {/* Auth Bypass Indicator */}
          {authBypass && (
            <div className="flex items-center px-2 py-1 bg-warning/10 dark:bg-warning/20 text-warning dark:text-warning/80 rounded-md text-xs font-medium">
              <Key className="h-3 w-3 mr-1" />
              Auth Bypass
            </div>
          )}
          
          <DarkModeToggle />

          {/* User Menu */}
          {(user && isAuthenticated && !authBypass) ? (
            <ClientOnlyWrapper>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={getAvatarUrl()} alt={getDisplayName()} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getDisplayName()?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 z-[10000]" align="end" side="top" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Dashboard Switcher */}
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                  Switch Dashboard
                </DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/user" className={dashboardType === 'user' ? 'bg-accent' : ''}>
                      <User className="mr-2 h-4 w-4" />
                      <span>User Dashboard</span>
                      {dashboardType === 'user' && <Badge variant="secondary" className="ml-auto text-xs">Current</Badge>}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/business" className={dashboardType === 'business' ? 'bg-accent' : ''}>
                      <Building2 className="mr-2 h-4 w-4" />
                      <span>Business Dashboard</span>
                      {dashboardType === 'business' && <Badge variant="secondary" className="ml-auto text-xs">Current</Badge>}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/academy" className={dashboardType === 'academy' ? 'bg-accent' : ''}>
                      <GraduationCap className="mr-2 h-4 w-4" />
                      <span>Academy Dashboard</span>
                      {dashboardType === 'academy' && <Badge variant="secondary" className="ml-auto text-xs">Current</Badge>}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/localhub" className={dashboardType === 'localhub' ? 'bg-accent' : ''}>
                      <Home className="mr-2 h-4 w-4" />
                      <span>LocalHub Dashboard</span>
                      {dashboardType === 'localhub' && <Badge variant="secondary" className="ml-auto text-xs">Current</Badge>}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/gofor" className={dashboardType === 'gofor' ? 'bg-accent' : ''}>
                      <Truck className="mr-2 h-4 w-4" />
                      <span>GoFor Dashboard</span>
                      {dashboardType === 'gofor' && <Badge variant="secondary" className="ml-auto text-xs">Current</Badge>}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/admin" className={dashboardType === 'admin' ? 'bg-accent' : ''}>
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                      {dashboardType === 'admin' && <Badge variant="secondary" className="ml-auto text-xs">Current</Badge>}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/developers" className={dashboardType === 'developers' ? 'bg-accent' : ''}>
                      <Monitor className="mr-2 h-4 w-4" />
                      <span>Developers Dashboard</span>
                      {dashboardType === 'developers' && <Badge variant="secondary" className="ml-auto text-xs">Current</Badge>}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />

                {/* Profile Actions */}
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/user/settings">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/user/billing">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Billing</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/user/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Support</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </ClientOnlyWrapper>
          ) : (
            !authBypass && (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )
          )}

                        {/* Mobile Menu */}
              <ClientOnlyWrapper>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="lg:hidden mobile-menu-button flex items-center justify-center h-10 w-10 border-border/50 bg-background/80 backdrop-blur-sm hover:bg-muted/80 transition-all duration-200 shadow-sm"
                  onClick={() => setMobileMenuOpen(true)}

                >
                  <Menu className="h-5 w-5 text-foreground" />
                </Button>
            
            <EnhancedMobileMenu
              isOpen={mobileMenuOpen}
              onClose={() => setMobileMenuOpen(false)}
              dashboardType={dashboardType}
              navigationItems={getNavigationItems}
              activeNavKey={activeNavKey}
              config={config}
              businessSubNavItems={businessSubNavItems}
            />
          </ClientOnlyWrapper>
        </div>
      </div>

      {/* Sub-header */}
      {businessSubNavItems[dashboardType] && businessSubNavItems[dashboardType][activeNavKey] && businessSubNavItems[dashboardType][activeNavKey].length > 0 && (
        <div className="border-t border-neutral-800 bg-neutral-900">
          <div className="px-2 lg:px-3 py-2">
            <nav className="flex space-x-1 overflow-x-auto">
              {businessSubNavItems[dashboardType][activeNavKey].map((subItem, index) => (
                <Link
                  key={index}
                  href={subItem.href}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex-shrink-0 ${
                    pathname === subItem.href
                      ? 'bg-primary/20 text-primary/90 border border-primary'
                      : 'text-neutral-400 hover:text-primary/90 hover:bg-primary/20'
                  }`}
                >
                  {subItem.text}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Advanced Search Dialog */}
      {showAdvancedSearch && (
        <AdvancedSearch 
          dashboardType={dashboardType}
          onSearchSelect={() => setShowAdvancedSearch(false)}
          isOpen={showAdvancedSearch}
          onClose={() => setShowAdvancedSearch(false)}
        />
      )}
    </div>
    </>
  );
}
