import { useMemo } from 'react'
import { Vector3 } from 'three'
import { Villager, VILLAGER_HAIR, VILLAGER_SHIRTS } from '@/world/Villager'
import type { VillagerSpec } from '@/world/Villager'
import { LOCATIONS } from '@/content/locations'
import { latLonToVec3 } from '@/lib/math/spherical'
import { PLANET_RADIUS } from '@/lib/constants'

/**
 * The plaza crowd: ~24 villagers (player-height) living across the
 * planet. Most gather in little chatting circles (facing each other);
 * everyone takes occasional slow strolls between the world's
 * destinations — circle members walk out, pause, and walk home again,
 * so the plaza constantly, gently reshuffles. Deterministic seed —
 * the same crowd greets every visitor.
 */

/** Deterministic [0,1) sequence (same recipe as Clouds). */
function makeRng(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 19487171) % 2147483647
    return (s & 0xffff) / 0x10000
  }
}

/** Chat circles: where they stand and how many gather. The first two
 *  sit near the spawn crown so the world feels inhabited immediately. */
const GROUPS: { lat: number; lon: number; size: number }[] = [
  { lat: 68, lon: 14, size: 3 },
  { lat: 64, lon: -16, size: 2 },
  { lat: 55, lon: 8, size: 4 },
  { lat: 35, lon: 75, size: 3 },
  { lat: 8, lon: -115, size: 2 },
  { lat: -28, lon: 155, size: 3 },
  { lat: -55, lon: 45, size: 2 },
]

/** How far chat-circle members stand from their center, world units. */
const CHAT_RADIUS = 0.75
/** Degrees of arc per world unit on this planet. */
const DEG_PER_UNIT = 180 / (Math.PI * PLANET_RADIUS)

function createCrowd(): VillagerSpec[] {
  const rng = makeRng(31415926)
  const specs: VillagerSpec[] = []
  let id = 0

  // Destinations wanderers stroll between: pods + chat circles + squares.
  const pois = [
    ...LOCATIONS.map((l) => ({ lat: l.lat, lon: l.lon })),
    ...GROUPS.map((g) => ({ lat: g.lat, lon: g.lon })),
    { lat: 45, lon: -60 },
    { lat: -10, lon: 20 },
    { lat: 20, lon: 170 },
  ]

  const make = (
    lat: number,
    lon: number,
    chatCenter: Vector3 | null,
    wanderer: boolean,
  ): VillagerSpec => ({
    id: id++,
    lat,
    lon,
    // Same height as the player, with a whisper of natural variation.
    scale: 0.96 + rng() * 0.08,
    hair: Math.floor(rng() * VILLAGER_HAIR.length),
    shirt: Math.floor(rng() * VILLAGER_SHIRTS.length),
    chatCenter,
    wanderer,
    seed: rng(),
    pois,
  })

  // Chat circles: members ring the center, facing inward.
  for (const g of GROUPS) {
    const center = latLonToVec3(g.lat, g.lon, PLANET_RADIUS)
    const startAngle = rng() * Math.PI * 2
    for (let m = 0; m < g.size; m++) {
      const a = startAngle + (m / g.size) * Math.PI * 2
      const r = CHAT_RADIUS * (0.9 + rng() * 0.3)
      specs.push(
        make(
          g.lat + Math.cos(a) * r * DEG_PER_UNIT,
          g.lon + (Math.sin(a) * r * DEG_PER_UNIT) / Math.max(0.25, Math.cos((g.lat * Math.PI) / 180)),
          center,
          false,
        ),
      )
    }
  }

  // Wanderers: a few near the crown, the rest scattered.
  const wanderSpots = [
    { lat: 71, lon: 30 },
    { lat: 58, lon: -35 },
    { lat: 44, lon: 120 },
    { lat: 15, lon: -30 },
    { lat: -5, lon: 80 },
    { lat: -40, lon: -100 },
  ]
  for (const w of wanderSpots) {
    specs.push(make(w.lat + (rng() - 0.5) * 6, w.lon + (rng() - 0.5) * 6, null, true))
  }

  return specs
}

export function Crowd() {
  const specs = useMemo(createCrowd, [])
  return (
    <>
      {specs.map((spec) => (
        <Villager key={spec.id} spec={spec} />
      ))}
    </>
  )
}
