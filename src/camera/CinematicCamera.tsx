import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Quaternion, Vector3 } from 'three'
import { getAmbientScale, getAmbientTime } from '@/hooks/useAmbientLoop'
import { useSmoothValue } from '@/hooks/useSmoothValue'
import { useWorldStore } from '@/store/useWorldStore'
import { latLonToVec3, expDamp, shortestAngleDeltaDeg } from '@/lib/math/spherical'
import { avatarPose } from '@/systems/movement/avatarPose'
import {
  CAMERA_FOCUS_RADIUS,
  CAMERA_ORBIT_RADIUS,
  CAMERA_ORBIT_SPEED,
  CHASE_DISTANCE,
  CHASE_HEIGHT,
  PLANET_RADIUS,
} from '@/lib/constants'

/** Idle framing: a touch above center so the planet floats slightly
 *  low in frame with generous white sky above. */
const IDLE_LOOK = new Vector3(0, PLANET_RADIUS * 0.12, 0)
const WORLD_UP = new Vector3(0, 1, 0)

const _pos = new Vector3()
const _focusLook = new Vector3()
const _desiredOff = new Vector3()
const _currOff = new Vector3()
const _a = new Vector3()
const _b = new Vector3()
const _qArc = new Quaternion()
const _qStep = new Quaternion()
const _qIdentity = new Quaternion()

/**
 * The cinematic rig, in three moods:
 *
 * 1. Idle orbit (arriving, before focus): slow drift around the whole
 *    planet — the world turns beneath you.
 * 2. Focus (greeting): pushed in over the avatar's lat/lon, *in front*
 *    of the character so the hello is fully visible.
 * 3. Chase (idle/exploring): classic third-person — behind the avatar,
 *    slightly above, looking past their shoulder. The transition from
 *    front to back is an eased *arc around* the character, and
 *    camera.up follows the surface normal so the shot stays level
 *    anywhere on the sphere.
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
    const { cameraFocus: focus, phase } = useWorldStore.getState()

    // ---------- Chase mode: behind the avatar, slightly above ----------
    if (phase === 'idle' || phase === 'exploring') {
      const pose = avatarPose

      _desiredOff
        .copy(pose.up)
        .multiplyScalar(CHASE_HEIGHT)
        .addScaledVector(pose.forward, -CHASE_DISTANCE)

      // Ease the current offset toward the desired one *by arc*: rotate
      // its direction and damp its length separately, so the camera
      // swings around the character instead of cutting through them.
      _currOff.copy(camera.position).sub(pose.position)
      const currLen = Math.max(_currOff.length(), 1e-4)
      _a.copy(_currOff).divideScalar(currLen)
      _b.copy(_desiredOff).normalize()
      _qArc.setFromUnitVectors(_a, _b)
      _qStep.copy(_qIdentity).slerp(_qArc, 1 - Math.exp(-2.4 * dt))
      const newLen = expDamp(currLen, _desiredOff.length(), 2.4, dt)
      _a.applyQuaternion(_qStep).multiplyScalar(newLen)
      camera.position.copy(pose.position).add(_a)

      // Level the horizon against the local ground, not world Y.
      camera.up.lerp(pose.up, 1 - Math.exp(-3 * dt)).normalize()

      // Look just above the head and a step ahead of travel.
      _focusLook
        .copy(pose.position)
        .addScaledVector(pose.up, 0.78)
        .addScaledVector(pose.forward, 0.9 + pose.moving * 0.5)
      look.current.lerp(_focusLook, 1 - Math.exp(-4 * dt))
      camera.lookAt(look.current)

      // Keep the orbit state parked near the camera so a later mode
      // switch (e.g. focusing a location) starts from a sane place.
      lonRef.current = Math.atan2(camera.position.x, camera.position.z) * (180 / Math.PI)
      return
    }

    // ---------- Orbit / focus modes ------------------------------------
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
    camera.up.lerp(WORLD_UP, 1 - Math.exp(-3 * dt)).normalize()

    latLonToVec3(lat.value, lonRef.current, radius.value, _pos)
    camera.position.copy(_pos)
    camera.lookAt(look.current)
  })

  return null
}
