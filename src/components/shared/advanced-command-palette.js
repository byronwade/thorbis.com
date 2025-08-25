"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@components/ui/command";
import { Badge } from "@components/ui/badge";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  FileText,
  Users,
  BarChart3,
  Package,
  Truck,
  Clock,
  DollarSign,
  Home,
  Building2,
  Phone,
  Mail,
  MessageSquare,
  Search,
  Plus,
  Edit,
  Trash2,
  Copy,
  Archive,
  Star,
  Filter,
  Download,
  Upload,
  Share,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  RefreshCw,
  Save,
  Send,
  Printer,
  Globe,
  Zap,
  Target,
  Brain,
  Crown,
  Shield,
  Activity,
  TrendingUp,
  PieChart,
  Map,
  Navigation,
  Compass,
  Layers,
  Grid,
  List,
  Table,
  Image,
  Video,
  Music,
  File,
  Folder,
  FolderOpen,
  Tag,
  Bookmark,
  Flag,
  Heart,
  ThumbsUp,
  MessageCircle,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Battery,
  Power,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  HardDrive,
  Database,
  Server,
  Cloud,
  CloudOff,
  Gauge,
  Speedometer,
  Timer,
  Stopwatch,
  AlarmClock,
  Sun,
  Moon,
  CloudRain,
  CloudSnow,
  Wind,
  Thermometer
} from "lucide-react";

/**
 * Advanced Command Palette with Smart Search and Actions
 * Features: Fuzzy search, recent items, quick actions, keyboard shortcuts
 */
export default function AdvancedCommandPalette({ 
  open, 
  onOpenChange, 
  dashboardType = "business" 
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentItems, setRecentItems] = useState([]);
  const router = useRouter();
  const pathname = usePathname();

  // Load recent items from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('command-palette-recent');
    if (saved) {
      try {
        setRecentItems(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load recent items:', error);
      }
    }
  }, []);

  // Save recent items to localStorage
  const saveRecentItem = useCallback((item) => {
    setRecentItems(prev => {
      const filtered = prev.filter(i => i.id !== item.id);
      const updated = [item, ...filtered].slice(0, 10); // Keep only 10 recent items
      localStorage.setItem('command-palette-recent', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Navigation items based on dashboard type
  const navigationItems = useMemo(() => {
    const baseItems = {
      business: [
        { id: "dashboard", label: "Dashboard", href: "/dashboard/business", icon: Home, category: "Navigation" },
        { id: "customers", label: "Customers", href: "/dashboard/business/customers", icon: Users, category: "Navigation" },
        { id: "invoices", label: "Invoices", href: "/dashboard/business/invoices", icon: FileText, category: "Navigation" },
        { id: "estimates", label: "Estimates", href: "/dashboard/business/estimates", icon: Calculator, category: "Navigation" },
        { id: "schedule", label: "Schedule", href: "/dashboard/business/schedule", icon: Calendar, category: "Navigation" },
        { id: "dispatch", label: "Dispatch", href: "/dashboard/business/dispatch", icon: Truck, category: "Navigation" },
        { id: "inventory", label: "Inventory", href: "/dashboard/business/inventory", icon: Package, category: "Navigation" },
        { id: "analytics", label: "Analytics", href: "/dashboard/business/analytics", icon: BarChart3, category: "Navigation" },
        { id: "payroll", label: "Payroll", href: "/dashboard/business/payroll", icon: DollarSign, category: "Navigation" },
        { id: "settings", label: "Settings", href: "/dashboard/business/settings", icon: Settings, category: "Navigation" },
      ],
      user: [
        { id: "dashboard", label: "Dashboard", href: "/dashboard/user", icon: Home, category: "Navigation" },
        { id: "timesheet", label: "Timesheet", href: "/dashboard/user/timesheet", icon: Clock, category: "Navigation" },
        { id: "schedule", label: "My Schedule", href: "/dashboard/user/schedule", icon: Calendar, category: "Navigation" },
        { id: "profile", label: "Profile", href: "/dashboard/user/profile", icon: User, category: "Navigation" },
      ],
      admin: [
        { id: "overview", label: "Overview", href: "/dashboard/admin", icon: Gauge, category: "Navigation" },
        { id: "users", label: "Users", href: "/dashboard/admin/users", icon: Users, category: "Navigation" },
        { id: "businesses", label: "Businesses", href: "/dashboard/admin/businesses", icon: Building2, category: "Navigation" },
        { id: "system", label: "System", href: "/dashboard/admin/system", icon: Settings, category: "Navigation" },
      ]
    };

    return baseItems[dashboardType] || baseItems.business;
  }, [dashboardType]);

  // Quick actions based on dashboard type
  const quickActions = useMemo(() => {
    const baseActions = {
      business: [
        { 
          id: "new-customer", 
          label: "New Customer", 
          href: "/dashboard/business/customers/new", 
          icon: Users, 
          category: "Create",
          shortcut: "⌘N",
          description: "Add a new customer to your database"
        },
        { 
          id: "new-invoice", 
          label: "Create Invoice", 
          href: "/dashboard/business/invoices/create", 
          icon: FileText, 
          category: "Create",
          shortcut: "⌘I",
          description: "Generate a new invoice for a customer"
        },
        { 
          id: "new-estimate", 
          label: "Create Estimate", 
          href: "/dashboard/business/estimates/create", 
          icon: Calculator, 
          category: "Create",
          shortcut: "⌘E",
          description: "Create a new estimate or quote"
        },
        { 
          id: "schedule-job", 
          label: "Schedule Job", 
          href: "/dashboard/business/schedule/new", 
          icon: Calendar, 
          category: "Create",
          shortcut: "⌘J",
          description: "Schedule a new job or appointment"
        },
        { 
          id: "add-inventory", 
          label: "Add Inventory", 
          href: "/dashboard/business/inventory/add", 
          icon: Package, 
          category: "Create",
          description: "Add new items to inventory"
        },
      ],
      user: [
        { 
          id: "clock-in", 
          label: "Clock In/Out", 
          action: "clock-toggle", 
          icon: Clock, 
          category: "Actions",
          shortcut: "⌘T",
          description: "Toggle your time tracking status"
        },
        { 
          id: "view-timesheet", 
          label: "View Timesheet", 
          href: "/dashboard/user/timesheet", 
          icon: Activity, 
          category: "View",
          description: "Check your logged hours"
        },
      ],
      admin: [
        { 
          id: "system-status", 
          label: "System Status", 
          href: "/dashboard/admin/system/status", 
          icon: Monitor, 
          category: "System",
          description: "Check system health and performance"
        },
        { 
          id: "user-management", 
          label: "Manage Users", 
          href: "/dashboard/admin/users", 
          icon: Users, 
          category: "Management",
          description: "Add, edit, or remove users"
        },
      ]
    };

    return baseActions[dashboardType] || baseActions.business;
  }, [dashboardType]);

  // Search functionality
  const searchItems = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const allItems = [...navigationItems, ...quickActions];
    const query = searchQuery.toLowerCase();

    return allItems.filter(item => 
      item.label.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  }, [searchQuery, navigationItems, quickActions]);

  // Handle item selection
  const handleSelect = useCallback((item) => {
    // Save to recent items
    saveRecentItem({
      ...item,
      timestamp: Date.now()
    });

    // Handle different item types
    if (item.href) {
      router.push(item.href);
    } else if (item.action) {
      // Handle custom actions
      switch (item.action) {
        case 'clock-toggle':
          // Implement clock toggle logic
          console.log('Toggle clock in/out');
          break;
        default:
          console.log('Unknown action:', item.action);
      }
    }

    onOpenChange(false);
  }, [router, onOpenChange, saveRecentItem]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle shortcuts when command palette is closed
      if (open) return;

      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            handleSelect({ href: "/dashboard/business/customers/new" });
            break;
          case 'i':
            e.preventDefault();
            handleSelect({ href: "/dashboard/business/invoices/create" });
            break;
          case 'e':
            e.preventDefault();
            handleSelect({ href: "/dashboard/business/estimates/create" });
            break;
          case 'j':
            e.preventDefault();
            handleSelect({ href: "/dashboard/business/schedule/new" });
            break;
          case 't':
            e.preventDefault();
            // Handle clock toggle
            console.log('Clock toggle shortcut');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleSelect]);

  // Group items by category
  const groupedItems = useMemo(() => {
    const items = searchQuery ? searchItems : [...navigationItems, ...quickActions];
    const groups = {};

    items.forEach(item => {
      const category = item.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    });

    return groups;
  }, [searchQuery, searchItems, navigationItems, quickActions]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Type a command or search..." 
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Search className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No results found.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try searching for customers, invoices, or actions.
            </p>
          </div>
        </CommandEmpty>

        {/* Recent Items (only show when no search query) */}
        {!searchQuery && recentItems.length > 0 && (
          <>
            <CommandGroup heading="Recent">
              {recentItems.slice(0, 5).map((item) => {
                const Icon = item.icon || FileText;
                return (
                  <CommandItem
                    key={`recent-${item.id}`}
                    onSelect={() => handleSelect(item)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Recent
                    </Badge>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Grouped Items */}
        {Object.entries(groupedItems).map(([category, items], index) => (
          <React.Fragment key={category}>
            <CommandGroup heading={category}>
              {items.map((item) => {
                const Icon = item.icon || FileText;
                const isActive = pathname === item.href;
                
                return (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelect(item)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <Icon className="mr-2 h-4 w-4" />
                      <div className="flex flex-col">
                        <span className={isActive ? "font-medium" : ""}>{item.label}</span>
                        {item.description && (
                          <span className="text-xs text-muted-foreground">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {isActive && (
                        <Badge variant="default" className="text-xs">
                          Current
                        </Badge>
                      )}
                      {item.shortcut && (
                        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                          {item.shortcut}
                        </kbd>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {index < Object.keys(groupedItems).length - 1 && <CommandSeparator />}
          </React.Fragment>
        ))}

        {/* Help Section */}
        {!searchQuery && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Help">
              <CommandItem onSelect={() => handleSelect({ href: "/help" })}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Documentation</span>
              </CommandItem>
              <CommandItem onSelect={() => handleSelect({ href: "/support" })}>
                <MessageCircle className="mr-2 h-4 w-4" />
                <span>Contact Support</span>
              </CommandItem>
              <CommandItem onSelect={() => handleSelect({ href: "/shortcuts" })}>
                <Zap className="mr-2 h-4 w-4" />
                <span>Keyboard Shortcuts</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
