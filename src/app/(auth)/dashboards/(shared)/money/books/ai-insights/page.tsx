'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Bot, 
  Sparkles, 
  Upload, 
  Search, 
  Filter,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Eye,
  FileText,
  Camera,
  Zap,
  Target,
  BarChart3,
  Clock
} from 'lucide-react'
import { AiInsight, processDocument, categorizeTransaction, generateFinancialInsights } from '@/lib/ai-categorization'
import { TradingViewWrapper, TradingViewChartData } from '@/components/analytics/advanced-charts/trading-view-wrapper'

// Mock data for demonstration
const recentInsights: AiInsight[] = [
  {
    type: 'opportunity',
    title: 'Cash Flow Optimization Opportunity',
    description: 'You have $15,200 in outstanding invoices that are 15+ days past due. Following up on these could improve your cash flow by approximately 22%.',
    confidence: 0.92,
    recommendation: 'Send automated payment reminders to customers with overdue invoices and consider offering a 2% early payment discount.',
    impact_score: 9,
    data: { amount: 15200, count: 7, avgDaysOverdue: 23 }
  },
  {
    type: 'trend',
    title: 'Marketing ROI Trending Upward',
    description: 'Your marketing expenses increased 31% this quarter, but revenue from new customers grew 45%, indicating positive ROI improvement.',
    confidence: 0.88,
    recommendation: 'Consider increasing marketing budget allocation to high-performing channels like Google Ads and social media.',
    impact_score: 8,
    data: { marketingIncrease: 31, revenueIncrease: 45, roi: 1.45 }
  },
  {
    type: 'warning',
    title: 'Expense Category Spike Detected',
    description: 'Professional fees have increased 67% compared to last quarter. This may indicate scope creep in consulting projects.',
    confidence: 0.85,
    recommendation: 'Review current consulting contracts and consider renegotiating terms or setting stricter project boundaries.',
    impact_score: 6,
    data: { increase: 67, category: 'Professional Fees', amount: 8700 }
  },
  {
    type: 'anomaly',
    title: 'Unusual Transaction Pattern',
    description: 'Detected 3 transactions with amounts significantly higher than your typical expense patterns.',
    confidence: 0.78,
    recommendation: 'Review these transactions for accuracy and ensure proper approval processes are followed for large expenses.',
    impact_score: 5,
    data: { count: 3, avgAmount: 4500, threshold: 2000 }
  }
]

const trendData = [
  { month: 'Sep', aiAccuracy: 82, categorized: 245, reviewed: 23 },
  { month: 'Oct', aiAccuracy: 85, categorized: 289, reviewed: 18 },
  { month: 'Nov', aiAccuracy: 87, categorized: 312, reviewed: 15 },
  { month: 'Dec', aiAccuracy: 89, categorized: 334, reviewed: 12 },
  { month: 'Jan', aiAccuracy: 91, categorized: 367, reviewed: 8 },
  { month: 'Feb', aiAccuracy: 93, categorized: 398, reviewed: 6 }
]

const categoryAccuracyData = [
  { category: 'Office Supplies', accuracy: 95, count: 67 },
  { category: 'Marketing', accuracy: 92, count: 45 },
  { category: 'Travel', accuracy: 89, count: 23 },
  { category: 'Utilities', accuracy: 97, count: 34 },
  { category: 'Professional', accuracy: 88, count: 29 },
  { category: 'Vehicle', accuracy: 91, count: 18 }
]

// Convert data for TradingView charts
const trendTradingData: TradingViewChartData[] = trendData.map((item, index) => ({
  time: '2024-${String(index + 1).padStart(2, '0')}-01',
  value: item.aiAccuracy
}))

const categoryTradingData: TradingViewChartData[] = categoryAccuracyData.map((item, index) => ({
  time: '2024-01-${String(index + 1).padStart(2, '0')}',
  value: item.accuracy
}))

function getInsightIcon(type: AiInsight['type']) {
  switch (type) {
    case 'opportunity': return Lightbulb
    case 'trend': return TrendingUp
    case 'warning': return AlertTriangle
    case 'anomaly': return Target
    default: return Sparkles
  }
}

function getInsightColor(type: AiInsight['type']) {
  switch (type) {
    case 'opportunity': return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'trend': return 'text-green-600 bg-green-50 border-green-200'
    case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'anomaly': return 'text-red-600 bg-red-50 border-red-200'
    default: return 'text-neutral-600 bg-neutral-50 border-neutral-200'
  }
}

function getImpactBadge(score: number) {
  if (score >= 8) return { label: 'High Impact', variant: 'destructive' as const }
  if (score >= 6) return { label: 'Medium Impact', variant: 'default' as const }
  return { label: 'Low Impact', variant: 'secondary' as const }
}

interface DocumentUploadProps {
  onUpload: (file: File) => void
  isProcessing: boolean
}

function DocumentUpload({ onUpload, isProcessing }: DocumentUploadProps) {
  return (
    <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
      <CardContent className="pt-6">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
            {isProcessing ? (
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            ) : (
              <Camera className="h-6 w-6 text-primary" />
            )}
          </div>
          <h3 className="text-lg font-medium mb-2">AI Document Processing</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload receipts or invoices for automatic data extraction and categorization
          </p>
          <div className="flex items-center justify-center space-x-2">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
              className="hidden"
              id="document-upload"
              disabled={isProcessing}
            />
            <label htmlFor="document-upload">
              <Button variant="outline" disabled={isProcessing} asChild>
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  {isProcessing ? 'Processing...' : 'Upload Document'}
                </span>
              </Button>
            </label>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Supports images and PDFs up to 10MB
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AiInsightsPage() {
  const [selectedInsight, setSelectedInsight] = useState<AiInsight | null>(null)
  const [isProcessingDocument, setIsProcessingDocument] = useState(false)
  const [documentResult, setDocumentResult] = useState<unknown>(null)
  const [searchTerm, setSearchTerm] = useState(')
  const [filterType, setFilterType] = useState<AiInsight['type'] | 'all'>('all')

  const filteredInsights = recentInsights.filter(insight => {
    const matchesSearch = insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         insight.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || insight.type === filterType
    return matchesSearch && matchesFilter
  })

  const handleDocumentUpload = async (file: File) => {
    setIsProcessingDocument(true)
    try {
      const result = await processDocument(file)
      setDocumentResult(result)
    } catch (error) {
      console.error('Document processing failed:', error)
    } finally {
      setIsProcessingDocument(false)
    }
  }

  const handleGenerateInsights = async () => {
    // Mock implementation - in real app this would call the AI service
    console.log('Generating new insights...')
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Bot className="mr-3 h-8 w-8 text-primary" />
            AI Insights & Automation
          </h1>
          <p className="text-muted-foreground">Intelligent analysis and recommendations for your business</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleGenerateInsights}>
            <Zap className="mr-2 h-4 w-4" />
            Generate New Insights
          </Button>
          <Button>
            <Sparkles className="mr-2 h-4 w-4" />
            AI Settings
          </Button>
        </div>
      </div>

      {/* AI Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Accuracy</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">93%</div>
            <p className="text-xs text-green-600">+4% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Categorized</CardTitle>
            <Bot className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">398</div>
            <p className="text-xs text-muted-foreground">Transactions this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23h</div>
            <p className="text-xs text-muted-foreground">Manual entry avoided</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Insights</CardTitle>
            <Lightbulb className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentInsights.length}</div>
            <p className="text-xs text-muted-foreground">Recommendations available</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Trends and Document Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Performance Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              AI Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <TradingViewWrapper
                data={trendTradingData}
                type="area"
                height={300}
                theme="dark"
                className="rounded-lg overflow-hidden"
                options={{
                  layout: {
                    background: {
                      type: 1,
                      color: 'transparent',
                    },
                  },
                  grid: {
                    vertLines: {
                      color: 'rgba(75, 85, 99, 0.2)',
                    },
                    horzLines: {
                      color: 'rgba(75, 85, 99, 0.2)',
                    },
                  },
                  rightPriceScale: {
                    scaleMargins: {
                      top: 0.1,
                      bottom: 0.1,
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Document Upload */}
        <DocumentUpload 
          onUpload={handleDocumentUpload} 
          isProcessing={isProcessingDocument}
        />
      </div>

      {/* Document Processing Result */}
      {documentResult && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Document Processing Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Extracted Information:</h4>
                <pre className="text-sm bg-muted p-3 rounded-lg overflow-auto">
                  {documentResult.extractedText}
                </pre>
              </div>
              <div>
                <h4 className="font-medium mb-2">Suggested Transaction:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Description:</span>
                    <p className="font-medium">{documentResult.suggestedTransaction.description}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <p className="font-medium">${documentResult.suggestedTransaction.total_amount}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <Badge variant="outline">
                    Confidence: {Math.round(documentResult.confidence * 100)}%
                  </Badge>
                  <div className="space-x-2">
                    <Button size="sm" variant="outline">Review</Button>
                    <Button size="sm">Create Transaction</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Accuracy Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>AI Categorization Accuracy by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <TradingViewWrapper
              data={categoryTradingData}
              type="histogram"
              height={200}
              theme="dark"
              className="rounded-lg overflow-hidden"
              options={{
                layout: {
                  background: {
                    type: 1,
                    color: 'transparent',
                  },
                },
                grid: {
                  vertLines: {
                    color: 'rgba(75, 85, 99, 0.2)',
                  },
                  horzLines: {
                    color: 'rgba(75, 85, 99, 0.2)',
                  },
                },
                rightPriceScale: {
                  scaleMargins: {
                    top: 0.1,
                    bottom: 0.1,
                  },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Insights Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search insights..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as AiInsight['type'] | 'all')}
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
              >
                <option value="all">All Types</option>
                <option value="opportunity">Opportunities</option>
                <option value="trend">Trends</option>
                <option value="warning">Warnings</option>
                <option value="anomaly">Anomalies</option>
              </select>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent AI Insights ({filteredInsights.length})</h2>
        {filteredInsights.map((insight, index) => {
          const Icon = getInsightIcon(insight.type)
          const impact = getImpactBadge(insight.impact_score)
          
          return (
            <Card key={index} className={'border ${getInsightColor(insight.type)}'}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <Icon className="h-5 w-5 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">{insight.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(insight.confidence * 100)}% confidence
                        </Badge>
                        <Badge variant={impact.variant} className="text-xs">
                          {impact.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {insight.description}
                      </p>
                      {insight.recommendation && (
                        <div className="bg-background/50 p-3 rounded-lg mb-3">
                          <h4 className="text-sm font-medium mb-1">💡 Recommendation:</h4>
                          <p className="text-sm">{insight.recommendation}</p>
                        </div>
                      )}
                      {insight.data && (
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          {Object.entries(insight.data).map(([key, value]) => (
                            <div key={key} className="flex items-center space-x-1">
                              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                              <span className="font-medium">
                                {typeof value === 'number' 
                                  ? (key.includes('amount') || key.includes('Amount`) ? '$${value.toLocaleString()}' : value)
                                  : value}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button size="sm" variant="ghost" onClick={() => setSelectedInsight(insight)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm">
                      Act on This
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        
        {filteredInsights.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Bot className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No insights found matching your criteria.</p>
              <Button className="mt-4" onClick={() => setSearchTerm(')}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}