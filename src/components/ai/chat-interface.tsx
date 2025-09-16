'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { 
  Paperclip, 
  Mic,
  MicOff,
  Upload,
  ArrowUp
} from 'lucide-react'
import { EnhancedChatInput } from './enhanced-chat-input'
import { FilePreviewGrid } from './file-preview'
import { useConversationMemory } from '@/hooks/use-conversation-memory'
import Image from 'next/image'
import WeatherWidget from './widgets/weather-widget'
import StockWidget from './widgets/stock-widget'
import NewsWidget from './widgets/news-widget'

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition
  new(): SpeechRecognition
}


interface ChatInterfaceProps {
  user?: {
    email: string
    id: string
    type: string
    name?: string
    avatar?: string
  }
  currentIndustry?: "hs" | "rest" | "auto" | "ret" | "admin"
}

export function ChatInterface({ 
  user, 
  currentIndustry = "hs"
}: ChatInterfaceProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [input, setInput] = useState(')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Conversation memory
  const {
    currentConversation,
    addTurn,
    startNewConversation,
    getConversationContext
  } = useConversationMemory(currentIndustry)

  // Vercel AI SDK chat hook with massive debugging
  console.log('🎯 Initializing useChat hook with AI SDK v5 configuration...')
  console.log('🏭 Current industry:', currentIndustry)
  console.log('👤 User context:', user)
  
  const { messages, sendMessage, status, error } = useChat({
    // AI SDK 5 configuration - use DefaultChatTransport
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

  // Save conversation turns when messages change
  useEffect(() => {
    if (messages.length >= 2) {
      const lastUserMessage = messages[messages.length - 2]
      const lastAssistantMessage = messages[messages.length - 1]
      
      if (lastUserMessage?.role === 'user' && lastAssistantMessage?.role === 'assistant') {
        // Extract text content from AI SDK 5 message format
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
            tools: [] // Could track which tools were used
          })
        }
      }
    }
  }, [messages, addTurn, currentIndustry, attachedFiles])

  // Start new conversation if none exists
  useEffect(() => {
    if (!currentConversation && messages.length === 0) {
      startNewConversation()
    }
  }, [currentConversation, messages.length, startNewConversation])
  
  // Log current chat state
  console.log('📊 Current chat state: '
  console.log('💬 Messages count:', messages.length)
  console.log('⏳ Status:', status)
  console.log('❌ Has error:', !!error)
  console.log('📝 Current input:', input)
  console.log('📋 Recent messages:', messages.slice(-2))'



    const suggestedActions = [
    "How do I create a new invoice in the system?",
    "Explain the difference between estimates and work orders", 
    "What reports are available for tracking business performance?",
    "How can I integrate payment processing with Stripe?"
  ]

  // Real-time speech recognition setup
  const initializeSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported in this browser')
      return null
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    
    recognition.onstart = () => {
      setIsTranscribing(true)
      console.log('Speech recognition started')
    }
    
    recognition.onresult = (event) => {
      const interimTranscript = '
      const finalTranscript = '
      
      for (const i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }
      
      // Update input with final transcript
      if (finalTranscript) {
        setInput(prev => {
          const newText = prev ? prev + ' ' + finalTranscript : finalTranscript
          return newText.trim()
        })
      }
    }
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsTranscribing(false)
      setIsRecording(false)
    }
    
    recognition.onend = () => {
      setIsTranscribing(false)
      setIsRecording(false)
      console.log('Speech recognition ended')
    }
    
    return recognition
  }, [])

  // Real-time speech recognition functions
  const startRecording = useCallback(() => {
    try {
      const recognition = initializeSpeechRecognition()
      if (!recognition) {
        alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.')
        return
      }
      
      recognitionRef.current = recognition
      recognition.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting speech recognition:', error)
      alert('Error starting speech recognition. Please check your microphone permissions.')
    }
  }, [initializeSpeechRecognition])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
      setIsTranscribing(false)
    }
  }, [isRecording])

  // File upload functions
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setAttachedFiles(prev => [...prev, ...files])
  }, [])

  const removeFile = useCallback((index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  const models = [
    {
      name: 'Grok Vision',
      description: 'Advanced multimodal model with vision and text capabilities'
    },
    {
      name: 'Grok Reasoning', 
      description: 'Uses advanced chain-of-thought reasoning for complex problems'
    }
  ]

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-100">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="relative flex flex-col min-w-0 gap-6 pt-4 pb-32 px-4 w-full" role="log">
            <div className="max-w-4xl mx-auto w-full">
              <div className="flex flex-col gap-6">
                {messages.length === 0 ? (
                  /* Welcome Message */
                  <div className="max-w-2xl mx-auto md:mt-16 px-6 size-full flex flex-col justify-center text-center">
                    {/* Thorbis Logo */}
                    <div className="flex justify-center mb-10">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Image 
                          src="/ThorbisLogo.webp" 
                          alt="Thorbis Logo" 
                          width={32} 
                          height={32} 
                          className="w-8 h-8"
                          priority
                          unoptimized
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="text-3xl font-semibold text-neutral-100">
                        Hello there!
                      </div>
                      <div className="text-lg text-neutral-400">
                        How can I help you today?
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Chat Messages */
                  <div className="flex flex-col gap-4 w-full">
                    {messages.map((message, index) => (
                      <div key={message.id || index} className={'flex ${message.role === 'user' ? 'justify-end' : 'justify-start'
              }'}>'
                        <div className={'max-w-[70%] ${
                          message.role === 'user' 
                            ? 'ml-auto' 
                            : `
              }'}>'
                          {/* Message parts */}
                          <div className={'p-4 rounded-2xl ${
                            message.role === 'user' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-neutral-800 text-neutral-100'
              }'}>'
                            <div className="text-sm whitespace-pre-wrap">
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
                          
                          {/* Tool invocations - render widgets */}
                          {(message as any).toolInvocations && (message as any).toolInvocations.map((toolInvocation: unknown, toolIndex: number) => {
                            const { toolName, toolCallId, state, args } = toolInvocation;
                            const result = toolInvocation.result;
                            
                            return (
                              <div key={toolCallId || toolIndex} className="mt-3">
                                {toolName === 'getWeather' && (
                                  <>
                                    {state === 'call' && (
                                      <div className="bg-neutral-800 text-neutral-100 p-3 rounded-lg">
                                        <div className="text-sm text-neutral-400 mb-2">Getting weather for {args?.location}...</div>
                                        <WeatherWidget loading={true} weather={null} />
                                      </div>
                                    )}
                                    {state === 'result' && result && (
                                      <div className="bg-neutral-800 text-neutral-100 p-3 rounded-lg">
                                        <div className="text-sm text-neutral-400 mb-3">Weather for {result.location}</div>
                                        <WeatherWidget weather={result} />
                                      </div>
                                    )}
                                  </>
                                )}
                                
                                {toolName === 'getStockPrice' && (
                                  <>
                                    {state === 'call' && (
                                      <div className="bg-neutral-800 text-neutral-100 p-3 rounded-lg">
                                        <div className="text-sm text-neutral-400 mb-2">Getting stock data for {args?.symbol}...</div>
                                        <StockWidget loading={true} stock={null} />
                                      </div>
                                    )}
                                    {state === 'result' && result && (
                                      <div className="bg-neutral-800 text-neutral-100 p-3 rounded-lg">
                                        <div className="text-sm text-neutral-400 mb-3">Stock information for {result.symbol}</div>
                                        <StockWidget stock={result} />
                                      </div>
                                    )}
                                  </>
                                )}
                                
                                {toolName === 'getNews' && (
                                  <>
                                    {state === 'call' && (
                                      <div className="bg-neutral-800 text-neutral-100 p-3 rounded-lg">
                                        <div className="text-sm text-neutral-400 mb-2">
                                          Getting news{args?.topic ? ' about ${args.topic}' : '}...
                                        </div>
                                        <NewsWidget loading={true} articles={[]} />
                                      </div>
                                    )}
                                    {state === 'result' && result && Array.isArray(result) && (
                                      <div className="bg-neutral-800 text-neutral-100 p-3 rounded-lg">
                                        <div className="text-sm text-neutral-400 mb-3">
                                          Latest news{args?.topic ? ' about ${args.topic}' : '}
                                        </div>
                                        <NewsWidget 
                                          articles={result} 
                                          title={args?.topic ? '${args.topic} News' : 'Latest News'}
                                        />
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    
                    {/* Loading indicator - Modern minimalistic design */}
                    {(status === 'submitted' || status === 'streaming') && (
                      <div className="flex justify-start py-6">
                        <div className="flex items-center gap-3" aria-live="polite" aria-label="AI is thinking">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-neutral-400 animate-pulse" style={{ animationDelay: '0ms', animationDuration: '2s' }} />
                            <div className="w-1 h-1 rounded-full bg-neutral-400 animate-pulse" style={{ animationDelay: '400ms', animationDuration: '2s' }} />
                            <div className="w-1 h-1 rounded-full bg-neutral-400 animate-pulse" style={{ animationDelay: '800ms', animationDuration: '2s' }} />
                          </div>
                          <span className="text-xs text-neutral-500 font-light tracking-wide">thinking</span>
                          <span className="sr-only">AI is processing your message</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Error indicator */}
                    {error && (
                      <div className="flex justify-start">
                        <div className="max-w-[70%] w-fit p-3 rounded-2xl bg-red-900/20 border border-red-500/30 text-red-200 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="text-sm">
                              Failed to send message. Please try again.
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="shrink-0 min-w-[24px] min-h-[24px]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Input Area - Sticky at bottom */}
        <div className="flex-shrink-0 px-4 py-4 w-full bg-neutral-950 sticky bottom-0 z-50">
          <div className="max-w-4xl mx-auto w-full">
            <div className="flex relative flex-col gap-4 w-full">
              {/* Suggested Actions - only show when no messages */}
              {messages.length === 0 && (
                <div data-testid="suggested-actions" className="grid sm:grid-cols-2 gap-3 w-full">
                  {suggestedActions.map((action, index) => (
                    <div key={index} style={{opacity: 1, transform: 'none'}}>
                      <button 
                        className="flex items-center justify-center text-sm font-medium text-neutral-300 hover:text-neutral-100 bg-neutral-800/50 hover:bg-neutral-700/50 rounded-xl transition-all duration-200 cursor-pointer text-center w-full h-auto whitespace-normal py-3 px-4" 
                        type="button"
                        onClick={() => setInput(action)}
                      >
                        {action}
                      </button>
                    </div>
                  ))}
                </div>
              )}

            {/* File Input (Hidden) */}
            <input 
              type="file" 
              className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none" 
              multiple 
              tabIndex={-1} 
            />

            {/* Attached Files Preview */}
            {/* Enhanced File Preview */}
            {attachedFiles.length > 0 && (
              <div className="mb-4">
                <FilePreviewGrid
                  files={attachedFiles}
                  onRemoveFile={(index) => {
                    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
                  }}
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
      </div>
    </div>
  )
}