'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger 
} from '@/components/ui/sheet'
import { Menu, Search, Github, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'

export function SiteHeader() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6 lg:px-8 xl:px-12 2xl:px-16">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <img 
            src="/images/ThorbisLogo.webp" 
            alt="Thorbis Logo"
            className="h-8 w-8 group-hover:opacity-80 transition-opacity duration-200"
          />
          <span className="font-bold text-xl text-foreground group-hover:text-primary transition-colors duration-200">LOM</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            href="/documentation" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Docs
          </Link>
          <Link 
            href="/examples" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Examples
          </Link>
          <Link 
            href="/playground" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Playground
          </Link>
          <Link 
            href="/community" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Community
          </Link>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          {/* Search */}
          <Button
            variant="outline"
            size="sm"
            className="hidden lg:flex items-center space-x-2 w-64 justify-start text-muted-foreground hover:bg-muted/50"
            disabled
          >
            <Search className="h-4 w-4" />
            <span className="text-sm">Search...</span>
            <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-70">
              ⌘K
            </kbd>
          </Button>

          {/* GitHub */}
          <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2" asChild>
            <Link href="https://github.com/thorbis/lom" target="_blank" rel="noreferrer">
              <Github className="h-4 w-4" />
              <span className="hidden xl:inline">GitHub</span>
            </Link>
          </Button>

          {/* Mobile GitHub (icon only) */}
          <Button variant="ghost" size="sm" className="sm:hidden" asChild>
            <Link href="https://github.com/thorbis/lom" target="_blank" rel="noreferrer">
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="relative"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader className="pb-6">
                <SheetTitle className="flex items-center gap-3">
                  <img 
                    src="/images/ThorbisLogo.webp" 
                    alt="Thorbis Logo"
                    className="h-6 w-6"
                  />
                  LOM Navigation
                </SheetTitle>
              </SheetHeader>
              <nav className="space-y-6">
                {/* Main Pages */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Main</h4>
                  <div className="space-y-2">
                    <Link href="/documentation" className="block p-2 rounded-lg text-foreground hover:bg-muted transition-colors">
                      Documentation
                    </Link>
                    <Link href="/examples" className="block p-2 rounded-lg text-foreground hover:bg-muted transition-colors">
                      Examples  
                    </Link>
                    <Link href="/playground" className="block p-2 rounded-lg text-foreground hover:bg-muted transition-colors">
                      Playground
                    </Link>
                  </div>
                </div>

                {/* Tools */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Tools</h4>
                  <div className="space-y-2">
                    <Link href="/validator" className="block p-2 rounded-lg text-foreground hover:bg-muted transition-colors">
                      Validator
                    </Link>
                    <Link href="/generators" className="block p-2 rounded-lg text-foreground hover:bg-muted transition-colors">
                      Generator
                    </Link>
                  </div>
                </div>

                {/* Resources */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Resources</h4>
                  <div className="space-y-2">
                    <Link href="/community" className="block p-2 rounded-lg text-foreground hover:bg-muted transition-colors">
                      Community
                    </Link>
                    <Link href="/about" className="block p-2 rounded-lg text-foreground hover:bg-muted transition-colors">
                      About
                    </Link>
                    <Link 
                      href="https://github.com/thorbis/lom" 
                      target="_blank" 
                      rel="noreferrer"
                      className="block p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
                    >
                      GitHub ↗
                    </Link>
                  </div>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}