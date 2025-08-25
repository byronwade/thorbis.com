"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator 
} from '@components/ui/dropdown-menu';
import { RefreshCw, ExternalLink, ChevronDown, GitBranch } from 'lucide-react';
import { useSystemUpdates } from '@hooks/use-system-updates';

/**
 * Reusable Updates Dropdown Component
 * 
 * @param {Object} props - Component props
 * @param {Array} props.updates - Array of system updates
 * @param {string} props.updatesPageUrl - URL for the full updates page
 * @param {string} props.currentVersion - Current system version
 * @param {string} props.dashboardType - Type of dashboard (for styling)
 * @param {boolean} props.showVersionBadge - Whether to show version badge
 * @param {string} props.className - Additional CSS classes
 */
export default function UpdatesDropdown({ 
  updates = [], 
  updatesPageUrl = '/dashboard/updates',
  currentVersion = 'v2.1.0',
  dashboardType = 'business',
  showVersionBadge = true,
  className = '',
  audience = 'all'
}) {
  const [showUpdatesDropdown, setShowUpdatesDropdown] = useState(false);

  // Use the hook to fetch updates if none provided
  const { updates: fetchedUpdates, currentVersion: fetchedVersion, loading } = useSystemUpdates({
    limit: 5,
    audience,
    enabled: updates.length === 0
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const displayUpdates = updates.length > 0 ? updates : fetchedUpdates;
  const displayVersion = currentVersion || fetchedVersion;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Version Badge */}
      {showVersionBadge && (
        <div className="hidden sm:flex items-center space-x-2 text-xs text-muted-foreground">
          <GitBranch className="h-3 w-3" />
          <span className="font-mono">{displayVersion}</span>
        </div>
      )}

      {/* Updates Dropdown */}
      <DropdownMenu open={showUpdatesDropdown} onOpenChange={setShowUpdatesDropdown}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Updates
            <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
              {loading ? '...' : displayUpdates.length}
            </Badge>
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Recent Updates</span>
            <Link href={updatesPageUrl}>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                <ExternalLink className="h-3 w-3 mr-1" />
                View All
              </Button>
            </Link>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {loading ? (
            <DropdownMenuItem className="p-3">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading updates...</span>
              </div>
            </DropdownMenuItem>
          ) : displayUpdates.length > 0 ? (
            displayUpdates.map((update) => (
              <DropdownMenuItem key={update.id} className="flex-col items-start p-3 space-y-2">
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className={`text-xs ${update.badgeColor}`}>
                      {update.badge}
                    </Badge>
                    <span className="text-sm font-medium">{update.title}</span>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>{formatDate(update.date)}</div>
                    <div className="font-mono">{update.version}</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {update.description}
                </p>
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem className="p-3">
              <span className="text-sm text-muted-foreground">No updates available</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
                      <div className="p-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Last updated</span>
                <span>{displayUpdates[0]?.date ? formatDate(displayUpdates[0].date) : 'Unknown'}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <span>Current version</span>
                <span className="font-mono">{displayVersion}</span>
              </div>
            </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
