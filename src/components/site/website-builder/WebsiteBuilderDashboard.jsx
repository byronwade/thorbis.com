'use client';

/**
 * Website Builder Dashboard - Main interface for creating and managing websites
 * Styled with Thorbis design system
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layout, 
  Settings, 
  Eye, 
  Globe, 
  BarChart3, 
  Zap,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  Award,
  Smartphone,
  Monitor
} from 'lucide-react';

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Badge } from '@components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@components/ui/select';
import { Progress } from '@components/ui/progress';
import { useToast } from '@components/ui/use-toast';


import { logger } from '@utils/logger';
import { cn } from '@utils';

// Lazy load heavy components
const WebsiteEditor = React.lazy(() => import('./WebsiteEditor'));
const TemplatePreview = React.lazy(() => import('./TemplatePreview'));

/**
 * Main Website Builder Dashboard Component
 */
export default function WebsiteBuilderDashboard({ businessId, onClose }) {
  const [currentTab, setCurrentTab] = useState('templates');
  const [templates, setTemplates] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  
  const { toast } = useToast();

  // Initialize Website Builder with mock data
  useEffect(() => {
    const initializeBuilder = async () => {
      try {
        const startTime = performance.now();
        
        // Mock templates data
        const templatesData = [
          {
            id: 'modern-business',
            name: 'Modern Business',
            category: 'business',
            previewUrl: '/templates/modern-business/preview',
            thumbnailUrl: '/templates/modern-business/thumb.jpg',
            description: 'Clean, professional design perfect for modern businesses',
            isPremium: false,
            features: ['Responsive Design', 'Contact Forms', 'SEO Optimized', 'Social Integration'],
            sections: [
              { id: 'hero', type: 'hero', name: 'Hero Section', required: true },
              { id: 'about', type: 'about', name: 'About Section', required: false },
              { id: 'services', type: 'services', name: 'Services Section', required: false },
              { id: 'contact', type: 'contact', name: 'Contact Section', required: true }
            ]
          },
          {
            id: 'ecommerce-store',
            name: 'E-commerce Store',
            category: 'ecommerce',
            previewUrl: '/templates/ecommerce-store/preview',
            thumbnailUrl: '/templates/ecommerce-store/thumb.jpg',
            description: 'Full-featured online store with shopping cart and payments',
            isPremium: true,
            price: 29,
            features: ['Shopping Cart', 'Payment Integration', 'Inventory Management', 'Order Tracking'],
            sections: [
              { id: 'hero', type: 'hero', name: 'Store Hero', required: true },
              { id: 'ecommerce', type: 'ecommerce', name: 'Product Grid', required: true }
            ]
          },
          {
            id: 'portfolio-creative',
            name: 'Creative Portfolio',
            category: 'portfolio',
            previewUrl: '/templates/portfolio-creative/preview',
            thumbnailUrl: '/templates/portfolio-creative/thumb.jpg',
            description: 'Showcase your creative work with stunning galleries',
            isPremium: false,
            features: ['Image Galleries', 'Project Showcases', 'Contact Forms', 'Social Links'],
            sections: [
              { id: 'hero', type: 'hero', name: 'Portfolio Hero', required: true },
              { id: 'gallery', type: 'gallery', name: 'Project Gallery', required: true }
            ]
          }
        ];

        setTemplates(templatesData);

        const duration = performance.now() - startTime;
        logger.performance(`Website Builder dashboard initialized in ${duration.toFixed(2)}ms`);

      } catch (error) {
        logger.error('Failed to initialize Website Builder:', error);
        toast({
          title: "Initialization Error",
          description: "Failed to load Website Builder. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeBuilder();
  }, [toast]);

  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Template categories for filtering
  const categories = [
    { value: 'all', label: 'All Templates' },
    { value: 'business', label: 'Business' },
    { value: 'portfolio', label: 'Portfolio' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'blog', label: 'Blog' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'services', label: 'Services' }
  ];

  // Handle template selection and website creation
  const handleCreateWebsite = async (templateId) => {
    try {
      setIsLoading(true);
      
      // Mock website creation
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      const template = templates.find(t => t.id === templateId);
      const siteId = `site_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const result = {
        siteId,
        url: `/preview/${siteId}`,
        editUrl: `/dashboard/website-builder/edit/${siteId}`
      };

      toast({
        title: "Website Created",
        description: "Your website has been created successfully!",
        action: (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(result.editUrl, '_blank')}
          >
            Edit Now
          </Button>
        ),
      });

      // Add to websites list
      setWebsites(prev => [...prev, {
        id: result.siteId,
        templateId,
        name: `My ${templates.find(t => t.id === templateId)?.name} Site`,
        status: 'draft',
        url: result.url,
        editUrl: result.editUrl,
        createdAt: new Date().toISOString()
      }]);

    } catch (error) {
      logger.error('Website creation failed:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create website. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render template card
  const renderTemplateCard = (template) => (
    <motion.div
      key={template.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        viewMode === 'grid' ? 'col-span-1' : 'col-span-full'
      )}
    >
      <Card className={cn(
        "group hover:shadow-lg transition-all duration-300 hover:-translate-y-1",
        viewMode === 'list' && "flex flex-row"
      )}>
        <div className={cn(
          "relative overflow-hidden",
          viewMode === 'grid' ? "aspect-video" : "w-64 flex-shrink-0"
        )}>
          <img
            src={template.thumbnailUrl || '/placeholder-template.jpg'}
            alt={template.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {template.isPremium && (
            <Badge className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black">
              <Award className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPreviewTemplate(template)}
              className="mr-2"
            >
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
            <Button
              size="sm"
              onClick={() => handleCreateWebsite(template.id)}
              disabled={isLoading}
            >
              <Plus className="w-4 h-4 mr-1" />
              Use Template
            </Button>
          </div>
        </div>

        <div className={cn(
          "p-6",
          viewMode === 'list' && "flex-1"
        )}>
          <CardHeader className="p-0 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{template.name}</CardTitle>
              {template.price && (
                <Badge variant="outline">${template.price}</Badge>
              )}
            </div>
            <CardDescription>{template.description}</CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <div className="flex flex-wrap gap-1 mb-4">
              {template.features.slice(0, 3).map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {template.features.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{template.features.length - 3} more
                </Badge>
              )}
            </div>
          </CardContent>

          <CardFooter className="p-0 pt-4 flex justify-between items-center">
            <div className="flex items-center text-sm text-muted-foreground">
              <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
              4.8 (124 reviews)
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCreateWebsite(template.id)}
              disabled={isLoading}
            >
              Create Site
            </Button>
          </CardFooter>
        </div>
      </Card>
    </motion.div>
  );

  // Render website card for existing websites
  const renderWebsiteCard = (website) => (
    <motion.div
      key={website.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{website.name}</CardTitle>
            <Badge 
              variant={website.status === 'published' ? 'default' : 'secondary'}
            >
              {website.status}
            </Badge>
          </div>
          <CardDescription>
            Created {new Date(website.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Monitor className="w-4 h-4 mr-1" />
              Desktop Ready
            </div>
            <div className="flex items-center">
              <Smartphone className="w-4 h-4 mr-1" />
              Mobile Ready
            </div>
            <div className="flex items-center">
              <Zap className="w-4 h-4 mr-1" />
              Fast Loading
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(website.url, '_blank')}
            >
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
            <Button
              size="sm"
              onClick={() => window.open(website.editUrl, '_blank')}
            >
              <Layout className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );

  if (isLoading && templates.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Website Builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Website Builder</h1>
            </div>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              Squarespace-like
            </Badge>
          </div>

          <div className="flex items-center space-x-4 ml-auto">
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="h-full flex flex-col">
          <div className="border-b bg-muted/10">
            <div className="container px-4">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="websites">My Websites</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <TabsContent value="templates" className="h-full m-0 p-6">
              <div className="space-y-6">
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search templates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Templates Grid */}
                <AnimatePresence>
                  <div className={cn(
                    "grid gap-6",
                    viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                  )}>
                    {filteredTemplates.map(renderTemplateCard)}
                  </div>
                </AnimatePresence>

                {filteredTemplates.length === 0 && (
                  <div className="text-center py-12">
                    <Layout className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium">No templates found</p>
                    <p className="text-muted-foreground">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="websites" className="h-full m-0 p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">My Websites</h2>
                    <p className="text-muted-foreground">
                      Manage and edit your created websites
                    </p>
                  </div>
                  <Button onClick={() => setCurrentTab('templates')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New
                  </Button>
                </div>

                {websites.length === 0 ? (
                  <div className="text-center py-12">
                    <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium">No websites yet</p>
                    <p className="text-muted-foreground mb-6">
                      Create your first website to get started
                    </p>
                    <Button onClick={() => setCurrentTab('templates')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Browse Templates
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {websites.map(renderWebsiteCard)}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="h-full m-0 p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold">Analytics</h2>
                  <p className="text-muted-foreground">
                    Track your website performance and visitor insights
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Websites
                      </CardTitle>
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{websites.length}</div>
                      <p className="text-xs text-muted-foreground">
                        Active websites
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Views
                      </CardTitle>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">12,834</div>
                      <p className="text-xs text-muted-foreground">
                        +20.1% from last month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Conversions
                      </CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">573</div>
                      <p className="text-xs text-muted-foreground">
                        +15% from last month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Performance
                      </CardTitle>
                      <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">95%</div>
                      <p className="text-xs text-muted-foreground">
                        Average speed score
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Website Performance</CardTitle>
                    <CardDescription>
                      Your websites are performing excellently
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Loading Speed</span>
                        <span>95%</span>
                      </div>
                      <Progress value={95} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>SEO Score</span>
                        <span>88%</span>
                      </div>
                      <Progress value={88} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Mobile Optimization</span>
                        <span>92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Security Score</span>
                        <span>100%</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{previewTemplate.name}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewTemplate(null)}
              >
                ✕
              </Button>
            </div>
            <TemplatePreview template={previewTemplate} />
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setPreviewTemplate(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleCreateWebsite(previewTemplate.id);
                  setPreviewTemplate(null);
                }}
              >
                Use This Template
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
