import { NextResponse } from "next/server"

// Simple deterministic pseudo-random based on string
function seedFromString(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
  }
  return h >>> 0
}
function rnd(seed: number) {
  // xorshift32
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
  const address = (searchParams.get("address") || "").trim()
  if (!address) {
    return NextResponse.json({ error: "address required" }, { status: 400 })
  }

  const seed = seedFromString(address.toLowerCase())
  const rand = rnd(seed)

  const beds = 2 + Math.floor(rand() * 4) // 2-5
  const baths = 1 + Math.floor(rand() * 3) // 1-3
  const sqft = 900 + Math.floor(rand() * 3500)
  const year = 1955 + Math.floor(rand() * 65)
  const lot = 2500 + Math.floor(rand() * 15000)
  const zestimate = 400_000 + Math.floor(rand() * 1_200_000)
  const conf = 0.6 + rand() * 0.35
  const soldYear = 2005 + Math.floor(rand() * 19)
  const soldPrice = Math.max(180_000, Math.floor(zestimate * (0.45 + rand() * 0.2)))

  const zUrl = `https://www.zillow.com/homes/${encodeURIComponent(address)}`
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
  const image = `/placeholder.svg?height=100&width=140&query=modern%20home%20exterior%20front`

  return NextResponse.json({
    address,
    zestimate,
    confidence: Math.min(0.95, conf),
    beds,
    baths,
    sqft,
    year,
    lotSizeSqft: lot,
    lastSold: `${soldYear}`,
    lastSoldPrice: soldPrice,
    image,
    zillowUrl: zUrl,
    mapsUrl: maps,
  })
}
