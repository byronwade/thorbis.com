/**
 * Realtime client that prefers SSE (EventSource) with BroadcastChannel fallback.
 */

export type RTUser = {
  id: string
  name: string
  role: "CSR" | "Supervisor"
}

export type RTEvent =
  | { type: "presence:join"; payload: { user: RTUser } }
  | { type: "presence:leave"; payload: { userId: string } }
  | { type: "typing"; payload: { user: RTUser; typing: boolean } }
  | { type: "suggestion"; payload: { user: RTUser; text: string } }
  | {
      type: "profile:update"
      payload: { reviewStars?: number | null; maintenancePlan?: string | null; reviewDateISO?: string | null }
    }

export type RTMessage = RTEvent & {
  senderId: string
  ts: number
}

export type RealtimeClient = {
  roomId: string
  selfId: string
  on: (handler: (msg: RTMessage) => void) => () => void
  emit: (event: RTEvent) => void
  close: () => void
}

function getOrCreateSelfId() {
  if (typeof window === "undefined") return "ssr"
  try {
    const k = "voip:self"
    let id = window.sessionStorage.getItem(k)
    if (!id) {
      id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      window.sessionStorage.setItem(k, id)
    }
    return id
  } catch {
    return `${Date.now()}-${Math.random()}`
  }
}

function createSSEClient(roomId: string): RealtimeClient {
  const selfId = getOrCreateSelfId()
  const base = `/api/rt/${encodeURIComponent(roomId)}`
  const handlers = new Set<(msg: RTMessage) => void>()
  let es: EventSource | null = null

  function on(handler: (msg: RTMessage) => void) {
    handlers.add(handler)
    return () => handlers.delete(handler)
  }

  function connect() {
    if (typeof window === "undefined") return
    try {
      es?.close()
    } catch {}
    es = new EventSource(`${base}/sse`)
    es.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data) as RTMessage
        handlers.forEach((h) => h(msg))
      } catch {}
    }
    es.onerror = () => {
      // browser will auto-reconnect
    }
  }

  function emit(event: RTEvent) {
    const body: RTMessage = { ...event, senderId: selfId, ts: Date.now() }
    fetch(`${base}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => {})
  }

  function close() {
    try {
      es?.close()
    } catch {}
    handlers.clear()
  }

  if (typeof window !== "undefined") connect()
  return { roomId, selfId, on, emit, close }
}

function createBroadcastClient(roomId: string): RealtimeClient {
  const selfId = getOrCreateSelfId()
  const ch = typeof window !== "undefined" ? new BroadcastChannel(`voip:room:${roomId}`) : null
  const handlers = new Set<(msg: RTMessage) => void>()

  function on(handler: (msg: RTMessage) => void) {
    handlers.add(handler)
    return () => handlers.delete(handler)
  }
  function emit(event: RTEvent) {
    if (!ch) return
    const msg: RTMessage = { ...event, senderId: selfId, ts: Date.now() }
    ch.postMessage(msg)
  }
  function close() {
    try {
      ch?.close()
    } catch {}
    handlers.clear()
  }
  if (ch) {
    ch.onmessage = (ev) => {
      const msg = ev.data as RTMessage
      handlers.forEach((h) => h(msg))
    }
  }
  return { roomId, selfId, on, emit, close }
}

export function createRealtimeClient(roomId: string): RealtimeClient {
  if (typeof window !== "undefined" && "EventSource" in window) return createSSEClient(roomId)
  return createBroadcastClient(roomId)
}
