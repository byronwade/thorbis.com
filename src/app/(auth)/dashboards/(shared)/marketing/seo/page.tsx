"use client";

import { useState } from "react";
;
import { 
  Search,
  TrendingUp,
  Globe,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  Plus,
  Download,
  RefreshCw,
  Target,
  Eye,
  Edit3,
  Copy,
  BarChart3,
  Zap,
  Link,
  Image,
  Code,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';


interface SEOPage {
  id: string;
  url: string;
  title: string;
  metaDescription?: string;
  h1?: string;
  wordCount: number;
  score: number;
  issues: SEOIssue[];
  keywords: string[];
  lastCrawled: string;
  status: "healthy" | "needs-attention" | "critical";
}

interface SEOIssue {
  type: "error" | "warning" | "info";
  category: "title" | "meta" | "headings" | "content" | "images" | "links" | "technical";
  message: string;
  impact: "high" | "medium" | "low";
}

interface Keyword {
  keyword: string;
  position: number;
  previousPosition?: number;
  volume: number;
  difficulty: number;
  url: string;
  trend: "up" | "down" | "stable";
}

const mockPages: SEOPage[] = [
  {
    id: "1",
    url: "/",
    title: "Thorbis - Business Management Platform",
    metaDescription: "Streamline your business operations with Thorbis comprehensive management platform",
    h1: "Welcome to Thorbis",
    wordCount: 1250,
    score: 85,
    issues: [
      {
        type: "warning",
        category: "meta",
        message: "Meta description could be more descriptive",
        impact: "medium"
      }
    ],
    keywords: ["business management", "platform", "operations"],
    lastCrawled: "2 hours ago",
    status: "healthy"
  },
  {
    id: "2", 
    url: "/pricing",
    title: "Pricing Plans - Thorbis",
    metaDescription: "",
    h1: "Choose Your Plan",
    wordCount: 850,
    score: 65,
    issues: [
      {
        type: "error",
        category: "meta",
        message: "Missing meta description",
        impact: "high"
      },
      {
        type: "warning",
        category: "content",
        message: "Content length below recommended minimum",
        impact: "medium"
      }
    ],
    keywords: ["pricing", "plans", "cost"],
    lastCrawled: "3 hours ago", 
    status: "needs-attention"
  },
  {
    id: "3",
    url: "/features",
    title: "",
    metaDescription: "Explore powerful features designed for modern businesses",
    h1: "Powerful Features for Your Business",
    wordCount: 2100,
    score: 45,
    issues: [
      {
        type: "error",
        category: "title",
        message: "Missing page title",
        impact: "high"
      },
      {
        type: "error",
        category: "images",
        message: "5 images missing alt text",
        impact: "high"
      }
    ],
    keywords: ["features", "business tools", "functionality"],
    lastCrawled: "1 hour ago",
    status: "critical"
  }
];

const mockKeywords: Keyword[] = [
  {
    keyword: "business management software",
    position: 3,
    previousPosition: 5,
    volume: 8900,
    difficulty: 65,
    url: "/",
    trend: "up"
  },
  {
    keyword: "project management tool",
    position: 12,
    previousPosition: 15,
    volume: 12400,
    difficulty: 78,
    url: "/features",
    trend: "up"
  },
  {
    keyword: "small business platform",
    position: 8,
    previousPosition: 8,
    volume: 5600,
    difficulty: 52,
    url: "/pricing",
    trend: "stable"
  },
  {
    keyword: "workflow automation",
    position: 25,
    previousPosition: 18,
    volume: 15200,
    difficulty: 82,
    url: "/features",
    trend: "down"
  }
];

export default function SEOPage() {
  const [pages, setPages] = useState<SEOPage[]>(mockPages);
  const [keywords, setKeywords] = useState<Keyword[]>(mockKeywords);
  const [activeTab, setActiveTab] = useState<"overview" | "pages" | "keywords" | "tools">("overview");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "needs-attention": return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "critical": return <XCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case "error": return <XCircle className="h-3 w-3 text-red-600" />;
      case "warning": return <AlertTriangle className="h-3 w-3 text-yellow-600" />;
      case "info": return <CheckCircle className="h-3 w-3 text-blue-600" />;
      default: return null;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-3 w-3 text-green-600" />;
      case "down": return <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />;
      case "stable": return <div className="h-3 w-3 bg-gray-400 rounded-full" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SEO Optimization</h1>
          <p className="text-muted-foreground">
            Monitor and optimize your website's search engine performance.'
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Crawl Site
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Page
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "overview" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "pages" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("pages")}
        >
          Page Analysis
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "keywords" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }'}
          onClick={() => setActiveTab("keywords")}
        >
          Keyword Tracking
        </button>
        <button
          className={'px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "tools" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }'}
          onClick={() => setActiveTab("tools")}
        >
          SEO Tools
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          {/* SEO Score Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall SEO Score</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">72/100</div>
                <p className="text-xs text-yellow-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Room for improvement
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pages Analyzed</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pages.length}</div>
                <p className="text-xs text-muted-foreground">
                  Last crawl: 1 hour ago
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Keywords Tracked</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{keywords.length}</div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  2 positions improved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {pages.reduce((sum, page) => sum + page.issues.filter(i => i.type === "error").length, 0)}
                </div>
                <p className="text-xs text-red-600">
                  Require immediate attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Issues */}
          <Card>
            <CardHeader>
              <CardTitle>Top SEO Issues</CardTitle>
              <CardDescription>Issues that need immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pages.flatMap(page => 
                  page.issues
                    .filter(issue => issue.type === "error" || issue.impact === "high")
                    .map(issue => ({...issue, url: page.url, pageTitle: page.title}))
                )
                .slice(0, 5)
                .map((issue, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getIssueIcon(issue.type)}
                    <div className="flex-1">
                      <div className="font-medium">{issue.message}</div>
                      <div className="text-sm text-muted-foreground">
                        Page: {issue.url} • Impact: {issue.impact} • Category: {issue.category}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Fix
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Page Analysis Tab */}
      {activeTab === "pages" && (
        <Card>
          <CardHeader>
            <CardTitle>Page Analysis</CardTitle>
            <CardDescription>SEO health check for all your pages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pages.map((page) => (
                <div key={page.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(page.status)}
                      <div>
                        <h3 className="font-medium">{page.title || "Untitled Page"}</h3>
                        <div className="text-sm text-muted-foreground">{page.url}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{page.score}/100</div>
                        <div className="text-muted-foreground">SEO Score</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{page.wordCount}</div>
                        <div className="text-muted-foreground">Words</div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Analyze
                      </Button>
                    </div>
                  </div>

                  {/* Page Details */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-2">Meta Information</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Title: </span>
                          {page.title ? (
                            <span className="font-mono">{page.title}</span>
                          ) : (
                            <span className="text-red-600">Missing</span>
                          )}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Description: </span>
                          {page.metaDescription ? (
                            <span className="font-mono">{page.metaDescription}</span>
                          ) : (
                            <span className="text-red-600">Missing</span>
                          )}
                        </div>
                        <div>
                          <span className="text-muted-foreground">H1: </span>
                          {page.h1 ? (
                            <span className="font-mono">{page.h1}</span>
                          ) : (
                            <span className="text-red-600">Missing</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Issues ({page.issues.length})</h4>
                      <div className="space-y-1">
                        {page.issues.slice(0, 3).map((issue, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            {getIssueIcon(issue.type)}
                            <span>{issue.message}</span>
                          </div>
                        ))}
                        {page.issues.length > 3 && (
                          <div className="text-sm text-muted-foreground">
                            +{page.issues.length - 3} more issues
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Target Keywords</h4>
                    <div className="flex gap-2 flex-wrap">
                      {page.keywords.map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-muted rounded text-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keywords Tab */}
      {activeTab === "keywords" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Keyword Tracking</CardTitle>
                <CardDescription>Monitor your search engine rankings</CardDescription>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Keywords
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {keywords.map((keyword, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-medium">{keyword.keyword}</div>
                      <div className="text-sm text-muted-foreground">{keyword.url}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 text-sm">
                    <div className="text-center">
                      <div className="font-medium">#{keyword.position}</div>
                      <div className="text-muted-foreground">Position</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{keyword.volume.toLocaleString()}</div>
                      <div className="text-muted-foreground">Volume</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{keyword.difficulty}%</div>
                      <div className="text-muted-foreground">Difficulty</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 font-medium">
                        {getTrendIcon(keyword.trend)}
                        {keyword.previousPosition && keyword.position !== keyword.previousPosition && (
                          <span className={
                            keyword.position < keyword.previousPosition 
                              ? "text-green-600" 
                              : "text-red-600"
                          }>
                            {keyword.position < keyword.previousPosition ? "+" : ""}
                            {keyword.previousPosition - keyword.position}
                          </span>
                        )}
                      </div>
                      <div className="text-muted-foreground">Change</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SEO Tools Tab */}
      {activeTab === "tools" && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Sitemap Generator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Sitemap Generator
              </CardTitle>
              <CardDescription>Generate and submit XML sitemaps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm">
                  <div className="font-medium">Last generated:</div>
                  <div className="text-muted-foreground">2 hours ago</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">URLs included:</div>
                  <div className="text-muted-foreground">247 pages</div>
                </div>
                <div className="flex gap-2">
                  <Button>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Sitemap
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schema Markup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Schema Markup
              </CardTitle>
              <CardDescription>Structured data for better search results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Organization</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">WebSite</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">BreadcrumbList</span>
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Product</span>
                    <XCircle className="h-4 w-4 text-red-600" />
                  </div>
                </div>
                <Button>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Configure Schema
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Robots.txt */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Robots.txt Manager
              </CardTitle>
              <CardDescription>Control search engine crawling</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm">
                  <div className="font-medium">Status:</div>
                  <div className="text-green-600">Valid and accessible</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Sitemap reference:</div>
                  <div className="text-muted-foreground">Included</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Rules
                  </Button>
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Validate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Monitor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Page Speed Monitor
              </CardTitle>
              <CardDescription>Core Web Vitals and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-green-600">0.8s</div>
                    <div className="text-muted-foreground">LCP</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-yellow-600">0.15</div>
                    <div className="text-muted-foreground">CLS</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-green-600">45ms</div>
                    <div className="text-muted-foreground">FID</div>
                  </div>
                </div>
                <Button>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Detailed Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}