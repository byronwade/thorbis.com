'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowUp, AtSign, Mic, MicOff, Paperclip, X, FileText, User, Building, Brain, Keyboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { calculateContextPercentage, getIndustryLabel, getContextTooltip } from '@/lib/context-utils'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { ContextSearchMenu } from './context-search-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ContextItem {
  id: string
  type: 'user' | 'platform' | 'file' | 'capability'
  label: string
  icon: React.ReactNode
  value: string
  removable?: boolean
}

interface EnhancedChatInputProps {
  input: string
  setInput: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  disabled?: boolean
  status: 'ready' | 'submitted' | 'streaming' | 'error'
  user?: any
  currentIndustry?: string
  attachedFiles?: File[]
  onFileUpload?: (files: File[]) => void
  onRemoveFile?: (index: number) => void
  isRecording?: boolean
  isTranscribing?: boolean
  onStartRecording?: () => void
  onStopRecording?: () => void
}

export function EnhancedChatInput({
  input,
  setInput,
  onSubmit,
  disabled = false,
  status,
  user,
  currentIndustry,
  attachedFiles = [],
  onFileUpload,
  onRemoveFile,
  isRecording = false,
  isTranscribing = false,
  onStartRecording,
  onStopRecording,
}: EnhancedChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showAtMenu, setShowAtMenu] = useState(false)
  const [showContextSearch, setShowContextSearch] = useState(false)
  const [contextItems, setContextItems] = useState<ContextItem[]>([])
  const [contextPercentage, setContextPercentage] = useState(77.6)
  const [contextMetrics, setContextMetrics] = useState<unknown>(null)
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | undefined>()

  // Keyboard shortcuts
  const { shortcuts } = useKeyboardShortcuts({
    onOpenContextMenu: () => {
      setShowContextSearch(true)
      setMenuPosition(undefined) // Center the menu
    },
    onClearContext: () => {
      setContextItems(prev => prev.filter(item => !item.removable))
    },
    onFocusInput: () => {
      textareaRef.current?.focus()
    },
    onSubmit: () => {
      if (input.trim()) {
        const event = new Event('submit', { bubbles: true, cancelable: true })
        onSubmit(event as any)
      }
    }
  })

  // Auto-detect context on mount
  useEffect(() => {
    const autoContext: ContextItem[] = []

    // Add user context
    if (user) {
      autoContext.push({
        id: 'user-context',
        type: 'user',
        label: user.name || 'User',
        icon: <User className="h-3 w-3" />,
        value: 'User: ${user.name} (${user.email})',
        removable: false
      })
    }

    // Add platform context
    if (currentIndustry) {
      autoContext.push({
        id: 'platform-context',
        type: 'platform',
        label: getIndustryLabel(currentIndustry),
        icon: <Building className="h-3 w-3" />,
        value: 'Platform: ${getIndustryLabel(currentIndustry)} Business OS',
        removable: false
      })
    }

    // Add capability context
    autoContext.push({
      id: 'capabilities',
      type: 'capability',
      label: '11',
      icon: <Brain className="h-3 w-3" />,
      value: 'AI Tools: Weather, Stock, News, Business Analytics',
      removable: false
    })

    setContextItems(autoContext)
  }, [user, currentIndustry])

  // Calculate context percentage based on items
  useEffect(() => {
    const fileCount = contextItems.filter(item => item.type === 'file').length
    const capabilityCount = contextItems.filter(item => item.type === 'capability').length
    
    const result = calculateContextPercentage(
      !!user,
      !!currentIndustry,
      fileCount + attachedFiles.length,
      input.length,
      capabilityCount
    )
    
    setContextPercentage(result.percentage)
    setContextMetrics(result.metrics)
  }, [contextItems, input.length, attachedFiles.length, user, currentIndustry])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0 && onFileUpload) {
      onFileUpload(files)
      
      // Add file context items
      const newFileItems: ContextItem[] = files.map((file, index) => ({
        id: 'file-${Date.now()}-${index}',
        type: 'file',
        label: file.name,
        icon: <FileText className="h-3 w-3" />,
        value: 'File: ${file.name} (${(file.size / 1024).toFixed(1)}KB)',
        removable: true
      }))
      
      setContextItems(prev => [...prev, ...newFileItems])
    }
  }, [onFileUpload])

  const removeContextItem = useCallback((id: string) => {
    setContextItems(prev => prev.filter(item => item.id !== id))
    
    // If it's a file, also remove from attachedFiles'
    const item = contextItems.find(item => item.id === id)
    if (item?.type === 'file' && onRemoveFile) {
      const fileIndex = attachedFiles.findIndex(file => file.name === item.label)
      if (fileIndex !== -1) {
        onRemoveFile(fileIndex)
      }
    }
  }, [contextItems, attachedFiles, onRemoveFile])

  const handleAtSymbol = useCallback((event?: React.MouseEvent) => {
    if (event) {
      const rect = event.currentTarget.getBoundingClientRect()
      setMenuPosition({
        x: rect.left,
        y: rect.bottom + 8
      })
    }
    setShowContextSearch(true)
    setShowAtMenu(false)
  }, [])

  const addContextFromMenu = useCallback((type: string, label: string) => {
    const newItem: ContextItem = {
      id: '${type}-${Date.now()}',
      type: type as ContextItem['type'],
      label,
      icon: type === 'file' ? <FileText className="h-3 w-3" /> : <User className="h-3 w-3" />,
      value: '${type}: ${label}',
      removable: true
    }
    
    setContextItems(prev => [...prev, newItem])
    setShowAtMenu(false)
  }, [])

  const handleContextSelect = useCallback((option: unknown) => {
    const iconMap = {
      file: <FileText className="h-3 w-3" />,
      user: <User className="h-3 w-3" />,
      platform: <Building className="h-3 w-3" />,
      capability: <Brain className="h-3 w-3" />,
      history: <FileText className="h-3 w-3" />,
      code: <FileText className="h-3 w-3" />,
      data: <FileText className="h-3 w-3" />,
      settings: <FileText className="h-3 w-3" />
    }

    const newItem: ContextItem = {
      id: option.id,
      type: option.type === 'history' || option.type === 'code' || option.type === 'data' || option.type === 'settings' 
        ? 'file' 
        : option.type as ContextItem['type'],
      label: option.label,
      icon: iconMap[option.type as keyof typeof iconMap] || <FileText className="h-3 w-3" />,
      value: option.value,
      removable: true
    }
    
    setContextItems(prev => {
      // Avoid duplicates
      const exists = prev.some(item => item.id === option.id)
      if (exists) return prev
      return [...prev, newItem]
    })
    setShowContextSearch(false)
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = '${Math.min(textareaRef.current.scrollHeight, 120)}px'
    }
  }, [input])

  const circumference = 2 * Math.PI * 5.25
  const strokeDashoffset = circumference - (contextPercentage / 100) * circumference

  return (
    <div className="relative">
      {/* Context Menu */}
      {showAtMenu && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl z-50">
          <div className="p-2">
            <div className="text-xs text-neutral-400 mb-2">Add Context</div>
            <div className="space-y-1">
              <button
                onClick={() => addContextFromMenu('file', 'Current File')}
                className="w-full text-left px-2 py-1 text-sm hover:bg-neutral-700 rounded flex items-center gap-2"
              >
                <FileText className="h-3 w-3" />
                Current File
              </button>
              <button
                onClick={() => addContextFromMenu('user', 'User Profile')}
                className="w-full text-left px-2 py-1 text-sm hover:bg-neutral-700 rounded flex items-center gap-2"
              >
                <User className="h-3 w-3" />
                User Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Input Container */}
      <div 
        className={cn(
          "relative flex flex-col border rounded-md p-3 gap-3 transition-all duration-200 ease-in-out",
          "bg-neutral-800/60 border-neutral-700/60 backdrop-blur-sm",
          "hover:bg-neutral-800/80 hover:border-neutral-600/80",
          "focus-within:bg-neutral-800/90 focus-within:border-blue-500/60",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {/* Context Percentage Indicator */}
        <div className="absolute top-3 right-3 z-20">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-900/80 rounded-md border border-neutral-600/60 cursor-help hover:bg-neutral-800/90 hover:border-neutral-500/80 transition-all duration-200 ease-in-out backdrop-blur-sm">
                  <span className="text-xs text-neutral-200 font-medium">
                    {contextPercentage.toFixed(1)}%
                  </span>
                  <div className="relative w-4 h-4 flex items-center justify-center">
                    <svg className="absolute w-4 h-4 transform -rotate-90">
                      <circle
                        cx="8"
                        cy="8"
                        r="6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                        className="text-neutral-600/40"
                      />
                      <circle
                        cx="8"
                        cy="8"
                        r="6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                        className="text-blue-400 transition-all duration-300"
                        strokeDasharray={2 * Math.PI * 6}
                        strokeDashoffset={2 * Math.PI * 6 - (contextPercentage / 100) * 2 * Math.PI * 6}
                      />
                    </svg>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" align="end">
                <div>
                  <div className="font-semibold">Context Quality: {contextPercentage.toFixed(1)}%</div>
                  {contextMetrics && (
                    <div className="text-xs text-neutral-300 mt-1 space-y-1">
                      {contextMetrics.userContext > 0 && <div>User: {contextMetrics.userContext}%</div>}
                      {contextMetrics.platformContext > 0 && <div>Platform: {contextMetrics.platformContext}%</div>}
                      {contextMetrics.fileContext > 0 && <div>Files: {contextMetrics.fileContext}%</div>}
                      {contextMetrics.capabilityContext > 0 && <div>Tools: {contextMetrics.capabilityContext}%</div>}
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Context Pills Row */}
        <div className="flex items-center gap-2 pr-16 min-h-[24px]">
          {/* @ Symbol Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleAtSymbol}
                  className="flex items-center justify-center w-6 h-6 border border-neutral-600/60 rounded-md hover:bg-neutral-700/60 hover:border-neutral-500/80 transition-all duration-200 ease-in-out group"
                >
                  <AtSign className="h-3 w-3 text-neutral-400 group-hover:text-neutral-300" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <div>
                  <div className="font-semibold">Add Context</div>
                  <div className="text-xs text-neutral-300 mt-1">Add files, user info, platform details, or AI capabilities to improve response quality</div>
                  <div className="text-xs text-neutral-400 mt-1">Shortcut: {shortcuts.openContext}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Context Pills */}
          {contextItems.map((item) => (
            <TooltipProvider key={item.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs border transition-all duration-200 ease-in-out cursor-help",
                      item.type === 'capability'
                        ? "border-blue-500/40 bg-blue-500/10 text-blue-300 hover:bg-blue-500/15 hover:border-blue-500/60"
                        : item.type === 'user'
                        ? "border-green-500/40 bg-green-500/10 text-green-300 hover:bg-green-500/15 hover:border-green-500/60"
                        : item.type === 'platform'
                        ? "border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/15 hover:border-purple-500/60"
                        : "border-neutral-600/60 bg-neutral-700/40 text-neutral-300 hover:bg-neutral-700/60 hover:border-neutral-500/80"
                    )}
                  >
                    <div className="flex-shrink-0">
                      {item.icon}
                    </div>
                    <span className="max-w-20 truncate font-medium">{item.label}</span>
                    {item.removable && (
                      <button
                        onClick={() => removeContextItem(item.id)}
                        className="ml-0.5 hover:text-red-400 transition-colors flex-shrink-0"
                        title="Remove from context"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <div>
                    <div className="font-semibold">{item.label}</div>
                    <div className="text-xs text-neutral-400 mt-1">{item.value}</div>
                    {item.removable && (
                      <div className="text-xs text-neutral-500 mt-1">
                        Click × to remove from context
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        {/* Input Area */}
        <div className="relative">
          <form onSubmit={onSubmit} className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if (input.trim()) {
                      onSubmit(e)
                    }
                  }
                }}
                placeholder="Plan, search, build anything..."
                disabled={disabled || status !== 'ready'}
                className={cn(
                  "w-full bg-transparent border-none outline-none resize-none",
                  "text-neutral-100 placeholder:text-neutral-500 text-sm leading-6",
                  "min-h-[20px] max-h-[120px] overflow-y-auto",
                  "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                )}
                rows={1}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
                        {/* File Upload */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700/60 rounded-md transition-all duration-200 ease-in-out"
                              >
                                <Paperclip className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <div>
                                <div className="font-semibold">Attach Files</div>
                                <div className="text-xs text-neutral-300 mt-1">Upload images, documents, or other files to provide context for your conversation</div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

              {/* Voice Recording */}
              {(onStartRecording || onStopRecording) && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={isRecording ? onStopRecording : onStartRecording}
                        className={cn(
                          "p-2 rounded-md transition-all duration-200 ease-in-out",
                          isRecording
                            ? "text-red-400 bg-red-500/20 hover:bg-red-500/30 hover:text-red-300"
                            : isTranscribing
                            ? "text-blue-400 bg-blue-500/20 hover:bg-blue-500/30 hover:text-blue-300"
                            : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700/60"
                        )}
                      >
                        {isRecording ? (
                          <MicOff className="h-4 w-4 animate-pulse" />
                        ) : isTranscribing ? (
                          <div className="animate-spin">
                            <Mic className="h-4 w-4" />
                          </div>
                        ) : (
                          <Mic className="h-4 w-4" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <div>
                        <div className="font-semibold">
                          {isRecording
                            ? "Stop Recording"
                            : isTranscribing
                            ? "Processing Audio..."
                            : "Voice Input"}
                        </div>
                        <div className="text-xs text-neutral-300 mt-1">
                          {isRecording
                            ? "Click to stop recording and transcribe your voice message"
                            : isTranscribing
                            ? "Converting your speech to text..."
                            : "Click and speak to add voice input to your message"}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Send Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="submit"
                      disabled={!input.trim() || status !== 'ready'}
                      className={cn(
                        "p-2 rounded-md transition-all duration-200 ease-in-out",
                        input.trim() && status === 'ready'
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : "bg-neutral-600/60 text-neutral-400 cursor-not-allowed opacity-50"
                      )}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <div>
                      <div className="font-semibold">
                        {!input.trim()
                          ? "Enter a Message"
                          : status !== 'ready'
                          ? "AI is Processing..."
                          : "Send Message"}
                      </div>
                      <div className="text-xs text-neutral-300 mt-1">
                        {!input.trim()
                          ? "Type a message to send to the AI assistant"
                          : status !== 'ready'
                          ? "Please wait for the current response to complete"
                          : "Send your message to get an AI response with tools and widgets"}
                      </div>
                      {shortcuts.submit && (
                        <div className="text-xs text-neutral-400 mt-1">Shortcut: {shortcuts.submit}</div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </form>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Context Search Menu */}
      <ContextSearchMenu
        isOpen={showContextSearch}
        onClose={() => setShowContextSearch(false)}
        onSelect={handleContextSelect}
        currentIndustry={currentIndustry}
        position={menuPosition}
      />

      {/* Old Context Menu (fallback) */}
      {showAtMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowAtMenu(false)}
        />
      )}

      {/* Keyboard Shortcuts Indicator - Disabled for now */}
      {false && (
        <div className="absolute bottom-full left-0 mb-3 opacity-60 hover:opacity-100 transition-all duration-200 ease-in-out cursor-help">
          <div className="bg-neutral-900/90 border border-neutral-700/60 rounded-md p-3 text-xs space-y-2 backdrop-blur-sm shadow-lg">
            <div className="flex items-center gap-2 text-neutral-300 font-medium">
              <Keyboard className="h-3 w-3" />
              <span>Shortcuts</span>
            </div>
            <div className="space-y-1.5 text-neutral-400">
              <div className="flex items-center justify-between gap-3">
                <span>Add context</span>
                <kbd className="px-1.5 py-0.5 bg-neutral-800/80 border border-neutral-600/60 rounded text-xs font-mono">
                  {shortcuts.openContext}
                </kbd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Send message</span>
                <kbd className="px-1.5 py-0.5 bg-neutral-800/80 border border-neutral-600/60 rounded text-xs font-mono">
                  {shortcuts.submit}
                </kbd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Clear context</span>
                <kbd className="px-1.5 py-0.5 bg-neutral-800/80 border border-neutral-600/60 rounded text-xs font-mono">
                  {shortcuts.clearContext}
                </kbd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Focus input</span>
                <kbd className="px-1.5 py-0.5 bg-neutral-800/80 border border-neutral-600/60 rounded text-xs font-mono">
                  {shortcuts.focusInput}
                </kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
