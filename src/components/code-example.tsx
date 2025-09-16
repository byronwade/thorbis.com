"use client"

import { Button } from '@/components/ui/button';

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodeExampleProps {
  code: string
  language: string
  title?: string
  showLineNumbers?: boolean
  maxHeight?: number
  copyable?: boolean
  className?: string
}

export function CodeExample({
  code,
  language,
  title,
  showLineNumbers = true,
  maxHeight,
  copyable = true,
  className
}: CodeExampleProps) {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  return (
    <div className={cn("relative group", className)}>
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
          <span className="text-sm font-medium text-foreground">{title}</span>
          {copyable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      )}
      
      <div className="relative">
        {copyable && !title && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        )}
        
        <div 
          className="overflow-auto"
          style={{ maxHeight: maxHeight ? '${maxHeight}px' : undefined }}
        >
          <SyntaxHighlighter
            language={language}
            style={{
              ...oneDark,
              'pre[class*="language-"]': {
                ...oneDark['pre[class*="language-"]'],
                background: 'transparent',
                margin: 0,
                padding: '1rem',
              },
              'code[class*="language-"]': {
                ...oneDark['code[class*="language-"]'],
                background: 'transparent',
              },
            }}
            showLineNumbers={showLineNumbers}
            customStyle={{
              background: 'transparent',
              margin: 0,
              padding: '1rem',
              fontSize: '0.875rem',
              lineHeight: '1.5',
            }}
            codeTagProps={{
              style: {
                background: 'transparent',
                fontFamily: 'var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
              },
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  )
}
