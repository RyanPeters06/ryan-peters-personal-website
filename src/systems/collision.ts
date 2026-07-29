import { Vector3 } from 'three'
import { LOCATIONS } from '@/content/locations'
import { LAMPPOSTS, BENCH } from '@/world/PlazaDressing'

/**
 * Plaza collision — the solid things a mover can't walk through.
 *
 * The world is flat and everything solid reads as a raised mass on the
 * floor, so collision is a cheap set of vertical CYLINDERS (circles in
 * XZ): the six raised grass islands, the centerpiece planter, each
 * lamppost, and the bench. The player and the villagers walk the plaza
 * floor AROUND these — after each integration step we push the mover
 * back out of any circle it penetrated, so it slides along the boundary
 * instead of clipping through (no pathfinding needed for a plaza this
 * open). Proximity cards still fire: a pod's enter distance (3.4) is
 * larger than its footprint, so you trigger it standing in front.
 */
export interface Obstacle {
  x: number
  z: number
  r: number
}

// Footprint radii — sized so a mover's BODY doesn't clip onto the raised
// grass/base (the old 1.7 let bodies overlap the grass edge by ~0.2u).
// Follows POD.base (2026-07-29: the islands were deepened to fit the
// trees behind the panels, so the walkable exclusion grew with them).
const ISLAND_R = 2.05
const CENTER_R = 1.4
const LAMP_R = 0.22
const BENCH_R = 0.55

export const OBSTACLES: Obstacle[] = [
  ...LOCATIONS.map((l) => ({ x: l.x, z: l.z, r: ISLAND_R })),
  { x: 0, z: 0, r: CENTER_R },
  ...LAMPPOSTS.map(([x, z]) => ({ x, z, r: LAMP_R })),
  { x: BENCH.x, z: BENCH.z, r: BENCH_R },
]

/**
 * Push `pos` out of any obstacle it penetrates (XZ only), accounting for
 * the mover's own radius. Mutates `pos`. Returns true if it had to move
 * the position (i.e. a collision was resolved this step) — callers use
 * that to know a mover is blocked.
 */
export function resolveCollision(pos: Vector3, selfRadius: number): boolean {
  let hit = false
  for (let i = 0; i < OBSTACLES.length; i++) {
    const o = OBSTACLES[i]
    let dx = pos.x - o.x
    let dz = pos.z - o.z
    const min = o.r + selfRadius
    let d2 = dx * dx + dz * dz
    if (d2 >= min * min) continue
    // Dead-center: nudge out along an arbitrary axis to avoid /0.
    if (d2 < 1e-6) {
      dx = 1
      dz = 0
      d2 = 1
    }
    const d = Math.sqrt(d2)
    const push = (min - d) / d
    pos.x += dx * push
    pos.z += dz * push
    hit = true
  }
  return hit
}
