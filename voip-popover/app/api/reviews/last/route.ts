import { NextResponse } from "next/server"

// Deterministic seed from string
function seedFromString(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
  }
  return h >>> 0
}
function rnd(seed: number) {
  let x = seed || 1
  return () => {
    x ^= x << 13
    x ^= x >>> 17
    x ^= x << 5
    return (x >>> 0) / 4294967295
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const accountId = (searchParams.get("accountId") || "").trim()
  if (!accountId) return NextResponse.json({ error: "accountId required" }, { status: 400 })

  const r = rnd(seedFromString(accountId))
  // Bias toward 4.7–5.0 stars, occasionally perfect 5
  const stars = Math.round((4.6 + r() * 0.4) * 10) / 10
  const daysAgo = Math.floor(r() * 30)
  const date = new Date(Date.now() - daysAgo * 86400000)
  const dateISO = date.toISOString()

  return NextResponse.json({ stars, dateISO })
}
