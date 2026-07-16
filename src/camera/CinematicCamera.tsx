import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { getAmbientScale, getAmbientTime } from '@/hooks/useAmbientLoop'
import { useSmoothValue } from '@/hooks/useSmoothValue'
import { useWorldStore } from '@/store/useWorldStore'
import { latLonToVec3, shortestAngleDeltaDeg } from '@/lib/math/spherical'
import {
  CAMERA_FOCUS_RADIUS,
  CAMERA_ORBIT_RADIUS,
  CAMERA_ORBIT_SPEED,
  PLANET_RADIUS,
} from '@/lib/constants'

/** Idle framing: a touch above center so the planet floats slightly
 *  low in frame with generous white sky above. */
const IDLE_LOOK = new Vector3(0, PLANET_RADIUS * 0.12, 0)

const _pos = new Vector3()
const _focusLook = new Vector3()

/**
 * The cinematic rig.
 *
 * Idle mode (cameraFocus === null): a slow, continuous drift around the
 * whole planet — the world turns beneath you.
 *
 * Focus mode: pushes in over the focused point (the avatar, or later a
 * location) and holds a gently breathing over-the-shoulder-of-the-sky
 * shot. Every quantity — longitude, latitude, distance, look target —
 * is individually eased, so mode changes are one long smooth move.
 */
export function CinematicCamera() {
  const camera = useThree((s) => s.camera)

  const lonRef = useRef(-30)
  const lat = useSmoothValue(24, 1.2)
  const radius = useSmoothValue(CAMERA_ORBIT_RADIUS, 1.0)
  const look = useRef(IDLE_LOOK.clone())

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    const t = getAmbientTime()
    const focus = useWorldStore.getState().cameraFocus

    let latTarget: number
    let radiusTarget: number
    let lookTarget: Vector3

    if (focus === null) {
      // Idle drift: constant slow orbit + breathing tilt.
      lonRef.current +=
        CAMERA_ORBIT_SPEED * getAmbientScale() * dt * (180 / Math.PI) * 0.35
      latTarget = 24 + Math.sin(t * 0.11) * 7
      radiusTarget = CAMERA_ORBIT_RADIUS * (1 + Math.sin(t * 0.07) * 0.02)
      lookTarget = IDLE_LOOK
    } else {
      // Focused: settle over the point, with a gentle lateral sway so
      // the shot never feels locked off.
      const lonTarget = focus.lon + Math.sin(t * 0.06) * 5
      lonRef.current +=
        shortestAngleDeltaDeg(lonRef.current, lonTarget) *
        (1 - Math.exp(-1.4 * dt))
      latTarget = focus.lat + 13 + Math.sin(t * 0.1) * 2
      radiusTarget = CAMERA_FOCUS_RADIUS * (1 + Math.sin(t * 0.07) * 0.015)
      lookTarget = latLonToVec3(focus.lat, focus.lon, PLANET_RADIUS + 0.55, _focusLook)
    }

    lat.update(latTarget, dt)
    radius.update(radiusTarget, dt)
    look.current.lerp(lookTarget, 1 - Math.exp(-1.8 * dt))

    latLonToVec3(lat.value, lonRef.current, radius.value, _pos)
    camera.position.copy(_pos)
    camera.lookAt(look.current)
  })

  return null
}
