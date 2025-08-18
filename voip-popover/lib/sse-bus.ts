/**
 * Simple in-memory SSE bus for room fanout.
 * Note: For production, replace with a durable pub/sub (Redis, etc.).
 */

type Client = {
  write: (data: string) => void
  close: () => void
}

type RoomMap = Map<string, Set<Client>>

declare global {
  // eslint-disable-next-line no-var
  var __V0_SSE_ROOMS__: RoomMap | undefined
}

const rooms: RoomMap = globalThis.__V0_SSE_ROOMS__ ?? new Map()
globalThis.__V0_SSE_ROOMS__ = rooms

export function subscribe(roomId: string, client: Client) {
  if (!rooms.has(roomId)) rooms.set(roomId, new Set())
  rooms.get(roomId)!.add(client)
  return () => {
    const set = rooms.get(roomId)
    if (!set) return
    set.delete(client)
    if (set.size === 0) rooms.delete(roomId)
  }
}

export function broadcast(roomId: string, payload: unknown) {
  const set = rooms.get(roomId)
  if (!set || set.size === 0) return 0
  const data = `data: ${JSON.stringify(payload)}\n\n`
  let delivered = 0
  for (const c of set) {
    try {
      c.write(data)
      delivered++
    } catch {
      // ignore
    }
  }
  return delivered
}
