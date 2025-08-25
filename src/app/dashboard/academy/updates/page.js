"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Input } from '@components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { 
  RefreshCw, 
  Search, 
  Filter, 
  Calendar, 
  GitBranch, 
  ExternalLink,
  Download,
  Star,
  AlertCircle,
  CheckCircle,
  Zap,
  Shield,
  Bug,
  Sparkles
} from 'lucide-react';
import { cn } from '@lib/utils';
import { useSystemUpdates } from '@hooks/use-system-updates';

const updateTypes = [
  { value: 'all', label: 'All Updates', icon: RefreshCw },
  { value: 'feature', label: 'New Features', icon: Sparkles },
  { value: 'improvement', label: 'Improvements', icon: Star },
  { value: 'fix', label: 'Bug Fixes', icon: Bug },
  { value: 'security', label: 'Security', icon: Shield }
];

const categories = [
  'All Categories',
  'Courses',
  'Learning',
  'Certifications',
  'Progress',
  'Content',
  'UI/UX',
  'Performance',
  'Mobile',
  'Notifications'
];

export default function UpdatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedImpact, setSelectedImpact] = useState('all');

  // Fetch updates specifically for academy users
  const { updates, currentVersion, loading, error } = useSystemUpdates({
    limit: 20,
    audience: 'academy',
    enabled: true
  });

  const filteredUpdates = useMemo(() => {
    return updates.filter(update => {
      const matchesSearch = update.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           update.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || update.type === selectedType;
      const matchesCategory = selectedCategory === 'All Categories' || update.category === selectedCategory;
      const matchesImpact = selectedImpact === 'all' || update.impact === selectedImpact;
      
      return matchesSearch && matchesType && matchesCategory && matchesImpact;
    });
  }, [updates, searchQuery, selectedType, selectedCategory, selectedImpact]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950';
      case 'low': return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950';
      default: return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950';
    }
  };

  const getImpactLabel = (impact) => {
    switch (impact) {
      case 'high': return 'High Impact';
      case 'medium': return 'Medium Impact';
      case 'low': return 'Low Impact';
      default: return 'Unknown Impact';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading updates...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error loading updates</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <RefreshCw className="h-8 w-8 text-primary" />
            Academy Updates & Changelog
          </h1>
          <p className="text-muted-foreground mt-2">
            Stay informed about the latest learning features, course updates, and improvements
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Changelog
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Subscribe to Updates
          </Button>
        </div>
      </div>

      {/* Current Version Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-primary/10">
                <GitBranch className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Current Version</h3>
                <p className="text-2xl font-mono text-primary">{currentVersion}</p>
                <p className="text-sm text-muted-foreground">
                  Released on {updates[0]?.date ? formatDate(updates[0].date) : 'Recently'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Updates</p>
              <p className="text-2xl font-bold">{updates.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search updates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {updateTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Impact Filter */}
            <Select value={selectedImpact} onValueChange={setSelectedImpact}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by impact" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Impact Levels</SelectItem>
                <SelectItem value="high">High Impact</SelectItem>
                <SelectItem value="medium">Medium Impact</SelectItem>
                <SelectItem value="low">Low Impact</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Updates List */}
      <div className="space-y-4">
        {filteredUpdates.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No updates found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search terms
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredUpdates.map((update) => {
            return (
              <Card key={update.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full bg-background border ${update.badgeColor}`}>
                      {update.type === 'feature' && <Sparkles className="h-5 w-5" />}
                      {update.type === 'improvement' && <Star className="h-5 w-5" />}
                      {update.type === 'fix' && <Bug className="h-5 w-5" />}
                      {update.type === 'security' && <Shield className="h-5 w-5" />}
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{update.title}</h3>
                            <Badge variant="secondary" className={update.badgeColor}>
                              {update.badge}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", getImpactColor(update.impact))}
                            >
                              {getImpactLabel(update.impact)}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">
                            {update.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(update.date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <GitBranch className="h-4 w-4" />
                            <span className="font-mono">{update.version}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="capitalize">{update.category}</span>
                          </div>
                        </div>
                        
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Learn More
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination or Load More */}
      {filteredUpdates.length > 0 && (
        <div className="flex justify-center pt-6">
          <Button variant="outline">
            Load More Updates
          </Button>
        </div>
      )}
    </div>
  );
}
