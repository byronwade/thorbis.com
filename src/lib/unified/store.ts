import type { Conversation, Message, Participant, ChannelType, Message as MessageType } from "./types"

let conversations: Conversation[] = []
let messagesByConv: Record<string, Message[]> = {}

function nowMinus(ms: number) {
  return Date.now() - ms
}

// Seed demo data for one unified conversation
function seed() {
  if (conversations.length) return
  const customer: Participant = {
    id: "cust1",
    name: "Pat Jones",
    role: "customer",
    email: "pat@example.com",
    phone: "+1-555-0100",
  }
  const agentAlex: Participant = { id: "u1", name: "Alex Rivera", role: "agent", email: "alex@acme.co" }
  const agentBri: Participant = { id: "u2", name: "Bri Chen", role: "agent", email: "bri@acme.co" }

  const convId = "c1"
  const subject = "Refund request for order #1041"
  const conv: Conversation = {
    id: convId,
    subject,
    customerId: customer.id,
    participants: [customer, agentAlex, agentBri],
    labels: ["Support", "Priority"],
    createdAt: nowMinus(3 * 24 * 60 * 60 * 1000),
    updatedAt: nowMinus(15 * 60 * 1000),
    lastMessagePreview: "Thanks — sending a replacement today.",
    unreadFor: [],
    channels: ["email", "webchat", "sms"],
  }

  const msgs: Message[] = [
    {
      id: "m1",
      conversationId: convId,
      channel: "webchat",
      direction: "inbound",
      authorId: customer.id,
      createdAt: nowMinus(3 * 24 * 60 * 60 * 1000),
      text: "Hi, I requested a refund for #1041 — any update?",
      deliveryStatus: "delivered",
      readReceipts: [{ by: "u1", ts: nowMinus(3 * 24 * 60 * 60 * 1000 - 2 * 60 * 1000) }],
      external: { channel: "webchat", sessionId: "wc_8f3a", widgetId: "widget_main", page: "/orders/1041" },
    },
    {
      id: "m2",
      conversationId: convId,
      channel: "email",
      direction: "inbound",
      authorId: customer.id,
      createdAt: nowMinus(2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      text: "Following up via email — can you confirm the refund timeline?",
      deliveryStatus: "delivered",
      external: {
        channel: "email",
        messageId: "<CAF_abc123@mx.example.com>",
        threadId: "<thread_ref_1041>",
        headers: { "In-Reply-To": "<initial@mx.example.com>" },
      },
    },
    {
      id: "m3",
      conversationId: convId,
      channel: "internal",
      direction: "internal",
      authorId: "u1",
      createdAt: nowMinus(2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
      text: "Checked OMS: item eligible. Preparing replacement shipment.",
      deliveryStatus: "none",
      external: { channel: "internal", noteType: "private" },
    },
    {
      id: "m4",
      conversationId: convId,
      channel: "email",
      direction: "outbound",
      authorId: "u1",
      createdAt: nowMinus(2 * 24 * 60 * 60 * 1000 + 80 * 60 * 1000),
      text: "Hi Pat — refund is approved. We can issue refund or ship a replacement — your preference?",
      deliveryStatus: "delivered",
      readReceipts: [{ by: "customer", ts: nowMinus(2 * 24 * 60 * 60 * 1000 + 70 * 60 * 1000) }],
      external: { channel: "email", messageId: "<reply_abc@mx.acme.co>", threadId: "<thread_ref_1041>" },
    },
    {
      id: "m5",
      conversationId: convId,
      channel: "sms",
      direction: "outbound",
      authorId: "u2",
      createdAt: nowMinus(1 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      text: "ACME: Hi Pat, following up on #1041 via SMS. We can ship a replacement today — reply YES to confirm.",
      deliveryStatus: "delivered",
      external: { channel: "sms", provider: "twilio", sid: "SMxxxxxxxx1" },
    },
    {
      id: "m6",
      conversationId: convId,
      channel: "sms",
      direction: "inbound",
      authorId: customer.id,
      createdAt: nowMinus(1 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000),
      text: "YES, please ship a replacement.",
      deliveryStatus: "delivered",
      readReceipts: [{ by: "u2", ts: nowMinus(1 * 24 * 60 * 60 * 1000 + 24 * 60 * 1000) }],
      external: { channel: "sms", provider: "twilio", sid: "SMxxxxxxxx2" },
    },
    {
      id: "m7",
      conversationId: convId,
      channel: "email",
      direction: "outbound",
      authorId: "u2",
      createdAt: nowMinus(15 * 60 * 1000),
      text: "Thanks — sending a replacement today.",
      deliveryStatus: "delivered",
      external: { channel: "email", messageId: "<last_abc@mx.acme.co>", threadId: "<thread_ref_1041>" },
    },
  ]

  conversations.push(conv)
  messagesByConv[convId] = msgs
}
seed()

export function listConversations(): Conversation[] {
  return conversations
    .slice()
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

export function getConversation(id: string): Conversation | undefined {
  return conversations.find((c) => c.id === id)
}

export function listMessages(conversationId: string): Message[] {
  return (messagesByConv[conversationId] ?? []).slice().sort((a, b) => a.createdAt - b.createdAt)
}

export function appendMessage(
  conversationId: string,
  input: Omit<MessageType, "id" | "createdAt" | "deliveryStatus" | "conversationId">
): MessageType {
  const c = getConversation(conversationId)
  if (!c) throw new Error("Conversation not found")
  const id = "m" + Math.random().toString(36).slice(2)
  const msg: MessageType = {
    ...input,
    id,
    conversationId,
    createdAt: Date.now(),
    deliveryStatus: input.channel === "internal" ? "none" : "sent",
  }
  messagesByConv[conversationId] = [...(messagesByConv[conversationId] || []), msg]
  c.updatedAt = msg.createdAt
  c.lastMessagePreview = (msg.text ?? "").slice(0, 180)
  if (!c.channels.includes(msg.channel)) c.channels.push(msg.channel)
  return msg
}
