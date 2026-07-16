import { useMemo } from 'react'
import { Quaternion, Vector3 } from 'three'
import { latLonToVec3, surfaceQuaternion } from '@/lib/math/spherical'
import { PLANET_RADIUS } from '@/lib/constants'

export interface SphericalPlacement {
  /** World position at the requested lat/lon/altitude. */
  position: Vector3
  /** Orientation whose +Y is the outward surface normal — "standing up". */
  quaternion: Quaternion
}

/**
 * Place something on (or above) the planet surface.
 *
 * ```tsx
 * const { position, quaternion } = useSphericalPosition(12, -40)
 * return <group position={position} quaternion={quaternion}>…</group>
 * ```
 */
export function useSphericalPosition(
  lat: number,
  lon: number,
  altitude = 0,
): SphericalPlacement {
  return useMemo(() => {
    const position = latLonToVec3(lat, lon, PLANET_RADIUS + altitude)
    const quaternion = surfaceQuaternion(position)
    return { position, quaternion }
  }, [lat, lon, altitude])
}
