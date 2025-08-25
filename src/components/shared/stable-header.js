"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuGroup 
} from '@components/ui/dropdown-menu';
import {
  Search,
  Bell,
  Settings,
  LogOut,
  User,
  Sun,
  Moon,
  Home,
  Plus,
  Command,
  Cloud,
  MessageSquare,
  Phone,
  Wifi,
  Cpu,
  Zap,
  Navigation,
  Bookmark,
  HelpCircle,
  Signal,
  Server,
  Database,
  MemoryStick,
  HardDrive,
  Activity,
  Thermometer,
  Globe,
  CloudRain,
  Sun as SunIcon,
  Moon as MoonIcon,
  Map,
  MapPin,
  Truck,
  UserPlus,
  FileText,
  Target,
  GraduationCap,
  BookOpen,
  Inbox,
  Star,
  Calendar,
  BarChart3,
  Separator,
  X,
  Keyboard
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@context/auth-context';
import useBusinessStore from '@store/use-business-store';
import BusinessSwitcher from '@components/header/BusinessSwitcher';
import SmartBusinessNavigation from '@components/navigation/SmartBusinessNavigation';
import { dashboardBusinesses } from '@data/dashboard-businesses';
import AdvancedCommandPalette from '@components/shared/advanced-command-palette';
import { handleIntelligentBusinessSwitch } from '@lib/routing/intelligent-business-router';

export default function StableHeader({ 
  dashboardType = "business",
  showCompanySelector = true,
  showSearch = true,
  showCommandPalette = true
}) {
  const [isClient, setIsClient] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();
  const { user, logout, getDisplayName, getAvatarUrl } = useAuth();

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

  /**
   * Utility Button Component for Stable Header
   * A reusable button component for header utility buttons with consistent styling
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
    ...props
  }) => {
    const baseClasses = "relative h-8 w-8 rounded-md p-0 bg-background hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center";

    const buttonContent = (
      <>
        {Icon && <Icon className="w-4 h-4 text-foreground" />}
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
          variant="ghost"
          size="sm"
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
        variant="ghost"
        size="sm"
        className={`${baseClasses} ${className}`}
        title={title}
        onClick={onClick}
        {...props}
      >
        {buttonContent}
      </Button>
    );
  };

  useEffect(() => {
    setIsClient(true);
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isClient || !mounted) {
    return (
      <header className="sticky top-0 z-[50] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="h-8 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-px bg-border" />
            <div className="flex space-x-2">
              <div className="h-8 w-20 bg-muted rounded animate-pulse" />
              <div className="h-8 w-24 bg-muted rounded animate-pulse" />
              <div className="h-8 w-28 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-muted rounded animate-pulse" />
            <div className="h-8 w-8 bg-muted rounded animate-pulse" />
            <div className="h-8 w-8 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </header>
    );
  }

  const shouldUseSmartNavigation = dashboardType === "business" && mounted;

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-[50] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          {showCompanySelector && <BusinessSwitcher 
            businesses={mockBusinesses}
            onBusinessSwitch={handleBusinessSwitch}
          />}
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center space-x-1 flex-1 min-w-0">
            {shouldUseSmartNavigation ? (
              <SmartBusinessNavigation 
                userId="user_1"
                userRole="OWNER"
                businessId="business_1"
                businessType={pathname.includes('/field-management') ? 'field-service' : pathname.includes('/restaurants') ? 'restaurant' : 'field-service'}
                className="flex-1"
                maxHeaderItems={7}
                showAppLauncher={true}
                showCustomization={true}
                enhanced={true}
              />
            ) : (
              <nav className="hidden lg:flex items-center space-x-1">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
              </nav>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {showSearch && (
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
          )}

          <Button 
            variant="ghost" 
            size="sm" 
            className="w-8 h-8 p-0 transition-all duration-200 hover:scale-110 hover:bg-primary/10 hover:text-primary"
          >
            <Plus className="h-4 w-4" />
          </Button>

          {/* Enhanced Weather Widget */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <UtilityButton
                icon={Cloud}
                title="Today's Weather"
                className="relative"
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

          {/* Quick Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <UtilityButton
                icon={Zap}
                title="Quick Actions"
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
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Phone/Dial Out */}
          <DropdownMenu
            onOpenChange={(open) => {
              if (open) {
                // Add keyboard listener when menu opens
                const handleKeyPress = (e) => {
                  const input = document.querySelector('input[placeholder="Enter phone number"]');
                  if (!input) return;
                  
                  // Handle number keys and special characters
                  if (e.key >= '0' && e.key <= '9' || e.key === '*' || e.key === '#') {
                    e.preventDefault();
                    input.value += e.key;
                    input.focus();
                  } else if (e.key === 'Backspace') {
                    e.preventDefault();
                    input.value = input.value.slice(0, -1);
                    input.focus();
                  } else if (e.key === 'Delete' || (e.key === 'a' && (e.ctrlKey || e.metaKey))) {
                    e.preventDefault();
                    input.value = '';
                    input.focus();
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    // Trigger call action
                    const callButton = document.querySelector('[data-phone-call-button]');
                    if (callButton) callButton.click();
                  }
                };
                
                document.addEventListener('keydown', handleKeyPress);
                
                // Cleanup listener when menu closes
                const cleanup = () => {
                  document.removeEventListener('keydown', handleKeyPress);
                };
                
                // Store cleanup function for later use
                window._phoneKeyboardCleanup = cleanup;
              } else if (window._phoneKeyboardCleanup) {
                window._phoneKeyboardCleanup();
                delete window._phoneKeyboardCleanup;
              }
            }}
          >
            <DropdownMenuTrigger asChild>
              <UtilityButton
                icon={Phone}
                title="Phone & Dialing"
                statusIndicator={true}
                statusColor="green-500"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-4 z-[10001]">
              {/* Polaris-style Header */}
              <div className="mb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
                    <Phone className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Phone</h3>
                    <p className="text-xs text-muted-foreground">Make a call</p>
                  </div>
                </div>
              </div>
              
              {/* Clean Number Input */}
              <div className="mb-4">
                <input 
                  type="text" 
                  placeholder="Enter phone number"
                  className="w-full h-10 px-3 text-base font-mono text-center border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                  maxLength="20"
                  autoFocus
                />
              </div>
              
              {/* Polaris-style Keypad */}
              <div className="mb-4">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { num: '1', letters: '' },
                    { num: '2', letters: 'ABC' },
                    { num: '3', letters: 'DEF' },
                    { num: '4', letters: 'GHI' },
                    { num: '5', letters: 'JKL' },
                    { num: '6', letters: 'MNO' },
                    { num: '7', letters: 'PQRS' },
                    { num: '8', letters: 'TUV' },
                    { num: '9', letters: 'WXYZ' },
                    { num: '*', letters: '' },
                    { num: '0', letters: '+' },
                    { num: '#', letters: '' }
                  ].map(({ num, letters }) => (
                    <button
                      key={num}
                      className="h-12 w-full bg-background hover:bg-muted border border-border rounded flex flex-col items-center justify-center text-foreground transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Enter phone number"]');
                        if (input) {
                          input.value += num;
                          input.focus();
                        }
                      }}
                    >
                      <span className="text-base font-medium">{num}</span>
                      {letters && (
                        <span className="text-xs text-muted-foreground font-normal mt-0.5">
                          {letters}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Polaris-style Action Buttons */}
              <div className="flex gap-2 mb-4">
                <Button 
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" 
                  data-phone-call-button="true"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
                
                <Button 
                  variant="outline"
                  className="px-3"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Enter phone number"]');
                    if (input) {
                      if (input.value.length > 0) {
                        input.value = input.value.slice(0, -1);
                      }
                      input.focus();
                    }
                  }}
                  title="Backspace"
                >
                  ⌫
                </Button>
                
                <Button 
                  variant="outline"
                  className="px-3"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Enter phone number"]');
                    if (input) {
                      input.value = '';
                      input.focus();
                    }
                  }}
                  title="Clear"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Simple Keyboard Hint */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Use keyboard: 0-9, *, #, Backspace, Enter
                </p>
              </div>
              
              <DropdownMenuSeparator />
              
              {/* Quick Contacts - Polaris Style */}
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                  Quick contacts
                </DropdownMenuLabel>
                
                <DropdownMenuItem className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-6 rounded bg-muted flex items-center justify-center">
                      <User className="h-3 w-3" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Support Center</p>
                      <p className="text-xs text-muted-foreground">(555) 123-4567</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                    <Phone className="h-3 w-3" />
                  </Button>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-6 rounded bg-muted flex items-center justify-center">
                      <User className="h-3 w-3" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Main Office</p>
                      <p className="text-xs text-muted-foreground">(555) 987-6543</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                    <Phone className="h-3 w-3" />
                  </Button>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-6 rounded bg-muted flex items-center justify-center">
                      <User className="h-3 w-3" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Emergency</p>
                      <p className="text-xs text-muted-foreground">911</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                    <Phone className="h-3 w-3" />
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/business/communication/contacts">
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Manage contacts</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/business/communication/call-history">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Call history</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative w-9 px-0 transition-all duration-200 hover:scale-110 hover:bg-muted/50">
                <Bell className="h-4 w-4 transition-all duration-200" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center animate-pulse"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 z-[100] animate-in fade-in-0 slide-in-from-top-2">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                <Badge variant="secondary" className="text-xs">3 new</Badge>
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
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 px-0 transition-all duration-200 hover:scale-110 hover:bg-muted/50">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-[100] animate-in fade-in-0 zoom-in-95">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
                {theme === "light" && <Badge variant="secondary" className="ml-auto text-xs">Active</Badge>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
                {theme === "dark" && <Badge variant="secondary" className="ml-auto text-xs">Active</Badge>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
              <DropdownMenuItem asChild>
                <Link href="/dashboard/user/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/business/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {showCommandPalette && (
        <AdvancedCommandPalette 
          open={commandOpen} 
          onOpenChange={setCommandOpen}
          dashboardType={dashboardType}
        />
      )}
    </header>
  );
}
