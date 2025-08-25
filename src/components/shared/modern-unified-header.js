"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut
} from "@components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
// Command components now handled by AdvancedCommandPalette
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@components/ui/sheet";
import { Separator } from "@components/ui/separator";
import {
  Search,
  Menu,
  Settings,
  LogOut,
  User,
  Bell,
  Calendar,
  Clock,
  Activity,
  HelpCircle,
  Keyboard,
  Sun,
  Moon,
  Monitor,
  ChevronDown,
  Plus,
  Zap,
  Star,
  Building2,
  Crown,
  Shield,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  BarChart3,
  DollarSign,
  Package,
  Truck,
  Users,
  Target,
  Brain,
  Megaphone,
  Calculator,
  CreditCard,
  Home,
  ArrowLeft,
  Command as CommandIcon,
  Sparkles,
  Gauge,
  Layers,
  Globe,
  UserPlus
} from "lucide-react";

import { useTheme } from "next-themes";
import { useAuth } from "@context/auth-context";
import useBusinessStore from "@store/use-business-store";
import SmartBusinessNavigation from "@components/navigation/SmartBusinessNavigation";
import BusinessSwitcher from "@components/header/BusinessSwitcher";
import ClientOnlyWrapper from "./client-only-wrapper";
import { dashboardBusinesses } from "@data/dashboard-businesses";
import { handleIntelligentBusinessSwitch } from "@lib/routing/intelligent-business-router";
import AdvancedCommandPalette from "./advanced-command-palette";
import HeaderPerformanceMonitor from "./header-performance-monitor";

/**
 * Modern Unified Header Component
 * Features: Command palette, smart search, modern UI, performance optimized
 */
export default function ModernUnifiedHeader({ 
  dashboardType = "business",
  showCompanySelector = true,
  showSearch = true,
  customTitle = null,
  customSubtitle = null,
  backHref = "/"
}) {
  // State management
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(3);
  
  // Time tracking state
  const [isClockedIn, setIsClockedIn] = useState(true);
  const [clockInTime, setClockInTime] = useState("9:15 AM");
  const [totalHoursToday, setTotalHoursToday] = useState("6.5");
  
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  
  const { 
    user, 
    logout, 
    loading, 
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

  // Command palette shortcuts
  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Handle clock toggle
  const handleClockToggle = useCallback(() => {
    if (isClockedIn) {
      setIsClockedIn(false);
      setClockInTime("");
      setTotalHoursToday((prev) => (parseFloat(prev) + 0.5).toString());
    } else {
      setIsClockedIn(true);
      const now = new Date();
      setClockInTime(now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }));
    }
  }, [isClockedIn]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout, router]);

  // Quick actions now handled by AdvancedCommandPalette

  // Navigation items for different dashboard types
  const navigationItems = useMemo(() => {
    switch (dashboardType) {
      case "business":
        return "smart"; // Use SmartBusinessNavigation
      case "user":
        return [
          { key: "dashboard", label: "Dashboard", href: "/dashboard/user", icon: Home },
          { key: "timesheet", label: "Timesheet", href: "/dashboard/user/timesheet", icon: Clock },
          { key: "schedule", label: "Schedule", href: "/dashboard/user/schedule", icon: Calendar },
          { key: "profile", label: "Profile", href: "/dashboard/user/profile", icon: User }
        ];
      case "admin":
        return [
          { key: "overview", label: "Overview", href: "/dashboard/admin", icon: Gauge },
          { key: "users", label: "Users", href: "/dashboard/admin/users", icon: Users },
          { key: "businesses", label: "Businesses", href: "/dashboard/admin/businesses", icon: Building2 },
          { key: "system", label: "System", href: "/dashboard/admin/system", icon: Settings }
        ];
      default:
        return [];
    }
  }, [dashboardType]);

  // Theme toggle component with enhanced animations
  const ThemeToggle = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-9 px-0 transition-all duration-200 hover:scale-110 hover:bg-muted/50">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[100] animate-in fade-in-0 zoom-in-95">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="transition-colors duration-200 hover:bg-yellow-50 hover:text-yellow-900 dark:hover:bg-yellow-950 dark:hover:text-yellow-100"
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
          {theme === "light" && <Badge variant="secondary" className="ml-auto text-xs">Active</Badge>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
          {theme === "dark" && <Badge variant="secondary" className="ml-auto text-xs">Active</Badge>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className="transition-colors duration-200 hover:bg-blue-50 hover:text-blue-900 dark:hover:bg-blue-950 dark:hover:text-blue-100"
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
          {theme === "system" && <Badge variant="secondary" className="ml-auto text-xs">Active</Badge>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Notifications dropdown with enhanced animations
  const NotificationsDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative w-9 px-0 transition-all duration-200 hover:scale-110 hover:bg-muted/50">
          <Bell className="h-4 w-4 transition-all duration-200" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center animate-pulse"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 z-[100] animate-in fade-in-0 slide-in-from-top-2">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <Badge variant="secondary" className="text-xs">
            {unreadCount} new
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-64 overflow-y-auto">
          <DropdownMenuItem className="flex flex-col items-start p-3 transition-colors duration-200 hover:bg-muted/50">
            <div className="flex items-center w-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0 animate-pulse" />
              <div className="flex-1">
                <p className="text-sm font-medium">New customer inquiry</p>
                <p className="text-xs text-muted-foreground">John Smith requested a quote</p>
              </div>
              <span className="text-xs text-muted-foreground">2m</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex flex-col items-start p-3">
            <div className="flex items-center w-full">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Payment received</p>
                <p className="text-xs text-muted-foreground">Invoice #1234 has been paid</p>
              </div>
              <span className="text-xs text-muted-foreground">5m</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex flex-col items-start p-3">
            <div className="flex items-center w-full">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Schedule reminder</p>
                <p className="text-xs text-muted-foreground">Appointment in 30 minutes</p>
              </div>
              <span className="text-xs text-muted-foreground">25m</span>
            </div>
          </DropdownMenuItem>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-center text-sm text-muted-foreground">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // User dropdown with enhanced features
  const UserDropdown = () => (
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
      <DropdownMenuContent className="w-64 z-[100]" align="end" forceMount>
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
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {/* Quick Actions */}
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
          Quick Actions
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/user/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/user/preferences">
              <Settings className="mr-2 h-4 w-4" />
              <span>Preferences</span>
              <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setCommandOpen(true)}>
            <Keyboard className="mr-2 h-4 w-4" />
            <span>Command Palette</span>
            <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {/* Support */}
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
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Use the advanced command palette
  const CommandPalette = () => (
    <AdvancedCommandPalette 
      open={commandOpen} 
      onOpenChange={setCommandOpen}
      dashboardType={dashboardType}
    />
  );

  // Site header (non-dashboard pages)
  if (!pathname.includes('/dashboard')) {
    return (
      <TooltipProvider>
        <header className="sticky top-0 z-[50] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200 hover:bg-background/98">
          <div className="container flex h-14 items-center">
            <div className="mr-4 hidden md:flex">
              <Link className="mr-6 flex items-center space-x-2" href="/">
                <Image
                  src="/logos/ThorbisLogo.webp"
                  alt="Thorbis"
                  width={32}
                  height={32}
                  className="rounded-md"
                />
                <span className="hidden font-bold sm:inline-block">
                  Thorbis
                </span>
              </Link>
            </div>
            
            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
              <div className="w-full flex-1 md:w-auto md:flex-none">
                <Button
                  variant="outline"
                  className="relative h-8 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64 transition-all duration-200 hover:bg-muted/50 hover:shadow-sm"
                  onClick={() => setCommandOpen(true)}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Search...
                  <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </Button>
              </div>
              
              <nav className="flex items-center space-x-1">
                <ThemeToggle />
                
                {isAuthenticated ? (
                  <UserDropdown />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/auth/login">Sign In</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/auth/register">Sign Up</Link>
                    </Button>
                  </div>
                )}
              </nav>
            </div>
          </div>
          <CommandPalette />
        </header>
      </TooltipProvider>
    );
  }

  // Dashboard header
  return (
    <TooltipProvider>
      <header className="sticky top-0 z-[50] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200">
        <HeaderPerformanceMonitor enabled={process.env.NODE_ENV === 'development'} />
        <div className="flex h-14 items-center px-4">
          {/* Left Section - Business Switcher & Navigation */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* Business Switcher */}
            {showCompanySelector && <BusinessSwitcher 
              businesses={mockBusinesses}
              onBusinessSwitch={handleBusinessSwitch}
            />}
            
            {/* Vertical Divider */}
            <Separator orientation="vertical" className="h-6" />
            
            {/* Navigation */}
            <div className="flex items-center space-x-1 flex-1 min-w-0">
              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Navigation</SheetTitle>
                  </SheetHeader>
                  {/* Mobile navigation content would go here */}
                </SheetContent>
              </Sheet>
              
              {/* Desktop Navigation */}
              {navigationItems === "smart" ? (
                <div className="flex-1 min-w-0">
                  <SmartBusinessNavigation className="flex-1" />
                </div>
              ) : (
                <nav className="hidden lg:flex items-center space-x-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    
                    return (
                      <Tooltip key={item.key}>
                        <TooltipTrigger asChild>
                                              <Button
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      asChild
                      className="relative transition-all duration-200 hover:scale-105 hover:shadow-sm"
                    >
                            <Link href={item.href}>
                              <Icon className="mr-2 h-4 w-4" />
                              {item.label}
                              {isActive && (
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                              )}
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{item.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </nav>
              )}
            </div>
          </div>

          {/* Right Section - Actions & User */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            {showSearch && (
              <Tooltip>
                <TooltipTrigger asChild>
                                  <Button
                  variant="outline"
                  size="sm"
                  className="relative h-8 w-8 p-0 xl:h-8 xl:w-64 xl:justify-start xl:px-3 xl:py-2 transition-all duration-200 hover:bg-muted/50 hover:shadow-sm hover:scale-105"
                  onClick={() => setCommandOpen(true)}
                >
                    <Search className="h-4 w-4 xl:mr-2" />
                    <span className="hidden xl:inline-flex">Search...</span>
                    <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
                      ⌘K
                    </kbd>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Search (⌘K)</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Quick Actions */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0 transition-all duration-200 hover:scale-110 hover:bg-primary/10 hover:text-primary">
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Quick Add (⌘N)</p>
              </TooltipContent>
            </Tooltip>

            {/* Notifications */}
            <NotificationsDropdown />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu */}
            <UserDropdown />
          </div>
        </div>
        
        {/* Command Palette */}
        <CommandPalette />
      </header>
    </TooltipProvider>
  );
}

// Helper component for command shortcuts
const CommandShortcut = ({ children }) => (
  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-auto">
    {children}
  </kbd>
);
