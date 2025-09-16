'use client'

import React, { useState } from 'react'
import { 
  MessageSquare, 
  Search, 
  Trash2, 
  Clock, 
  Plus,
  ChevronRight,
  Hash
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useConversationMemory } from '@/hooks/use-conversation-memory'

interface ConversationHistoryProps {
  currentIndustry?: string
  onNewChat?: () => void
  className?: string
}

export function ConversationHistory({ 
  currentIndustry, 
  onNewChat,
  className 
}: ConversationHistoryProps) {
  const [searchQuery, setSearchQuery] = useState(')
  const [isExpanded, setIsExpanded] = useState(false)
  
  const {
    conversations,
    currentConversation,
    loadConversation,
    deleteConversation,
    searchConversations,
    startNewConversation
  } = useConversationMemory(currentIndustry)

  const filteredConversations = searchQuery 
    ? searchConversations(searchQuery)
    : conversations.filter(conv => conv.industry === currentIndustry)

  const handleNewChat = () => {
    startNewConversation()
    onNewChat?.()
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago'
    if (diffDays < 30) return '${Math.floor(diffDays / 7)} weeks ago'
    return date.toLocaleDateString()
  }

  const groupConversationsByDate = (conversations: typeof filteredConversations) => {
    const groups: { [key: string]: typeof conversations } = {}
    
    conversations.forEach(conv => {
      const dateKey = formatDate(conv.updatedAt)
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(conv)
    })
    
    return groups
  }

  const conversationGroups = groupConversationsByDate(filteredConversations)

  return (
    <div className={cn("flex flex-col h-full bg-neutral-900", className)}>
      {/* Header */}
      <div className="p-4 border-b border-neutral-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-neutral-400" />
            <span className="text-sm font-medium text-neutral-300">Chat History</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-neutral-700 rounded transition-colors"
          >
            <ChevronRight className={cn(
              "h-4 w-4 text-neutral-400 transition-transform",
              isExpanded && "rotate-90"
            )} />
          </button>
        </div>

        {/* New Chat Button */}
        <button
          onClick={handleNewChat}
          className="w-full flex items-center gap-2 p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors text-white text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>

        {/* Search */}
        {isExpanded && (
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-600 rounded-md text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
        )}
      </div>

      {/* Conversation List */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto">
          {Object.keys(conversationGroups).length === 0 ? (
            <div className="p-4 text-center text-neutral-500 text-sm">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </div>
          ) : (
            <div className="p-2 space-y-4">
              {Object.entries(conversationGroups).map(([dateGroup, conversations]) => (
                <div key={dateGroup}>
                  {/* Date Group Header */}
                  <div className="flex items-center gap-2 px-2 py-1 text-xs text-neutral-500 font-medium">
                    <Clock className="h-3 w-3" />
                    {dateGroup}
                  </div>

                  {/* Conversations in Group */}
                  <div className="space-y-1">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={cn(
                          "group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors",
                          currentConversation?.id === conversation.id
                            ? "bg-blue-500/20 border border-blue-500/30"
                            : "hover:bg-neutral-800"
                        )}
                        onClick={() => loadConversation(conversation.id)}
                      >
                        {/* Conversation Icon */}
                        <div className="flex-shrink-0">
                          <Hash className="h-3 w-3 text-neutral-400" />
                        </div>

                        {/* Conversation Info */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-neutral-100 truncate">
                            {conversation.title}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {conversation.turns.length} messages
                          </div>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteConversation(conversation.id)
                          }}
                          className="flex-shrink-0 p-1 rounded hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete conversation"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Collapsed View */}
      {!isExpanded && (
        <div className="p-2">
          <div className="text-xs text-neutral-500 text-center">
            {filteredConversations.length} conversations
          </div>
        </div>
      )}
    </div>
  )
}
