import { NextResponse } from "next/server"
import { listConversations } from "@/lib/unified/store"

export async function GET() {
  const data = listConversations()
  return NextResponse.json({ conversations: data })
}
