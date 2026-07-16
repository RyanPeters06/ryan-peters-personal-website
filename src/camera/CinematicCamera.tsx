import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { getAmbientScale, getAmbientTime } from '@/hooks/useAmbientLoop'
import { useSmoothValue } from '@/hooks/useSmoothValue'
import { useWorldStore } from '@/store/useWorldStore'
import { latLonToVec3 } from '@/lib/math/spherical'
import {
  CAMERA_ORBIT_RADIUS,
  CAMERA_ORBIT_SPEED,
  PLANET_RADIUS,
} from '@/lib/constants'

/** Where the camera looks: a touch above center so the planet floats
 *  slightly low in frame with generous white sky above. */
const LOOK_TARGET = new Vector3(0, PLANET_RADIUS * 0.12, 0)

const _pos = new Vector3()

/**
 * The cinematic rig.
 *
 * Idle mode (cameraFocus === null): a slow, continuous drift around the
 * planet with gentle vertical breathing — the world turns beneath you.
 *
 * Focus mode (later milestones): eases toward the stored lat/lon so the
 * camera can follow the avatar or frame a location. The easing built
 * here is the same path both modes travel — nothing ever snaps.
 */
export function CinematicCamera() {
  const camera = useThree((s) => s.camera)

  // Orbit state, all eased. Longitude accumulates forever in idle mode.
  const lonRef = useRef(-30)
  const lat = useSmoothValue(24, 1.2)
  const radius = useSmoothValue(CAMERA_ORBIT_RADIUS, 1.2)

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    const t = getAmbientTime()
    const focus = useWorldStore.getState().cameraFocus

    let latTarget: number
    if (focus === null) {
      // Idle drift: constant slow orbit + breathing tilt.
      lonRef.current += CAMERA_ORBIT_SPEED * getAmbientScale() * dt * (180 / Math.PI) * 0.35
      latTarget = 24 + Math.sin(t * 0.11) * 7
    } else {
      // Future: settle over the focused point (avatar / location).
      lonRef.current = focus.lon
      latTarget = focus.lat + 18
    }

    lat.update(latTarget, dt)
    radius.update(CAMERA_ORBIT_RADIUS * (1 + Math.sin(t * 0.07) * 0.02), dt)

    latLonToVec3(lat.value, lonRef.current, radius.value, _pos)
    camera.position.copy(_pos)
    camera.lookAt(LOOK_TARGET)
  })

  return null
}
