import { useFrame } from '@react-three/fiber'
import { updateProximity } from '@/systems/proximity'

/**
 * Runs the landmark-proximity director once per frame.
 *
 * Mounted once, inside the Canvas. It exists only so the single shared
 * update has a frame loop to live in — all the reasoning is in
 * `systems/proximity.ts`. This replaces the six per-pod proximity checks
 * that used to fight each other.
 */
export function ProximityDirector() {
  useFrame((_, rawDt) => updateProximity(Math.min(rawDt, 0.1)))
  return null
}
