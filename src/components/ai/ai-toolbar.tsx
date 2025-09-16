'use client'

import Link from "next/link"
import {
  Plus,
  Search,
  History as HistoryIcon,
  Image as ImageIcon,
} from "lucide-react"

export function AIToolbar() {
  return (
    <div className="bg-neutral-950 px-4 py-2">
      <div className="flex items-center gap-2">
        <button className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-neutral-100 bg-neutral-800/50 hover:bg-neutral-700/50 rounded transition-colors">
          <Plus className="h-3 w-3" />
          New
        </button>
        
        <button className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50 rounded transition-colors">
          <Search className="h-3 w-3" />
          Search
        </button>
        
        <Link
          href="/dashboards/ai/history"
          className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50 rounded transition-colors"
        >
          <HistoryIcon className="h-3 w-3" />
          History
        </Link>
        
        <Link
          href="/dashboards/ai/media"
          className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50 rounded transition-colors"
        >
          <ImageIcon className="h-3 w-3" />
          Media
        </Link>
      </div>
    </div>
  )
}