"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Search,
  Mic,
  MicOff,
  Clock,
  Filter,
  FileText,
  Users,
  CreditCard,
  Calendar,
  Settings,
  X,
  TrendingUp,
  Target,
  BarChart3
} from 'lucide-react';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'suggestion' | 'filter' | 'result';
  category?: string;
  icon?: React.ReactNode;
  url?: string;
  description?: string;
  metadata?: {
    type: string;
    status?: string;
    date?: string;
    amount?: string;
    priority?: string;
  };
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'invoice' | 'contact' | 'payment' | 'appointment' | 'task' | 'document' | 'setting' | 'report';
  url: string;
  icon: React.ReactNode;
  metadata: {
    status?: string;
    date?: string;
    amount?: string;
    priority?: string;
    category?: string;
  };
}

interface QuickSearchProps {
  className?: string;
  onSearch?: (query: string, filters?: string[]) => void;
}

const QuickSearch: React.FC<QuickSearchProps> = ({ 
  className = '',
  onSearch 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Mock recent searches - in real app, this would come from localStorage or API
  const mockRecentSearches = [
    'invoice #1234',
    'john doe contact',
    'plumbing services',
    'payment received',
    'scheduled maintenance'
  ];

  // Intelligent search suggestions based on context
  const getIntelligentSuggestions = useCallback((query: string): SearchSuggestion[] => {
    const suggestions: SearchSuggestion[] = [];
    
    // Action-based suggestions
    if (query.toLowerCase().includes('create') || query.toLowerCase().includes('new') || query.toLowerCase().includes('add')) {
      suggestions.push(
        { id: 'create-invoice', text: 'Create new invoice', type: 'suggestion', category: 'invoice', icon: <FileText className="h-4 w-4" />, url: '/dashboard/business/invoices/new' },
        { id: 'create-contact', text: 'Add new contact', type: 'suggestion', category: 'contact', icon: <Users className="h-4 w-4" />, url: '/dashboard/business/contacts/new' },
        { id: 'create-appointment', text: 'Schedule appointment', type: 'suggestion', category: 'calendar', icon: <Calendar className="h-4 w-4" />, url: '/dashboard/business/calendar/new' },
        { id: 'create-task', text: 'Create new task', type: 'suggestion', category: 'task', icon: <Target className="h-4 w-4" />, url: '/dashboard/business/tasks/new' }
      );
    }
    
    // View-based suggestions
    if (query.toLowerCase().includes('view') || query.toLowerCase().includes('show') || query.toLowerCase().includes('see')) {
      suggestions.push(
        { id: 'view-invoices', text: 'View all invoices', type: 'suggestion', category: 'invoice', icon: <FileText className="h-4 w-4" />, url: '/dashboard/business/invoices' },
        { id: 'view-contacts', text: 'View all contacts', type: 'suggestion', category: 'contact', icon: <Users className="h-4 w-4" />, url: '/dashboard/business/contacts' },
        { id: 'view-analytics', text: 'View analytics', type: 'suggestion', category: 'report', icon: <BarChart3 className="h-4 w-4" />, url: '/dashboard/business/analytics' }
      );
    }
    
    // Settings suggestions
    if (query.toLowerCase().includes('setting') || query.toLowerCase().includes('config') || query.toLowerCase().includes('preference')) {
      suggestions.push(
        { id: 'business-settings', text: 'Business settings', type: 'suggestion', category: 'settings', icon: <Settings className="h-4 w-4" />, url: '/dashboard/business/settings' },
        { id: 'user-settings', text: 'User preferences', type: 'suggestion', category: 'settings', icon: <Settings className="h-4 w-4" />, url: '/dashboard/business/settings/profile' }
      );
    }
    
    // Default suggestions if no specific context
    if (suggestions.length === 0) {
      suggestions.push(
        { id: 'quick-invoice', text: 'Create invoice', type: 'suggestion', category: 'invoice', icon: <FileText className="h-4 w-4" />, url: '/dashboard/business/invoices/new' },
        { id: 'quick-contact', text: 'Add contact', type: 'suggestion', category: 'contact', icon: <Users className="h-4 w-4" />, url: '/dashboard/business/contacts/new' },
        { id: 'quick-appointment', text: 'Schedule meeting', type: 'suggestion', category: 'calendar', icon: <Calendar className="h-4 w-4" />, url: '/dashboard/business/calendar/new' },
        { id: 'quick-analytics', text: 'View reports', type: 'suggestion', category: 'report', icon: <BarChart3 className="h-4 w-4" />, url: '/dashboard/business/analytics' }
      );
    }
    
    return suggestions.slice(0, 4);
  }, []);

  // Intelligent search results based on query
  const getIntelligentResults = useCallback((query: string): SearchResult[] => {
    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();
    
    // Invoice search
    if (queryLower.includes('invoice') || queryLower.includes('bill') || queryLower.match(/#\d+/)) {
      results.push(
        {
          id: 'inv-1234',
          title: 'Invoice #1234 - John Doe',
          description: 'Plumbing services - $450.00',
          type: 'invoice',
          url: '/dashboard/business/invoices/1234',
          icon: <FileText className="h-4 w-4" />,
          metadata: { status: 'Paid', date: '2024-01-15', amount: '$450.00' }
        },
        {
          id: 'inv-1235',
          title: 'Invoice #1235 - ABC Corp',
          description: 'Maintenance contract - $1,200.00',
          type: 'invoice',
          url: '/dashboard/business/invoices/1235',
          icon: <FileText className="h-4 w-4" />,
          metadata: { status: 'Overdue', date: '2024-01-10', amount: '$1,200.00' }
        }
      );
    }
    
    // Contact search
    if (queryLower.includes('contact') || queryLower.includes('client') || queryLower.includes('customer')) {
      results.push(
        {
          id: 'contact-john',
          title: 'John Doe',
          description: 'john.doe@email.com • (555) 123-4567',
          type: 'contact',
          url: '/dashboard/business/contacts/john-doe',
          icon: <Users className="h-4 w-4" />,
          metadata: { category: 'Client', priority: 'High' }
        },
        {
          id: 'contact-abc',
          title: 'ABC Corporation',
          description: 'contact@abccorp.com • (555) 987-6543',
          type: 'contact',
          url: '/dashboard/business/contacts/abc-corp',
          icon: <Users className="h-4 w-4" />,
          metadata: { category: 'Business', priority: 'Medium' }
        }
      );
    }
    
    // Payment search
    if (queryLower.includes('payment') || queryLower.includes('paid') || queryLower.includes('$')) {
      results.push(
        {
          id: 'payment-001',
          title: 'Payment Received - Invoice #1234',
          description: 'John Doe • $450.00 • Credit Card',
          type: 'payment',
          url: '/dashboard/business/payments/001',
          icon: <CreditCard className="h-4 w-4" />,
          metadata: { status: 'Completed', date: '2024-01-15', amount: '$450.00' }
        }
      );
    }
    
    // Appointment/Calendar search
    if (queryLower.includes('appointment') || queryLower.includes('meeting') || queryLower.includes('schedule')) {
      results.push(
        {
          id: 'appt-001',
          title: 'Team Standup Meeting',
          description: 'Daily team meeting • 10:00 AM',
          type: 'appointment',
          url: '/dashboard/business/calendar/appointment/001',
          icon: <Calendar className="h-4 w-4" />,
          metadata: { status: 'Scheduled', date: '2024-01-16', priority: 'High' }
        }
      );
    }
    
    // Task search
    if (queryLower.includes('task') || queryLower.includes('todo') || queryLower.includes('work')) {
      results.push(
        {
          id: 'task-001',
          title: 'Follow up with ABC Corp',
          description: 'Call regarding maintenance contract renewal',
          type: 'task',
          url: '/dashboard/business/tasks/001',
          icon: <Target className="h-4 w-4" />,
          metadata: { status: 'Pending', priority: 'High', date: '2024-01-16' }
        }
      );
    }
    
    // Analytics/Reports search
    if (queryLower.includes('report') || queryLower.includes('analytics') || queryLower.includes('stats')) {
      results.push(
        {
          id: 'report-monthly',
          title: 'Monthly Revenue Report',
          description: 'January 2024 financial summary',
          type: 'report',
          url: '/dashboard/business/analytics/reports/monthly',
          icon: <BarChart3 className="h-4 w-4" />,
          metadata: { status: 'Generated', date: '2024-01-31' }
        }
      );
    }
    
    // Settings search
    if (queryLower.includes('setting') || queryLower.includes('config') || queryLower.includes('preference')) {
      results.push(
        {
          id: 'settings-business',
          title: 'Business Settings',
          description: 'Company information and preferences',
          type: 'setting',
          url: '/dashboard/business/settings',
          icon: <Settings className="h-4 w-4" />,
          metadata: { category: 'Configuration' }
        }
      );
    }
    
    return results;
  }, []);

  // Smart filters that adapt based on search context
  const getSmartFilters = useCallback((query: string) => {
    const baseFilters = [
      { id: 'invoices', label: 'Invoices', icon: <FileText className="h-4 w-4" /> },
      { id: 'contacts', label: 'Contacts', icon: <Users className="h-4 w-4" /> },
      { id: 'payments', label: 'Payments', icon: <CreditCard className="h-4 w-4" /> },
      { id: 'appointments', label: 'Appointments', icon: <Calendar className="h-4 w-4" /> },
      { id: 'tasks', label: 'Tasks', icon: <Target className="h-4 w-4" /> },
      { id: 'reports', label: 'Reports', icon: <BarChart3 className="h-4 w-4" /> },
      { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> }
    ];

    // If query contains specific terms, prioritize relevant filters
    const queryLower = query.toLowerCase();
    if (queryLower.includes('invoice') || queryLower.includes('bill') || queryLower.match(/#\d+/)) {
      return baseFilters.filter(f => f.id === 'invoices' || f.id === 'payments');
    }
    if (queryLower.includes('contact') || queryLower.includes('client') || queryLower.includes('customer')) {
      return baseFilters.filter(f => f.id === 'contacts');
    }
    if (queryLower.includes('payment') || queryLower.includes('paid') || queryLower.includes('$')) {
      return baseFilters.filter(f => f.id === 'payments' || f.id === 'invoices');
    }
    if (queryLower.includes('appointment') || queryLower.includes('meeting') || queryLower.includes('schedule')) {
      return baseFilters.filter(f => f.id === 'appointments');
    }
    if (queryLower.includes('task') || queryLower.includes('todo') || queryLower.includes('work')) {
      return baseFilters.filter(f => f.id === 'tasks');
    }
    if (queryLower.includes('report') || queryLower.includes('analytics') || queryLower.includes('stats')) {
      return baseFilters.filter(f => f.id === 'reports');
    }
    if (queryLower.includes('setting') || queryLower.includes('config') || queryLower.includes('preference')) {
      return baseFilters.filter(f => f.id === 'settings');
    }

    return baseFilters;
  }, []);

  // Memoized values to prevent unnecessary re-renders
  const intelligentSuggestions = useMemo(() => getIntelligentSuggestions(searchQuery), [getIntelligentSuggestions, searchQuery]);
  const intelligentResults = useMemo(() => getIntelligentResults(searchQuery), [getIntelligentResults, searchQuery]);
  const quickFilters = useMemo(() => getSmartFilters(searchQuery), [getSmartFilters, searchQuery]);
  
  const filteredSuggestions = useMemo(() => 
    intelligentSuggestions.filter(suggestion =>
      suggestion.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      suggestion.category?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [intelligentSuggestions, searchQuery]
  );

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    } else {
      setRecentSearches(mockRecentSearches);
    }
  }, []);

  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    
    // Add to recent searches
    setRecentSearches(prev => {
      const updated = [query, ...prev.filter(s => s !== query)].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
    
    // Call parent search handler
    onSearch?.(query, activeFilters);
    setIsOpen(false);
    setSearchQuery('');
  }, [activeFilters, onSearch]);

  const handleVoiceSearch = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice search is not supported in this browser');
      return;
    }

    setIsListening(true);
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, []);

  const toggleFilter = useCallback((filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilters([]);
  }, []);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          className={`relative h-7 w-7 rounded-md p-0 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 transition-colors hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 flex items-center justify-center ${className}`}
          title="Quick Search"
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => searchInputRef.current?.focus(), 100);
          }}
        >
          <Search className="w-3.5 h-3.5 text-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-2 z-[10001]">
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Quick Search</p>
              <p className="text-xs text-muted-foreground">Search across all features</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Search Input */}
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search across invoices, contacts, payments, tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(searchQuery);
                }
              }}
              className="pl-10 pr-20"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVoiceSearch}
                className={`h-6 w-6 p-0 ${isListening ? 'text-red-500' : 'text-muted-foreground'}`}
                title={isListening ? 'Listening...' : 'Voice search'}
              >
                {isListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
              </Button>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="h-6 w-6 p-0 text-muted-foreground"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Search Context Indicator */}
          {searchQuery && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">Searching:</span>
              <div className="flex flex-wrap gap-1">
                {intelligentResults.length > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {intelligentResults.length} results found
                  </span>
                )}
                {searchQuery.toLowerCase().includes('invoice') && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    Invoices
                  </span>
                )}
                {searchQuery.toLowerCase().includes('contact') && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    Contacts
                  </span>
                )}
                {searchQuery.toLowerCase().includes('payment') && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                    Payments
                  </span>
                )}
                {searchQuery.toLowerCase().includes('appointment') && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                    Appointments
                  </span>
                )}
                {searchQuery.toLowerCase().includes('task') && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                    Tasks
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="px-2 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Filters:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-5 px-2 text-xs"
              >
                Clear all
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {activeFilters.map(filterId => {
                const filter = quickFilters.find(f => f.id === filterId);
                return (
                  <div
                    key={filterId}
                    className="flex items-center space-x-1 bg-primary/10 text-primary px-2 py-1 rounded text-xs"
                  >
                    {filter?.icon}
                    <span>{filter?.label}</span>
                    <button
                      onClick={() => toggleFilter(filterId)}
                      className="ml-1 hover:text-primary/70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Filters */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
            Quick Filters
          </DropdownMenuLabel>
          <div className="grid grid-cols-2 gap-1 px-2">
            {quickFilters.map(filter => (
              <Button
                key={filter.id}
                variant={activeFilters.includes(filter.id) ? "default" : "ghost"}
                size="sm"
                onClick={() => toggleFilter(filter.id)}
                className="justify-start h-8 text-xs"
              >
                {filter.icon}
                <span className="ml-2">{filter.label}</span>
              </Button>
            ))}
          </div>
        </DropdownMenuGroup>

        {/* Intelligent Search Results */}
        {searchQuery && intelligentResults.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                Search Results
              </DropdownMenuLabel>
              {intelligentResults.map(result => (
                <DropdownMenuItem
                  key={result.id}
                  onClick={() => {
                    window.location.href = result.url;
                    setIsOpen(false);
                  }}
                  className="p-2"
                >
                  <div className="flex items-start space-x-3 w-full">
                    <div className="flex-shrink-0 mt-1">
                      {result.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{result.title}</p>
                        {result.metadata.status && (
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            result.metadata.status === 'Paid' || result.metadata.status === 'Completed' 
                              ? 'bg-green-100 text-green-700' 
                              : result.metadata.status === 'Overdue' 
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {result.metadata.status}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{result.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {result.metadata.date && (
                          <span className="text-xs text-muted-foreground">{result.metadata.date}</span>
                        )}
                        {result.metadata.amount && (
                          <span className="text-xs font-medium text-green-600">{result.metadata.amount}</span>
                        )}
                        {result.metadata.priority && (
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            result.metadata.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {result.metadata.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}

        {/* Intelligent Suggestions */}
        {searchQuery && filteredSuggestions.length > 0 && intelligentResults.length === 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                Quick Actions
              </DropdownMenuLabel>
              {filteredSuggestions.slice(0, 3).map(suggestion => (
                <DropdownMenuItem
                  key={suggestion.id}
                  onClick={() => {
                    if (suggestion.url) {
                      window.location.href = suggestion.url;
                      setIsOpen(false);
                    } else {
                      handleSearch(suggestion.text);
                    }
                  }}
                  className="p-2"
                >
                  <div className="flex items-center space-x-2">
                    {suggestion.icon}
                    <span className="text-sm">{suggestion.text}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}

        {/* Recent Searches */}
        {!searchQuery && recentSearches.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                Recent Searches
              </DropdownMenuLabel>
              {recentSearches.slice(0, 3).map((search, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => handleSearch(search)}
                  className="p-2"
                >
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{search}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}

        {/* Search Button */}
        {searchQuery && intelligentResults.length === 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => handleSearch(searchQuery)}
                className="p-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <span className="text-sm">Search for "{searchQuery}"</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default QuickSearch;
