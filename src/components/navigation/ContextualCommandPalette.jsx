"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@components/ui/command";
import { Badge } from "@components/ui/badge";
import { Kbd } from "@components/ui/kbd";
import {
  Search,
  Clock,
  Star,
  Zap,
  Calculator,
  Calendar,
  Users,
  FileText,
  Package,
  Settings,
  TrendingUp,
  MessageSquare,
  Home,
  Plus,
  Filter,
  Download,
  Edit,
  Trash2,
  Copy,
  Share,
  Archive,
  BookOpen,
  HelpCircle,
  Command
} from "lucide-react";
import { BUSINESS_MODULES } from "@config/navigation/industry-presets";

/**
 * Contextual Command Palette
 * Advanced command palette with AI-powered suggestions and context awareness
 */
export default function ContextualCommandPalette({ 
  open, 
  onOpenChange,
  userId = "user_1",
  businessId = "business_1",
  currentModule = null
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [recentCommands, setRecentCommands] = useState([]);
  const [frequentCommands, setFrequentCommands] = useState([]);

  // Load user command history
  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem(`recent_commands_${userId}`) || '[]');
    const frequent = JSON.parse(localStorage.getItem(`frequent_commands_${userId}`) || '{}');
    
    setRecentCommands(recent.slice(0, 5));
    setFrequentCommands(
      Object.entries(frequent)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([command]) => command)
    );
  }, [userId]);

  // Generate contextual commands based on current page
  const contextualCommands = useMemo(() => {
    const commands = [];
    const segments = pathname.split('/').filter(Boolean);
    
    // Page-specific commands
    if (pathname.includes('/schedule')) {
      commands.push(
        { id: 'new-job', label: 'Create New Job', icon: Plus, action: () => router.push('/dashboard/business/field-management/schedule/new-job'), category: 'Actions' },
        { id: 'view-calendar', label: 'View Calendar', icon: Calendar, action: () => router.push('/dashboard/business/field-management/schedule/calendar'), category: 'Navigation' },
        { id: 'route-planner', label: 'Route Planner', icon: TrendingUp, action: () => router.push('/dashboard/business/field-management/schedule/route-planner'), category: 'Tools' }
      );
    }
    
    if (pathname.includes('/customers')) {
      commands.push(
        { id: 'add-customer', label: 'Add New Customer', icon: Plus, action: () => router.push('/dashboard/business/field-management/customers/create'), category: 'Actions' },
        { id: 'customer-list', label: 'View All Customers', icon: Users, action: () => router.push('/dashboard/business/field-management/customers/list'), category: 'Navigation' },
        { id: 'customer-analytics', label: 'Customer Analytics', icon: TrendingUp, action: () => router.push('/dashboard/shared/analytics/customers'), category: 'Insights' }
      );
    }
    
    if (pathname.includes('/estimates')) {
      commands.push(
        { id: 'create-estimate', label: 'Create Estimate', icon: Plus, action: () => router.push('/dashboard/business/field-management/estimates/create'), category: 'Actions' },
        { id: 'estimate-templates', label: 'Estimate Templates', icon: FileText, action: () => router.push('/dashboard/business/field-management/estimates/templates'), category: 'Tools' },
        { id: 'pending-estimates', label: 'Pending Estimates', icon: Clock, action: () => router.push('/dashboard/business/field-management/estimates/list?status=pending'), category: 'Quick Access' }
      );
    }
    
    if (pathname.includes('/invoices')) {
      commands.push(
        { id: 'create-invoice', label: 'Create Invoice', icon: Plus, action: () => router.push('/dashboard/business/field-management/invoices/create'), category: 'Actions' },
        { id: 'pending-invoices', label: 'Pending Invoices', icon: Clock, action: () => router.push('/dashboard/business/field-management/invoices/list?status=pending'), category: 'Quick Access' },
        { id: 'invoice-analytics', label: 'Invoice Analytics', icon: Calculator, action: () => router.push('/dashboard/shared/analytics/invoices'), category: 'Insights' }
      );
    }
    
    // Universal commands
    commands.push(
      { id: 'dashboard', label: 'Go to Dashboard', icon: Home, action: () => router.push('/dashboard/business'), category: 'Navigation' },
      { id: 'settings', label: 'Settings', icon: Settings, action: () => router.push('/dashboard/shared/settings'), category: 'Navigation' },
      { id: 'help', label: 'Help & Support', icon: HelpCircle, action: () => window.open('/help', '_blank'), category: 'Support' }
    );
    
    return commands;
  }, [pathname, router]);

  // All available modules as commands
  const moduleCommands = useMemo(() => {
    return Object.values(BUSINESS_MODULES).map(module => ({
      id: `module-${module.id}`,
      label: `Go to ${module.label}`,
      icon: module.icon,
      action: () => router.push(module.href),
      category: 'Modules',
      description: module.description
    }));
  }, [router]);

  // Quick actions based on current context
  const quickActions = useMemo(() => {
    const actions = [
      { id: 'search-customers', label: 'Search Customers', icon: Search, action: () => setSearch('customers '), category: 'Search' },
      { id: 'search-jobs', label: 'Search Jobs', icon: Search, action: () => setSearch('jobs '), category: 'Search' },
      { id: 'search-invoices', label: 'Search Invoices', icon: Search, action: () => setSearch('invoices '), category: 'Search' }
    ];
    
    // Add time-sensitive actions
    const hour = new Date().getHours();
    if (hour >= 8 && hour <= 17) {
      actions.unshift(
        { id: 'todays-schedule', label: "Today's Schedule", icon: Calendar, action: () => router.push('/dashboard/business/field-management/schedule?date=today'), category: 'Quick Access' }
      );
    }
    
    return actions;
  }, [router]);

  // Filter commands based on search
  const filteredCommands = useMemo(() => {
    if (!search) return [];
    
    const allCommands = [...contextualCommands, ...moduleCommands, ...quickActions];
    return allCommands.filter(command => 
      command.label.toLowerCase().includes(search.toLowerCase()) ||
      command.category.toLowerCase().includes(search.toLowerCase()) ||
      command.description?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, contextualCommands, moduleCommands, quickActions]);

  // Handle command execution
  const executeCommand = useCallback((command) => {
    // Track command usage
    const recent = JSON.parse(localStorage.getItem(`recent_commands_${userId}`) || '[]');
    const frequent = JSON.parse(localStorage.getItem(`frequent_commands_${userId}`) || '{}');
    
    // Update recent commands
    const updatedRecent = [command.id, ...recent.filter(id => id !== command.id)].slice(0, 10);
    localStorage.setItem(`recent_commands_${userId}`, JSON.stringify(updatedRecent));
    
    // Update frequent commands
    frequent[command.id] = (frequent[command.id] || 0) + 1;
    localStorage.setItem(`frequent_commands_${userId}`, JSON.stringify(frequent));
    
    // Execute the command
    command.action();
    onOpenChange(false);
    setSearch("");
  }, [userId, onOpenChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onOpenChange]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups = {};
    
    if (search) {
      filteredCommands.forEach(command => {
        if (!groups[command.category]) {
          groups[command.category] = [];
        }
        groups[command.category].push(command);
      });
    } else {
      // Show contextual commands when no search
      contextualCommands.forEach(command => {
        if (!groups[command.category]) {
          groups[command.category] = [];
        }
        groups[command.category].push(command);
      });
    }
    
    return groups;
  }, [search, filteredCommands, contextualCommands]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Search commands, pages, or actions..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {/* Recent Commands */}
        {!search && recentCommands.length > 0 && (
          <CommandGroup heading="Recent">
            {recentCommands.map(commandId => {
              const command = [...contextualCommands, ...moduleCommands, ...quickActions]
                .find(c => c.id === commandId);
              if (!command) return null;
              
              const Icon = command.icon;
              return (
                <CommandItem 
                  key={command.id}
                  onSelect={() => executeCommand(command)}
                  className="flex items-center space-x-3"
                >
                  <Icon className="h-4 w-4" />
                  <span>{command.label}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Recent
                  </Badge>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
        
        {/* Frequent Commands */}
        {!search && frequentCommands.length > 0 && (
          <CommandGroup heading="Frequently Used">
            {frequentCommands.map(commandId => {
              const command = [...contextualCommands, ...moduleCommands, ...quickActions]
                .find(c => c.id === commandId);
              if (!command) return null;
              
              const Icon = command.icon;
              return (
                <CommandItem 
                  key={command.id}
                  onSelect={() => executeCommand(command)}
                  className="flex items-center space-x-3"
                >
                  <Icon className="h-4 w-4" />
                  <span>{command.label}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    Frequent
                  </Badge>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
        
        {/* Grouped Commands */}
        {Object.entries(groupedCommands).map(([category, commands], index) => (
          <React.Fragment key={category}>
            {index > 0 && <CommandSeparator />}
            <CommandGroup heading={category}>
              {commands.map(command => {
                const Icon = command.icon;
                return (
                  <CommandItem 
                    key={command.id}
                    onSelect={() => executeCommand(command)}
                    className="flex items-center space-x-3"
                  >
                    <Icon className="h-4 w-4" />
                    <div className="flex-1">
                      <span>{command.label}</span>
                      {command.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {command.description}
                        </p>
                      )}
                    </div>
                    {command.shortcut && (
                      <Kbd className="ml-auto">
                        {command.shortcut}
                      </Kbd>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </React.Fragment>
        ))}
        
        {/* Help Footer */}
        <CommandSeparator />
        <CommandGroup>
          <div className="px-2 py-1 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Press <Kbd>⌘K</Kbd> to open</span>
              <span>Press <Kbd>↵</Kbd> to select</span>
            </div>
          </div>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
