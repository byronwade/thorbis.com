"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@components/ui/dropdown-menu";
import { 
  Keyboard, 
  Search, 
  Calendar, 
  Users, 
  Settings, 
  BarChart3, 
  FileText, 
  Star,
  Briefcase,
  HelpCircle,
  Command,
  Plus,
  RefreshCw,
  MapPin,
  TrendingUp,
  DollarSign,
  Package,
  UserPlus,
  Monitor,
  Bell,
  MessageSquare,
  Building2
} from "lucide-react";
import { useToast } from "@components/ui/use-toast";
import logger from "@lib/utils/logger";

/**
 * Keyboard Shortcuts System
 * Features: Global shortcuts, context-aware actions, visual feedback
 */
export default function KeyboardShortcuts({ 
  dashboardType = "business",
  onShortcutTriggered,
  className = ""
}) {
  const [activeShortcuts, setActiveShortcuts] = useState(new Set());
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  // Performance tracking
  const startTime = performance.now();

  // Dashboard-specific shortcuts
  const shortcutConfigs = useMemo(() => ({
    business: [
      {
        id: "search",
        keys: ["⌘", "K"],
        description: "Open command palette",
        action: () => {
          // Trigger search component
          document.dispatchEvent(new KeyboardEvent('keydown', { 
            key: 'k', 
            metaKey: true 
          }));
        },
        icon: Search,
        category: "General"
      },
      {
        id: "help",
        keys: ["?"],
        description: "Show keyboard shortcuts",
        action: () => {},
        icon: HelpCircle,
        category: "General"
      },
      {
        id: "refresh",
        keys: ["⌘", "R"],
        description: "Refresh page",
        action: () => window.location.reload(),
        icon: RefreshCw,
        category: "General"
      },
      {
        id: "new-job",
        keys: ["⌘", "⇧", "J"],
        description: "Create new job",
        action: () => router.push("/dashboard/business/jobs/create"),
        icon: Briefcase,
        category: "Jobs"
      },
      {
        id: "view-jobs",
        keys: ["⌘", "J"],
        description: "View all jobs",
        action: () => router.push("/dashboard/business/jobs"),
        icon: Briefcase,
        category: "Jobs"
      },
      {
        id: "job-board",
        keys: ["⌘", "⇧", "B"],
        description: "Open job board",
        action: () => router.push("/dashboard/business/jobs/board"),
        icon: Briefcase,
        category: "Jobs"
      },
      {
        id: "job-map",
        keys: ["⌘", "⇧", "M"],
        description: "View jobs on map",
        action: () => router.push("/dashboard/business/jobs/map"),
        icon: MapPin,
        category: "Jobs"
      },
      {
        id: "new-customer",
        keys: ["⌘", "⇧", "C"],
        description: "Add new customer",
        action: () => router.push("/dashboard/business/customers/create"),
        icon: Users,
        category: "Customers"
      },
      {
        id: "view-customers",
        keys: ["⌘", "C"],
        description: "View all customers",
        action: () => router.push("/dashboard/business/customers"),
        icon: Users,
        category: "Customers"
      },
      {
        id: "customer-search",
        keys: ["⌘", "⇧", "F"],
        description: "Search customers",
        action: () => router.push("/dashboard/business/customers/search"),
        icon: Search,
        category: "Customers"
      },
      {
        id: "calendar",
        keys: ["⌘", "⇧", "S"],
        description: "Open schedule calendar",
        action: () => router.push("/dashboard/business/schedule/calendar"),
        icon: Calendar,
        category: "Schedule"
      },
      {
        id: "schedule",
        keys: ["⌘", "S"],
        description: "View schedule",
        action: () => router.push("/dashboard/business/schedule"),
        icon: Calendar,
        category: "Schedule"
      },
      {
        id: "new-appointment",
        keys: ["⌘", "⇧", "A"],
        description: "Create appointment",
        action: () => router.push("/dashboard/business/schedule/create"),
        icon: Calendar,
        category: "Schedule"
      },
      {
        id: "analytics",
        keys: ["⌘", "⇧", "D"],
        description: "View analytics dashboard",
        action: () => router.push("/dashboard/business/analytics"),
        icon: BarChart3,
        category: "Analytics"
      },
      {
        id: "reports",
        keys: ["⌘", "R"],
        description: "Generate reports",
        action: () => router.push("/dashboard/business/reports"),
        icon: BarChart3,
        category: "Analytics"
      },
      {
        id: "performance",
        keys: ["⌘", "⇧", "P"],
        description: "View performance metrics",
        action: () => router.push("/dashboard/business/analytics/performance"),
        icon: TrendingUp,
        category: "Analytics"
      },
      {
        id: "new-estimate",
        keys: ["⌘", "⇧", "E"],
        description: "Create new estimate",
        action: () => router.push("/dashboard/business/estimates/create"),
        icon: FileText,
        category: "Estimates"
      },
      {
        id: "view-estimates",
        keys: ["⌘", "E"],
        description: "View all estimates",
        action: () => router.push("/dashboard/business/estimates"),
        icon: FileText,
        category: "Estimates"
      },
      {
        id: "new-invoice",
        keys: ["⌘", "⇧", "I"],
        description: "Create new invoice",
        action: () => router.push("/dashboard/business/invoices/create"),
        icon: FileText,
        category: "Invoices"
      },
      {
        id: "view-invoices",
        keys: ["⌘", "I"],
        description: "View all invoices",
        action: () => router.push("/dashboard/business/invoices"),
        icon: FileText,
        category: "Invoices"
      },
      {
        id: "payments",
        keys: ["⌘", "⇧", "P"],
        description: "View payments",
        action: () => router.push("/dashboard/business/payments"),
        icon: DollarSign,
        category: "Invoices"
      },
      {
        id: "inventory",
        keys: ["⌘", "V"],
        description: "View inventory",
        action: () => router.push("/dashboard/business/inventory"),
        icon: Package,
        category: "Inventory"
      },
      {
        id: "add-item",
        keys: ["⌘", "⇧", "N"],
        description: "Add inventory item",
        action: () => router.push("/dashboard/business/inventory/create"),
        icon: Plus,
        category: "Inventory"
      },
      {
        id: "team",
        keys: ["⌘", "T"],
        description: "Manage team",
        action: () => router.push("/dashboard/business/team"),
        icon: Users,
        category: "Team"
      },
      {
        id: "add-employee",
        keys: ["⌘", "⇧", "T"],
        description: "Add team member",
        action: () => router.push("/dashboard/business/team/create"),
        icon: UserPlus,
        category: "Team"
      },
      {
        id: "devices",
        keys: ["⌘", "D"],
        description: "Manage devices",
        action: () => router.push("/dashboard/business/devices"),
        icon: Monitor,
        category: "Devices"
      },
      {
        id: "add-device",
        keys: ["⌘", "⇧", "D"],
        description: "Add new device",
        action: () => router.push("/dashboard/business/devices/create"),
        icon: Plus,
        category: "Devices"
      },
      {
        id: "settings",
        keys: ["⌘", ","],
        description: "Open settings",
        action: () => router.push("/dashboard/business/settings"),
        icon: Settings,
        category: "Settings"
      },
      {
        id: "profile",
        keys: ["⌘", "P"],
        description: "Business profile",
        action: () => router.push("/dashboard/business/profile"),
        icon: Building2,
        category: "Settings"
      },
      {
        id: "notifications",
        keys: ["⌘", "N"],
        description: "Notification settings",
        action: () => router.push("/dashboard/business/notifications"),
        icon: Bell,
        category: "Settings"
      },
      {
        id: "help-support",
        keys: ["⌘", "H"],
        description: "Help & support",
        action: () => router.push("/dashboard/business/support"),
        icon: HelpCircle,
        category: "Support"
      },
      {
        id: "contact-support",
        keys: ["⌘", "⇧", "H"],
        description: "Contact support",
        action: () => router.push("/dashboard/business/support/contact"),
        icon: MessageSquare,
        category: "Support"
      }
    ],
    user: [
      {
        id: "search",
        keys: ["⌘", "K"],
        description: "Open command palette",
        action: () => {
          document.dispatchEvent(new KeyboardEvent('keydown', { 
            key: 'k', 
            metaKey: true 
          }));
        },
        icon: Search,
        category: "General"
      },
      {
        id: "profile",
        keys: ["⌘", "P"],
        description: "Open profile",
        action: () => router.push("/dashboard/user/profile"),
        icon: Users,
        category: "Profile"
      },
      {
        id: "jobs",
        keys: ["⌘", "J"],
        description: "View my jobs",
        action: () => router.push("/dashboard/user/jobs"),
        icon: Briefcase,
        category: "Jobs"
      }
    ],
    admin: [
      {
        id: "search",
        keys: ["⌘", "K"],
        description: "Open command palette",
        action: () => {
          document.dispatchEvent(new KeyboardEvent('keydown', { 
            key: 'k', 
            metaKey: true 
          }));
        },
        icon: Search,
        category: "General"
      },
      {
        id: "users",
        keys: ["⌘", "U"],
        description: "Manage users",
        action: () => router.push("/dashboard/admin/users"),
        icon: Users,
        category: "Users"
      },
      {
        id: "reports",
        keys: ["⌘", "R"],
        description: "View reports",
        action: () => router.push("/dashboard/admin/reports"),
        icon: BarChart3,
        category: "Reports"
      }
    ]
  }), [router]);

  // Get shortcuts for current dashboard type
  const shortcuts = shortcutConfigs[dashboardType] || shortcutConfigs.business;

  // Group shortcuts by category
  const shortcutsByCategory = useMemo(() => {
    const grouped = {};
    shortcuts.forEach(shortcut => {
      if (!grouped[shortcut.category]) {
        grouped[shortcut.category] = [];
      }
      grouped[shortcut.category].push(shortcut);
    });
    return grouped;
  }, [shortcuts]);

  // Global keyboard event handler
  const handleGlobalKeyDown = useCallback((event) => {
    // Don't trigger shortcuts when typing in input fields
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.contentEditable === 'true') {
      return;
    }

    const pressedKeys = [];
    if (event.metaKey || event.ctrlKey) pressedKeys.push('cmd');
    if (event.shiftKey) pressedKeys.push('shift');
    if (event.altKey) pressedKeys.push('alt');
    if (event.key !== 'Meta' && event.key !== 'Shift' && event.key !== 'Alt' && event.key !== 'Control') {
      pressedKeys.push(event.key.toLowerCase());
    }

    const pressedKeyString = pressedKeys.sort().join('+');
    
    shortcuts.forEach(shortcut => {
      const shortcutKeyString = shortcut.keys.map(k => k.toLowerCase()).sort().join('+');
      if (pressedKeyString === shortcutKeyString) {
        event.preventDefault();
        
        // Visual feedback
        setActiveShortcuts(prev => new Set([...prev, shortcut.id]));
        setTimeout(() => {
          setActiveShortcuts(prev => {
            const newSet = new Set(prev);
            newSet.delete(shortcut.id);
            return newSet;
          });
        }, 200);

        // Execute action
        try {
          shortcut.action();
          if (onShortcutTriggered) {
            onShortcutTriggered(shortcut);
          }
          
          // Show toast notification
          toast({
            title: "Shortcut executed",
            description: shortcut.description,
            duration: 1500
          });
        } catch (error) {
          logger.error('Keyboard shortcut error:', error);
          toast({
            title: "Shortcut error",
            description: "Failed to execute shortcut",
            variant: "destructive"
          });
        }
      }
    });
  }, [shortcuts, onShortcutTriggered, toast]);

  // Set up global keyboard listener
  useEffect(() => {
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [handleGlobalKeyDown]);

  // Performance logging
  useEffect(() => {
    const endTime = performance.now();
    logger.debug(`KeyboardShortcuts component mounted in ${endTime - startTime}ms`);
  }, [startTime]);

  const formatKeys = (keys) => {
    return keys.map(key => {
      switch (key.toLowerCase()) {
        case 'cmd':
        case 'ctrl':
          return '⌘';
        case 'shift':
          return '⇧';
        case 'alt':
          return '⌥';
        case 'enter':
          return '↵';
        case 'escape':
          return '⎋';
        case 'backspace':
          return '⌫';
        case 'delete':
          return '⌦';
        case 'tab':
          return '⇥';
        default:
          return key.toUpperCase();
      }
    }).join('');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="relative h-7 w-7 rounded-md p-0 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 transition-colors hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50"
          title="Keyboard shortcuts"
        >
          <Keyboard className="w-3.5 h-3.5 text-foreground" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-96 p-2 z-[10001] max-h-[80vh] overflow-y-auto">
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Keyboard className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Keyboard Shortcuts</p>
              <p className="text-xs text-muted-foreground">Quick actions & navigation</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Shortcuts by Category */}
        {Object.entries(shortcutsByCategory).map(([category, categoryShortcuts]) => (
          <div key={category}>
            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
              {category}
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {categoryShortcuts.map((shortcut) => {
                const IconComponent = shortcut.icon;
                const isActive = activeShortcuts.has(shortcut.id);
                
                return (
                  <DropdownMenuItem 
                    key={shortcut.id}
                    className={`p-2 ${isActive ? 'bg-primary/10' : ''}`}
                    onClick={shortcut.action}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-2">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{shortcut.description}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {shortcut.keys.map((key, index) => (
                          <React.Fragment key={key}>
                            <kbd className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 text-xs font-medium text-muted-foreground bg-muted border border-border rounded">
                              {key}
                            </kbd>
                            {index < shortcut.keys.length - 1 && (
                              <span className="text-xs text-muted-foreground">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </div>
        ))}
        
        {/* Tips */}
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
          Tips
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          <div className="px-2 py-1.5 text-xs text-muted-foreground space-y-1">
            <p>• Shortcuts work from anywhere in the dashboard</p>
            <p>• Press <kbd className="bg-muted px-1 rounded">?</kbd> to open this menu</p>
            <p>• Some shortcuts may not work while typing</p>
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
