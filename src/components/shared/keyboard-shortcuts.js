"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@components/ui/dialog";
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
  HelpCircle
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
  const [showDialog, setShowDialog] = useState(false);
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
        keys: ["cmd", "k"],
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
        id: "new-job",
        keys: ["cmd", "shift", "j"],
        description: "Create new job",
        action: () => router.push("/dashboard/business/jobs/create"),
        icon: Briefcase,
        category: "Jobs"
      },
      {
        id: "new-customer",
        keys: ["cmd", "shift", "c"],
        description: "Add new customer",
        action: () => router.push("/dashboard/business/customers/create"),
        icon: Users,
        category: "Customers"
      },
      {
        id: "calendar",
        keys: ["cmd", "shift", "s"],
        description: "Open schedule calendar",
        action: () => router.push("/dashboard/business/schedule/calendar"),
        icon: Calendar,
        category: "Schedule"
      },
      {
        id: "analytics",
        keys: ["cmd", "shift", "a"],
        description: "View analytics dashboard",
        action: () => router.push("/dashboard/business/analytics"),
        icon: BarChart3,
        category: "Analytics"
      },
      {
        id: "new-estimate",
        keys: ["cmd", "shift", "e"],
        description: "Create new estimate",
        action: () => router.push("/dashboard/business/estimates/create"),
        icon: FileText,
        category: "Estimates"
      },
      {
        id: "settings",
        keys: ["cmd", ","],
        description: "Open settings",
        action: () => router.push("/dashboard/business/settings"),
        icon: Settings,
        category: "General"
      },
      {
        id: "help",
        keys: ["?"],
        description: "Show keyboard shortcuts",
        action: () => setShowDialog(true),
        icon: HelpCircle,
        category: "General"
      }
    ],
    user: [
      {
        id: "search",
        keys: ["cmd", "k"],
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
        id: "write-review",
        keys: ["cmd", "shift", "r"],
        description: "Write a review",
        action: () => router.push("/dashboard/user/reviews/create"),
        icon: Star,
        category: "Reviews"
      },
      {
        id: "post-job",
        keys: ["cmd", "shift", "j"],
        description: "Post job request",
        action: () => router.push("/dashboard/user/jobs/create"),
        icon: Briefcase,
        category: "Jobs"
      },
      {
        id: "bookmarks",
        keys: ["cmd", "shift", "b"],
        description: "View bookmarks",
        action: () => router.push("/dashboard/user/bookmarks"),
        icon: Star,
        category: "Bookmarks"
      },
      {
        id: "settings",
        keys: ["cmd", ","],
        description: "Open settings",
        action: () => router.push("/dashboard/user/settings"),
        icon: Settings,
        category: "General"
      },
      {
        id: "help",
        keys: ["?"],
        description: "Show keyboard shortcuts",
        action: () => setShowDialog(true),
        icon: HelpCircle,
        category: "General"
      }
    ],
    admin: [
      {
        id: "search",
        keys: ["cmd", "k"],
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
        keys: ["cmd", "shift", "u"],
        description: "Manage users",
        action: () => router.push("/admin/users"),
        icon: Users,
        category: "Management"
      },
      {
        id: "reports",
        keys: ["cmd", "shift", "r"],
        description: "View reports",
        action: () => router.push("/admin/reports"),
        icon: BarChart3,
        category: "Analytics"
      },
      {
        id: "settings",
        keys: ["cmd", ","],
        description: "Open settings",
        action: () => router.push("/admin/settings"),
        icon: Settings,
        category: "General"
      }
    ],
    academy: [
      {
        id: "search",
        keys: ["cmd", "k"],
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
        id: "courses",
        keys: ["cmd", "shift", "c"],
        description: "Browse courses",
        action: () => router.push("/academy/courses"),
        icon: FileText,
        category: "Learning"
      },
      {
        id: "progress",
        keys: ["cmd", "shift", "p"],
        description: "View progress",
        action: () => router.push("/academy/progress"),
        icon: BarChart3,
        category: "Learning"
      }
    ]
  }), [router]);

  // Get current dashboard shortcuts
  const shortcuts = shortcutConfigs[dashboardType] || shortcutConfigs.business;

  // Group shortcuts by category
  const shortcutsByCategory = useMemo(() => {
    const categories = {};
    shortcuts.forEach(shortcut => {
      if (!categories[shortcut.category]) {
        categories[shortcut.category] = [];
      }
      categories[shortcut.category].push(shortcut);
    });
    return categories;
  }, [shortcuts]);

  // Check if key combination matches
  const matchesShortcut = useCallback((event, shortcut) => {
    const keys = shortcut.keys;
    
    // Handle single key shortcuts
    if (keys.length === 1) {
      return event.key === keys[0] && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
    }
    
    // Handle combination shortcuts
    const hasCmd = keys.includes("cmd") && (event.metaKey || event.ctrlKey);
    const hasShift = keys.includes("shift") && event.shiftKey;
    const hasAlt = keys.includes("alt") && event.altKey;
    
    const keyPart = keys.find(k => !["cmd", "shift", "alt"].includes(k));
    const hasKey = event.key.toLowerCase() === keyPart?.toLowerCase();
    
    // Check exact match
    const cmdMatch = keys.includes("cmd") ? hasCmd : !event.metaKey && !event.ctrlKey;
    const shiftMatch = keys.includes("shift") ? hasShift : !event.shiftKey;
    const altMatch = keys.includes("alt") ? hasAlt : !event.altKey;
    
    return cmdMatch && shiftMatch && altMatch && hasKey;
  }, []);

  // Handle keydown events
  const handleKeyDown = useCallback((event) => {
    // Skip if typing in input fields
    if (["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) {
      return;
    }

    // Skip if any modals are open (except our shortcuts dialog)
    if (document.querySelector('[role="dialog"]') && !showDialog) {
      return;
    }

    // Find matching shortcut
    const matchedShortcut = shortcuts.find(shortcut => matchesShortcut(event, shortcut));
    
    if (matchedShortcut) {
      event.preventDefault();
      event.stopPropagation();
      
      // Visual feedback
      setActiveShortcuts(prev => new Set(prev).add(matchedShortcut.id));
      setTimeout(() => {
        setActiveShortcuts(prev => {
          const newSet = new Set(prev);
          newSet.delete(matchedShortcut.id);
          return newSet;
        });
      }, 200);

      // Execute action
      try {
        matchedShortcut.action();
        
        // Show toast feedback
        toast({
          title: "Shortcut activated",
          description: matchedShortcut.description,
          duration: 2000,
        });

        // Log usage
        logger.debug('Keyboard shortcut used', {
          action: 'keyboard_shortcut',
          shortcutId: matchedShortcut.id,
          keys: matchedShortcut.keys,
          dashboardType,
          pathname,
          timestamp: Date.now(),
        });

        // Call custom handler
        if (onShortcutTriggered) {
          onShortcutTriggered(matchedShortcut);
        }

      } catch (error) {
        logger.error('Shortcut action failed:', error);
        toast({
          title: "Shortcut failed",
          description: "There was an error executing this action",
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  }, [shortcuts, matchesShortcut, showDialog, toast, logger, onShortcutTriggered, dashboardType, pathname]);

  // Register global event listeners
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [handleKeyDown]);

  // Format key combination for display
  const formatKeys = useCallback((keys) => {
    const keyMap = {
      cmd: "⌘",
      shift: "⇧", 
      alt: "⌥",
      ctrl: "⌃"
    };

    return keys.map(key => keyMap[key] || key.toUpperCase()).join(" ");
  }, []);

  // Performance logging
  useEffect(() => {
    const renderTime = performance.now() - startTime;
    logger.performance(`KeyboardShortcuts rendered in ${renderTime.toFixed(2)}ms`);
  }, [startTime]);

  return (
    <>
      {/* Shortcuts Help Button */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-7 w-7 rounded-md p-0 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 ${className}`}
            title="Keyboard shortcuts"
          >
            <Keyboard className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Keyboard className="w-5 h-5" />
              <span>Keyboard Shortcuts</span>
              <Badge variant="secondary" className="text-xs ml-2">
                {dashboardType}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {Object.entries(shortcutsByCategory).map(([category, categoryShortcuts]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut) => {
                    const IconComponent = shortcut.icon;
                    const isActive = activeShortcuts.has(shortcut.id);
                    
                    return (
                      <div 
                        key={shortcut.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          isActive 
                            ? "bg-primary/10 border-primary/20" 
                            : "bg-muted/30 hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-background border flex items-center justify-center">
                            <IconComponent className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{shortcut.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          {shortcut.keys.map((key, index) => (
                            <React.Fragment key={key}>
                              <kbd className="inline-flex items-center justify-center h-6 min-w-[24px] px-2 text-xs font-medium text-muted-foreground bg-background border border-border rounded">
                                {formatKeys([key])}
                              </kbd>
                              {index < shortcut.keys.length - 1 && (
                                <span className="text-xs text-muted-foreground">+</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Tips */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Tips</h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>• Shortcuts work from anywhere in the dashboard</p>
                <p>• Press <kbd className="bg-muted px-1 rounded">?</kbd> to open this dialog</p>
                <p>• Some shortcuts may not work while typing in forms</p>
                <p>• Shortcuts are context-aware to your current dashboard</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Global shortcut feedback (invisible) */}
      <div className="sr-only" aria-live="polite">
        {Array.from(activeShortcuts).map(id => {
          const shortcut = shortcuts.find(s => s.id === id);
          return shortcut ? `Shortcut activated: ${shortcut.description}` : null;
        })}
      </div>
    </>
  );
}
