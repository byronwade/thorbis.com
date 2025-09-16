'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle,
  Phone,
  Video,
  Search,
  Plus,
  Settings,
  Archive,
  Pin,
  VolumeX,
  Users,
  Clock,
  Check,
  CheckCheck,
  Send,
  Paperclip,
  Smile,
  MoreHorizontal,
  PhoneCall,
  VideoIcon,
  Mic,
  MicOff,
  Volume2,
  Screen,
  PhoneOff
} from 'lucide-react';

import { useOfflineCommunication } from '@/lib/offline-communication-manager';
import type { 
  ConversationMetadata,
  MessageMetadata,
  CallMetadata,
  CommunicationStats 
} from '@/lib/offline-communication-manager';

interface CommunicationDashboardProps {
  organizationId?: string;
  currentUserId?: string;
  onConversationSelect?: (conversationId: string) => void;
}

export default function CommunicationDashboard({
  organizationId = 'default',
  currentUserId = 'current_user',
  onConversationSelect
}: CommunicationDashboardProps) {
  const [activeTab, setActiveTab] = useState('conversations');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationMetadata[]>([]);
  const [messages, setMessages] = useState<MessageMetadata[]>([]);
  const [calls, setCalls] = useState<CallMetadata[]>([]);
  const [stats, setStats] = useState<CommunicationStats | null>(null);
  const [searchQuery, setSearchQuery] = useState(');
  const [messageInput, setMessageInput] = useState(');
  const [loading, setLoading] = useState(false);

  const communicationManager = useOfflineCommunication();

  useEffect(() => {
    loadData();
    setupEventListeners();
    
    return () => {
      // Cleanup listeners
      communicationManager.off('conversation_created', handleConversationCreated);
      communicationManager.off('message_sent', handleMessageSent);
      communicationManager.off('call_initiated', handleCallInitiated);
    };
  }, [organizationId]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const setupEventListeners = () => {
    communicationManager.on('conversation_created', handleConversationCreated);
    communicationManager.on('conversation_updated', handleConversationUpdated);
    communicationManager.on('message_sent', handleMessageSent);
    communicationManager.on('message_status_changed', handleMessageStatusChanged);
    communicationManager.on('call_initiated', handleCallInitiated);
    communicationManager.on('call_status_changed', handleCallStatusChanged);
  };

  const handleConversationCreated = (data: unknown) => {
    setConversations(prev => [data.conversation, ...prev]);
  };

  const handleConversationUpdated = (data: unknown) => {
    setConversations(prev => prev.map(conv => 
      conv.id === data.conversationId ? data.conversation : conv
    ));
  };

  const handleMessageSent = (data: unknown) => {
    if (data.message.conversationId === selectedConversation) {
      setMessages(prev => [data.message, ...prev]);
    }
    
    // Update conversation last message
    setConversations(prev => prev.map(conv => 
      conv.id === data.message.conversationId 
        ? { ...conv, lastMessage: data.message, lastActivity: data.message.timestamp }
        : conv
    ));
  };

  const handleMessageStatusChanged = (data: unknown) => {
    setMessages(prev => prev.map(msg => 
      msg.id === data.messageId ? data.message : msg
    ));
  };

  const handleCallInitiated = (data: unknown) => {
    setCalls(prev => [data.call, ...prev]);
  };

  const handleCallStatusChanged = (data: unknown) => {
    setCalls(prev => prev.map(call => 
      call.id === data.callId ? data.call : call
    ));
  };

  const loadData = async () => {
    try {
      const [conversationsData, callsData, statsData] = await Promise.all([
        communicationManager.getConversations(organizationId),
        communicationManager.getCalls(),
        communicationManager.getStatistics(organizationId)
      ]);

      setConversations(conversationsData);
      setCalls(callsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load communication data:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const messagesData = await communicationManager.getMessages(conversationId);
      setMessages(messagesData);
      
      // Mark conversation as read
      await communicationManager.markAsRead(conversationId);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleConversationClick = (conversationId: string) => {
    setSelectedConversation(conversationId);
    onConversationSelect?.(conversationId);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    setLoading(true);
    try {
      await communicationManager.sendMessage({
        conversationId: selectedConversation,
        type: 'text',
        content: messageInput.trim()
      });
      
      setMessageInput(');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCall = async (type: 'audio' | 'video') => {
    if (!selectedConversation) return;

    try {
      const conversation = conversations.find(c => c.id === selectedConversation);
      if (!conversation) return;

      const participantIds = conversation.participants
        .filter(p => p.userId !== currentUserId)
        .map(p => p.userId);

      await communicationManager.initiateCall({
        participantIds,
        type,
        conversationId: selectedConversation
      });
    } catch (error) {
      console.error('Failed to start call:', error);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m ago';
    } else if (hours < 24) {
      return '${Math.floor(hours)}h ago';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getMessageStatusIcon = (message: MessageMetadata) => {
    switch (message.status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-neutral-400" />;
      case 'sent':
        return <Check className="h-3 w-3 text-neutral-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-neutral-400" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-400" />;
      case 'failed':
        return <Clock className="h-3 w-3 text-red-400" />;
      default:
        return null;
    }
  };

  const getCallStatusColor = (status: CallMetadata['status']) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'ended':
        return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
      case 'missed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'declined':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-neutral-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Communication</h1>
            <p className="text-neutral-400">Messages, calls, and collaboration</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Conversation
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-400 text-sm">Unread Messages</p>
                    <p className="text-2xl font-bold text-white">{stats.unreadMessages}</p>
                  </div>
                  <MessageCircle className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-400 text-sm">Active Conversations</p>
                    <p className="text-2xl font-bold text-white">{stats.activeConversations}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-400 text-sm">Call Minutes</p>
                    <p className="text-2xl font-bold text-white">{Math.round(stats.callMinutes)}</p>
                  </div>
                  <Phone className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-400 text-sm">Pending Sync</p>
                    <p className="text-2xl font-bold text-white">{stats.pendingSync}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 border-r border-neutral-800 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-neutral-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-neutral-800 border-neutral-700"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 bg-neutral-800 border-neutral-700 m-4">
              <TabsTrigger value="conversations">Messages</TabsTrigger>
              <TabsTrigger value="calls">Calls</TabsTrigger>
            </TabsList>

            <TabsContent value="conversations" className="flex-1 mt-0">
              <ScrollArea className="h-full">
                <div className="space-y-1 p-2">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={'p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedConversation === conversation.id
                          ? 'bg-blue-500/20 border border-blue-500/30'
                          : 'hover:bg-neutral-800'
                      }'}
                      onClick={() => handleConversationClick(conversation.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conversation.avatar} />
                          <AvatarFallback>{conversation.name[0]}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-white truncate">{conversation.name}</h4>
                            <div className="flex items-center gap-1">
                              {conversation.isPinned && <Pin className="h-3 w-3 text-blue-400" />}
                              {conversation.isMuted && <VolumeX className="h-3 w-3 text-neutral-400" />}
                              <span className="text-xs text-neutral-400">
                                {formatTime(conversation.lastActivity)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-neutral-400 truncate">
                              {conversation.lastMessage?.content || 'No messages'}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <Badge variant="destructive" className="h-5 min-w-5 text-xs px-1">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="calls" className="flex-1 mt-0">
              <ScrollArea className="h-full">
                <div className="space-y-2 p-2">
                  {calls.map((call) => (
                    <div key={call.id} className="p-3 rounded-lg hover:bg-neutral-800">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {call.type === 'video' ? (
                            <Video className="h-5 w-5 text-blue-400" />
                          ) : (
                            <Phone className="h-5 w-5 text-green-400" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-white">{call.initiatorName}</h4>
                            <Badge variant="outline" className={getCallStatusColor(call.status)}>
                              {call.status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-neutral-400">
                              {call.participants.length} participant{call.participants.length !== 1 ? 's' : '}
                            </p>
                            <span className="text-xs text-neutral-400">
                              {formatTime(call.startTime)}
                            </span>
                          </div>
                          
                          {call.duration && (
                            <p className="text-xs text-neutral-500 mt-1">
                              Duration: {Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-neutral-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conversations.find(c => c.id === selectedConversation)?.avatar} />
                      <AvatarFallback>
                        {conversations.find(c => c.id === selectedConversation)?.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-white">
                        {conversations.find(c => c.id === selectedConversation)?.name}
                      </h3>
                      <p className="text-sm text-neutral-400">
                        {conversations.find(c => c.id === selectedConversation)?.participants.length} participants
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartCall('audio')}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartCall('video')}
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={'flex gap-3 ${
                        message.senderId === currentUserId ? 'justify-end' : 'justify-start'
                      }'}
                    >
                      {message.senderId !== currentUserId && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.senderAvatar} />
                          <AvatarFallback>{message.senderName[0]}</AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div
                        className={'max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                          message.senderId === currentUserId
                            ? 'bg-blue-500 text-white'
                            : 'bg-neutral-800 text-white'
                        }'}
                      >
                        {message.senderId !== currentUserId && (
                          <p className="text-xs text-neutral-400 mb-1">{message.senderName}</p>
                        )}
                        <p className="text-sm">{message.content}</p>
                        
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs opacity-70">
                            {formatTime(message.timestamp)}
                          </span>
                          {message.senderId === currentUserId && getMessageStatusIcon(message)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-neutral-800">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="pr-10 bg-neutral-800 border-neutral-700"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || loading}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">Select a conversation</h3>
                <p className="text-neutral-400">Choose a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}