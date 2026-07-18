import { useMemo } from 'react'
import { Vector3 } from 'three'
import { Villager, VILLAGER_HAIR, VILLAGER_SHIRTS } from '@/world/Villager'
import type { VillagerSpec } from '@/world/Villager'
import { LOCATIONS } from '@/content/locations'

/**
 * The plaza crowd: ~24 villagers (player-height) living across the
 * flat plaza floor. Most gather in little chatting circles (facing
 * each other); everyone takes occasional slow strolls between the
 * world's destinations — circle members walk out, pause, and walk
 * home again, so the plaza constantly, gently reshuffles. Deterministic
 * seed — the same crowd greets every visitor.
 */

/** Deterministic [0,1) sequence (same recipe as Clouds). */
function makeRng(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 19487171) % 2147483647
    return (s & 0xffff) / 0x10000
  }
}

/** Chat circles: all staged inside the tableau frame, scattered
 *  between the fountain and the landmark arc like the reference. */
const GROUPS: { x: number; z: number; size: number }[] = [
  { x: 3.0, z: -3.0, size: 3 },
  { x: -3.5, z: -2.0, size: 2 },
  { x: -5.5, z: -4.5, size: 3 },
  { x: 5.0, z: -5.5, size: 3 },
  { x: 4.0, z: -1.0, size: 2 },
  { x: -4.0, z: -6.0, size: 2 },
  { x: 0.5, z: -2.5, size: 2 },
]

/** How far chat-circle members stand from their center, world units. */
const CHAT_RADIUS = 0.75

function createCrowd(): VillagerSpec[] {
  const rng = makeRng(31415926)
  const specs: VillagerSpec[] = []
  let id = 0

  // Destinations wanderers stroll between: pods + chat circles.
  const pois = [
    ...LOCATIONS.map((l) => ({ x: l.x, z: l.z })),
    ...GROUPS.map((g) => ({ x: g.x, z: g.z })),
  ]

  const make = (
    x: number,
    z: number,
    chatCenter: Vector3 | null,
    wanderer: boolean,
  ): VillagerSpec => ({
    id: id++,
    x,
    z,
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
    const center = new Vector3(g.x, 0, g.z)
    const startAngle = rng() * Math.PI * 2
    for (let m = 0; m < g.size; m++) {
      const a = startAngle + (m / g.size) * Math.PI * 2
      const r = CHAT_RADIUS * (0.9 + rng() * 0.3)
      specs.push(make(g.x + Math.cos(a) * r, g.z + Math.sin(a) * r, center, false))
    }
  }

  // Wanderers: strolling the open plaza between the arc and the front.
  const wanderSpots = [
    { x: 2.0, z: 2.0 },
    { x: -2.5, z: 1.5 },
    { x: 6.5, z: -3.5 },
    { x: -6.5, z: -3.0 },
    { x: 0, z: -5.0 },
    { x: -1.5, z: 3.0 },
  ]
  for (const w of wanderSpots) {
    specs.push(make(w.x + (rng() - 0.5) * 1.5, w.z + (rng() - 0.5) * 1.5, null, true))
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
