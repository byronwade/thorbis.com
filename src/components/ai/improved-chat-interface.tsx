'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { 
  Paperclip, 
  Mic,
  MicOff,
  Upload,
  ArrowUp,
  Bot,
  User as UserIcon,
  Sparkles
} from 'lucide-react'
import { EnhancedChatInput } from './enhanced-chat-input'
import { FilePreviewGrid } from './file-preview'
import { useConversationMemory } from '@/hooks/use-conversation-memory'
import { FeatureTooltip } from './ui/tooltip'
import { ThorbisLogo } from '@/components/shared/thorbis-logo'
import Image from 'next/image'
import WeatherWidget from './widgets/weather-widget'
import StockWidget from './widgets/stock-widget'
import NewsWidget from './widgets/news-widget'
import { cn } from '@/lib/utils'

interface ChatInterfaceProps {
  user?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  currentIndustry?: string
  className?: string
}

export function ImprovedChatInterface({
  user,
  currentIndustry = "hs",
  className
}: ChatInterfaceProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [input, setInput] = useState(')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Conversation memory
  const {
    currentConversation,
    addTurn,
    startNewConversation,
    getConversationContext
  } = useConversationMemory(currentIndustry)

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/v1/ai/chat',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        currentIndustry,
      },
    })
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Save conversation turns when messages change (with ref to prevent infinite loops)
  const lastMessageCount = useRef(0)
  useEffect(() => {
    if (messages.length >= 2 && messages.length > lastMessageCount.current) {
      const lastUserMessage = messages[messages.length - 2]
      const lastAssistantMessage = messages[messages.length - 1]
      
      if (lastUserMessage?.role === 'user' && lastAssistantMessage?.role === 'assistant') {
        const getUserContent = (msg: unknown) => {
          if (msg.parts && msg.parts.length > 0) {
            return msg.parts.find((part: unknown) => part.type === 'text')?.text || '
          }
          return msg.content || '
        }
        
        const userContent = getUserContent(lastUserMessage)
        const assistantContent = getUserContent(lastAssistantMessage)
        
        if (userContent && assistantContent) {
          addTurn(userContent, assistantContent, {
            industry: currentIndustry,
            files: attachedFiles.map(f => f.name),
            tools: []
          })
        }
      }
      lastMessageCount.current = messages.length
    }
  }, [messages.length, addTurn, currentIndustry])

  // Start new conversation if none exists (only once)
  const hasInitialized = useRef(false)
  useEffect(() => {
    if (!hasInitialized.current && !currentConversation && messages.length === 0) {
      startNewConversation()
      hasInitialized.current = true
    }
  }, [currentConversation, messages.length, startNewConversation])

  // Voice recording functions
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        // Here you would typically send the audio to a transcription service
        setIsTranscribing(true)
        setTimeout(() => {
          setIsTranscribing(false)
          setInput(prev => prev + ' [Voice input transcribed]')
        }, 2000)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }
  }, [isRecording])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setAttachedFiles(prev => [...prev, ...files])
  }, [])

  const removeFile = useCallback((index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  return (
    <div className={cn("flex flex-col h-full bg-neutral-950", className)}>
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            /* Welcome Screen */
            <div className="max-w-3xl mx-auto mt-4 md:mt-16 px-4 md:px-8 size-full flex flex-col justify-center">
              {/* Thorbis Logo */}
              <div className="mb-6">
                <ThorbisLogo size="lg" />
              </div>
              
              {/* Welcome Message */}
              <div className="text-xl md:text-2xl font-semibold text-white mb-2">
                Hello there!
              </div>
              <div className="text-xl md:text-2xl text-zinc-500">
                How can I help you today?
              </div>

              
              {/* Artistic Quick Actions - Suggestion Pills */}
              <div className="flex flex-wrap justify-center gap-3 mt-8 max-w-2xl mx-auto">
                <button
                  onClick={() => setInput("What's the weather forecast for my outdoor work today?")}
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 border border-blue-500/20 hover:border-blue-400/30 rounded-full px-4 py-2 text-sm font-medium text-blue-300 hover:text-blue-200 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/10"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span>Weather Check</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setInput("Show me today's business performance metrics")}
                  className="group relative overflow-hidden bg-gradient-to-r from-emerald-500/10 to-green-500/10 hover:from-emerald-500/20 hover:to-green-500/20 border border-emerald-500/20 hover:border-emerald-400/30 rounded-full px-4 py-2 text-sm font-medium text-emerald-300 hover:text-emerald-200 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/10"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span>Analytics</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setInput("Help me manage customer communications efficiently")}
                  className="group relative overflow-hidden bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-500/20 hover:border-purple-400/30 rounded-full px-4 py-2 text-sm font-medium text-purple-300 hover:text-purple-200 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/10"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span>Support</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setInput("What are some creative ideas for my business?")}
                  className="group relative overflow-hidden bg-gradient-to-r from-orange-500/10 to-amber-500/10 hover:from-orange-500/20 hover:to-amber-500/20 border border-orange-500/20 hover:border-orange-400/30 rounded-full px-4 py-2 text-sm font-medium text-orange-300 hover:text-orange-200 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/10"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                    <span>Inspire Me</span>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div key={message.id || index} className={'flex gap-4 ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }'}>'
                 {/* Avatar */}
                 <div className="flex-shrink-0">
                   {message.role === 'user' ? (
                     <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center hover:scale-[1.02] transition-all duration-200 ease-in-out">
                       <UserIcon className="w-4 h-4 text-white" />
                     </div>
                   ) : (
                     <div className="w-8 h-8 bg-neutral-700/80 rounded-md flex items-center justify-center hover:scale-[1.02] transition-all duration-200 ease-in-out backdrop-blur-sm">
                       <Bot className="w-4 h-4 text-white" />
                     </div>
                   )}
                 </div>

                 {/* Message Content */}
                 <div className={'flex-1 max-w-3xl ${message.role === 'user' ? 'text-right' : 'text-left'
              }'}>'
                   {/* Message Bubble */}
                   <div className={'inline-block p-4 rounded-md transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-sm ${
                     message.role === 'user'
                       ? 'bg-blue-600/90 text-white backdrop-blur-sm hover:bg-blue-600'
                       : 'bg-neutral-800/60 border border-neutral-700/60 text-neutral-100 backdrop-blur-sm hover:bg-neutral-800/80 hover:border-neutral-600/80'
              }'}>'
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.parts?.map((part, partIndex) => {
                          switch (part.type) {
                            case 'text':
                              return <span key={partIndex}>{part.text}</span>
                            default:
                              return null
                          }
                        })}
                      </div>
                    </div>

                    {/* Tool Invocations - Widgets */}
                    {(message as any).toolInvocations && (
                      <div className="mt-4 space-y-3">
                        {(message as any).toolInvocations.map((toolInvocation: unknown, toolIndex: number) => {
                          const { toolName, result } = toolInvocation
                          
                          if (toolName === 'getWeather' && result) {
                            return (
                              <div key={toolIndex} className="animate-fadeIn">
                                <WeatherWidget data={result} />
                              </div>
                            )
                          }
                          
                          if (toolName === 'getStockPrice' && result) {
                            return (
                              <div key={toolIndex} className="animate-fadeIn">
                                <StockWidget data={result} />
                              </div>
                            )
                          }
                          
                          if (toolName === 'getNews' && result) {
                            return (
                              <div key={toolIndex} className="animate-fadeIn">
                                <NewsWidget data={result} />
                              </div>
                            )
                          }
                          
                          return null
                        })}
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className={'text-xs text-neutral-500 mt-2 ${
                      message.role === 'user' ? 'text-right' : 'text-left'
              }'}>'
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {(status === 'submitted' || status === 'streaming') && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-neutral-700/80 rounded-md flex items-center justify-center backdrop-blur-sm hover:scale-[1.02] transition-all duration-200 ease-in-out">
                    <Bot className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <div className="inline-block p-4 bg-neutral-800/60 border border-neutral-700/60 rounded-md backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-sm text-neutral-300">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="">
        <div className="max-w-4xl mx-auto p-4">
          
          {/* File Preview */}
          {attachedFiles.length > 0 && (
            <div className="mb-4">
              <FilePreviewGrid
                files={attachedFiles}
                onRemoveFile={removeFile}
              />
            </div>
          )}

          {/* Enhanced Chat Input */}
          <EnhancedChatInput
            input={input}
            setInput={setInput}
            onSubmit={(e) => {
              e.preventDefault()
              if (input.trim()) {
                sendMessage({ text: input })
                setInput(')
              }
            }}
            status={status}
            user={user}
            currentIndustry={currentIndustry}
            attachedFiles={attachedFiles}
            onFileUpload={(files: File[]) => {
              setAttachedFiles(prev => [...prev, ...files])
            }}
            onRemoveFile={(index) => {
              setAttachedFiles(prev => prev.filter((_, i) => i !== index))
            }}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
          />
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  )
}
