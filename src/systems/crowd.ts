import { Vector3 } from 'three'

/**
 * Crowd avoidance — the dynamic counterpart to `collision.ts` (which is
 * the static plaza props). Every villager registers a live agent here so
 * each one can see the others: villagers separate so they never overlap
 * or walk through each other, and they STEP ASIDE for the player (the
 * player yields to no one — the crowd parts around it), so the player
 * never overlaps a villager yet is never blocked by one.
 */
export interface CrowdAgent {
  id: number
  /** LIVE reference to the agent's position (mutated in place), so the
   *  registry always reflects current positions with no per-frame copy. */
  pos: Vector3
  radius: number
}

export const crowdAgents: CrowdAgent[] = []

export function registerAgent(a: CrowdAgent): void {
  crowdAgents.push(a)
}

export function unregisterAgent(id: number): void {
  const i = crowdAgents.findIndex((a) => a.id === id)
  if (i >= 0) crowdAgents.splice(i, 1)
}

/**
 * Push `pos` away from a point until they're at least `minDist` apart,
 * taking `share` of the correction (1 = move all the way out, 0.5 = the
 * two bodies meet halfway). XZ only; mutates `pos`. Returns true if it
 * pushed (i.e. they were overlapping).
 */
export function separate(
  pos: Vector3,
  ox: number,
  oz: number,
  minDist: number,
  share: number,
): boolean {
  let dx = pos.x - ox
  let dz = pos.z - oz
  let d2 = dx * dx + dz * dz
  if (d2 >= minDist * minDist) return false
  // Exactly coincident: pick an arbitrary direction to avoid /0.
  if (d2 < 1e-6) {
    dx = 0.7
    dz = 0.2
    d2 = dx * dx + dz * dz
  }
  const d = Math.sqrt(d2)
  const push = ((minDist - d) * share) / d
  pos.x += dx * push
  pos.z += dz * push
  return true
}
