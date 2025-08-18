import { subscribe } from "@/lib/sse-bus"

export async function GET(req: Request, { params }: { params: { room: string } }) {
  const roomId = decodeURIComponent(params.room)
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()
  const enc = new TextEncoder()

  const write = (s: string) => writer.write(enc.encode(s))
  const close = () => writer.close()

  // Register client
  const unsub = subscribe(roomId, { write, close })

  // Initial hello
  write(`data: ${JSON.stringify({ type: "hello", ts: Date.now() })}\n\n`)

  // Heartbeat
  const heartbeat = setInterval(() => {
    try {
      write(`: ping\n\n`)
    } catch {}
  }, 15000)

  const signal = (req as any).signal as AbortSignal | undefined
  const onAbort = () => {
    clearInterval(heartbeat)
    try {
      unsub()
    } catch {}
    try {
      close()
    } catch {}
  }
  if (signal) {
    if (signal.aborted) onAbort()
    signal.addEventListener("abort", onAbort, { once: true })
  }

  return new Response(stream.readable, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
