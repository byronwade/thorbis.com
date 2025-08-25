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
import SmartBusinessNavigation from "@components/navigation/SmartBusinessNavigation";
import ModernUnifiedHeader from "./modern-unified-header";
import StableHeader from "./stable-header";
import PageSubHeader from "@components/navigation/PageSubHeader";
import {
  BarChart3,
  Building2,
  Calendar,
  Settings,
  LogOut,
  User,
  UserPlus,
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
  Activity,
  Phone,
  PhoneCall,
  Bell,
  Cloud,
  BellRing,
  Keyboard,
  Sun,
  Moon,
  Tag,
  Plug,
  Download,
  Wrench,
  BookOpen,
  Wifi,
  Battery,
  Volume2,
  Navigation,
  Globe,
  Bookmark,
  Heart,
  Coffee,
  Timer,
  Thermometer,
  Map,
  Calendar as CalendarIcon,
  CloudRain,
  Sun as SunIcon,
  Moon as MoonIcon,
  CloudSnow,
  Palette,
  Music,
  Headphones,
  Radio,
  Signal,
  Server,
  Database,
  Cpu,
  HardDrive,
  MemoryStick,
  WifiOff,
  Bluetooth
} from "lucide-react";

import { RiComputerFill } from "react-icons/ri";
import { useTheme } from "next-themes";
import { useAuth } from "@context/auth-context";
import useBusinessStore from "@store/use-business-store";
import { useCartStore } from "@store/cart";
import logger from "@lib/utils/logger";
import { readFlagFromDOM } from "@lib/flags/client";
import AdvancedSearch from "./advanced-search";
import AdvancedSearchHeader from "./advanced-search-header";
import ClientOnlyWrapper from "./client-only-wrapper";
import BusinessSwitcher from "@components/header/BusinessSwitcher";
import UpdatesDropdown from "./updates-dropdown";
import { dashboardBusinesses } from "@data/dashboard-businesses";
import { handleIntelligentBusinessSwitch } from "@lib/routing/intelligent-business-router";

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
  backHref = "/",
  useModernHeader = true // Flag to use modern header
}) {
  
  // Use stable header to prevent hydration loops and browser extension issues
  if (useModernHeader) {
    return (
      <StableHeader
        dashboardType={dashboardType}
        showCompanySelector={showCompanySelector}
        showSearch={showSearch}
      />
    );
  }
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentCompanyId, setCurrentCompanyId] = useState("1");
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const { totalItems, openCart } = useCartStore();
  const [moreFilter, setMoreFilter] = useState("");
  
  // Time tracking state
  const [isClockedIn, setIsClockedIn] = useState(true);
  const [clockInTime, setClockInTime] = useState("9:15 AM");
  const [totalHoursToday, setTotalHoursToday] = useState("6.5");
  
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  
  // Check if we're on a field management page to use full header with sub-navigation
  const isFieldManagementPage = pathname.includes('/field-management');
  
  // For field management pages, use the full header instead of stable header to get sub-navigation
  if (useModernHeader && isFieldManagementPage) {
    // Continue with full header implementation
  } else if (useModernHeader) {
    return (
      <StableHeader
        dashboardType={dashboardType}
        showCompanySelector={showCompanySelector}
        showSearch={showSearch}
      />
    );
  }
  
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

  // Use global business store for persistent state
  const { activeBusinessId, setActiveBusinessId } = useBusinessStore();
  
  // Use shared dashboard business data for consistency
  const mockBusinesses = dashboardBusinesses;
  
  // Initialize business ID from store or default to "1"
  const currentBusinessId = activeBusinessId || "1";
  const currentBusiness = mockBusinesses.find(b => b.id === currentBusinessId);
  

  
  // Initialize store if not set (but only after rehydration is complete)
  useEffect(() => {
    // Wait a bit to ensure rehydration is complete
    const timer = setTimeout(() => {
      if (!activeBusinessId) {
        console.log('🔄 No activeBusinessId found after rehydration, setting default to "1"');
        setActiveBusinessId("1");
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [activeBusinessId, setActiveBusinessId]);
  
  const handleBusinessSwitch = (businessId) => {
    handleIntelligentBusinessSwitch(businessId, pathname, setActiveBusinessId);
  };

  // Check auth bypass flag for development/testing
  const authBypass = readFlagFromDOM('data-flag-auth-bypass');

  // Performance tracking
  const startTime = performance.now();

  // Handle clock in/out functionality
  const handleClockToggle = () => {
    if (isClockedIn) {
      // Clock out
      setIsClockedIn(false);
      setClockInTime("");
      // In a real app, you'd calculate actual hours worked
      setTotalHoursToday((prev) => (parseFloat(prev) + 0.5).toString());
    } else {
      // Clock in
      setIsClockedIn(true);
      const now = new Date();
      setClockInTime(now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }));
    }
  };

  // Fallback mobile menu button for testing - only show when no other mobile menu is available
  const FallbackMobileMenu = () => {
    // Only show fallback if we're on a page that doesn't have its own mobile menu
    const shouldShowFallback = dashboardType === "site" && !showSearch;
    
    if (!shouldShowFallback) return null;
    
    return (
      <div className="fixed top-4 right-4 z-[10000] lg:hidden">
        <UtilityButton
          icon={Menu}
          title="Mobile Menu"
          onClick={() => setMobileMenuOpen(true)}
          mobileMenu={true}
          variant="outline"
          className="mobile-menu-button"
          style={{ display: 'flex' }}
        />
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

  // Navigation items by dashboard type - Enhanced with smart navigation for business
  const getNavigationItems = useMemo(() => {
    if (customNavItems) return customNavItems;

    const navConfigs = {
      business: [
        // Core Dashboard Navigation
        { key: "overview", text: "Dashboard", icon: BarChart3, href: "/dashboard/business", category: "core", badge: null },
        
        // Field Management System (FMS) - Core Operations
        { key: "schedule", text: "Schedule", icon: Calendar, href: "/dashboard/business/field-management/schedule", category: "core", badge: null },
        { key: "new-job", text: "New Job", icon: Plus, href: "/dashboard/business/field-management/schedule/new-job", category: "core", badge: null },
        { key: "calendar", text: "Calendar", icon: Calendar, href: "/dashboard/business/field-management/schedule/calendar", category: "core", badge: null },
        { key: "dispatch", text: "Dispatch", icon: Target, href: "/dashboard/business/field-management/dispatch", category: "operations", badge: null },
        { key: "fleet", text: "Fleet Management", icon: Truck, href: "/dashboard/business/field-management/fleet", category: "operations", badge: null },
        { key: "route-planner", text: "Route Planner", icon: MapPin, href: "/dashboard/business/field-management/schedule/route-planner", category: "operations", badge: null },
        
        // Customer Management
        { key: "customers", text: "Customers", icon: Users, href: "/dashboard/business/field-management/customers", category: "sales", badge: null },
        { key: "customer-list", text: "Customer List", icon: Users, href: "/dashboard/business/field-management/customers/list", category: "sales", badge: null },
        { key: "customer-details", text: "Customer Details", icon: User, href: "/dashboard/business/field-management/customers/details", category: "sales", badge: null },
        { key: "service-history", text: "Service History", icon: Clock, href: "/dashboard/business/field-management/customers/service-history", category: "sales", badge: null },
        { key: "portal-access", text: "Portal Access", icon: Key, href: "/dashboard/business/field-management/customers/portal-access", category: "sales", badge: null },
        { key: "messages-log", text: "Messages Log", icon: MessageSquare, href: "/dashboard/business/field-management/customers/messages-log", category: "sales", badge: null },
        
        // Estimates & Proposals
        { key: "estimates", text: "Estimates", icon: Calculator, href: "/dashboard/business/field-management/estimates", category: "sales", badge: null },
        { key: "create-estimate", text: "Create Estimate", icon: Plus, href: "/dashboard/business/field-management/estimates/create", category: "sales", badge: null },
        { key: "estimate-list", text: "Estimate List", icon: FileText, href: "/dashboard/business/field-management/estimates/list", category: "sales", badge: null },
        { key: "proposals", text: "Proposals", icon: FileText, href: "/dashboard/business/field-management/estimates/proposals", category: "sales", badge: null },
        { key: "estimate-templates", text: "Templates", icon: FileText, href: "/dashboard/business/field-management/estimates/templates", category: "sales", badge: null },
        { key: "estimate-follow-ups", text: "Follow-ups", icon: Bell, href: "/dashboard/business/field-management/estimates/follow-ups", category: "sales", badge: 3 },
        { key: "estimate-approvals", text: "Approvals", icon: Shield, href: "/dashboard/business/field-management/estimates/approvals", category: "sales", badge: 2 },
        
        // Invoicing & Billing
        { key: "invoices", text: "Invoices", icon: Receipt, href: "/dashboard/business/field-management/invoices", category: "financial", badge: null },
        { key: "create-invoice", text: "Create Invoice", icon: Plus, href: "/dashboard/business/field-management/invoices/create", category: "financial", badge: null },
        { key: "invoice-list", text: "Invoice List", icon: FileText, href: "/dashboard/business/field-management/invoices/list", category: "financial", badge: null },
        { key: "invoice-payments", text: "Payments", icon: CreditCard, href: "/dashboard/business/field-management/invoices/payments", category: "financial", badge: null },
        { key: "invoice-financing", text: "Financing", icon: DollarSign, href: "/dashboard/business/field-management/invoices/financing", category: "financial", badge: null },
        { key: "accounting-sync", text: "Accounting Sync", icon: Plug, href: "/dashboard/business/field-management/invoices/accounting-sync", category: "financial", badge: null },
        
        // Communication Hub
        { key: "communication", text: "Communication", icon: MessageSquare, href: "/dashboard/business/field-management/communication", category: "business", badge: 5 },
        { key: "inbox", text: "Inbox", icon: Inbox, href: "/dashboard/business/field-management/communication/inbox", category: "business", badge: 3 },
        { key: "compose", text: "Compose", icon: Send, href: "/dashboard/business/field-management/communication/compose", category: "business", badge: null },
        { key: "team-chat", text: "Team Chat", icon: MessageSquare, href: "/dashboard/business/field-management/communication/team-chat", category: "business", badge: 2 },
        { key: "conversations", text: "Conversations", icon: MessageSquare, href: "/dashboard/business/field-management/communication/conversations", category: "business", badge: null },
        { key: "ticketing", text: "Ticketing", icon: HelpCircle, href: "/dashboard/business/field-management/communication/ticketing", category: "business", badge: 1 },
        
        // VoIP & Phone System
        { key: "voip", text: "VoIP System", icon: Phone, href: "/dashboard/business/field-management/voip", category: "business", badge: null },
        { key: "voip-call", text: "VoIP Call", icon: PhoneCall, href: "/dashboard/business/field-management/voip-call", category: "business", badge: null },
        { key: "calls", text: "Calls", icon: Phone, href: "/dashboard/business/field-management/communication/calls", category: "business", badge: null },
        { key: "call-recordings", text: "Call Recordings", icon: Phone, href: "/dashboard/business/field-management/communication/call-recordings", category: "business", badge: null },
        { key: "voice-video", text: "Voice & Video", icon: Phone, href: "/dashboard/business/field-management/communication/voice-video", category: "business", badge: null },
        { key: "voip-management", text: "VoIP Management", icon: Settings, href: "/dashboard/business/field-management/communication/voip-management", category: "business", badge: null },
        { key: "ivr-settings", text: "IVR Settings", icon: Settings, href: "/dashboard/business/field-management/communication/ivr-settings", category: "business", badge: null },
        { key: "csr-console", text: "CSR Console", icon: Monitor, href: "/dashboard/business/field-management/communication/csr-console", category: "business", badge: null },
        
        // Staff & Scheduling
        { key: "technician-availability", text: "Tech Availability", icon: Users, href: "/dashboard/business/field-management/schedule/technician-availability", category: "operations", badge: null },
        { key: "shifts", text: "Shifts", icon: Clock, href: "/dashboard/business/field-management/schedule/shifts", category: "operations", badge: null },
        { key: "time-off-requests", text: "Time Off", icon: Calendar, href: "/dashboard/business/field-management/schedule/time-off-requests", category: "operations", badge: 2 },
        { key: "capacity-planning", text: "Capacity Planning", icon: BarChart3, href: "/dashboard/business/field-management/schedule/capacity-planning", category: "analytics", badge: null },
        { key: "recurring-jobs", text: "Recurring Jobs", icon: Clock, href: "/dashboard/business/field-management/schedule/recurring-jobs", category: "operations", badge: null },
        { key: "advanced-scheduler", text: "Advanced Scheduler", icon: Settings, href: "/dashboard/business/field-management/schedule/advanced-scheduler", category: "operations", badge: null },
        
        // Industry-Specific: Restaurant Management  
        { key: "restaurant-dashboard", text: "Restaurant Dashboard", icon: ShoppingCart, href: "/dashboard/business/restaurants/dashboard", category: "business", badge: null },
        { key: "menu-management", text: "Menu Management", icon: FileText, href: "/dashboard/business/restaurants/menu", category: "business", badge: null },
        { key: "pos-system", text: "POS System", icon: Monitor, href: "/dashboard/business/restaurants/pos", category: "business", badge: null },
        { key: "kitchen-display", text: "Kitchen Display", icon: Monitor, href: "/dashboard/business/restaurants/kitchen", category: "operations", badge: null },
        { key: "reservations", text: "Reservations", icon: Calendar, href: "/dashboard/business/restaurants/reservations", category: "sales", badge: null },
        { key: "delivery-orders", text: "Delivery", icon: Truck, href: "/dashboard/business/restaurants/delivery", category: "operations", badge: null },
        { key: "restaurant-inventory", text: "Food Inventory", icon: Package, href: "/dashboard/business/restaurants/inventory", category: "inventory", badge: null },
        { key: "restaurant-staff", text: "Restaurant Staff", icon: Users, href: "/dashboard/business/restaurants/staff", category: "business", badge: null },
        { key: "restaurant-customers", text: "Restaurant Customers", icon: Users, href: "/dashboard/business/restaurants/customers", category: "sales", badge: null },
        { key: "restaurant-analytics", text: "Restaurant Analytics", icon: BarChart3, href: "/dashboard/business/restaurants/analytics", category: "analytics", badge: null },
        
        // Inventory & Parts Management (FMS-specific)
        { key: "parts-catalog", text: "Parts Catalog", icon: Package, href: "/dashboard/business/field-management/inventory/parts", category: "inventory", badge: null },
        { key: "stock-levels", text: "Stock Levels", icon: Package, href: "/dashboard/business/field-management/inventory/stock", category: "inventory", badge: null },
        { key: "purchase-orders", text: "Purchase Orders", icon: Receipt, href: "/dashboard/business/field-management/inventory/purchase-orders", category: "inventory", badge: null },
        { key: "suppliers", text: "Suppliers", icon: Building2, href: "/dashboard/business/field-management/inventory/suppliers", category: "inventory", badge: null },
        { key: "warehouse", text: "Warehouse", icon: Package, href: "/dashboard/business/field-management/inventory/warehouse", category: "inventory", badge: null },
        
        // Quick Actions
        { key: "field-management", text: "Field Management Hub", icon: Briefcase, href: "/dashboard/business/field-management", category: "business", badge: null },
        { key: "restaurants", text: "Restaurant Hub", icon: ShoppingCart, href: "/dashboard/business/restaurants", category: "business", badge: null },
      ],
      legacyBusiness: [
        { key: "dashboard", text: "Overview", icon: BarChart3, href: "/dashboard/business" },
        { key: "schedule", text: "Schedule", icon: Calendar, href: "/dashboard/business/schedule" },
        { key: "customers", text: "Customers", icon: Users, href: "/dashboard/business/customers" },
        { key: "estimates", text: "Estimates", icon: FileText, href: "/dashboard/business/estimates" },
        { key: "invoices", text: "Invoices", icon: Receipt, href: "/dashboard/business/invoices" },
        { key: "inventory", text: "Inventory", icon: Package, href: "/dashboard/business/inventory" },
        { key: "employees", text: "Team", icon: Users, href: "/dashboard/business/employees" },
        { key: "communication", text: "Messages", icon: MessageSquare, href: "/dashboard/business/communication" },
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

    return navConfigs[dashboardType] || navConfigs.legacyBusiness;
  }, [dashboardType, customNavItems]);

  // Get navigation items for mobile menu (always returns array)
  const getMobileNavigationItems = useMemo(() => {
    if (customNavItems) return customNavItems;
    
    // Navigation items are now always arrays, so return them directly
    
    return getNavigationItems;
  }, [dashboardType, customNavItems, getNavigationItems]);

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
        const section = pathParts[3]; // e.g., /dashboard/business/schedule -> "schedule"
        
        // Special handling for field-management pages
        if (section === 'field-management') {
          return 'field-management';
        }
        
        return section;
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
          { text: "Updates", href: "/dashboard/business/updates" },
        ],
        devices: [
          { text: "Overview", href: "/dashboard/business/devices" },
          { text: "Device List", href: "/dashboard/business/devices" },
          { text: "Device Scanner", href: "/dashboard/business/devices" },
          { text: "Firmware", href: "/dashboard/business/devices" },
          { text: "Network", href: "/dashboard/business/devices" },
          { text: "Monitor", href: "/dashboard/business/devices" },
          { text: "Configuration", href: "/dashboard/business/devices" },
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
          { text: "Email Management", href: "/dashboard/business/communication" },
          { text: "Conversations", href: "/dashboard/business/communication/conversations" },
          { text: "Team Chat", href: "/dashboard/business/communication/team-chat" },
          { text: "Voice & Video", href: "/dashboard/business/communication/voice-video" },
          { text: "Calls", href: "/dashboard/business/communication/calls" },
          { text: "Ticketing System", href: "/dashboard/business/communication/ticketing" },
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
        "field-management": [
          { text: "Dashboard", href: "/dashboard/business/field-management" },
          { text: "Jobs", href: "/dashboard/business/field-management/jobs" },
          { text: "Schedule", href: "/dashboard/business/field-management/schedule" },
          { text: "Technicians", href: "/dashboard/business/field-management/technicians" },
          { text: "Customers", href: "/dashboard/business/field-management/customers" },
          { text: "Equipment", href: "/dashboard/business/field-management/equipment" },
          { text: "Analytics", href: "/dashboard/business/field-management/analytics" },
          { text: "Settings", href: "/dashboard/business/field-management/settings" },
        ],
      },

      // User Dashboard Sub-Navigation
      user: {
        dashboard: [
          { text: "My Activity", href: "/dashboard/user/activity" },
          { text: "Recommendations", href: "/dashboard/user/recommendations" },
          { text: "Updates", href: "/dashboard/user/updates" },
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
          { text: "Updates", href: "/dashboard/admin/updates" },
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
          { text: "Updates", href: "/dashboard/academy/updates" },
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

  /**
 * Utility Button Component
 * A reusable button component for header utility buttons with consistent styling
 * Supports icons, badges, status indicators, and both link and button functionality
 */
const UtilityButton = ({
  icon: Icon,
  title,
  onClick,
  href,
  badge,
  badgeColor = "destructive",
  statusIndicator,
  statusColor = "green-500",
  className = "",
  children,
  variant = "ghost",
  size = "sm",
  mobileMenu = false,
  ...props
}) => {
  // Base classes for different button types
  const baseClasses = mobileMenu 
    ? "relative h-7 w-7 sm:h-8 sm:w-8 sm:h-9 sm:w-9 rounded-md p-0 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 transition-colors hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 flex items-center justify-center"
    : "relative h-8 w-8 sm:h-8 sm:w-8 rounded-md p-0 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 transition-colors hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 flex items-center justify-center";

  const buttonContent = (
    <>
      {Icon && <Icon className="w-4 h-4 sm:w-4 sm:h-4 text-foreground" />}
      {children}
      {badge && (
        <span className={`absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-${badgeColor} text-[10px] font-medium text-white`}>
          {badge}
        </span>
      )}
      {statusIndicator && (
        <span className={`absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-${statusColor} ${statusColor === "orange-500" ? "animate-pulse" : ""}`} />
      )}
    </>
  );

  if (href) {
    return (
      <Button
        variant={variant}
        size={size}
        className={`${baseClasses} ${className}`}
        title={title}
        asChild
        {...props}
      >
        <Link href={href}>
          {buttonContent}
        </Link>
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={`${baseClasses} ${className}`}
      title={title}
      onClick={onClick}
      {...props}
    >
      {buttonContent}
    </Button>
  );
};



  /**
   * Communication Group Component
   * Individual utility buttons for quick access to common functions
   */
  const CommunicationGroup = () => (
    <div className="flex items-center space-x-0.5 sm:space-x-1 md:space-x-1.5">
      {/* Messages */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <UtilityButton
            icon={MessageSquare}
            title="Messages & Communication"
            badge={3}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-2 z-[10001]">
          {/* Messages dropdown content */}
          <DropdownMenuLabel className="font-normal p-3">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Messages</p>
                <p className="text-xs text-muted-foreground">3 unread messages</p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Quick Message Actions */}
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/business/communication">
                <Inbox className="mr-2 h-4 w-4" />
                <span>View All Messages</span>
                <Badge variant="secondary" className="ml-auto text-xs">3</Badge>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/business/communication/compose">
                <Plus className="mr-2 h-4 w-4" />
                <span>Compose New Message</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/business/communication/notifications">
                <Bell className="mr-2 h-4 w-4" />
                <span>Notification Settings</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          {/* Recent Messages */}
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
            Recent Messages
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem className="p-2">
              <div className="flex items-start space-x-3 w-full">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">JD</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">John Doe</p>
                  <p className="text-xs text-muted-foreground truncate">Invoice #1234 ready for review</p>
                </div>
                <span className="text-xs text-muted-foreground">2m</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-2">
              <div className="flex items-start space-x-3 w-full">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">SM</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">Sarah Manager</p>
                  <p className="text-xs text-muted-foreground truncate">Team meeting scheduled for tomorrow</p>
                </div>
                <span className="text-xs text-muted-foreground">15m</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* VoIP System */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <UtilityButton
            icon={Phone}
            title="VoIP Phone System"
            statusIndicator={true}
            statusColor="green-500"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-2 z-[10001]">
          <DropdownMenuLabel className="font-normal p-3">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Phone System</p>
                <p className="text-xs text-muted-foreground">2 active calls</p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Quick Actions */}
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/business/voip">
                <Phone className="mr-2 h-4 w-4" />
                <span>Phone Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/business/voip/calls">
                <PhoneCall className="mr-2 h-4 w-4" />
                <span>Call History</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/business/voip/contacts">
                <Users className="mr-2 h-4 w-4" />
                <span>Contacts</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/business/voip/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Phone Settings</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          {/* Active Calls */}
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
            Active Calls
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem className="p-2">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">John Doe</span>
                </div>
                <span className="text-xs text-muted-foreground">5:23</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-2">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">Sarah Manager</span>
                </div>
                <span className="text-xs text-muted-foreground">2:15</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Analytics */}
      <UtilityButton
        icon={BarChart3}
        title="Analytics & Reports"
        href="/dashboard/business/analytics"
      />
      
      {/* Quick Search */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <UtilityButton
            icon={Search}
            title="Quick Search"
            className="h-7 w-7"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-96 p-2 z-[10001]">
          {/* Quick search content would go here */}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Time & Date Widget */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <UtilityButton
            icon={Clock}
            title="Time & Date"
            statusIndicator={true}
            statusColor="green-500"
            className="h-7 w-7"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-2 z-[10001]">
          {/* Time & date content would go here */}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Weather */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <UtilityButton
            icon={Cloud}
            title="Today's Weather"
            className="relative h-7 w-7"
          >
            <span className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 text-[8px] font-bold text-foreground bg-background rounded-full px-1 leading-none">
              72°
            </span>
          </UtilityButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-2 z-[10001]">
          <DropdownMenuLabel className="font-normal p-3">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <SunIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Sunny</p>
                <p className="text-xs text-muted-foreground">72°F • San Francisco, CA</p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Current Weather Details */}
          <DropdownMenuGroup>
            <div className="p-3 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex items-center space-x-2">
                  <Thermometer className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="font-medium">Feels like</p>
                    <p className="text-muted-foreground">75°F</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Cloud className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="font-medium">Humidity</p>
                    <p className="text-muted-foreground">65%</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="font-medium">Wind</p>
                    <p className="text-muted-foreground">8 mph</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="font-medium">UV Index</p>
                    <p className="text-muted-foreground">6 (High)</p>
                  </div>
                </div>
              </div>
            </div>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          {/* Weather Forecast */}
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
            5-Day Forecast
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            <div className="p-2 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <SunIcon className="h-4 w-4 text-yellow-500" />
                  <span>Today</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">78°</span>
                  <span>/</span>
                  <span className="text-muted-foreground">65°</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <CloudRain className="h-4 w-4 text-blue-500" />
                  <span>Tomorrow</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">70°</span>
                  <span>/</span>
                  <span className="text-muted-foreground">58°</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Cloud className="h-4 w-4 text-gray-500" />
                  <span>Friday</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">68°</span>
                  <span>/</span>
                  <span className="text-muted-foreground">55°</span>
                </div>
              </div>
            </div>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <Link href="/dashboard/business/weather" className="w-full">
              <Globe className="mr-2 h-4 w-4" />
              <span>View Full Weather</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Network Status */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <UtilityButton
            icon={Wifi}
            title="Network & Connectivity"
            statusIndicator={true}
            statusColor="green-500"
            className="h-7 w-7"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-2 z-[10001]">
          <DropdownMenuLabel className="font-normal p-3">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Wifi className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Network Status</p>
                <p className="text-xs text-muted-foreground">Connection: Stable</p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Signal className="mr-2 h-4 w-4 text-green-500" />
              <span>WiFi: Strong (5G)</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Server className="mr-2 h-4 w-4 text-green-500" />
              <span>Server: Online</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Database className="mr-2 h-4 w-4 text-green-500" />
              <span>Database: Connected</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* System Performance */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <UtilityButton
            icon={Cpu}
            title="System Performance"
            statusIndicator={true}
            statusColor="green-500"
            className="h-7 w-7"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-2 z-[10001]">
          <DropdownMenuLabel className="font-normal p-3">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Cpu className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">System Status</p>
                <p className="text-xs text-muted-foreground">All systems operational</p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Cpu className="mr-2 h-4 w-4 text-green-500" />
              <span>CPU Usage: 23%</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <MemoryStick className="mr-2 h-4 w-4 text-blue-500" />
              <span>Memory: 8.2GB / 16GB</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HardDrive className="mr-2 h-4 w-4 text-orange-500" />
              <span>Storage: 234GB / 1TB</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Quick Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <UtilityButton
            icon={Zap}
            title="Quick Actions"
            className="h-7 w-7"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-2 z-[10001]">
          <DropdownMenuLabel className="font-normal p-3">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Quick Actions</p>
                <p className="text-xs text-muted-foreground">Productivity shortcuts</p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/business/tasks/new">
                <Plus className="mr-2 h-4 w-4" />
                <span>Create New Task</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/business/calendar/event/new">
                <Calendar className="mr-2 h-4 w-4" />
                <span>Schedule Meeting</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/business/contacts/new">
                <UserPlus className="mr-2 h-4 w-4" />
                <span>Add Contact</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/business/documents/upload">
                <FileText className="mr-2 h-4 w-4" />
                <span>Upload Document</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Location & Navigation */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <UtilityButton
            icon={Navigation}
            title="Location & Navigation"
            className="h-7 w-7"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-2 z-[10001]">
          <DropdownMenuLabel className="font-normal p-3">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Navigation className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Current Location</p>
                <p className="text-xs text-muted-foreground">San Francisco, CA</p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/business/map">
                <Map className="mr-2 h-4 w-4" />
                <span>View Map</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/business/fleet/tracking">
                <Truck className="mr-2 h-4 w-4" />
                <span>Fleet Tracking</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/business/locations">
                <MapPin className="mr-2 h-4 w-4" />
                <span>Manage Locations</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Bookmarks & Favorites */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <UtilityButton
            icon={Bookmark}
            title="Bookmarks & Favorites"
            className="h-7 w-7"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-2 z-[10001]">
          <DropdownMenuLabel className="font-normal p-3">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bookmark className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Quick Access</p>
                <p className="text-xs text-muted-foreground">Your favorite tools</p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/business/analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>Analytics Dashboard</span>
                <Star className="ml-auto h-3 w-3 text-yellow-500" />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/business/calendar">
                <Calendar className="mr-2 h-4 w-4" />
                <span>Calendar View</span>
                <Star className="ml-auto h-3 w-3 text-yellow-500" />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/business/tasks">
                <Target className="mr-2 h-4 w-4" />
                <span>Task Manager</span>
                <Star className="ml-auto h-3 w-3 text-yellow-500" />
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Contextual Help */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <UtilityButton
            icon={HelpCircle}
            title="Help & Tips"
            statusIndicator={true}
            statusColor="orange-500"
            className="h-7 w-7"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-2 z-[10001]">
          <DropdownMenuLabel className="font-normal p-3">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Help & Support</p>
                <p className="text-xs text-muted-foreground">Get assistance quickly</p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/business/help">
                <BookOpen className="mr-2 h-4 w-4" />
                <span>Documentation</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/business/support">
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Contact Support</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/business/tutorials">
                <GraduationCap className="mr-2 h-4 w-4" />
                <span>Video Tutorials</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  // Simple Dark Mode Toggle Component
  const DarkModeToggle = () => (
    <UtilityButton
      title="Toggle theme"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="h-8 w-8"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </UtilityButton>
  );

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
                <div className="sticky top-0 z-[9999] bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-800 border-b border-neutral-800/50 shadow-lg backdrop-blur-md w-full min-w-0">
          {/* Main Header */}
          <div className="flex items-center w-full py-2 px-3 sm:py-3 sm:px-4 md:py-4 md:px-6 lg:px-8 min-w-0">
          {/* Left Section - Logo & Search */}
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-6 flex-1 min-w-0">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0 group">
              <Image
                src="/logos/ThorbisLogo.webp"
                alt={config.title}
                width={32}
                height={32}
                className="h-6 w-auto sm:h-7 md:h-8 object-contain transition-transform duration-200 group-hover:scale-105"
              />
              <span className="ml-1.5 sm:ml-2 text-sm sm:text-base md:text-lg font-bold text-white hidden sm:block">Thorbis</span>
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
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 lg:space-x-6 flex-shrink-0">
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
                        className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium relative transition-all duration-200 ${
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
                        className="text-white hover:text-primary/90 hover:bg-primary/20 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-200 group"
                      >
                        <span className="flex items-center space-x-1">
                          <span>Menu</span>
                          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="start" 
                      side="top" 
                      className="w-[680px] p-0 z-[100] bg-neutral-950/95 backdrop-blur-xl border border-neutral-800/50 shadow-2xl"
                    >
                      {/* Header with gradient accent */}
                      <div className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5"></div>
                        <div className="relative p-6 border-b border-neutral-800/50">
                          <h3 className="text-lg font-semibold text-white mb-1">Platform Menu</h3>
                          <p className="text-sm text-neutral-400">Access all features and resources</p>
                        </div>
                      </div>

                      {/* Main Content Grid */}
                      <div className="p-6">
                        <div className="grid grid-cols-3 gap-8">
                          {/* Business Section */}
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2 mb-4">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">For Business</h4>
                            </div>
                            <div className="space-y-3">
                              <Link 
                                href="/add-a-business"
                                className="group flex items-center space-x-4 p-3 rounded-xl hover:bg-neutral-900/50 transition-all duration-200 border border-transparent hover:border-neutral-700/50"
                              >
                                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                                  <Plus className="h-4 w-4 text-emerald-400" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">List Business</div>
                                  <div className="text-xs text-neutral-500">Get discovered by customers</div>
                                </div>
                              </Link>
                              
                              <Link 
                                href="/dashboard/business"
                                className="group flex items-center space-x-4 p-3 rounded-xl hover:bg-neutral-900/50 transition-all duration-200 border border-transparent hover:border-neutral-700/50"
                              >
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                  <BarChart3 className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-white group-hover:text-primary transition-colors">Dashboard</div>
                                  <div className="text-xs text-neutral-500">Manage your business</div>
                                </div>
                              </Link>
                              
                              <Link 
                                href="/advertise"
                                className="group flex items-center space-x-4 p-3 rounded-xl hover:bg-neutral-900/50 transition-all duration-200 border border-transparent hover:border-neutral-700/50"
                              >
                                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                                  <Megaphone className="h-4 w-4 text-amber-400" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors">Advertise</div>
                                  <div className="text-xs text-neutral-500">Reach more customers</div>
                                </div>
                              </Link>
                              
                              <Link 
                                href="/academy"
                                className="group flex items-center space-x-4 p-3 rounded-xl hover:bg-neutral-900/50 transition-all duration-200 border border-transparent hover:border-neutral-700/50"
                              >
                                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                  <GraduationCap className="h-4 w-4 text-blue-400" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">Academy</div>
                                  <div className="text-xs text-neutral-500">Learn & grow</div>
                                </div>
                              </Link>
                            </div>
                          </div>

                          {/* Platform Features */}
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2 mb-4">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Platform</h4>
                            </div>
                            <div className="space-y-3">
                              <Link 
                                href="/store"
                                className="group flex items-center space-x-4 p-3 rounded-xl hover:bg-neutral-900/50 transition-all duration-200 border border-transparent hover:border-neutral-700/50"
                              >
                                <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                                  <ShoppingCart className="h-4 w-4 text-indigo-400" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">Store</div>
                                  <div className="text-xs text-neutral-500">Shop local products</div>
                                </div>
                              </Link>
                              
                              <Link 
                                href="/localhub"
                                className="group flex items-center space-x-4 p-3 rounded-xl hover:bg-neutral-900/50 transition-all duration-200 border border-transparent hover:border-neutral-700/50"
                              >
                                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                                  <Building2 className="h-4 w-4 text-purple-400" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-white group-hover:text-purple-400 transition-colors">LocalHub</div>
                                  <div className="text-xs text-neutral-500">Community center</div>
                                </div>
                              </Link>
                              
                              {readFlagFromDOM('data-flag-fleet-management') && (
                                <Link 
                                  href="/fleet"
                                  className="group flex items-center space-x-4 p-3 rounded-xl hover:bg-neutral-900/50 transition-all duration-200 border border-transparent hover:border-neutral-700/50"
                                >
                                  <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                                    <Truck className="h-4 w-4 text-orange-400" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-white group-hover:text-orange-400 transition-colors">Fleet</div>
                                    <div className="text-xs text-neutral-500">Manage vehicles</div>
                                  </div>
                                </Link>
                              )}
                              
                              <Link 
                                href="/jobs"
                                className="group flex items-center space-x-4 p-3 rounded-xl hover:bg-neutral-900/50 transition-all duration-200 border border-transparent hover:border-neutral-700/50"
                              >
                                <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                                  <Briefcase className="h-4 w-4 text-cyan-400" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">Jobs</div>
                                  <div className="text-xs text-neutral-500">Find opportunities</div>
                                </div>
                              </Link>
                            </div>
                          </div>

                          {/* Resources */}
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2 mb-4">
                              <div className="w-2 h-2 bg-neutral-500 rounded-full"></div>
                              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Resources</h4>
                            </div>
                            <div className="space-y-3">
                              <Link 
                                href="/pricing"
                                className="group flex items-center space-x-4 p-3 rounded-xl hover:bg-neutral-900/50 transition-all duration-200 border border-transparent hover:border-neutral-700/50"
                              >
                                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                                  <Calculator className="h-4 w-4 text-green-400" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-white group-hover:text-green-400 transition-colors">Pricing</div>
                                  <div className="text-xs text-neutral-500">Plans & features</div>
                                </div>
                              </Link>
                              
                              <Link 
                                href="/developers"
                                className="group flex items-center space-x-4 p-3 rounded-xl hover:bg-neutral-900/50 transition-all duration-200 border border-transparent hover:border-neutral-700/50"
                              >
                                <div className="w-10 h-10 bg-gray-500/10 rounded-lg flex items-center justify-center group-hover:bg-gray-500/20 transition-colors">
                                  <Monitor className="h-4 w-4 text-gray-400" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-white group-hover:text-gray-400 transition-colors">API</div>
                                  <div className="text-xs text-neutral-500">Developer tools</div>
                                </div>
                              </Link>
                              
                              <Link 
                                href="/help"
                                className="group flex items-center space-x-4 p-3 rounded-xl hover:bg-neutral-900/50 transition-all duration-200 border border-transparent hover:border-neutral-700/50"
                              >
                                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                                  <HelpCircle className="h-4 w-4 text-amber-400" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors">Help</div>
                                  <div className="text-xs text-neutral-500">Support & guides</div>
                                </div>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions Footer */}
                      <div className="border-t border-neutral-800/50 p-6 bg-neutral-900/30">
                        <div className="flex gap-3">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 h-10 font-medium border-neutral-700 hover:border-primary/50 hover:bg-primary/5 text-white hover:text-primary transition-all duration-200"
                            asChild
                          >
                            <Link href="/add-a-business">
                              <Plus className="h-4 w-4 mr-2" />
                              List Business
                            </Link>
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1 h-10 font-medium bg-primary hover:bg-primary/90 text-white transition-all duration-200"
                            asChild
                          >
                            <Link href="/pricing">
                              <Calculator className="h-4 w-4 mr-2" />
                              View Pricing
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 h-10 font-medium border-neutral-700 hover:border-neutral-500 hover:bg-neutral-800/50 text-white transition-all duration-200"
                            asChild
                          >
                            <Link href="/help">
                              <HelpCircle className="h-4 w-4 mr-2" />
                              Get Help
                            </Link>
                          </Button>
                        </div>
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
                  <DropdownMenuContent className="w-64 z-[100]" align="end" side="top" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                {/* Time Tracking */}
                    <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                  Time Tracking
                    </DropdownMenuLabel>
                    <DropdownMenuGroup>
                  <DropdownMenuItem onClick={handleClockToggle}>
                    <Clock className={`mr-2 h-4 w-4 ${isClockedIn ? 'text-green-500' : 'text-gray-400'}`} />
                    <span>{isClockedIn ? 'Clock Out' : 'Clock In'}</span>
                    {isClockedIn && clockInTime && (
                      <Badge variant="outline" className="ml-auto text-xs bg-green-50 text-green-700 border-green-200">
                        {clockInTime}
                      </Badge>
                    )}
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                    <Link href="/dashboard/user/timesheet">
                      <Activity className="mr-2 h-4 w-4" />
                      <span>View Timesheet</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {totalHoursToday}h today
                      </Badge>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                    <Link href="/dashboard/user/schedule">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>My Schedule</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />

                {/* User Actions */}
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                  Account
                </DropdownMenuLabel>
                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild>
                    <Link href="/dashboard/user/profile">
                          <User className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                    <Link href="/dashboard/user/preferences">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Preferences</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                    <Link href="/dashboard/user/notifications">
                      <Bell className="mr-2 h-4 w-4" />
                      <span>Notifications</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />

                {/* Quick Actions */}
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help & Support</span>
                    </DropdownMenuItem>

                </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                </ClientOnlyWrapper>



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
                <UtilityButton
                  icon={Menu}
                  title="Mobile Menu"
                  onClick={() => setMobileMenuOpen(true)}
                  mobileMenu={true}
                  variant="outline"
                  className="lg:hidden mobile-menu-button"
                />
                
                            <EnhancedMobileMenu
              isOpen={mobileMenuOpen}
              onClose={() => setMobileMenuOpen(false)}
              dashboardType={dashboardType}
              navigationItems={getMobileNavigationItems}
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
    <div>
      <div className="sticky top-0 z-[50] bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-800 border-b border-neutral-800/50 shadow-lg backdrop-blur-md">
      {/* Main Header */}
      <div className="flex items-center justify-between py-2 px-3 sm:py-2.5 sm:px-4 lg:px-6">
        {/* Left - Business Switcher & Navigation */}
        <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
          {/* Business Switcher with Logo */}
          <BusinessSwitcher 
            businesses={mockBusinesses}
            onBusinessSwitch={handleBusinessSwitch}
          />
          
          {/* Vertical Divider */}
          <div className="hidden lg:block h-5 w-px bg-border/50" />
          
          {/* Navigation */}
          <div className="flex items-center space-x-1 flex-1 min-w-0">
          {/* Mobile Menu Button */}
          <ClientOnlyWrapper>
            <UtilityButton
              icon={Menu}
              title="Mobile Menu"
              onClick={() => setMobileMenuOpen(true)}
              mobileMenu={true}
              className="lg:hidden"
            />
          </ClientOnlyWrapper>
          
          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
              {getNavigationItems.slice(0, 5).map((item) => {
                const isActive = activeNavKey === item.key;
                
                return (
                  <Link key={item.key} href={item.href}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`px-2 py-1.5 text-xs font-medium transition-all duration-200 ${
                        isActive 
                          ? "bg-primary/20 text-primary shadow-sm" 
                          : "text-white hover:text-primary hover:bg-primary/10"
                      }`}
                    >
                      {item.icon && <item.icon className="w-3 h-3 mr-1" />}
                      {item.text}
                      {item.badge && (
                        <Badge variant="secondary" className="ml-1 text-xs px-1">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                );
              })}

              {/* "More" Dropdown for additional FMS nav items */}
              {getNavigationItems.length > 5 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs font-medium text-white hover:text-primary hover:bg-primary/10 px-2 py-1.5 transition-all duration-200"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      More
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" side="bottom" className="w-96 max-h-[80vh] overflow-y-auto p-4 z-[100]">
                    <div className="space-y-4">
                      {/* Field Operations Section */}
                      <div>
                        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                          Field Operations
                        </DropdownMenuLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {getNavigationItems.filter(item => item.category === 'operations').map((item) => (
                            <DropdownMenuItem key={item.key} asChild className="p-0">
                              <Link 
                                href={item.href}
                                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group text-sm"
                              >
                                {item.icon && <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />}
                                <span className="font-medium flex-1">{item.text}</span>
                                {item.badge && (
                                  <Badge variant="secondary" className="text-xs">
                                    {item.badge}
                                  </Badge>
                                )}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </div>
                      </div>

                      {/* Sales & Customer Management */}
                      <div className="border-t border-muted pt-3">
                        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                          Sales & Customer Management
                        </DropdownMenuLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {getNavigationItems.filter(item => item.category === 'sales').map((item) => (
                            <DropdownMenuItem key={item.key} asChild className="p-0">
                              <Link 
                                href={item.href}
                                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group text-sm"
                              >
                                {item.icon && <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />}
                                <span className="font-medium flex-1">{item.text}</span>
                                {item.badge && (
                                  <Badge variant="secondary" className="text-xs">
                                    {item.badge}
                                  </Badge>
                                )}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </div>
                      </div>

                      {/* Inventory & Parts Management */}
                      <div className="border-t border-muted pt-3">
                        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                          Inventory & Parts
                        </DropdownMenuLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {getNavigationItems.filter(item => item.category === 'inventory').map((item) => (
                            <DropdownMenuItem key={item.key} asChild className="p-0">
                              <Link 
                                href={item.href}
                                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group text-sm"
                              >
                                {item.icon && <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />}
                                <span className="font-medium flex-1">{item.text}</span>
                                {item.badge && (
                                  <Badge variant="secondary" className="text-xs">
                                    {item.badge}
                                  </Badge>
                                )}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </div>
                      </div>

                      {/* Financial Management */}
                      <div className="border-t border-muted pt-3">
                        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                          Financial Management
                        </DropdownMenuLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {getNavigationItems.filter(item => item.category === 'financial').map((item) => (
                            <DropdownMenuItem key={item.key} asChild className="p-0">
                              <Link 
                                href={item.href}
                                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group text-sm"
                              >
                                {item.icon && <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />}
                                <span className="font-medium flex-1">{item.text}</span>
                                {item.badge && (
                                  <Badge variant="secondary" className="text-xs">
                                    {item.badge}
                                  </Badge>
                                )}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </div>
                      </div>

                      {/* Reporting & Analytics */}
                      <div className="border-t border-muted pt-3">
                        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                          Reporting & Analytics
                        </DropdownMenuLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {getNavigationItems.filter(item => item.category === 'analytics').map((item) => (
                            <DropdownMenuItem key={item.key} asChild className="p-0">
                              <Link 
                                href={item.href}
                                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group text-sm"
                              >
                                {item.icon && <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />}
                                <span className="font-medium flex-1">{item.text}</span>
                                {item.badge && (
                                  <Badge variant="secondary" className="text-xs">
                                    {item.badge}
                                  </Badge>
                                )}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </div>
                      </div>

                      {/* Business Management Section */}
                      <div className="border-t border-muted pt-3">
                        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                          Business Management
                        </DropdownMenuLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {getNavigationItems.filter(item => item.category === 'business').map((item) => (
                            <DropdownMenuItem key={item.key} asChild className="p-0">
                              <Link 
                                href={item.href}
                                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group text-sm"
                              >
                                {item.icon && <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />}
                                <span className="font-medium flex-1">{item.text}</span>
                                {item.badge && (
                                  <Badge variant="secondary" className="text-xs">
                                    {item.badge}
                                  </Badge>
                                )}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </div>
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
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </nav>
          </div>
        </div>

        {/* Right - User Controls */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <UtilityButton
                icon={BellRing}
                title="Notifications"
                badge={3}
                className="h-7 w-7"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[420px] z-[10001]" align="end" sideOffset={8}>
              {/* Notifications content would go here */}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Keyboard Shortcuts */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <UtilityButton
                icon={Keyboard}
                title="Keyboard shortcuts"
                className="h-7 w-7"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96 p-2 z-[10001] max-h-[80vh] overflow-y-auto">
              {/* Keyboard shortcuts content would go here */}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Communication and Utility Group */}
          <CommunicationGroup />
          
          {/* Dark Mode Toggle */}
          <UtilityButton
            title="Toggle theme"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="h-7 w-7"
          >
            <Sun className="h-3.5 w-3.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-3.5 w-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </UtilityButton>

          {/* User Menu */}
          <ClientOnlyWrapper>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 sm:h-8 sm:w-8 rounded-full">
                  <Avatar className="h-8 w-8 sm:h-8 sm:w-8">
                    <AvatarImage src={getAvatarUrl()} alt={getDisplayName()} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getDisplayName()?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 z-[100]" align="end" side="top" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Time Tracking */}
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                  Time Tracking
                </DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={handleClockToggle}>
                    <Clock className={`mr-2 h-4 w-4 ${isClockedIn ? 'text-green-500' : 'text-gray-400'}`} />
                    <span>{isClockedIn ? 'Clock Out' : 'Clock In'}</span>
                    {isClockedIn && clockInTime && (
                      <Badge variant="outline" className="ml-auto text-xs bg-green-50 text-green-700 border-green-200">
                        {clockInTime}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/user/timesheet">
                      <Activity className="mr-2 h-4 w-4" />
                      <span>View Timesheet</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {totalHoursToday}h today
                      </Badge>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/user/schedule">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>My Schedule</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />

                {/* User Actions */}
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                  Account
                </DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/user/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/user/preferences">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Preferences</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/user/notifications">
                      <Bell className="mr-2 h-4 w-4" />
                      <span>Notifications</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />

                {/* Quick Actions */}
                <DropdownMenuGroup>
                <DropdownMenuItem>
                  <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help & Support</span>
                </DropdownMenuItem>

                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </ClientOnlyWrapper>

                        {/* Mobile Menu */}
              <ClientOnlyWrapper>
                <UtilityButton
                  icon={Menu}
                  title="Mobile Menu"
                  onClick={() => setMobileMenuOpen(true)}
                  mobileMenu={true}
                  variant="outline"
                  className="lg:hidden mobile-menu-button"
                />
              </ClientOnlyWrapper>
            
            <EnhancedMobileMenu
              isOpen={mobileMenuOpen}
              onClose={() => setMobileMenuOpen(false)}
              dashboardType={dashboardType}
              navigationItems={getMobileNavigationItems}
              activeNavKey={activeNavKey}
              config={config}
              businessSubNavItems={businessSubNavItems}
            />
        </div>
      </div>

      {/* Sub-header */}
      {(businessSubNavItems[dashboardType] && businessSubNavItems[dashboardType][activeNavKey] && businessSubNavItems[dashboardType][activeNavKey].length > 0) && (
        <div className="border-t border-neutral-800 bg-neutral-900">
          <div className="px-2 sm:px-3 lg:px-3 py-1 sm:py-1.5">
            <div className="flex items-center justify-between">
              <nav className="flex space-x-0.5 overflow-x-auto flex-1 scrollbar-hide">
                {businessSubNavItems[dashboardType][activeNavKey].map((subItem, index) => (
                  <Link
                    key={index}
                    href={subItem.href}
                    className={`px-2 sm:px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-200 flex-shrink-0 whitespace-nowrap ${
                      pathname === subItem.href
                        ? 'bg-neutral-800 text-neutral-100 border border-neutral-600 shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                    }`}
                  >
                    {subItem.text}
                  </Link>
                ))}
              </nav>
              
              {/* Updates Section */}
              <div className="ml-2 sm:ml-4 flex-shrink-0">
                <UpdatesDropdown 
                  updatesPageUrl={`/dashboard/${dashboardType}/updates`}
                  currentVersion="v2.1.0"
                  dashboardType={dashboardType}
                  audience={dashboardType}
                  className="text-neutral-400"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Updates Section for dashboards without sub-nav */}
      {(!businessSubNavItems[dashboardType] || !businessSubNavItems[dashboardType][activeNavKey] || businessSubNavItems[dashboardType][activeNavKey].length === 0) && (
        <div className="border-t border-neutral-800 bg-neutral-900">
          <div className="px-2 sm:px-3 lg:px-3 py-1 sm:py-1.5">
            <div className="flex items-center justify-end">
              <UpdatesDropdown 
                updatesPageUrl={`/dashboard/${dashboardType}/updates`}
                currentVersion="v2.1.0"
                dashboardType={dashboardType}
                audience={dashboardType}
                className="text-neutral-400"
              />
            </div>
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
    
    {/* Page Sub-Header Toolbar */}
    {dashboardType === "business" && (
      <PageSubHeader 
        showBreadcrumbs={true}
        showSearch={false}
        onSearch={(query) => console.log('Sub-header search:', query)}
        onActionClick={(action) => console.log('Sub-header action:', action)}
      />
    )}
    </div>
  );
}
