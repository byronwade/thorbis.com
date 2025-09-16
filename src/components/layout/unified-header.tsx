'use client'

import Link from 'next/link'
import { Search, User, Key } from 'lucide-react'
import { useApi } from '@/components/providers/api-provider'
import { cn } from '@/lib/utils'

export function UnifiedHeader() {
  const { isAuthenticated, apiKey } = useApi()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
      <div className="flex h-14 items-center px-6">
        <div className="flex items-center space-x-6">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <span className="text-sm font-bold text-black">T</span>
            </div>
            <span className="font-semibold text-white">Thorbis API</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/docs" 
              className="text-sm text-neutral-300 hover:text-white transition-colors"
            >
              Documentation
            </Link>
            <Link 
              href="/playground" 
              className="text-sm text-neutral-300 hover:text-white transition-colors"
            >
              API Playground
            </Link>
          </nav>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          {/* Search */}
          <button className="flex items-center space-x-2 rounded-md border border-neutral-700 bg-neutral-900/50 px-3 py-1.5 text-sm text-neutral-400 hover:border-neutral-600 transition-colors">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search...</span>
            <span className="hidden sm:inline text-xs text-neutral-500">⌘K</span>
          </button>

          {/* Authentication Status */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2 rounded-md bg-green-500/10 border border-green-500/20 px-3 py-1.5">
                <Key className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">
                  {apiKey?.slice(0, 8)}...
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 rounded-md bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5">
                <User className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-yellow-500">No API Key</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}