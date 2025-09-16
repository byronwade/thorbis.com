'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Share2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShareButtonsProps {
  title: string
  slug: string
}

export function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const url = 'https://lom.thorbis.com/blog/${slug}'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:`, err)
    }
  }

  return (
    <div className="flex items-center gap-4 pt-6 border-t border-border">
      <span className="text-sm font-medium">Share this post:</span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link 
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}'}
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter
            <ExternalLink className="ml-2 h-3 w-3" />
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link 
            href={'https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}'}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
            <ExternalLink className="ml-2 h-3 w-3" />
          </Link>
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleCopy}
        >
          <Share2 className="h-4 w-4" />
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
    </div>
  )
}