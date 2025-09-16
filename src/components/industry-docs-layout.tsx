import { Button } from '@/components/ui/button';
"use client"

import { ArrowRight, ExternalLink, Play, BookOpen, Code, Zap } from 'lucide-react'

import { cn, getMethodColor } from '@/lib/utils'
import { CodeExample } from '@/components/ui/code-example'

interface IndustryDocsLayoutProps {
  data: {
    industry: string
    title: string
    description: string
    icon: string
    stats: {
      endpoints: number
      coverage: string
      uptime: string
    }
    quickStart: {
      title: string
      description: string
      code: string
    }
    sections: {
      title: string
      description: string
      endpoints: {
        name: string
        description: string
        method: string
        path: string
        href: string
      }[]
    }[]
    examples: {
      title: string
      description: string
      href: string
    }[]
  }
}

export function IndustryDocsLayout({ data }: IndustryDocsLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b border-border bg-gradient-to-br from-blue-600/5 via-transparent to-transparent">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1 mb-6 text-sm border border-blue-600/20 bg-blue-600/10 text-blue-500 rounded-full">
              <Zap className="w-3 h-3 mr-2" />
              Industry-Specific API
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              {data.title}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {data.description}
            </p>
            
            {/* Stats */}
            <div className="flex justify-center space-x-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{data.stats.endpoints}</div>
                <div className="text-sm text-muted-foreground">Endpoints</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{data.stats.coverage}</div>
                <div className="text-sm text-muted-foreground">API Coverage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{data.stats.uptime}</div>
                <div className="text-sm text-muted-foreground">Uptime SLA</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-blue-600 hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-background">
                <Play className="w-4 h-4 mr-2" />
                Try in Playground
              </Button>
              <Button 
                variant="outline"
                className="border-blue-600/20 text-blue-500 hover:bg-blue-600/10 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-background"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                View Examples
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-16">
            {/* Quick Start */}
            <section>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-green-600/10 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{data.quickStart.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{data.quickStart.description}</p>
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 border-b border-border">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="ml-4 text-sm text-muted-foreground font-mono">
                      Quick Start Example
                    </span>
                  </div>
                </div>
                <CodeExample 
                  code={data.quickStart.code}
                  language="bash"
                  showLineNumbers={false}
                  maxHeight={300}
                />
              </div>
            </section>
            
            {/* API Sections */}
            {data.sections.map((section, index) => (
              <section key={index}>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">{section.title}</h2>
                  <p className="text-muted-foreground">{section.description}</p>
                </div>
                
                <div className="grid gap-4">
                  {section.endpoints.map((endpoint, endpointIndex) => (
                    <div 
                      key={endpointIndex}
                      className="group border border-border rounded-lg p-4 hover:border-blue-600/50 hover:shadow-lg hover:shadow-blue-600/10 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className={cn(
                              "px-2 py-1 text-xs font-medium rounded border",
                              getMethodColor(endpoint.method)
                            )}>
                              {endpoint.method}
                            </span>
                            <h3 className="text-lg font-semibold text-foreground">
                              {endpoint.name}
                            </h3>
                          </div>
                          <code className="text-sm text-muted-foreground font-mono mb-3 block">
                            {endpoint.path}
                          </code>
                          <p className="text-sm text-muted-foreground mb-4">
                            {endpoint.description}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <a 
                          href={endpoint.href}
                          className="text-sm text-blue-500 hover:text-blue-400 font-medium"
                        >
                          View Documentation
                        </a>
                        <span className="text-muted-foreground">•</span>
                        <a 
                          href={'/playground?endpoint=${data.industry}-${endpoint.name.toLowerCase().replace(/\s+/g, '-')}'}
                          className="text-sm text-blue-500 hover:text-blue-400 font-medium"
                        >
                          Try in Playground
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-8">
            {/* Navigation */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Navigation</h3>
              <nav className="space-y-2">
                <a 
                  href="#quick-start"
                  className="block py-2 px-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                >
                  Quick Start
                </a>
                {data.sections.map((section, index) => (
                  <a 
                    key={index}
                    href={'#${section.title.toLowerCase().replace(/\s+/g, '-')}'}
                    className="block py-2 px-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
            
            {/* Examples */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <Code className="w-4 h-4 mr-2" />
                Examples
              </h3>
              <div className="space-y-4">
                {data.examples.map((example, index) => (
                  <a 
                    key={index}
                    href={example.href}
                    className="block p-3 rounded-lg border border-transparent hover:border-blue-600/20 hover:bg-blue-600/5 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-foreground text-sm mb-1">
                          {example.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {example.description}
                        </div>
                      </div>
                      <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-1" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
            
            {/* Support */}
            <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-600/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get support from our team or join the community discussion.
              </p>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full text-left justify-start">
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Guides
                </Button>
                <Button variant="outline" size="sm" className="w-full text-left justify-start">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Join Discord
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
