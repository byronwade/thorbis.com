import Link from 'next/link'
import { Github, Twitter, ArrowUpRight, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background/50 backdrop-blur-sm">
      <div className="px-6 lg:px-8 xl:px-12 2xl:px-16 py-20">
        {/* Header with Logo */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-16">
          <div className="mb-8 lg:mb-0">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center group-hover:bg-primary/90 transition-all duration-200">
                <span className="text-primary-foreground font-bold text-lg">L</span>
              </div>
              <div>
                <span className="font-bold text-2xl text-foreground group-hover:text-primary transition-colors duration-200">LOM</span>
                <p className="text-sm text-muted-foreground">LLM Operations Manifest</p>
              </div>
            </Link>
          </div>
          
          <div className="text-left lg:text-right">
            <p className="text-lg text-foreground font-medium mb-2">Making APIs AI-ready</p>
            <p className="text-muted-foreground max-w-md">
              The open standard for AI agent integration. Safe, discoverable, and standardized.
            </p>
          </div>
        </div>

        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-16">
          <div className="space-y-6">
            <h3 className="text-base font-semibold text-foreground">Product</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/documentation" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                  Documentation
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/examples" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                  Examples
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/playground" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                  Playground
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/api-reference" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                  API Reference
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-base font-semibold text-foreground">Tools</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/validator" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                  Validator
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/generators" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                  Generator
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/schemas" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                  Schemas
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-base font-semibold text-foreground">Community</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/community" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                  Community
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="https://github.com/thorbis/lom" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                  GitHub
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/contributing" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                  Contributing
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                  Changelog
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-base font-semibold text-foreground">Company</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/about" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                  About
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                  Blog
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="https://thorbis.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                  Thorbis
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pt-12 border-t border-border/50 gap-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
            <p className="text-muted-foreground">
              &copy; {new Date().getFullYear()} Thorbis. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hover:bg-muted" asChild>
              <Link href="https://github.com/thorbis/lom" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-muted" asChild>
              <Link href="https://twitter.com/thorbis" target="_blank" rel="noopener noreferrer">
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  )
}