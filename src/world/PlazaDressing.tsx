import { Lamppost } from '@/world/Lamppost'
import { Bench } from '@/world/Bench'

/**
 * Dressing scattered across the OPEN plaza floor — not clustered onto
 * any one landmark's platform. Positions are hand-placed in the gaps
 * between pods and along the front apron, echoing the reference's
 * natural, distributed planting rather than one lamppost-per-pod.
 *
 * Flowers live only on grass now (the island domes + the centerpiece).
 * The old loose FLOWER_TUFTS sat on bare tile and read as litter — Peter
 * had them removed; the plaza floor stays clean white.
 */
/** Only in the gaps BETWEEN pods. The front-apron pair that used to sit
 *  at [±3.4, 2.3] was removed (Peter, 2026-07-29): they flanked the
 *  avatar's spawn at (0, 2.6) and read as two posts standing guard over
 *  the visitor the moment the world opened. `OBSTACLES` in
 *  systems/collision.ts derives from this list, so their collision
 *  circles went with them. */
export const LAMPPOSTS: [number, number][] = [
  [-6.95, -3.65], // between About and Projects
  [-4.35, -7.3], // between Projects and Experience
  [4.35, -7.3], // between Skills and Contact
  [6.95, -3.65], // between Contact and Resume
]

/** Bench position + yaw (faces the plaza center, like the pods). */
export const BENCH: { x: number; z: number } = { x: -4.35, z: -6.5 }

export function PlazaDressing() {
  const benchYaw = Math.atan2(-BENCH.x, -BENCH.z)
  return (
    <>
      {LAMPPOSTS.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <Lamppost />
        </group>
      ))}
      <group position={[BENCH.x, 0, BENCH.z]} rotation-y={benchYaw}>
        <Bench />
      </group>
    </>
  )
}
