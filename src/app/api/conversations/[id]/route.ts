import { NextResponse } from "next/server"
import { getConversation, listMessages, appendMessage } from "@/lib/unified/store"
import type { ChannelType, Direction, Message } from "@/lib/unified/types"

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const { id } = ctx.params
  const conv = getConversation(id)
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const messages = listMessages(id)
  return NextResponse.json({ conversation: conv, messages })
}

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const { id } = ctx.params
  try {
    const body = await req.json()
    const {
      channel,
      direction,
      authorId,
      text,
      attachments,
      external,
    } = body as {
      channel: ChannelType
      direction: Direction
      authorId?: string
      text?: string
      attachments?: Message["attachments"]
      external: Message["external"]
    }

    const msg = appendMessage(id, {
      channel,
      direction,
      authorId,
      text,
      attachments,
      external,
      readReceipts: [],
    })
    return NextResponse.json({ message: msg })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to append message" }, { status: 400 })
  }
}
