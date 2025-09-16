/**
 * Conversation Memory Hook
 * 
 * Manages conversation history, context, and memory for AI chat interactions.
 * Provides functionality for storing, retrieving, and managing conversation state.
 */

'use client'

import { useState, useCallback, useEffect } from 'react'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    files?: File[]
    context?: string
    industry?: string
  }
}

export interface ConversationMemory {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  industry?: string
  tags?: string[]
}

interface UseConversationMemoryReturn {
  conversations: ConversationMemory[]
  currentConversation: ConversationMemory | null
  isLoading: boolean
  error: string | null
  createConversation: (title: string, industry?: string) => Promise<ConversationMemory>
  loadConversation: (id: string) => Promise<void>
  updateConversation: (conversation: ConversationMemory) => Promise<void>
  deleteConversation: (id: string) => Promise<void>
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  addTurn: (userMessage: string, assistantMessage: string) => void
  clearMessages: () => void
  searchConversations: (query: string) => ConversationMemory[]
  startNewConversation: () => Promise<void>
  getConversationContext: () => string
}

export function useConversationMemory(industry?: string): UseConversationMemoryReturn {
  const [conversations, setConversations] = useState<ConversationMemory[]>([])
  const [currentConversation, setCurrentConversation] = useState<ConversationMemory | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load conversations from localStorage on mount
  useEffect(() => {
    const loadSavedConversations = () => {
      try {
        const saved = localStorage.getItem('thorbis_conversations')
        if (saved) {
          const parsed = JSON.parse(saved)
          // Convert date strings back to Date objects
          const conversations = parsed.map((conv: unknown) => ({
            ...conv,
            createdAt: new Date(conv.createdAt),
            updatedAt: new Date(conv.updatedAt),
            messages: conv.messages.map((msg: unknown) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }))
          setConversations(conversations)
        }
      } catch (err) {
        console.error('Failed to load conversations:', err)
        setError('Failed to load conversation history')
      }
    }

    loadSavedConversations()
  }, [])

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      try {
        localStorage.setItem('thorbis_conversations', JSON.stringify(conversations))
      } catch (err) {
        console.error('Failed to save conversations:', err)
        setError('Failed to save conversation history')
      }
    }
  }, [conversations])

  const createConversation = useCallback(async (title: string, industry?: string): Promise<ConversationMemory> => {
    const newConversation: ConversationMemory = {
      id: crypto.randomUUID(),
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      industry,
      tags: []
    }

    setConversations(prev => [newConversation, ...prev])
    setCurrentConversation(newConversation)
    
    return newConversation
  }, [])

  const loadConversation = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true)
    try {
      const conversation = conversations.find(conv => conv.id === id)
      if (conversation) {
        setCurrentConversation(conversation)
      } else {
        setError('Conversation not found')
      }
    } catch (_error) {
      setError('Failed to load conversation')
    } finally {
      setIsLoading(false)
    }
  }, [conversations])

  const updateConversation = useCallback(async (updatedConversation: ConversationMemory): Promise<void> => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === updatedConversation.id 
          ? { ...updatedConversation, updatedAt: new Date() }
          : conv
      )
    )
    
    if (currentConversation?.id === updatedConversation.id) {
      setCurrentConversation({ ...updatedConversation, updatedAt: new Date() })
    }
  }, [currentConversation])

  const deleteConversation = useCallback(async (id: string): Promise<void> => {
    setConversations(prev => prev.filter(conv => conv.id !== id))
    
    if (currentConversation?.id === id) {
      setCurrentConversation(null)
    }
  }, [currentConversation])

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    if (!currentConversation) {
      return
    }

    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date()
    }

    const updatedConversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, newMessage],
      updatedAt: new Date()
    }

    updateConversation(updatedConversation)
  }, [currentConversation, updateConversation])

  const clearMessages = useCallback(() => {
    if (!currentConversation) {
      return
    }

    const updatedConversation = {
      ...currentConversation,
      messages: [],
      updatedAt: new Date()
    }

    updateConversation(updatedConversation)
  }, [currentConversation, updateConversation])

  const searchConversations = useCallback((query: string): ConversationMemory[] => {
    if (!query.trim()) {
      return conversations
    }

    const lowerQuery = query.toLowerCase()
    
    return conversations.filter(conv => 
      conv.title.toLowerCase().includes(lowerQuery) ||
      conv.messages.some(msg => 
        msg.content.toLowerCase().includes(lowerQuery)
      ) ||
      conv.tags?.some(tag => 
        tag.toLowerCase().includes(lowerQuery)
      ) ||
      conv.industry?.toLowerCase().includes(lowerQuery)
    )
  }, [conversations])

  const addTurn = useCallback((userMessage: string, assistantMessage: string) => {
    if (!currentConversation) {
      return
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }

    const assistantMsg: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: assistantMessage,
      timestamp: new Date()
    }

    const updatedConversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, userMsg, assistantMsg],
      updatedAt: new Date()
    }

    updateConversation(updatedConversation)
  }, [currentConversation, updateConversation])

  const startNewConversation = useCallback(async () => {
    const defaultTitle = 'Chat ${new Date().toLocaleDateString()}'
    await createConversation(defaultTitle, industry)
  }, [createConversation, industry])

  const getConversationContext = useCallback((): string => {
    if (!currentConversation || currentConversation.messages.length === 0) {
      return ''
    }

    // Return the last few messages as context
    const recentMessages = currentConversation.messages.slice(-5)
    return recentMessages
      .map(msg => '${msg.role}: ${msg.content}')
      .join('
')
  }, [currentConversation])

  return {
    conversations,
    currentConversation,
    isLoading,
    error,
    createConversation,
    loadConversation,
    updateConversation,
    deleteConversation,
    addMessage,
    addTurn,
    clearMessages,
    searchConversations,
    startNewConversation,
    getConversationContext
  }
}