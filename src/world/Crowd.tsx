import { useMemo } from 'react'
import { Vector3 } from 'three'
import { Villager, VILLAGER_HAIR, VILLAGER_SHIRTS, VILLAGER_PANTS } from '@/world/Villager'
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

/** Chat circles: sparse and spread across the OPEN plaza (front and
 *  sides), deliberately clear of the dead center — the fountain (0,0)
 *  and the player's spawn (0, 2.6) stay open so the crowd never piles
 *  on the hero. Matches the reference's scattered, un-clustered plaza. */
const GROUPS: { x: number; z: number; size: number }[] = [
  { x: -4.6, z: 1.6, size: 3 },
  { x: 4.7, z: 2.0, size: 2 },
  { x: -3.0, z: 4.2, size: 2 },
  { x: 3.4, z: 4.4, size: 2 },
  { x: 6.0, z: -1.2, size: 2 },
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
    pants: Math.floor(rng() * VILLAGER_PANTS.length),
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

  // Wanderers: a few strolling the open plaza, kept off the hero's spot.
  // Pulled the two front wanderers back (z 5.8/5.6 -> 4.9) so no one
  // looms in the very-foreground corners of the fixed frame.
  const wanderSpots = [
    { x: -6.2, z: 0.5 },
    { x: 5.4, z: -3.4 },
    { x: -1.8, z: 4.9 },
    { x: 2.4, z: 4.9 },
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
