"use client"

import { Badge } from "@components/ui/badge"
import { Mail, MessageSquare, Smartphone, MessageCircle, Users, ReplyIcon as Comment } from 'lucide-react'
import { cn } from "@lib/utils"
import type { ChannelType } from "@lib/unified/types"

export function ChannelBadge({ channel, className }: { channel: ChannelType; className?: string }) {
  const { label, Icon, cls } = map(channel)
  return (
    <Badge variant="outline" className={cn("h-5 gap-1 px-1.5 text-[10px]", cls, className)}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  )
}

function map(channel: ChannelType) {
  switch (channel) {
    case "email":
      return { label: "Email", Icon: Mail, cls: "border-slate-300" }
    case "sms":
      return { label: "SMS", Icon: Smartphone, cls: "border-emerald-300 text-emerald-700" }
    case "webchat":
      return { label: "Web Chat", Icon: MessageSquare, cls: "border-indigo-300 text-indigo-700" }
    case "whatsapp":
      return { label: "WhatsApp", Icon: MessageCircle, cls: "border-green-300 text-green-700" }
    case "teams":
      return { label: "Teams", Icon: Users, cls: "border-purple-300 text-purple-700" }
    case "internal":
      return { label: "Internal", Icon: Comment, cls: "border-amber-300 text-amber-700" }
  }
}
