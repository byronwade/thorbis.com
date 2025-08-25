"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Card, CardContent } from "@components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@components/ui/dropdown-menu";
import {
  Lightbulb,
  Zap,
  TrendingUp,
  Clock,
  Target,
  Sparkles,
  ChevronRight,
  X
} from "lucide-react";

/**
 * Smart Action Suggestions Component
 * AI-powered contextual suggestions based on user behavior and page context
 */
export default function SmartActionSuggestions({ 
  userId,
  userRole,
  businessId,
  currentModule,
  className = ""
}) {
  const pathname = usePathname();
  const [suggestions, setSuggestions] = useState([]);
  const [dismissedSuggestions, setDismissedSuggestions] = useState(new Set());
  const [userBehavior, setUserBehavior] = useState({});

  // Analyze user behavior and context
  useEffect(() => {
    const behavior = analyzeUserBehavior(pathname, currentModule, userRole);
    setUserBehavior(behavior);
    
    const contextualSuggestions = generateSmartSuggestions(behavior, currentModule, pathname);
    setSuggestions(contextualSuggestions);
  }, [pathname, currentModule, userRole]);

  // Analyze user behavior patterns
  const analyzeUserBehavior = (path, module, role) => {
    const timeOfDay = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Get from localStorage or analytics
    const recentActions = JSON.parse(localStorage.getItem(`user_actions_${userId}`) || '[]');
    const frequentModules = JSON.parse(localStorage.getItem(`frequent_modules_${userId}`) || '{}');
    
    return {
      timeOfDay,
      dayOfWeek,
      isWeekend,
      recentActions: recentActions.slice(-10), // Last 10 actions
      frequentModules,
      currentPath: path,
      currentModule: module,
      userRole: role
    };
  };

  // Generate smart suggestions based on context
  const generateSmartSuggestions = (behavior, module, path) => {
    const suggestions = [];
    const { timeOfDay, isWeekend, recentActions, frequentModules, userRole } = behavior;

    // Time-based suggestions
    if (timeOfDay >= 8 && timeOfDay <= 10 && !isWeekend) {
      suggestions.push({
        id: 'morning_schedule',
        type: 'time_based',
        priority: 'high',
        title: 'Review Today\'s Schedule',
        description: 'Check and optimize your daily appointments',
        action: '/dashboard/business/field-management/schedule',
        icon: Clock,
        category: 'productivity'
      });
    }

    // Module-specific suggestions
    switch (module?.id) {
      case 'schedule':
        if (path.includes('/schedule') && !path.includes('/new-job')) {
          suggestions.push({
            id: 'optimize_routes',
            type: 'contextual',
            priority: 'medium',
            title: 'Optimize Routes',
            description: 'AI can optimize your technician routes by 15%',
            action: '/dashboard/business/field-management/schedule/route-planner',
            icon: TrendingUp,
            category: 'efficiency'
          });
        }
        break;

      case 'customers':
        if (recentActions.filter(a => a.includes('customer')).length > 3) {
          suggestions.push({
            id: 'customer_insights',
            type: 'behavioral',
            priority: 'medium',
            title: 'Customer Insights Available',
            description: 'View analytics for your most active customers',
            action: '/dashboard/shared/analytics/customers',
            icon: Target,
            category: 'insights'
          });
        }
        break;

      case 'estimates':
        suggestions.push({
          id: 'estimate_templates',
          type: 'productivity',
          priority: 'low',
          title: 'Use Estimate Templates',
          description: 'Save time with pre-built estimate templates',
          action: '/dashboard/business/field-management/estimates/templates',
          icon: Zap,
          category: 'productivity'
        });
        break;

      case 'invoices':
        if (timeOfDay >= 16) { // After 4 PM
          suggestions.push({
            id: 'send_invoices',
            type: 'time_based',
            priority: 'high',
            title: 'Send Pending Invoices',
            description: 'End your day by sending out pending invoices',
            action: '/dashboard/business/field-management/invoices/list?filter=pending',
            icon: Clock,
            category: 'financial'
          });
        }
        break;
    }

    // Role-based suggestions
    if (userRole === 'OWNER') {
      suggestions.push({
        id: 'business_insights',
        type: 'role_based',
        priority: 'medium',
        title: 'Weekly Business Review',
        description: 'Check your key performance metrics',
        action: '/dashboard/shared/analytics/overview',
        icon: TrendingUp,
        category: 'management'
      });
    }

    // Filter out dismissed suggestions
    return suggestions.filter(s => !dismissedSuggestions.has(s.id));
  };

  const handleSuggestionClick = (suggestion) => {
    // Track suggestion usage
    const actions = JSON.parse(localStorage.getItem(`user_actions_${userId}`) || '[]');
    actions.push({
      type: 'suggestion_clicked',
      suggestionId: suggestion.id,
      timestamp: Date.now(),
      path: pathname
    });
    localStorage.setItem(`user_actions_${userId}`, JSON.stringify(actions.slice(-50)));

    // Navigate to suggestion
    window.location.href = suggestion.action;
  };

  const handleDismissSuggestion = (suggestionId) => {
    setDismissedSuggestions(prev => new Set([...prev, suggestionId]));
    
    // Store dismissed suggestions
    const dismissed = JSON.parse(localStorage.getItem(`dismissed_suggestions_${userId}`) || '[]');
    dismissed.push({ id: suggestionId, timestamp: Date.now() });
    localStorage.setItem(`dismissed_suggestions_${userId}`, JSON.stringify(dismissed));
  };

  const prioritySuggestions = useMemo(() => {
    return suggestions
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 3); // Show max 3 suggestions
  }, [suggestions]);

  if (prioritySuggestions.length === 0) return null;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Sparkles className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Smart Suggestions</span>
            <Badge 
              variant="secondary" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {prioritySuggestions.length}
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center">
            <Lightbulb className="h-4 w-4 mr-2" />
            Smart Suggestions
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {prioritySuggestions.map((suggestion) => {
            const Icon = suggestion.icon;
            return (
              <div key={suggestion.id} className="relative">
                <DropdownMenuItem 
                  className="flex flex-col items-start p-3 cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex items-start w-full">
                    <div className="flex items-center space-x-2 flex-1">
                      <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium">{suggestion.title}</p>
                          <Badge 
                            variant={suggestion.priority === 'high' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {suggestion.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {suggestion.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {suggestion.category}
                          </Badge>
                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismissSuggestion(suggestion.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-center text-muted-foreground">
            <Sparkles className="h-4 w-4 mr-2" />
            Powered by AI
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
