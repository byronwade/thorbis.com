'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Download, 
  Code, 
  FileText, 
  Copy, 
  ExternalLink,
  Zap,
  CheckCircle,
  Settings,
  Globe,
  Book
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface OpenApiDocsProps {
  className?: string
}

const industryOptions = [
  { value: 'all', label: 'All Industries', description: 'Complete API specification' },
  { value: 'hs', label: 'Home Services', description: 'Customer & work order management' },
  { value: 'rest', label: 'Restaurant', description: 'Orders, menu & kitchen operations' },
  { value: 'auto', label: 'Auto Services', description: 'Repair orders & diagnostics' },
  { value: 'ret', label: 'Retail', description: 'Products, inventory & sales' },
  { value: 'courses', label: 'Education', description: 'Courses & learning management' },
  { value: 'payroll', label: 'Payroll', description: 'Employee & payroll processing' },
  { value: 'ai', label: 'AI Services', description: 'Natural language & automation' }
]

const formatOptions = [
  { value: 'json', label: 'JSON', description: 'JavaScript Object Notation' },
  { value: 'yaml', label: 'YAML', description: 'YAML Ain\'t Markup Language' }'
]

export function OpenApiDocs({ className }: OpenApiDocsProps) {
  const [selectedIndustry, setSelectedIndustry] = useState('all')
  const [selectedFormat, setSelectedFormat] = useState('json')
  const [isLoading, setIsLoading] = useState(false)
  const [specPreview, setSpecPreview] = useState<string>(')
  const [downloadUrl, setDownloadUrl] = useState<string>(')

  useEffect(() => {
    generateSpec()
  }, [selectedIndustry, selectedFormat])

  const generateSpec = async () => {
    setIsLoading(true)
    
    try {
      const params = new URLSearchParams({
        format: selectedFormat,
        ...(selectedIndustry !== 'all' && { industry: selectedIndustry })
      })
      
      const response = await fetch(`/openapi?${params}')
      const spec = await response.text()
      
      setSpecPreview(spec)
      setDownloadUrl('/openapi?${params}&download=true')
    } catch (error) {
      console.error('Failed to generate OpenAPI spec:', error)
      setSpecPreview('Error generating specification')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadSpec = () => {
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = 'thorbis-${selectedIndustry === 'all' ? 'api' : selectedIndustry}-api.${selectedFormat}'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const openSwaggerUI = () => {
    const swaggerUrl = 'https://editor.swagger.io/?url=${encodeURIComponent(window.location.origin + downloadUrl)}'
    window.open(swaggerUrl, '_blank')
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">OpenAPI Documentation</h1>
            <p className="text-lg text-muted-foreground">
              Generate and download OpenAPI/Swagger specifications for Thorbis APIs
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-sm font-medium">OpenAPI 3.0.3</div>
                <div className="text-xs text-muted-foreground">Latest Standard</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-sm font-medium">200+ Endpoints</div>
                <div className="text-xs text-muted-foreground">Fully Documented</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-purple-500" />
              <div>
                <div className="text-sm font-medium">7 Industries</div>
                <div className="text-xs text-muted-foreground">Specialized APIs</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-orange-500" />
              <div>
                <div className="text-sm font-medium">Auto-Generated</div>
                <div className="text-xs text-muted-foreground">Always Current</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Specification Generator
          </CardTitle>
          <CardDescription>
            Configure and generate OpenAPI specifications for your integration needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Industry Scope</label>
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry scope" />
                  </SelectTrigger>
                  <SelectContent>
                    {industryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Output Format</label>
                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {formatOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button 
                onClick={generateSpec} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Settings className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                {isLoading ? 'Generating...' : 'Generate Spec'}
              </Button>

              <Button 
                variant="outline" 
                onClick={downloadSpec}
                disabled={!specPreview || isLoading}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>

              <Button 
                variant="outline" 
                onClick={openSwaggerUI}
                disabled={!specPreview || isLoading}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open in Swagger Editor
              </Button>
            </div>

            {/* Selected Configuration Display */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
              <span>Configuration:</span>
              <Badge variant="outline">
                {industryOptions.find(i => i.value === selectedIndustry)?.label}
              </Badge>
              <Badge variant="outline">
                {selectedFormat.toUpperCase()}
              </Badge>
              {specPreview && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Generated
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specification Preview */}
      {specPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-primary" />
                Specification Preview
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => copyToClipboard(specPreview)}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </CardTitle>
            <CardDescription>
              Preview of the generated OpenAPI specification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-96 overflow-y-auto">
                <code>{specPreview}</code>
              </pre>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Size: {(new Blob([specPreview]).size / 1024).toFixed(1)} KB</span>
                <span>Lines: {specPreview.split('
').length}</span>
                <span>Format: {selectedFormat.toUpperCase()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5 text-primary" />
            Integration Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="swagger-ui">
            <TabsList>
              <TabsTrigger value="swagger-ui">Swagger UI</TabsTrigger>
              <TabsTrigger value="postman">Postman</TabsTrigger>
              <TabsTrigger value="code-gen">Code Generation</TabsTrigger>
              <TabsTrigger value="validation">Validation</TabsTrigger>
            </TabsList>

            <TabsContent value="swagger-ui" className="space-y-4">
              <h4 className="font-semibold">Using with Swagger UI</h4>
              <p className="text-sm text-muted-foreground">
                Import the generated OpenAPI specification into Swagger UI for interactive API exploration:
              </p>
              <div className="space-y-2">
                <p className="text-sm">1. Download the specification file</p>
                <p className="text-sm">2. Go to <a href="https://editor.swagger.io" target="_blank" className="text-primary hover:underline">Swagger Editor</a></p>
                <p className="text-sm">3. Import the file or paste the URL: <code className="bg-muted px-1 rounded text-xs">{window.location.origin}/openapi</code></p>
                <p className="text-sm">4. Explore and test the API endpoints interactively</p>
              </div>
            </TabsContent>

            <TabsContent value="postman" className="space-y-4">
              <h4 className="font-semibold">Importing to Postman</h4>
              <p className="text-sm text-muted-foreground">
                Create a complete Postman collection from the OpenAPI specification:
              </p>
              <div className="space-y-2">
                <p className="text-sm">1. Open Postman and click "Import"</p>
                <p className="text-sm">2. Select "Link" and paste: <code className="bg-muted px-1 rounded text-xs">{window.location.origin}/openapi</code></p>
                <p className="text-sm">3. Configure authentication with your API key</p>
                <p className="text-sm">4. All endpoints will be organized by industry tags</p>
              </div>
            </TabsContent>

            <TabsContent value="code-gen" className="space-y-4">
              <h4 className="font-semibold">Code Generation</h4>
              <p className="text-sm text-muted-foreground">
                Generate client SDKs in multiple programming languages:
              </p>
              <div className="space-y-2">
                <p className="text-sm">• <strong>OpenAPI Generator:</strong> <code className="bg-muted px-1 rounded text-xs">openapi-generator-cli generate -i {window.location.origin}/openapi -g javascript</code></p>
                <p className="text-sm">• <strong>Swagger Codegen:</strong> Generate clients for 40+ languages</p>
                <p className="text-sm">• <strong>Supported Languages:</strong> JavaScript, Python, Java, PHP, C#, Ruby, Go, Swift, Kotlin</p>
                <p className="text-sm">• <strong>Framework Support:</strong> React, Vue, Angular, Express, Flask, Spring Boot</p>
              </div>
            </TabsContent>

            <TabsContent value="validation" className="space-y-4">
              <h4 className="font-semibold">Request Validation</h4>
              <p className="text-sm text-muted-foreground">
                Use the OpenAPI spec for request/response validation:
              </p>
              <div className="space-y-2">
                <p className="text-sm">• <strong>JSON Schema:</strong> Validate request bodies and responses</p>
                <p className="text-sm">• <strong>Parameter Validation:</strong> Query params, path params, headers</p>
                <p className="text-sm">• <strong>Content Type:</strong> Ensure proper media types</p>
                <p className="text-sm">• <strong>Security:</strong> Validate authentication requirements</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}