'use client';

/**
 * Template Preview Component - Shows template previews with device switching
 * Styled with Thorbis design system
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Monitor,
  Smartphone,
  Tablet,
  Star,
  Award,
  Zap,
  Shield,
  Globe,
  Palette,
  Code,
  ShoppingCart,
  BarChart3
} from 'lucide-react';

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Progress } from '@components/ui/progress';


/**
 * Template Preview Component
 */
export default function TemplatePreview({ template, onUseTemplate }) {
  const [deviceMode, setDeviceMode] = useState('desktop');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [template]);

  if (!template) return null;

  const getDeviceFrameClass = () => {
    switch (deviceMode) {
      case 'mobile':
        return 'max-w-sm mx-auto border-8 border-gray-800 rounded-3xl';
      case 'tablet':
        return 'max-w-2xl mx-auto border-4 border-gray-600 rounded-2xl';
      default:
        return 'w-full border border-border rounded-lg';
    }
  };

  const renderFeatureIcons = (feature) => {
    const iconMap = {
      'Responsive Design': Monitor,
      'SEO Optimized': BarChart3,
      'E-commerce Ready': ShoppingCart,
      'Fast Loading': Zap,
      'Secure': Shield,
      'Custom Code': Code,
      'Color Schemes': Palette,
      'Mobile Friendly': Smartphone,
      'Social Integration': Globe
    };

    const Icon = iconMap[feature] || Star;
    return <Icon className="w-4 h-4" />;
  };

  const mockPreviewData = {
    'modern-business': {
      heroTitle: 'Transform Your Business',
      heroSubtitle: 'Professional solutions for modern enterprises',
      aboutTitle: 'About Our Company',
      aboutText: 'We deliver innovative solutions that drive growth and success.',
      services: [
        { name: 'Consulting', description: 'Expert business consulting' },
        { name: 'Strategy', description: 'Strategic planning services' },
        { name: 'Implementation', description: 'Solution implementation' }
      ],
      colors: {
        primary: 'hsl(var(--primary))',
        secondary: 'hsl(var(--secondary))',
        accent: 'hsl(var(--accent))'
      }
    },
    'ecommerce-store': {
      heroTitle: 'Shop Premium Products',
      heroSubtitle: 'Discover our curated collection of quality items',
      featuredProducts: [
        { name: 'Premium Product 1', price: '$99' },
        { name: 'Premium Product 2', price: '$149' },
        { name: 'Premium Product 3', price: '$199' }
      ],
      colors: {
        primary: 'hsl(220, 70%, 50%)',
        secondary: 'hsl(280, 70%, 60%)',
        accent: 'hsl(45, 90%, 60%)'
      }
    },
    'portfolio-creative': {
      heroTitle: 'Creative Professional',
      heroSubtitle: 'Bringing ideas to life through innovative design',
      projects: [
        'Brand Identity Design',
        'Digital Art Creation',
        'Web Design Projects'
      ],
      colors: {
        primary: 'hsl(300, 70%, 60%)',
        secondary: 'hsl(200, 70%, 50%)',
        accent: 'hsl(60, 90%, 60%)'
      }
    }
  };

  const previewData = mockPreviewData[template.id] || mockPreviewData['modern-business'];

  return (
    <div className="space-y-6">
      {/* Device Mode Selector */}
      <div className="flex items-center justify-center space-x-2">
        <Button
          variant={deviceMode === 'desktop' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setDeviceMode('desktop')}
        >
          <Monitor className="w-4 h-4 mr-1" />
          Desktop
        </Button>
        <Button
          variant={deviceMode === 'tablet' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setDeviceMode('tablet')}
        >
          <Tablet className="w-4 h-4 mr-1" />
          Tablet
        </Button>
        <Button
          variant={deviceMode === 'mobile' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setDeviceMode('mobile')}
        >
          <Smartphone className="w-4 h-4 mr-1" />
          Mobile
        </Button>
      </div>

      {/* Template Preview */}
      <div className="bg-muted/20 p-6 rounded-lg">
        <div className={getDeviceFrameClass()}>
          {isLoading ? (
            <div className="aspect-video bg-muted animate-pulse rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading preview...</p>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-background rounded-lg overflow-hidden shadow-lg"
            >
              {template.category === 'business' && (
                <div className="min-h-96">
                  {/* Hero Section */}
                  <div 
                    className="px-6 py-16 text-center text-white"
                    style={{ backgroundColor: previewData.colors.primary }}
                  >
                    <h1 className="text-3xl font-bold mb-4">{previewData.heroTitle}</h1>
                    <p className="text-lg mb-6 opacity-90">{previewData.heroSubtitle}</p>
                    <button 
                      className="px-6 py-2 rounded-lg font-medium"
                      style={{ backgroundColor: previewData.colors.secondary }}
                    >
                      Get Started
                    </button>
                  </div>
                  
                  {/* About Section */}
                  <div className="px-6 py-12 bg-background">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">{previewData.aboutTitle}</h2>
                    <p className="text-muted-foreground leading-relaxed">{previewData.aboutText}</p>
                  </div>
                  
                  {/* Services Section */}
                  <div className="px-6 py-12 bg-muted/30">
                    <h2 className="text-2xl font-bold mb-6 text-center text-foreground">Our Services</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {previewData.services.map((service, index) => (
                        <div key={index} className="bg-background p-4 rounded-lg text-center">
                          <h3 className="font-semibold mb-2">{service.name}</h3>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {template.category === 'ecommerce' && (
                <div className="min-h-96">
                  {/* Store Hero */}
                  <div 
                    className="px-6 py-16 text-center text-white"
                    style={{ backgroundColor: previewData.colors.primary }}
                  >
                    <h1 className="text-3xl font-bold mb-4">{previewData.heroTitle}</h1>
                    <p className="text-lg mb-6 opacity-90">{previewData.heroSubtitle}</p>
                    <button 
                      className="px-6 py-2 rounded-lg font-medium"
                      style={{ backgroundColor: previewData.colors.secondary }}
                    >
                      Shop Now
                    </button>
                  </div>
                  
                  {/* Products Grid */}
                  <div className="px-6 py-12 bg-background">
                    <h2 className="text-2xl font-bold mb-6 text-center">Featured Products</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {previewData.featuredProducts.map((product, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="aspect-square bg-muted rounded-lg mb-4"></div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-lg font-bold text-primary">{product.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {template.category === 'portfolio' && (
                <div className="min-h-96">
                  {/* Portfolio Hero */}
                  <div 
                    className="px-6 py-16 text-center text-white"
                    style={{ backgroundColor: previewData.colors.primary }}
                  >
                    <h1 className="text-3xl font-bold mb-4">{previewData.heroTitle}</h1>
                    <p className="text-lg mb-6 opacity-90">{previewData.heroSubtitle}</p>
                    <button 
                      className="px-6 py-2 rounded-lg font-medium"
                      style={{ backgroundColor: previewData.colors.secondary }}
                    >
                      View Portfolio
                    </button>
                  </div>
                  
                  {/* Projects Gallery */}
                  <div className="px-6 py-12 bg-background">
                    <h2 className="text-2xl font-bold mb-6 text-center">Recent Work</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {previewData.projects.map((project, index) => (
                        <div key={index} className="group">
                          <div className="aspect-square bg-muted rounded-lg mb-2 group-hover:bg-muted/80 transition-colors"></div>
                          <p className="text-sm font-medium">{project}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Template Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Template Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{template.name}</CardTitle>
              {template.isPremium && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black">
                  <Award className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
            <CardDescription>{template.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Category</p>
                <Badge variant="secondary" className="capitalize">
                  {template.category}
                </Badge>
              </div>
              
              {template.price && (
                <div>
                  <p className="text-sm font-medium mb-2">Price</p>
                  <p className="text-2xl font-bold">${template.price}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>What's included in this template</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {template.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <div className="text-primary">
                    {renderFeatureIcons(feature)}
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Sections */}
      <Card>
        <CardHeader>
          <CardTitle>Template Sections</CardTitle>
          <CardDescription>Customizable sections included</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {template.sections.map((section, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <div className="w-4 h-4 bg-primary rounded-sm"></div>
                </div>
                <p className="text-sm font-medium">{section.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {section.configurable ? 'Customizable' : 'Fixed'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Score</CardTitle>
          <CardDescription>Template optimization metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center">
                <Zap className="w-4 h-4 mr-1" />
                Loading Speed
              </span>
              <span className="font-medium">95%</span>
            </div>
            <Progress value={95} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-1" />
                SEO Score
              </span>
              <span className="font-medium">92%</span>
            </div>
            <Progress value={92} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center">
                <Smartphone className="w-4 h-4 mr-1" />
                Mobile Optimization
              </span>
              <span className="font-medium">98%</span>
            </div>
            <Progress value={98} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                Security
              </span>
              <span className="font-medium">100%</span>
            </div>
            <Progress value={100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Use Template Button */}
      {onUseTemplate && (
        <div className="flex justify-center pt-4">
          <Button
            size="lg"
            onClick={() => onUseTemplate(template.id)}
            className="min-w-48"
          >
            Use This Template
            {template.price && (
              <span className="ml-2">- ${template.price}</span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
