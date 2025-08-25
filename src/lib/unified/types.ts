export type ChannelType = "email" | "sms" | "webchat" | "whatsapp" | "teams" | "internal"

export type Direction = "inbound" | "outbound" | "internal" // internal for staff notes

export type DeliveryStatus = "queued" | "sent" | "delivered" | "read" | "failed" | "none"

export type ReadReceipt = {
  by: string // user id or "customer"
  ts: number
}

export type ChannelMetadata =
  | {
      channel: "email"
      messageId: string
      threadId?: string
      headers?: Record<string, string>
    }
  | {
      channel: "sms"
      provider: "twilio"
      sid: string
      price?: number
    }
  | {
      channel: "webchat"
      sessionId: string
      widgetId?: string
      page?: string
    }
  | {
      channel: "whatsapp"
      provider: "twilio"
      sid: string
    }
  | {
    channel: "teams"
    teamId: string
    channelId: string
    messageId: string
  }
  | {
    channel: "internal"
    noteType?: "private" | "public"
  }

export type AttachmentMeta = {
  id: string
  name: string
  type: string
  size: number
  url?: string // preview
}

export type Participant = {
  id: string
  name: string
  role?: "customer" | "agent" | "system"
  email?: string
  phone?: string
}

export type Message = {
  id: string
  conversationId: string
  channel: ChannelType
  direction: Direction
  authorId?: string // participant id; undefined for system
  createdAt: number
  text?: string
  attachments?: AttachmentMeta[]
  deliveryStatus: DeliveryStatus
  readReceipts?: ReadReceipt[]
  external: ChannelMetadata
}

export type Conversation = {
  id: string
  subject: string
  customerId: string
  participants: Participant[]
  labels: string[]
  createdAt: number
  updatedAt: number
  lastMessagePreview: string
  unreadFor?: string[] // participant ids who have unread
  channels: ChannelType[] // union of channels present
}
