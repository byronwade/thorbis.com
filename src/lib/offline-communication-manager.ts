// Offline Communication Manager
// Provides comprehensive communication tools including messaging, calls, and video that work offline

import { EventEmitter } from 'events';

export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' | 'contact';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
export type ConversationType = 'direct' | 'group' | 'broadcast' | 'announcement';
export type CallType = 'audio' | 'video' | 'screen_share';
export type CallStatus = 'initiating' | 'ringing' | 'connected' | 'ended' | 'missed' | 'declined' | 'failed';
export type ParticipantStatus = 'online' | 'offline' | 'busy' | 'away' | 'do_not_disturb';

export interface MessageMetadata {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  type: MessageType;
  content: string;
  status: MessageStatus;
  timestamp: Date;
  editedAt?: Date;
  replyToId?: string;
  attachments: MessageAttachment[];
  reactions: MessageReaction[];
  mentions: string[];
  isEncrypted: boolean;
  localPath?: string; // For offline storage
  syncStatus: 'pending' | 'synced' | 'failed';
  organizationId: string;
  readBy: MessageRead[];
  deliveredTo: string[];
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'file' | 'audio' | 'video';
  name: string;
  size: number;
  mimeType: string;
  localPath: string;
  remoteUrl?: string;
  thumbnailPath?: string;
  duration?: number; // For audio/video
  compressed: boolean;
}

export interface MessageReaction {
  id: string;
  userId: string;
  userName: string;
  emoji: string;
  timestamp: Date;
}

export interface MessageRead {
  userId: string;
  userName: string;
  readAt: Date;
}

export interface ConversationMetadata {
  id: string;
  name: string;
  type: ConversationType;
  description?: string;
  avatar?: string;
  participants: ConversationParticipant[];
  lastMessage?: MessageMetadata;
  lastActivity: Date;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  createdAt: Date;
  createdBy: string;
  settings: ConversationSettings;
  organizationId: string;
  syncStatus: 'pending' | 'synced' | 'failed';
}

export interface ConversationParticipant {
  userId: string;
  name: string;
  email?: string;
  avatar?: string;
  role: 'admin' | 'moderator' | 'member';
  status: ParticipantStatus;
  lastSeen: Date;
  joinedAt: Date;
  permissions: ParticipantPermissions;
}

export interface ParticipantPermissions {
  canSendMessages: boolean;
  canSendMedia: boolean;
  canEditMessages: boolean;
  canDeleteMessages: boolean;
  canAddParticipants: boolean;
  canRemoveParticipants: boolean;
  canChangeSettings: boolean;
}

export interface ConversationSettings {
  allowedMessageTypes: MessageType[];
  maxFileSize: number;
  autoDeleteAfter?: number; // days
  requireApproval: boolean;
  allowReactions: boolean;
  allowEditing: boolean;
  allowForwarding: boolean;
  encryptionEnabled: boolean;
}

export interface CallMetadata {
  id: string;
  type: CallType;
  status: CallStatus;
  initiatorId: string;
  initiatorName: string;
  participants: CallParticipant[];
  startTime: Date;
  endTime?: Date;
  duration?: number; // seconds
  recordingUrl?: string;
  recordingLocalPath?: string;
  isRecorded: boolean;
  quality: 'low' | 'medium' | 'high' | 'hd';
  bandwidth?: number;
  organizationId: string;
  conversationId?: string;
  syncStatus: 'pending' | 'synced' | 'failed';
}

export interface CallParticipant {
  userId: string;
  name: string;
  avatar?: string;
  joinTime?: Date;
  leaveTime?: Date;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  connectionQuality: 'poor' | 'fair' | 'good' | 'excellent';
}

export interface VideoRoomSettings {
  id: string;
  name: string;
  description?: string;
  maxParticipants: number;
  allowRecording: boolean;
  requirePassword: boolean;
  password?: string;
  waitingRoom: boolean;
  hostControls: VideoHostControls;
  participantPermissions: VideoParticipantPermissions;
}

export interface VideoHostControls {
  canMuteAll: boolean;
  canMuteParticipants: boolean;
  canRemoveParticipants: boolean;
  canLockRoom: boolean;
  canControlRecording: boolean;
  canControlScreenShare: boolean;
}

export interface VideoParticipantPermissions {
  canUnmuteSelf: boolean;
  canEnableVideo: boolean;
  canShareScreen: boolean;
  canUseChat: boolean;
  canViewParticipants: boolean;
}

export interface CommunicationTemplate {
  id: string;
  name: string;
  type: 'message' | 'email' | 'sms';
  subject?: string;
  content: string;
  variables: string[];
  category: string;
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
}

export interface CommunicationStats {
  totalMessages: number;
  unreadMessages: number;
  totalConversations: number;
  activeConversations: number;
  totalCalls: number;
  callMinutes: number;
  storageUsed: number; // bytes
  lastSync: Date;
  pendingSync: number;
}

export class OfflineCommunicationManager extends EventEmitter {
  private static instance: OfflineCommunicationManager | null = null;
  
  private dbName = 'offline_communication';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  
  private messages: Map<string, MessageMetadata> = new Map();
  private conversations: Map<string, ConversationMetadata> = new Map();
  private calls: Map<string, CallMetadata> = new Map();
  private templates: Map<string, CommunicationTemplate> = new Map();
  
  private messageQueue: MessageMetadata[] = [];
  private mediaQueue: { messageId: string; attachmentId: string; file: File }[] = [];
  
  private currentUserId: string = 'current_user'; // Should be set from auth
  private currentUserName: string = 'Current User';
  
  private isOnline = navigator.onLine;
  private syncInProgress = false;
  
  private constructor() {
    super();
    this.initializeDatabase();
    this.setupEventListeners();
  }

  static getInstance(): OfflineCommunicationManager {
    if (!OfflineCommunicationManager.instance) {
      OfflineCommunicationManager.instance = new OfflineCommunicationManager();
    }
    return OfflineCommunicationManager.instance;
  }

  // Database Management

  private async initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.loadFromDatabase();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Messages store
        if (!db.objectStoreNames.contains('messages')) {
          const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
          messageStore.createIndex('conversationId', 'conversationId', { unique: false });
          messageStore.createIndex('senderId', 'senderId', { unique: false });
          messageStore.createIndex('timestamp', 'timestamp', { unique: false });
          messageStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        // Conversations store
        if (!db.objectStoreNames.contains('conversations')) {
          const conversationStore = db.createObjectStore('conversations', { keyPath: 'id' });
          conversationStore.createIndex('type', 'type', { unique: false });
          conversationStore.createIndex('lastActivity', 'lastActivity', { unique: false });
          conversationStore.createIndex('organizationId', 'organizationId', { unique: false });
        }

        // Calls store
        if (!db.objectStoreNames.contains('calls')) {
          const callStore = db.createObjectStore('calls', { keyPath: 'id' });
          callStore.createIndex('initiatorId', 'initiatorId', { unique: false });
          callStore.createIndex('startTime', 'startTime', { unique: false });
          callStore.createIndex('status', 'status', { unique: false });
        }

        // Templates store
        if (!db.objectStoreNames.contains('templates')) {
          const templateStore = db.createObjectStore('templates', { keyPath: 'id' });
          templateStore.createIndex('type', 'type', { unique: false });
          templateStore.createIndex('category', 'category', { unique: false });
        }

        // Media attachments store
        if (!db.objectStoreNames.contains('media')) {
          const mediaStore = db.createObjectStore('media', { keyPath: 'id' });
          mediaStore.createIndex('messageId', 'messageId', { unique: false });
          mediaStore.createIndex('type', 'type', { unique: false });
        }
      };
    });
  }

  private async loadFromDatabase(): Promise<void> {
    if (!this.db) return;

    try {
      // Load conversations
      const conversationTx = this.db.transaction(['conversations'], 'readonly');
      const conversationStore = conversationTx.objectStore('conversations');
      const conversationRequest = conversationStore.getAll();
      
      conversationRequest.onsuccess = () => {
        conversationRequest.result.forEach((conversation: ConversationMetadata) => {
          this.conversations.set(conversation.id, {
            ...conversation,
            lastActivity: new Date(conversation.lastActivity),
            createdAt: new Date(conversation.createdAt)
          });
        });
      };

      // Load messages
      const messageTx = this.db.transaction(['messages'], 'readonly');
      const messageStore = messageTx.objectStore('messages');
      const messageRequest = messageStore.getAll();
      
      messageRequest.onsuccess = () => {
        messageRequest.result.forEach((message: MessageMetadata) => {
          this.messages.set(message.id, {
            ...message,
            timestamp: new Date(message.timestamp),
            editedAt: message.editedAt ? new Date(message.editedAt) : undefined
          });
        });
      };

      // Load calls
      const callTx = this.db.transaction(['calls'], 'readonly');
      const callStore = callTx.objectStore('calls');
      const callRequest = callStore.getAll();
      
      callRequest.onsuccess = () => {
        callRequest.result.forEach((call: CallMetadata) => {
          this.calls.set(call.id, {
            ...call,
            startTime: new Date(call.startTime),
            endTime: call.endTime ? new Date(call.endTime) : undefined
          });
        });
      };

      // Load templates
      const templateTx = this.db.transaction(['templates'], 'readonly');
      const templateStore = templateTx.objectStore('templates');
      const templateRequest = templateStore.getAll();
      
      templateRequest.onsuccess = () => {
        templateRequest.result.forEach((template: CommunicationTemplate) => {
          this.templates.set(template.id, {
            ...template,
            createdAt: new Date(template.createdAt),
            updatedAt: new Date(template.updatedAt)
          });
        });
      };

      this.emit('data_loaded');
    } catch (error) {
      console.error('Failed to load data from database:', error);
    }
  }

  private async saveToDatabase(storeName: string, data: unknown): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async deleteFromDatabase(storeName: string, id: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Event Listeners

  private setupEventListeners(): void {
    // Online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.emit('connection_restored');
      this.processPendingOperations();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.emit('connection_lost');
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  // Conversation Management

  async createConversation(data: {
    name: string;
    type: ConversationType;
    description?: string;
    participants: string[];
    organizationId?: string;
  }): Promise<string> {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
    
    const conversation: ConversationMetadata = {
      id: conversationId,
      name: data.name,
      type: data.type,
      description: data.description,
      participants: data.participants.map(userId => ({
        userId,
        name: 'User ${userId}', // Would be resolved from user service
        role: userId === this.currentUserId ? 'admin' : 'member',
        status: 'offline',
        lastSeen: new Date(),
        joinedAt: new Date(),
        permissions: this.getDefaultPermissions(data.type)
      })),
      lastActivity: new Date(),
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      isArchived: false,
      createdAt: new Date(),
      createdBy: this.currentUserId,
      settings: this.getDefaultConversationSettings(data.type),
      organizationId: data.organizationId || 'default',
      syncStatus: 'pending'
    };

    this.conversations.set(conversationId, conversation);
    await this.saveToDatabase('conversations', conversation);

    this.emit('conversation_created', { conversationId, conversation });
    
    if (this.isOnline) {
      this.syncConversation(conversationId);
    }

    return conversationId;
  }

  async updateConversation(conversationId: string, updates: Partial<ConversationMetadata>): Promise<void> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const updatedConversation = {
      ...conversation,
      ...updates,
      syncStatus: 'pending' as const
    };

    this.conversations.set(conversationId, updatedConversation);
    await this.saveToDatabase('conversations', updatedConversation);

    this.emit('conversation_updated', { conversationId, conversation: updatedConversation });
    
    if (this.isOnline) {
      this.syncConversation(conversationId);
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Mark as archived instead of deleting
    await this.updateConversation(conversationId, { isArchived: true });
    
    this.emit('conversation_deleted`, { conversationId });
  }

  getConversations(organizationId?: string): ConversationMetadata[] {
    const conversations = Array.from(this.conversations.values())
      .filter(conv => !organizationId || conv.organizationId === organizationId)
      .filter(conv => !conv.isArchived)
      .sort((a, b) => {
        // Pinned conversations first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        
        // Then by last activity
        return b.lastActivity.getTime() - a.lastActivity.getTime();
      });

    return conversations;
  }

  getConversation(conversationId: string): ConversationMetadata | null {
    return this.conversations.get(conversationId) || null;
  }

  // Message Management

  async sendMessage(data: {
    conversationId: string;
    type: MessageType;
    content: string;
    attachments?: File[];
    replyToId?: string;
    mentions?: string[];
  }): Promise<string> {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
    
    // Process attachments
    const attachments: MessageAttachment[] = [];
    if (data.attachments) {
      for (const file of data.attachments) {
        const attachmentId = 'att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
        const localPath = await this.storeAttachment(file, attachmentId);
        
        attachments.push({
          id: attachmentId,
          type: this.getAttachmentType(file.type),
          name: file.name,
          size: file.size,
          mimeType: file.type,
          localPath,
          compressed: await this.shouldCompress(file)
        });
      }
    }

    const message: MessageMetadata = {
      id: messageId,
      conversationId: data.conversationId,
      senderId: this.currentUserId,
      senderName: this.currentUserName,
      type: data.type,
      content: data.content,
      status: this.isOnline ? 'sending' : 'pending' as MessageStatus,
      timestamp: new Date(),
      attachments,
      reactions: [],
      mentions: data.mentions || [],
      isEncrypted: false, // Would implement encryption
      syncStatus: 'pending',
      organizationId: this.conversations.get(data.conversationId)?.organizationId || 'default',
      readBy: [],
      deliveredTo: [],
      replyToId: data.replyToId
    };

    this.messages.set(messageId, message);
    await this.saveToDatabase('messages', message);

    // Update conversation last activity
    const conversation = this.conversations.get(data.conversationId);
    if (conversation) {
      await this.updateConversation(data.conversationId, {
        lastMessage: message,
        lastActivity: new Date()
      });
    }

    this.emit('message_sent', { messageId, message });

    if (this.isOnline) {
      this.syncMessage(messageId);
    } else {
      this.messageQueue.push(message);
    }

    return messageId;
  }

  async editMessage(messageId: string, newContent: string): Promise<void> {
    const message = this.messages.get(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    if (message.senderId !== this.currentUserId) {
      throw new Error('Cannot edit message from another user');
    }

    const updatedMessage = {
      ...message,
      content: newContent,
      editedAt: new Date(),
      syncStatus: 'pending' as const
    };

    this.messages.set(messageId, updatedMessage);
    await this.saveToDatabase('messages', updatedMessage);

    this.emit('message_edited', { messageId, message: updatedMessage });
    
    if (this.isOnline) {
      this.syncMessage(messageId);
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    const message = this.messages.get(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    if (message.senderId !== this.currentUserId) {
      throw new Error('Cannot delete message from another user');
    }

    this.messages.delete(messageId);
    await this.deleteFromDatabase('messages', messageId);

    this.emit('message_deleted', { messageId });
    
    if (this.isOnline) {
      // Would sync deletion to server
    }
  }

  async reactToMessage(messageId: string, emoji: string): Promise<void> {
    const message = this.messages.get(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    // Check if user already reacted with this emoji
    const existingReaction = message.reactions.find(
      r => r.userId === this.currentUserId && r.emoji === emoji
    );

    if (existingReaction) {
      // Remove reaction
      message.reactions = message.reactions.filter(r => r !== existingReaction);
    } else {
      // Add reaction
      message.reactions.push({
        id: 'react_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
        userId: this.currentUserId,
        userName: this.currentUserName,
        emoji,
        timestamp: new Date()
      });
    }

    message.syncStatus = 'pending';
    this.messages.set(messageId, message);
    await this.saveToDatabase('messages', message);

    this.emit('message_reaction_changed', { messageId, message });
    
    if (this.isOnline) {
      this.syncMessage(messageId);
    }
  }

  async markAsRead(conversationId: string, messageId?: string): Promise<void> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Mark conversation as read
    await this.updateConversation(conversationId, { unreadCount: 0 });

    // Mark specific message as read if provided
    if (messageId) {
      const message = this.messages.get(messageId);
      if (message) {
        const readEntry = {
          userId: this.currentUserId,
          userName: this.currentUserName,
          readAt: new Date()
        };

        if (!message.readBy.find(r => r.userId === this.currentUserId)) {
          message.readBy.push(readEntry);
          message.syncStatus = 'pending';
          
          this.messages.set(messageId, message);
          await this.saveToDatabase('messages', message);
        }
      }
    }

    this.emit('messages_read', { conversationId, messageId });
  }

  getMessages(conversationId: string, limit = 50, offset = 0): MessageMetadata[] {
    const messages = Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(offset, offset + limit);

    return messages;
  }

  getMessage(messageId: string): MessageMetadata | null {
    return this.messages.get(messageId) || null;
  }

  // Call Management

  async initiateCall(data: {
    participantIds: string[];
    type: CallType;
    conversationId?: string;
  }): Promise<string> {
    const callId = 'call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
    
    const call: CallMetadata = {
      id: callId,
      type: data.type,
      status: 'initiating',
      initiatorId: this.currentUserId,
      initiatorName: this.currentUserName,
      participants: data.participantIds.map(userId => ({
        userId,
        name: 'User ${userId}',
        isMuted: false,
        isVideoEnabled: data.type === 'video',
        isScreenSharing: false,
        connectionQuality: 'good'
      })),
      startTime: new Date(),
      isRecorded: false,
      quality: 'medium',
      organizationId: 'default',
      conversationId: data.conversationId,
      syncStatus: 'pending'
    };

    this.calls.set(callId, call);
    await this.saveToDatabase('calls', call);

    this.emit('call_initiated', { callId, call });

    return callId;
  }

  async updateCallStatus(callId: string, status: CallStatus): Promise<void> {
    const call = this.calls.get(callId);
    if (!call) {
      throw new Error('Call not found');
    }

    const updatedCall = {
      ...call,
      status,
      endTime: status === 'ended' ? new Date() : call.endTime,
      duration: status === 'ended' && call.startTime 
        ? Math.floor((new Date().getTime() - call.startTime.getTime()) / 1000)
        : call.duration,
      syncStatus: 'pending' as const
    };

    this.calls.set(callId, updatedCall);
    await this.saveToDatabase('calls', updatedCall);

    this.emit('call_status_changed', { callId, call: updatedCall });
  }

  async joinCall(callId: string): Promise<void> {
    const call = this.calls.get(callId);
    if (!call) {
      throw new Error('Call not found');
    }

    const participant = call.participants.find(p => p.userId === this.currentUserId);
    if (participant) {
      participant.joinTime = new Date();
    }

    await this.updateCallStatus(callId, 'connected');
    this.emit('call_joined', { callId, userId: this.currentUserId });
  }

  async leaveCall(callId: string): Promise<void> {
    const call = this.calls.get(callId);
    if (!call) {
      throw new Error('Call not found');
    }

    const participant = call.participants.find(p => p.userId === this.currentUserId);
    if (participant) {
      participant.leaveTime = new Date();
    }

    // If initiator leaves, end call for everyone
    if (call.initiatorId === this.currentUserId) {
      await this.updateCallStatus(callId, 'ended');
    }

    this.emit('call_left', { callId, userId: this.currentUserId });
  }

  getCalls(limit = 20): CallMetadata[] {
    return Array.from(this.calls.values())
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);
  }

  getCall(callId: string): CallMetadata | null {
    return this.calls.get(callId) || null;
  }

  // Template Management

  async createTemplate(data: {
    name: string;
    type: 'message' | 'email' | 'sms';
    subject?: string;
    content: string;
    variables: string[];
    category: string;
    organizationId?: string;
  }): Promise<string> {
    const templateId = 'tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
    
    const template: CommunicationTemplate = {
      id: templateId,
      name: data.name,
      type: data.type,
      subject: data.subject,
      content: data.content,
      variables: data.variables,
      category: data.category,
      isActive: true,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      organizationId: data.organizationId || 'default'
    };

    this.templates.set(templateId, template);
    await this.saveToDatabase('templates', template);

    this.emit('template_created', { templateId, template });

    return templateId;
  }

  async updateTemplate(templateId: string, updates: Partial<CommunicationTemplate>): Promise<void> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const updatedTemplate = {
      ...template,
      ...updates,
      updatedAt: new Date()
    };

    this.templates.set(templateId, updatedTemplate);
    await this.saveToDatabase('templates', updatedTemplate);

    this.emit('template_updated', { templateId, template: updatedTemplate });
  }

  async deleteTemplate(templateId: string): Promise<void> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    this.templates.delete(templateId);
    await this.deleteFromDatabase('templates', templateId);

    this.emit('template_deleted', { templateId });
  }

  getTemplates(type?: string, category?: string): CommunicationTemplate[] {
    return Array.from(this.templates.values())
      .filter(template => !type || template.type === type)
      .filter(template => !category || template.category === category)
      .filter(template => template.isActive)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  // Media and Attachment Management

  private async storeAttachment(file: File, attachmentId: string): Promise<string> {
    // In a real implementation, this would store the file in IndexedDB or similar
    const localPath = 'local://attachments/${attachmentId}';
    
    // Store file data in IndexedDB media store
    if (this.db) {
      const transaction = this.db.transaction(['media'], 'readwrite');
      const store = transaction.objectStore('media');
      
      await new Promise((resolve, reject) => {
        const request = store.put({
          id: attachmentId,
          messageId: ', // Will be set when message is saved
          file: file,
          localPath
        });
        request.onsuccess = () => resolve(undefined);
        request.onerror = () => reject(request.error);
      });
    }

    return localPath;
  }

  private getAttachmentType(mimeType: string): MessageAttachment['type'] {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'file';
  }

  private async shouldCompress(file: File): Promise<boolean> {
    const maxSize = 5 * 1024 * 1024; // 5MB
    return file.size > maxSize && (file.type.startsWith('image/') || file.type.startsWith('video/'));
  }

  // Helper Methods

  private getDefaultPermissions(conversationType: ConversationType): ParticipantPermissions {
    if (conversationType === 'direct') {
      return {
        canSendMessages: true,
        canSendMedia: true,
        canEditMessages: true,
        canDeleteMessages: true,
        canAddParticipants: false,
        canRemoveParticipants: false,
        canChangeSettings: false
      };
    }

    return {
      canSendMessages: true,
      canSendMedia: true,
      canEditMessages: true,
      canDeleteMessages: false,
      canAddParticipants: false,
      canRemoveParticipants: false,
      canChangeSettings: false
    };
  }

  private getDefaultConversationSettings(type: ConversationType): ConversationSettings {
    return {
      allowedMessageTypes: ['text', 'image', 'file', 'audio'],
      maxFileSize: 10 * 1024 * 1024, // 10MB
      requireApproval: false,
      allowReactions: true,
      allowEditing: true,
      allowForwarding: true,
      encryptionEnabled: false
    };
  }

  // Sync Operations

  private async syncConversation(conversationId: string): Promise<void> {
    // Implementation would sync conversation to server
    console.log('Syncing conversation:', conversationId);
  }

  private async syncMessage(messageId: string): Promise<void> {
    // Implementation would sync message to server
    const message = this.messages.get(messageId);
    if (message) {
      message.status = 'sent';
      message.syncStatus = 'synced';
      this.messages.set(messageId, message);
      await this.saveToDatabase('messages', message);
      
      this.emit('message_status_changed', { messageId, message });
    }
  }

  private async processPendingOperations(): Promise<void> {
    if (this.syncInProgress) return;
    
    this.syncInProgress = true;
    
    try {
      // Process pending messages
      for (const message of this.messageQueue) {
        await this.syncMessage(message.id);
      }
      this.messageQueue = [];

      // Process pending media
      for (const mediaItem of this.mediaQueue) {
        // Upload media files
        await this.uploadMediaAttachment(mediaItem);
      }
      this.mediaQueue = [];

      this.emit('sync_completed');
    } catch (error) {
      console.error('Sync failed:', error);
      this.emit('sync_failed', { error });
    } finally {
      this.syncInProgress = false;
    }
  }

  private async uploadMediaAttachment(mediaItem: { messageId: string; attachmentId: string; file: File }): Promise<void> {
    // Implementation would upload file to server
    console.log('Uploading media:', mediaItem.attachmentId);
  }

  // Statistics and Monitoring

  async getStatistics(organizationId?: string): Promise<CommunicationStats> {
    const conversations = Array.from(this.conversations.values())
      .filter(conv => !organizationId || conv.organizationId === organizationId);
    
    const messages = Array.from(this.messages.values())
      .filter(msg => !organizationId || msg.organizationId === organizationId);
    
    const calls = Array.from(this.calls.values())
      .filter(call => !organizationId || call.organizationId === organizationId);

    const unreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
    const activeConversations = conversations.filter(conv => !conv.isArchived).length;
    const callMinutes = calls.reduce((sum, call) => sum + (call.duration || 0), 0) / 60;

    // Calculate storage used
    const storageUsed = 0;
    for (const message of messages) {
      for (const attachment of message.attachments) {
        storageUsed += attachment.size;
      }
    }

    const pendingSync = messages.filter(msg => msg.syncStatus === 'pending').length;

    return {
      totalMessages: messages.length,
      unreadMessages: unreadCount,
      totalConversations: conversations.length,
      activeConversations,
      totalCalls: calls.length,
      callMinutes,
      storageUsed,
      lastSync: new Date(), // Would track actual last sync time
      pendingSync
    };
  }

  async getPendingSyncItems(): Promise<{
    messages: MessageMetadata[];
    conversations: ConversationMetadata[];
    calls: CallMetadata[];
  }> {
    const messages = Array.from(this.messages.values())
      .filter(msg => msg.syncStatus === 'pending');
    
    const conversations = Array.from(this.conversations.values())
      .filter(conv => conv.syncStatus === 'pending');
    
    const calls = Array.from(this.calls.values())
      .filter(call => call.syncStatus === 'pending');

    return { messages, conversations, calls };
  }

  // Cleanup

  private cleanup(): void {
    if (this.db) {
      this.db.close();
    }
  }

  public destroy(): void {
    this.cleanup();
    this.removeAllListeners();
    OfflineCommunicationManager.instance = null;
  }
}

// Factory function
export function createOfflineCommunicationManager(): OfflineCommunicationManager {
  return OfflineCommunicationManager.getInstance();
}

// React hook
export function useOfflineCommunication() {
  const manager = OfflineCommunicationManager.getInstance();
  
  return {
    // Conversation methods
    createConversation: manager.createConversation.bind(manager),
    updateConversation: manager.updateConversation.bind(manager),
    deleteConversation: manager.deleteConversation.bind(manager),
    getConversations: manager.getConversations.bind(manager),
    getConversation: manager.getConversation.bind(manager),
    
    // Message methods
    sendMessage: manager.sendMessage.bind(manager),
    editMessage: manager.editMessage.bind(manager),
    deleteMessage: manager.deleteMessage.bind(manager),
    reactToMessage: manager.reactToMessage.bind(manager),
    markAsRead: manager.markAsRead.bind(manager),
    getMessages: manager.getMessages.bind(manager),
    getMessage: manager.getMessage.bind(manager),
    
    // Call methods
    initiateCall: manager.initiateCall.bind(manager),
    updateCallStatus: manager.updateCallStatus.bind(manager),
    joinCall: manager.joinCall.bind(manager),
    leaveCall: manager.leaveCall.bind(manager),
    getCalls: manager.getCalls.bind(manager),
    getCall: manager.getCall.bind(manager),
    
    // Template methods
    createTemplate: manager.createTemplate.bind(manager),
    updateTemplate: manager.updateTemplate.bind(manager),
    deleteTemplate: manager.deleteTemplate.bind(manager),
    getTemplates: manager.getTemplates.bind(manager),
    
    // Statistics
    getStatistics: manager.getStatistics.bind(manager),
    getPendingSyncItems: manager.getPendingSyncItems.bind(manager),
    
    // Events
    on: manager.on.bind(manager),
    off: manager.off.bind(manager)
  };
}