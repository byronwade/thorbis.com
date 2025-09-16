"use client";

import { useState } from "react";
;
import { 
  Search,
  Globe,
  FileText,
  Code,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  XCircle,
  ExternalLink,
  Download,
  Refresh,
  Settings,
  Target,
  BarChart3
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';


interface SEOScore {
  score: number;
  issues: string[];
  recommendations: string[];
}

interface SiteAnalysis {
  url: string;
  title: string;
  description: string;
  performance: SEOScore;
  accessibility: SEOScore;
  bestPractices: SEOScore;
  seo: SEOScore;
}

export default function SEOToolsPage() {
  const [analysisUrl, setAnalysisUrl] = useState("https://thorbis.com");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Mock analysis data
  const [analysis, setAnalysis] = useState<SiteAnalysis>({
    url: "https://thorbis.com",
    title: "Thorbis - Business Management Platform",
    description: "Complete business management platform for home services, restaurants, auto services, and retail.",
    performance: {
      score: 92,
      issues: ["Large images not optimized", "Unused JavaScript"],
      recommendations: ["Optimize images for web", "Remove unused code"]
    },
    accessibility: {
      score: 88,
      issues: ["Missing alt text on 3 images"],
      recommendations: ["Add descriptive alt text to all images"]
    },
    bestPractices: {
      score: 95,
      issues: [],
      recommendations: ["Consider implementing CSP headers"]
    },
    seo: {
      score: 85,
      issues: ["Missing meta description on 2 pages", "H1 tag missing on blog page"],
      recommendations: ["Add meta descriptions", "Add proper heading structure"]
    }
  });

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsAnalyzing(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 75) return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SEO Tools</h1>
        <p className="text-muted-foreground">
          Optimize your sites for search engines with comprehensive SEO analysis and tools.
        </p>
      </div>

      {/* URL Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Site Analysis
          </CardTitle>
          <CardDescription>
            Run a comprehensive SEO audit on any URL
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="url"
                placeholder="Enter URL to analyze..."
                className="w-full px-4 py-2 border rounded-md bg-background"
                value={analysisUrl}
                onChange={(e) => setAnalysisUrl(e.target.value)}
              />
            </div>
            <Button onClick={runAnalysis} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <Refresh className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              {isAnalyzing ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>
                Results for {analysis.url}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Page Title</h4>
                  <p className="text-sm text-muted-foreground">{analysis.title}</p>
                </div>
                <div>
                  <h4 className="font-medium">Meta Description</h4>
                  <p className="text-sm text-muted-foreground">{analysis.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scores */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  Performance
                  {getScoreIcon(analysis.performance.score)}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className={`text-3xl font-bold ${getScoreColor(analysis.performance.score)}`}>
                  {analysis.performance.score}
                </div>
                <div className="mt-4 space-y-2">
                  {analysis.performance.issues.slice(0, 2).map((issue, index) => (
                    <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                      <XCircle className="h-3 w-3 text-red-500" />
                      {issue}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  Accessibility
                  {getScoreIcon(analysis.accessibility.score)}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className={`text-3xl font-bold ${getScoreColor(analysis.accessibility.score)}`}>
                  {analysis.accessibility.score}
                </div>
                <div className="mt-4 space-y-2">
                  {analysis.accessibility.issues.slice(0, 2).map((issue, index) => (
                    <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                      <XCircle className="h-3 w-3 text-red-500" />
                      {issue}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  Best Practices
                  {getScoreIcon(analysis.bestPractices.score)}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className={`text-3xl font-bold ${getScoreColor(analysis.bestPractices.score)}'}>
                  {analysis.bestPractices.score}
                </div>
                <div className="mt-4">
                  {analysis.bestPractices.issues.length === 0 ? (
                    <div className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      All checks passed
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {analysis.bestPractices.issues.slice(0, 2).map((issue, index) => (
                        <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                          <XCircle className="h-3 w-3 text-red-500" />
                          {issue}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  SEO
                  {getScoreIcon(analysis.seo.score)}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className={'text-3xl font-bold ${getScoreColor(analysis.seo.score)}'}>
                  {analysis.seo.score}
                </div>
                <div className="mt-4 space-y-2">
                  {analysis.seo.issues.slice(0, 2).map((issue, index) => (
                    <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                      <XCircle className="h-3 w-3 text-red-500" />
                      {issue}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>
                Priority improvements to boost your SEO performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-medium text-red-700">High Priority</h4>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>• Fix missing H1 tags on blog pages</li>
                    <li>• Add meta descriptions to all pages</li>
                    <li>• Optimize image file sizes (potential 40% improvement)</li>
                  </ul>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-medium text-yellow-700">Medium Priority</h4>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>• Add alt text to remaining images</li>
                    <li>• Implement structured data markup</li>
                    <li>• Improve internal linking structure</li>
                  </ul>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-medium text-green-700">Low Priority</h4>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>• Consider implementing AMP pages</li>
                    <li>• Add social media meta tags</li>
                    <li>• Optimize for local search</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SEO Tools */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Sitemap Generator
            </CardTitle>
            <CardDescription>
              Generate and submit XML sitemaps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              Generate Sitemap
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-green-500" />
              Robots.txt Editor
            </CardTitle>
            <CardDescription>
              Create and manage robots.txt files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Edit Robots.txt
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              Keyword Research
            </CardTitle>
            <CardDescription>
              Find and track target keywords
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Research Keywords
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-orange-500" />
              Schema Markup
            </CardTitle>
            <CardDescription>
              Add structured data to your pages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Add Schema
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-red-500" />
              Rank Tracking
            </CardTitle>
            <CardDescription>
              Monitor your search rankings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Track Rankings
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-teal-500" />
              Performance Monitor
            </CardTitle>
            <CardDescription>
              Track Core Web Vitals and speed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Monitor Performance
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}