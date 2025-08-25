"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  HelpCircle,
  Keyboard,
  Lightbulb,
  BookOpen,
  Video,
  ExternalLink,
  ChevronRight,
  Star,
  Zap,
  Target,
  Users,
  Settings,
  FileText,
  CreditCard,
  Calendar,
  Phone,
  BarChart3
} from 'lucide-react';
import { usePathname } from 'next/navigation';

interface KeyboardShortcut {
  key: string;
  description: string;
  category: string;
}

interface HelpTopic {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  url?: string;
}

interface ContextualHelpProps {
  className?: string;
}

const ContextualHelp: React.FC<ContextualHelpProps> = ({ 
  className = '' 
}) => {
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState<string>('');

  useEffect(() => {
    setCurrentPage(pathname);
  }, [pathname]);

  // Keyboard shortcuts
  const keyboardShortcuts: KeyboardShortcut[] = [
    { key: '⌘ + K', description: 'Quick search', category: 'Navigation' },
    { key: '⌘ + /', description: 'Show shortcuts', category: 'Help' },
    { key: '⌘ + N', description: 'New invoice', category: 'Actions' },
    { key: '⌘ + T', description: 'New task', category: 'Actions' },
    { key: '⌘ + C', description: 'New contact', category: 'Actions' },
    { key: '⌘ + E', description: 'New appointment', category: 'Actions' },
    { key: '⌘ + B', description: 'Toggle sidebar', category: 'Interface' },
    { key: '⌘ + D', description: 'Toggle dark mode', category: 'Interface' },
    { key: '⌘ + ,', description: 'Open settings', category: 'Interface' },
    { key: '⌘ + H', description: 'Go to home', category: 'Navigation' },
    { key: '⌘ + A', description: 'Select all', category: 'Actions' },
    { key: '⌘ + Z', description: 'Undo', category: 'Actions' },
    { key: '⌘ + Shift + Z', description: 'Redo', category: 'Actions' },
    { key: '⌘ + S', description: 'Save', category: 'Actions' },
    { key: '⌘ + P', description: 'Print', category: 'Actions' },
    { key: '⌘ + F', description: 'Find', category: 'Navigation' },
    { key: '⌘ + R', description: 'Refresh', category: 'Navigation' },
    { key: '⌘ + Shift + R', description: 'Hard refresh', category: 'Navigation' },
    { key: '⌘ + 1-9', description: 'Switch tabs', category: 'Navigation' },
    { key: '⌘ + 0', description: 'Go to dashboard', category: 'Navigation' }
  ];

  // Help topics based on current page
  const getContextualHelp = (): HelpTopic[] => {
    const baseTopics: HelpTopic[] = [
      {
        id: 'getting-started',
        title: 'Getting Started',
        description: 'Learn the basics of using the platform',
        category: 'general',
        icon: <Target className="h-4 w-4" />,
        url: '/help/getting-started'
      },
      {
        id: 'keyboard-shortcuts',
        title: 'Keyboard Shortcuts',
        description: 'Master keyboard navigation',
        category: 'general',
        icon: <Keyboard className="h-4 w-4" />
      },
      {
        id: 'video-tutorials',
        title: 'Video Tutorials',
        description: 'Watch step-by-step guides',
        category: 'general',
        icon: <Video className="h-4 w-4" />,
        url: '/help/videos'
      }
    ];

    // Page-specific help topics
    if (currentPage.includes('/dashboard/business/invoices')) {
      return [
        ...baseTopics,
        {
          id: 'create-invoice',
          title: 'Create Invoice',
          description: 'Step-by-step guide to creating invoices',
          category: 'invoices',
          icon: <FileText className="h-4 w-4" />,
          url: '/help/invoices/create'
        },
        {
          id: 'invoice-templates',
          title: 'Invoice Templates',
          description: 'Customize your invoice appearance',
          category: 'invoices',
          icon: <FileText className="h-4 w-4" />,
          url: '/help/invoices/templates'
        },
        {
          id: 'payment-tracking',
          title: 'Payment Tracking',
          description: 'Track and manage payments',
          category: 'invoices',
          icon: <CreditCard className="h-4 w-4" />,
          url: '/help/invoices/payments'
        }
      ];
    }

    if (currentPage.includes('/dashboard/business/contacts')) {
      return [
        ...baseTopics,
        {
          id: 'manage-contacts',
          title: 'Manage Contacts',
          description: 'Add, edit, and organize contacts',
          category: 'contacts',
          icon: <Users className="h-4 w-4" />,
          url: '/help/contacts/manage'
        },
        {
          id: 'contact-groups',
          title: 'Contact Groups',
          description: 'Organize contacts into groups',
          category: 'contacts',
          icon: <Users className="h-4 w-4" />,
          url: '/help/contacts/groups'
        }
      ];
    }

    if (currentPage.includes('/dashboard/business/calendar')) {
      return [
        ...baseTopics,
        {
          id: 'schedule-appointments',
          title: 'Schedule Appointments',
          description: 'Create and manage appointments',
          category: 'calendar',
          icon: <Calendar className="h-4 w-4" />,
          url: '/help/calendar/appointments'
        },
        {
          id: 'calendar-sync',
          title: 'Calendar Sync',
          description: 'Sync with external calendars',
          category: 'calendar',
          icon: <Calendar className="h-4 w-4" />,
          url: '/help/calendar/sync'
        }
      ];
    }

    if (currentPage.includes('/dashboard/business/analytics')) {
      return [
        ...baseTopics,
        {
          id: 'read-reports',
          title: 'Understanding Reports',
          description: 'Learn to read and interpret analytics',
          category: 'analytics',
          icon: <BarChart3 className="h-4 w-4" />,
          url: '/help/analytics/reports'
        },
        {
          id: 'custom-dashboards',
          title: 'Custom Dashboards',
          description: 'Create personalized dashboards',
          category: 'analytics',
          icon: <BarChart3 className="h-4 w-4" />,
          url: '/help/analytics/dashboards'
        }
      ];
    }

    return baseTopics;
  };

  // Feature discovery - highlight new or underused features
  const featureDiscovery = [
    {
      id: 'quick-actions',
      title: 'Quick Actions',
      description: 'Use the quick actions menu for faster workflows',
      icon: <Zap className="h-4 w-4" />,
      new: true
    },
    {
      id: 'voice-search',
      title: 'Voice Search',
      description: 'Try voice search for hands-free navigation',
      icon: <Target className="h-4 w-4" />,
      new: false
    },
    {
      id: 'keyboard-shortcuts',
      title: 'Keyboard Shortcuts',
      description: 'Press ⌘ + / to see all available shortcuts',
      icon: <Keyboard className="h-4 w-4" />,
      new: false
    }
  ];

  const helpTopics = getContextualHelp();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Navigation':
        return <Target className="h-3 w-3" />;
      case 'Actions':
        return <Zap className="h-3 w-3" />;
      case 'Interface':
        return <Settings className="h-3 w-3" />;
      case 'Help':
        return <HelpCircle className="h-3 w-3" />;
      default:
        return <HelpCircle className="h-3 w-3" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Navigation':
        return 'text-blue-500';
      case 'Actions':
        return 'text-green-500';
      case 'Interface':
        return 'text-purple-500';
      case 'Help':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={`relative h-7 w-7 rounded-md p-0 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 transition-colors hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 flex items-center justify-center ${className}`}
          title="Help & Tips"
        >
          <HelpCircle className="w-3.5 h-3.5 text-foreground" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-2 z-[10001] max-h-[600px] overflow-y-auto">
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <HelpCircle className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Help & Tips</p>
              <p className="text-xs text-muted-foreground">Get help and discover features</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Feature Discovery */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-3 w-3" />
              <span>Feature Discovery</span>
            </div>
          </DropdownMenuLabel>
          {featureDiscovery.map(feature => (
            <DropdownMenuItem key={feature.id} className="p-2">
              <div className="flex items-start space-x-3 w-full">
                <div className="flex-shrink-0 mt-1">
                  {feature.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">{feature.title}</p>
                    {feature.new && (
                      <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {feature.description}
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        
        {/* Contextual Help */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-3 w-3" />
              <span>Help Topics</span>
            </div>
          </DropdownMenuLabel>
          {helpTopics.map(topic => (
            <DropdownMenuItem key={topic.id} className="p-2">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  {topic.icon}
                  <div>
                    <p className="text-sm font-medium">{topic.title}</p>
                    <p className="text-xs text-muted-foreground">{topic.description}</p>
                  </div>
                </div>
                {topic.url && (
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        
        {/* Keyboard Shortcuts */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
            <div className="flex items-center space-x-2">
              <Keyboard className="h-3 w-3" />
              <span>Keyboard Shortcuts</span>
            </div>
          </DropdownMenuLabel>
          {keyboardShortcuts.slice(0, 8).map((shortcut, index) => (
            <DropdownMenuItem key={index} className="p-2">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <span className={`h-3 w-3 ${getCategoryColor(shortcut.category)}`}>
                    {getCategoryIcon(shortcut.category)}
                  </span>
                  <span className="text-sm">{shortcut.description}</span>
                </div>
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
                  {shortcut.key}
                </kbd>
              </div>
            </DropdownMenuItem>
          ))}
          {keyboardShortcuts.length > 8 && (
            <DropdownMenuItem className="p-2 text-center">
              <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                <span>View all {keyboardShortcuts.length} shortcuts</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        {/* Quick Actions */}
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Documentation</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Video className="mr-2 h-4 w-4" />
            <span>Video Tutorials</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Users className="mr-2 h-4 w-4" />
            <span>Contact Support</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ContextualHelp;
