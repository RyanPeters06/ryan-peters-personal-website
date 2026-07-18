import { useMemo } from 'react'
import { Quaternion, Vector3 } from 'three'

export interface FlatPlacement {
  /** World position at (x, altitude, z) on the flat plaza floor. */
  position: Vector3
  /** Identity orientation — the ground has no curvature, so "standing
   *  up" needs no rotation. Callers add their own facing (yaw) on top. */
  quaternion: Quaternion
}

/**
 * Place something on (or above) the flat plaza floor, in world-space
 * XZ coordinates. Y is always "up" and the ground is always flat.
 *
 * ```tsx
 * const { position, quaternion } = useFlatPosition(3, -8)
 * return <group position={position} quaternion={quaternion}>…</group>
 * ```
 */
export function useFlatPosition(x: number, z: number, altitude = 0): FlatPlacement {
  return useMemo(
    () => ({
      position: new Vector3(x, altitude, z),
      quaternion: new Quaternion(),
    }),
    [x, z, altitude],
  )
}
