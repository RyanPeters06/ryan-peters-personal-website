import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Group, MeshStandardMaterial, Vector3 } from 'three'
import { useSphericalPosition } from '@/hooks/useSphericalPosition'
import { useWorldStore } from '@/store/useWorldStore'
import { expDamp } from '@/lib/math/spherical'
import { AVATAR_LAT, AVATAR_LON, PALETTE } from '@/lib/constants'

/**
 * The resident of the tiny world: an original character inspired by the
 * friendliness of classic plaza avatars — big head, small body, stubby
 * limbs, built entirely from primitives. All animation is procedural
 * (no rig): breathing, blinking, looking around, and the arrival wave
 * are code-driven transforms in the frame loop, so the character never
 * holds perfectly still.
 */

// --- Proportions (world units; ~1.05 tall ≈ 1.2 floor tiles) ---------
const HEAD_R = 0.26
const HEAD_Y = 0.76
const TORSO_R = 0.155
const TORSO_LEN = 0.2
const TORSO_Y = 0.36
const ARM_R = 0.048
const ARM_LEN = 0.15
const SHOULDER_X = 0.19
const SHOULDER_Y = 0.45
const LEG_R = 0.055
const LEG_LEN = 0.11
const LEG_X = 0.07
const LEG_Y = 0.12
const EYE_X = 0.088
const EYE_Y = 0.03

const REST_ARM_Z = 0.1 // arms hang slightly away from the body

const smoothstep = (a: number, b: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

const _camLocal = new Vector3()

/** Mutable animation state kept outside React. */
interface AvatarAnim {
  t: number
  yaw: number
  blinkAt: number
  blinkT: number
  lookYaw: number
  lookPitch: number
  lookYawTarget: number
  lookPitchTarget: number
  nextLookAt: number
  waveT: number
}

export function Avatar() {
  const { position, quaternion } = useSphericalPosition(AVATAR_LAT, AVATAR_LON)
  const camera = useThree((s) => s.camera)

  const placed = useRef<Group>(null)
  const yawGroup = useRef<Group>(null)
  const breathGroup = useRef<Group>(null)
  const head = useRef<Group>(null)
  const eyes = useRef<Group>(null)
  const armR = useRef<Group>(null)
  const armL = useRef<Group>(null)

  const materials = useMemo(
    () => ({
      skin: new MeshStandardMaterial({ color: PALETTE.skin, roughness: 0.9 }),
      hair: new MeshStandardMaterial({ color: PALETTE.hair, roughness: 0.95 }),
      shirt: new MeshStandardMaterial({ color: PALETTE.shirt, roughness: 0.9 }),
      pants: new MeshStandardMaterial({ color: PALETTE.pants, roughness: 0.9 }),
      face: new MeshStandardMaterial({ color: PALETTE.face, roughness: 0.8 }),
    }),
    [],
  )

  const anim = useRef<AvatarAnim>({
    t: 0,
    yaw: 0,
    blinkAt: 1.6,
    blinkT: -1,
    lookYaw: 0,
    lookPitch: 0,
    lookYawTarget: 0,
    lookPitchTarget: 0,
    nextLookAt: 4,
    waveT: -1,
  })

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    const a = anim.current
    a.t += dt
    const { phase, setPhase, setCameraFocus, cameraFocus } =
      useWorldStore.getState()

    // ----- Arrival timeline -------------------------------------------
    if (phase === 'arriving') {
      // A breath of far-orbit calm, then the camera pushes in…
      if (a.t > 1.0 && cameraFocus === null) {
        setCameraFocus({ lat: AVATAR_LAT, lon: AVATAR_LON })
      }
      // …and once it has (mostly) settled, say hello.
      if (a.t > 3.4) {
        setPhase('greeting')
        a.waveT = 0
      }
    }

    // ----- Face the camera (always, gently) ---------------------------
    if (placed.current && yawGroup.current) {
      _camLocal.copy(camera.position)
      placed.current.worldToLocal(_camLocal)
      const yawTarget = Math.atan2(_camLocal.x, _camLocal.z)
      // Turn quickly while greeting, lazily during idle life.
      const lambda = phase === 'greeting' ? 4 : 0.9
      a.yaw = expDamp(a.yaw, yawTarget, lambda, dt)
      yawGroup.current.rotation.y = a.yaw
    }

    // ----- Breathing (always) -----------------------------------------
    if (breathGroup.current) {
      const breath = Math.sin(a.t * 2.0) * 0.014
      breathGroup.current.scale.set(1 - breath * 0.5, 1 + breath, 1 - breath * 0.5)
      breathGroup.current.rotation.z = Math.sin(a.t * 0.7) * 0.015
    }

    // ----- Blinking ----------------------------------------------------
    if (eyes.current) {
      if (a.blinkT < 0 && a.t >= a.blinkAt) a.blinkT = 0
      if (a.blinkT >= 0) {
        a.blinkT += dt
        const p = a.blinkT / 0.13
        eyes.current.scale.y = 1 - 0.92 * Math.sin(Math.min(p, 1) * Math.PI)
        if (p >= 1) {
          a.blinkT = -1
          a.blinkAt = a.t + 2 + Math.random() * 3.5
        }
      }
    }

    // ----- Head: look around during idle, steady while greeting -------
    if (head.current) {
      if (phase === 'idle' && a.t >= a.nextLookAt) {
        // Mostly glance somewhere, occasionally return to center.
        const wander = Math.random() < 0.75
        a.lookYawTarget = wander ? (Math.random() * 2 - 1) * 0.5 : 0
        a.lookPitchTarget = wander ? (Math.random() - 0.5) * 0.22 : 0
        a.nextLookAt = a.t + 2.2 + Math.random() * 3
      }
      const yawT = phase === 'greeting' ? 0 : a.lookYawTarget
      const pitchT = phase === 'greeting' ? -0.06 : a.lookPitchTarget
      a.lookYaw = expDamp(a.lookYaw, yawT, 5, dt)
      a.lookPitch = expDamp(a.lookPitch, pitchT, 5, dt)
      head.current.rotation.y = a.lookYaw
      head.current.rotation.x = a.lookPitch + Math.sin(a.t * 1.3) * 0.012
      head.current.rotation.z = 0
    }

    // ----- The wave ----------------------------------------------------
    if (armR.current && armL.current) {
      let raise = 0
      let wag = 0
      if (a.waveT >= 0) {
        a.waveT += dt
        raise = smoothstep(0, 0.45, a.waveT) * (1 - smoothstep(1.9, 2.4, a.waveT))
        wag =
          Math.sin(a.waveT * 9) * 0.35 * smoothstep(0.35, 0.55, a.waveT) * raise
        if (a.waveT > 2.5) {
          a.waveT = -1
          if (useWorldStore.getState().phase === 'greeting') setPhase('idle')
        }
      }
      // Right arm raises up beside the head; a happy head-tilt rides along.
      armR.current.rotation.z = -(REST_ARM_Z + raise * 2.2)
      armR.current.rotation.x = wag
      armL.current.rotation.z = REST_ARM_Z + Math.sin(a.t * 2.0 + 1.2) * 0.03
      if (head.current) head.current.rotation.z = raise * 0.14
    }
  })

  return (
    <group ref={placed} position={position} quaternion={quaternion}>
      <group ref={yawGroup}>
        <group ref={breathGroup}>
          {/* Legs */}
          <mesh material={materials.pants} position={[-LEG_X, LEG_Y, 0]} castShadow>
            <capsuleGeometry args={[LEG_R, LEG_LEN, 4, 10]} />
          </mesh>
          <mesh material={materials.pants} position={[LEG_X, LEG_Y, 0]} castShadow>
            <capsuleGeometry args={[LEG_R, LEG_LEN, 4, 10]} />
          </mesh>

          {/* Torso */}
          <mesh material={materials.shirt} position={[0, TORSO_Y, 0]} castShadow>
            <capsuleGeometry args={[TORSO_R, TORSO_LEN, 4, 14]} />
          </mesh>

          {/* Arms (groups pivot at the shoulder so waving is a rotation) */}
          <group ref={armL} position={[-SHOULDER_X, SHOULDER_Y, 0]} rotation={[0, 0, REST_ARM_Z]}>
            <mesh material={materials.shirt} position={[0, -ARM_LEN / 2 - ARM_R, 0]} castShadow>
              <capsuleGeometry args={[ARM_R, ARM_LEN, 4, 10]} />
            </mesh>
          </group>
          <group ref={armR} position={[SHOULDER_X, SHOULDER_Y, 0]} rotation={[0, 0, -REST_ARM_Z]}>
            <mesh material={materials.shirt} position={[0, -ARM_LEN / 2 - ARM_R, 0]} castShadow>
              <capsuleGeometry args={[ARM_R, ARM_LEN, 4, 10]} />
            </mesh>
          </group>

          {/* Head */}
          <group ref={head} position={[0, HEAD_Y, 0]}>
            <mesh material={materials.skin} castShadow>
              <sphereGeometry args={[HEAD_R, 24, 18]} />
            </mesh>

            {/* Hair: a squashed cap shifted up-and-back, leaving the face open */}
            <mesh material={materials.hair} position={[0, 0.075, -0.045]} scale={[1.04, 0.82, 1.04]}>
              <sphereGeometry args={[HEAD_R * 0.98, 24, 18]} />
            </mesh>

            {/* Eyes (group origin at eye height so blinks squash in place) */}
            <group ref={eyes} position={[0, EYE_Y, 0]}>
              <mesh material={materials.face} position={[-EYE_X, 0, HEAD_R * 0.88]} scale={[1, 1.35, 0.6]}>
                <sphereGeometry args={[0.028, 10, 10]} />
              </mesh>
              <mesh material={materials.face} position={[EYE_X, 0, HEAD_R * 0.88]} scale={[1, 1.35, 0.6]}>
                <sphereGeometry args={[0.028, 10, 10]} />
              </mesh>
            </group>

            {/* Nose: the tiniest bump */}
            <mesh material={materials.skin} position={[0, -0.03, HEAD_R * 0.97]}>
              <sphereGeometry args={[0.022, 10, 8]} />
            </mesh>

            {/* Smile: a thin torus arc hugging the lower face */}
            <mesh
              material={materials.face}
              position={[0, -0.075, HEAD_R * 0.86]}
              rotation={[0.35, 0, Math.PI + (Math.PI - Math.PI * 0.62) / 2]}
            >
              <torusGeometry args={[0.062, 0.009, 8, 24, Math.PI * 0.62]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}
