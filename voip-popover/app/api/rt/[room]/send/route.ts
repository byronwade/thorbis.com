import { broadcast } from "@/lib/sse-bus"

export async function POST(req: Request, { params }: { params: { room: string } }) {
  const roomId = decodeURIComponent(params.room)
  const body = await req.json().catch(() => null)

  if (!body || typeof body !== "object" || !("type" in body)) {
    return new Response(JSON.stringify({ error: "invalid message" }), { status: 400 })
  }

  const delivered = broadcast(roomId, body)
  return new Response(JSON.stringify({ ok: true, delivered }), { status: 200 })
}
