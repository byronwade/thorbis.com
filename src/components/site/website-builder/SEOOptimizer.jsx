'use client';

/**
 * SEO Optimizer Component - Advanced SEO tools for website builder
 * Styled with Thorbis design system
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  XCircle,
  Lightbulb,
  Image as ImageIcon,
  Link as LinkIcon,
  Smartphone,
  Zap
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
import { Label } from '@components/ui/label';
import { Textarea } from '@components/ui/textarea';
import { Badge } from '@components/ui/badge';
import { Progress } from '@components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@components/ui/select';
import { Switch } from '@components/ui/switch';
import { useToast } from '@components/ui/use-toast';

import { cn } from '@utils';
import { logger } from '@utils/logger';

/**
 * SEO Optimizer Component
 */
export default function SEOOptimizer({ websiteId, websiteData, onSave }) {
  const [seoData, setSeoData] = useState({
    title: '',
    description: '',
    keywords: [],
    ogImage: '',
    robots: 'index, follow',
    canonical: '',
    structuredData: []
  });
  
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywordSuggestions, setKeywordSuggestions] = useState([]);
  const [competitorData, setCompetitorData] = useState([]);
  const [currentKeyword, setCurrentKeyword] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    loadSEOData();
  }, [websiteId]);

  const loadSEOData = async () => {
    try {
      // Mock loading SEO data
      setSeoData({
        title: websiteData?.config?.siteName || '',
        description: `${websiteData?.config?.siteName} - Professional business website`,
        keywords: ['business', 'professional', 'services'],
        ogImage: '',
        robots: 'index, follow',
        canonical: `https://${websiteData?.config?.domain}`,
        structuredData: [
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            'name': websiteData?.config?.siteName,
            'url': `https://${websiteData?.config?.domain}`
          }
        ]
      });

      // Auto-analyze on load
      analyzeSEO();
      
    } catch (error) {
      logger.error('Failed to load SEO data:', error);
    }
  };

  const analyzeSEO = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate SEO analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAnalysis = {
        score: 78,
        issues: [
          {
            type: 'warning',
            category: 'Title',
            message: 'Title tag could be more descriptive',
            impact: 'medium',
            fix: 'Add relevant keywords to your title tag'
          },
          {
            type: 'error',
            category: 'Images',
            message: '3 images missing alt text',
            impact: 'high',
            fix: 'Add descriptive alt text to all images'
          },
          {
            type: 'success',
            category: 'Meta Description',
            message: 'Meta description is well optimized',
            impact: 'low',
            fix: null
          },
          {
            type: 'warning',
            category: 'Keywords',
            message: 'Keyword density could be improved',
            impact: 'medium',
            fix: 'Include target keywords more naturally in content'
          }
        ],
        metrics: {
          titleLength: seoData.title.length,
          descriptionLength: seoData.description.length,
          keywordCount: seoData.keywords.length,
          imageCount: 15,
          imagesWithAlt: 12,
          internalLinks: 8,
          externalLinks: 3,
          loadSpeed: 2.3,
          mobileScore: 95
        },
        suggestions: [
          'Add more relevant keywords to your content',
          'Improve page loading speed',
          'Add internal links to related pages',
          'Optimize images for better performance'
        ]
      };
      
      setAnalysis(mockAnalysis);
      
      // Mock keyword suggestions
      setKeywordSuggestions([
        { keyword: 'professional services', volume: 12000, difficulty: 45, trend: 'up' },
        { keyword: 'business consulting', volume: 8500, difficulty: 52, trend: 'stable' },
        { keyword: 'digital solutions', volume: 6200, difficulty: 38, trend: 'up' },
        { keyword: 'expert advice', volume: 4100, difficulty: 28, trend: 'down' }
      ]);
      
    } catch (error) {
      logger.error('SEO analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze SEO. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addKeyword = () => {
    if (currentKeyword && !seoData.keywords.includes(currentKeyword)) {
      setSeoData(prev => ({
        ...prev,
        keywords: [...prev.keywords, currentKeyword]
      }));
      setCurrentKeyword('');
    }
  };

  const removeKeyword = (keyword) => {
    setSeoData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const handleSave = async () => {
    try {
      // Generate structured data
      const structuredData = [
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          'name': seoData.title,
          'description': seoData.description,
          'url': seoData.canonical,
          'keywords': seoData.keywords.join(', ')
        }
      ];

      const updatedSEOData = {
        ...seoData,
        structuredData
      };

      if (onSave) {
        await onSave(updatedSEOData);
      }

      toast({
        title: "SEO Settings Saved",
        description: "Your SEO configuration has been updated successfully.",
      });

    } catch (error) {
      logger.error('Failed to save SEO data:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save SEO settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  const renderIssueIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const renderTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* SEO Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            SEO Overview
          </CardTitle>
          <CardDescription>
            Current SEO performance and optimization status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center mb-6">
            <div className="text-center">
              <div className={cn("text-6xl font-bold mb-2", analysis ? getScoreColor(analysis.score) : "text-muted-foreground")}>
                {isAnalyzing ? '...' : analysis ? analysis.score : '0'}
              </div>
              <div className="text-lg font-medium text-muted-foreground">
                {analysis ? getScoreLabel(analysis.score) : 'Not Analyzed'}
              </div>
              <Progress 
                value={analysis?.score || 0} 
                className="w-32 mt-2" 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{analysis?.metrics.titleLength || 0}</div>
              <div className="text-sm text-muted-foreground">Title Length</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{analysis?.metrics.descriptionLength || 0}</div>
              <div className="text-sm text-muted-foreground">Description Length</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{analysis?.metrics.keywordCount || 0}</div>
              <div className="text-sm text-muted-foreground">Keywords</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{analysis?.metrics.mobileScore || 0}%</div>
              <div className="text-sm text-muted-foreground">Mobile Score</div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={analyzeSEO} 
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze SEO'}
          </Button>
        </CardFooter>
      </Card>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic SEO</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic SEO Settings</CardTitle>
              <CardDescription>
                Essential SEO configuration for your website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Page Title</Label>
                <Input
                  id="title"
                  value={seoData.title}
                  onChange={(e) => setSeoData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter your page title..."
                  className="mt-1"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Optimal: 50-60 characters</span>
                  <span>{seoData.title.length}/60</span>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Meta Description</Label>
                <Textarea
                  id="description"
                  value={seoData.description}
                  onChange={(e) => setSeoData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter your meta description..."
                  className="mt-1"
                  rows={3}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Optimal: 150-160 characters</span>
                  <span>{seoData.description.length}/160</span>
                </div>
              </div>

              <div>
                <Label htmlFor="canonical">Canonical URL</Label>
                <Input
                  id="canonical"
                  value={seoData.canonical}
                  onChange={(e) => setSeoData(prev => ({ ...prev, canonical: e.target.value }))}
                  placeholder="https://example.com/page"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="robots">Robots Meta Tag</Label>
                <Select 
                  value={seoData.robots} 
                  onValueChange={(value) => setSeoData(prev => ({ ...prev, robots: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="index, follow">Index, Follow</SelectItem>
                    <SelectItem value="index, nofollow">Index, No Follow</SelectItem>
                    <SelectItem value="noindex, follow">No Index, Follow</SelectItem>
                    <SelectItem value="noindex, nofollow">No Index, No Follow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} className="w-full">
                Save SEO Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {/* SEO Issues */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Issues & Recommendations</CardTitle>
              <CardDescription>
                Issues found during analysis and how to fix them
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysis?.issues ? (
                <div className="space-y-4">
                  {analysis.issues.map((issue, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3 p-4 border rounded-lg"
                    >
                      {renderIssueIcon(issue.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{issue.category}</h4>
                          <Badge 
                            variant={issue.impact === 'high' ? 'destructive' : issue.impact === 'medium' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {issue.impact} impact
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {issue.message}
                        </p>
                        {issue.fix && (
                          <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                            <Lightbulb className="w-4 h-4 inline mr-1" />
                            {issue.fix}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Run an analysis to see SEO recommendations</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          {analysis && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Current website performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{analysis.metrics.imagesWithAlt}/{analysis.metrics.imageCount}</div>
                    <div className="text-sm text-muted-foreground">Images with Alt Text</div>
                  </div>
                  <div className="text-center">
                    <LinkIcon className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{analysis.metrics.internalLinks}</div>
                    <div className="text-sm text-muted-foreground">Internal Links</div>
                  </div>
                  <div className="text-center">
                    <Zap className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{analysis.metrics.loadSpeed}s</div>
                    <div className="text-sm text-muted-foreground">Load Speed</div>
                  </div>
                  <div className="text-center">
                    <Smartphone className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{analysis.metrics.mobileScore}%</div>
                    <div className="text-sm text-muted-foreground">Mobile Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="keywords" className="space-y-4">
          {/* Keywords Management */}
          <Card>
            <CardHeader>
              <CardTitle>Target Keywords</CardTitle>
              <CardDescription>
                Manage your target keywords for better search rankings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={currentKeyword}
                  onChange={(e) => setCurrentKeyword(e.target.value)}
                  placeholder="Add a keyword..."
                  onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                />
                <Button onClick={addKeyword}>Add</Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {seoData.keywords.map((keyword, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeKeyword(keyword)}
                  >
                    {keyword} ×
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Keyword Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle>Keyword Suggestions</CardTitle>
              <CardDescription>
                Recommended keywords based on your content and industry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {keywordSuggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{suggestion.keyword}</span>
                        {renderTrendIcon(suggestion.trend)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <span>Volume: {suggestion.volume.toLocaleString()}</span>
                        <span>Difficulty: {suggestion.difficulty}%</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (!seoData.keywords.includes(suggestion.keyword)) {
                          setSeoData(prev => ({
                            ...prev,
                            keywords: [...prev.keywords, suggestion.keyword]
                          }));
                        }
                      }}
                      disabled={seoData.keywords.includes(suggestion.keyword)}
                    >
                      {seoData.keywords.includes(suggestion.keyword) ? 'Added' : 'Add'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          {/* Open Graph Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Social Media (Open Graph)</CardTitle>
              <CardDescription>
                Control how your website appears when shared on social media
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="og-title">OG Title</Label>
                <Input
                  id="og-title"
                  value={seoData.ogTitle || seoData.title}
                  onChange={(e) => setSeoData(prev => ({ ...prev, ogTitle: e.target.value }))}
                  placeholder="Title for social media sharing"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="og-description">OG Description</Label>
                <Textarea
                  id="og-description"
                  value={seoData.ogDescription || seoData.description}
                  onChange={(e) => setSeoData(prev => ({ ...prev, ogDescription: e.target.value }))}
                  placeholder="Description for social media sharing"
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="og-image">OG Image URL</Label>
                <Input
                  id="og-image"
                  value={seoData.ogImage}
                  onChange={(e) => setSeoData(prev => ({ ...prev, ogImage: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended size: 1200x630px
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Structured Data */}
          <Card>
            <CardHeader>
              <CardTitle>Structured Data (JSON-LD)</CardTitle>
              <CardDescription>
                Help search engines understand your content better
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 p-4 rounded-lg">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(seoData.structuredData, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Additional Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Settings</CardTitle>
              <CardDescription>
                Advanced SEO configuration options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="sitemap">Generate XML Sitemap</Label>
                <Switch id="sitemap" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="robots-txt">Generate robots.txt</Label>
                <Switch id="robots-txt" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="google-analytics">Google Analytics Integration</Label>
                <Switch id="google-analytics" />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="google-search-console">Google Search Console</Label>
                <Switch id="google-search-console" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
