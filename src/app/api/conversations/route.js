import { NextResponse } from "next/server"

// Mock conversation data for demo purposes
const MOCK_CONVERSATIONS = [
  {
    id: "conv-1",
    subject: "HVAC Service Inquiry",
    customerId: "cust-1", 
    participants: [
      { id: "cust-1", name: "John Smith", role: "customer", email: "john@example.com" },
      { id: "u1", name: "Alex Rivera", role: "agent", email: "alex@company.com" },
    ],
    labels: ["Support", "HVAC"],
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
    updatedAt: Date.now() - 30 * 60 * 1000,
    lastMessagePreview: "Thank you for the quick response. When can we schedule the service?",
    unreadFor: ["u1"],
    channels: ["email", "sms"],
  },
  {
    id: "conv-2",
    subject: "Plumbing Emergency",
    customerId: "cust-2",
    participants: [
      { id: "cust-2", name: "Sarah Johnson", role: "customer", email: "sarah@business.com" },
      { id: "u2", name: "Bri Chen", role: "agent", email: "bri@company.com" },
    ],
    labels: ["Emergency", "Plumbing"],
    createdAt: Date.now() - 4 * 60 * 60 * 1000,
    updatedAt: Date.now() - 10 * 60 * 1000,
    lastMessagePreview: "The technician is on the way. ETA 15 minutes.",
    unreadFor: [],
    channels: ["email", "whatsapp"],
  },
  {
    id: "conv-3",
    subject: "Quote Request - Commercial Installation",
    customerId: "cust-3",
    participants: [
      { id: "cust-3", name: "Mike Wilson", role: "customer", email: "mike@company.org" },
      { id: "u3", name: "Casey Green", role: "agent", email: "casey@company.com" },
    ],
    labels: ["Quote", "Commercial"],
    createdAt: Date.now() - 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 2 * 60 * 60 * 1000,
    lastMessagePreview: "I've reviewed the specifications and will send the quote by tomorrow.",
    unreadFor: ["u3"],
    channels: ["email"],
  },
]

const MOCK_MESSAGES = {
  "conv-1": [
    {
      id: "msg-1",
      conversationId: "conv-1",
      channel: "email",
      direction: "inbound",
      authorId: "cust-1",
      createdAt: Date.now() - 2 * 60 * 60 * 1000,
      text: "Hi, I need to schedule maintenance for my HVAC system. It's been making strange noises lately.",
      deliveryStatus: "delivered",
      external: { channel: "email", messageId: "ext-1" },
    },
    {
      id: "msg-2",
      conversationId: "conv-1",
      channel: "email",
      direction: "outbound",
      authorId: "u1",
      createdAt: Date.now() - 90 * 60 * 1000,
      text: "Thank you for reaching out! I can schedule a technician for this week. What days work best for you?",
      deliveryStatus: "delivered",
      external: { channel: "email", messageId: "ext-2" },
    },
    {
      id: "msg-3",
      conversationId: "conv-1",
      channel: "sms",
      direction: "inbound",
      authorId: "cust-1",
      createdAt: Date.now() - 30 * 60 * 1000,
      text: "Thank you for the quick response. When can we schedule the service?",
      deliveryStatus: "delivered",
      external: { channel: "sms", provider: "twilio", sid: "SMS123" },
    },
  ],
  "conv-2": [
    {
      id: "msg-4",
      conversationId: "conv-2",
      channel: "email",
      direction: "inbound",
      authorId: "cust-2",
      createdAt: Date.now() - 4 * 60 * 60 * 1000,
      text: "Emergency! We have a burst pipe in our office building. Need immediate assistance.",
      deliveryStatus: "delivered",
      external: { channel: "email", messageId: "ext-3" },
    },
    {
      id: "msg-5",
      conversationId: "conv-2",
      channel: "whatsapp",
      direction: "outbound",
      authorId: "u2",
      createdAt: Date.now() - 10 * 60 * 1000,
      text: "The technician is on the way. ETA 15 minutes.",
      deliveryStatus: "delivered",
      external: { channel: "whatsapp", provider: "twilio", sid: "WA123" },
    },
  ],
  "conv-3": [
    {
      id: "msg-6",
      conversationId: "conv-3",
      channel: "email",
      direction: "inbound",
      authorId: "cust-3",
      createdAt: Date.now() - 24 * 60 * 60 * 1000,
      text: "We need a quote for installing HVAC systems in our new commercial building. The specifications are attached.",
      deliveryStatus: "delivered",
      external: { channel: "email", messageId: "ext-4" },
    },
    {
      id: "msg-7",
      conversationId: "conv-3",
      channel: "email",
      direction: "outbound",
      authorId: "u3",
      createdAt: Date.now() - 2 * 60 * 60 * 1000,
      text: "I've reviewed the specifications and will send the quote by tomorrow.",
      deliveryStatus: "delivered",
      external: { channel: "email", messageId: "ext-5" },
    },
  ],
}

export async function GET() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return NextResponse.json({ 
      conversations: MOCK_CONVERSATIONS 
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    )
  }
}
