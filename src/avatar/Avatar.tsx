import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Group, Matrix4, MeshStandardMaterial, Vector3 } from 'three'
import { useWorldStore } from '@/store/useWorldStore'
import { expDamp } from '@/lib/math/spherical'
import { avatarPose } from '@/systems/movement/avatarPose'
import { getMoveInput } from '@/systems/movement/useMovementInput'
import {
  AVATAR_LAT,
  AVATAR_LON,
  PALETTE,
  PLANET_RADIUS,
  WALK_SPEED,
} from '@/lib/constants'

/**
 * The resident of the tiny world: an original character inspired by the
 * friendliness of classic plaza avatars — big head, small body, stubby
 * limbs, built entirely from primitives. All animation is procedural
 * (no rig): breathing, blinking, looking around, the arrival wave, and
 * the walk cycle are code-driven transforms in the frame loop.
 *
 * Movement: WASD/arrows, camera-relative, integrated as rotations of
 * the position vector around the planet — the avatar always walks a
 * great circle. Pose is published to `avatarPose` for the chase camera.
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
const HIP_Y = 0.23
const LEG_X = 0.07
const EYE_X = 0.088
const EYE_Y = 0.03

const REST_ARM_Z = 0.1 // arms hang slightly away from the body

const smoothstep = (a: number, b: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

// Scratch objects — the frame loop never allocates.
const _camFlat = new Vector3()
const _camRight = new Vector3()
const _moveDir = new Vector3()
const _axis = new Vector3()
const _right = new Vector3()
const _basis = new Matrix4()

/** Mutable animation state kept outside React. */
interface AvatarAnim {
  t: number
  blinkAt: number
  blinkT: number
  lookYaw: number
  lookPitch: number
  lookYawTarget: number
  lookPitchTarget: number
  nextLookAt: number
  waveT: number
  move: number
  stride: number
}

export function Avatar() {
  const camera = useThree((s) => s.camera)

  const placed = useRef<Group>(null)
  const bodyGroup = useRef<Group>(null)
  const head = useRef<Group>(null)
  const eyes = useRef<Group>(null)
  const armR = useRef<Group>(null)
  const armL = useRef<Group>(null)
  const legR = useRef<Group>(null)
  const legL = useRef<Group>(null)

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
    blinkAt: 1.6,
    blinkT: -1,
    lookYaw: 0,
    lookPitch: 0,
    lookYawTarget: 0,
    lookPitchTarget: 0,
    nextLookAt: 4,
    waveT: -1,
    move: 0,
    stride: 0,
  })

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    const a = anim.current
    a.t += dt
    const store = useWorldStore.getState()
    const { phase } = store
    const pose = avatarPose

    // ----- Arrival timeline -------------------------------------------
    if (phase === 'arriving') {
      if (a.t > 0.4 && store.cameraFocus === null) {
        store.setCameraFocus({ lat: AVATAR_LAT, lon: AVATAR_LON })
      }
      // Wave only once the camera has actually arrived in front (with a
      // timeout in case something holds it up) — never greet an empty sky.
      const cameraClose = camera.position.distanceTo(avatarPose.position) < 6.5
      if (a.t > 1.2 && (cameraClose || a.t > 6)) {
        store.setPhase('greeting')
        a.waveT = 0
      }
    }

    // ----- Movement input ----------------------------------------------
    const input = getMoveInput()
    const inputActive = input.x !== 0 || input.z !== 0
    if (phase === 'idle' && inputActive) store.setPhase('exploring')

    pose.up.copy(pose.position).normalize()

    let moveTarget = 0
    let steering = false
    if (phase === 'exploring' && inputActive) {
      // Camera-relative direction on the tangent plane: W walks away
      // from the camera, A/D strafe — the avatar turns to face travel.
      _camFlat.copy(pose.position).sub(camera.position)
      _camFlat.addScaledVector(pose.up, -_camFlat.dot(pose.up))
      if (_camFlat.lengthSq() > 1e-8) {
        _camFlat.normalize()
        // Screen-right is viewDir x up (up x viewDir points LEFT).
        _camRight.crossVectors(_camFlat, pose.up)
        _moveDir
          .set(0, 0, 0)
          .addScaledVector(_camFlat, input.z)
          .addScaledVector(_camRight, input.x)
        if (_moveDir.lengthSq() > 1e-8) {
          _moveDir.normalize()
          moveTarget = 1
          steering = true
        }
      }
    }
    a.move = expDamp(a.move, moveTarget, 8, dt)
    pose.moving = a.move

    // ----- Facing --------------------------------------------------------
    if (phase === 'arriving' || phase === 'greeting') {
      // Face the camera for the hello.
      _moveDir.copy(camera.position).sub(pose.position)
      _moveDir.addScaledVector(pose.up, -_moveDir.dot(pose.up))
      if (_moveDir.lengthSq() > 1e-8) {
        _moveDir.normalize()
        steering = true
      }
    }
    if (steering) {
      const lambda = phase === 'exploring' ? 10 : 4
      pose.forward.lerp(_moveDir, 1 - Math.exp(-lambda * dt))
    }
    // Keep forward a clean tangent regardless of what happened above.
    pose.forward.addScaledVector(pose.up, -pose.forward.dot(pose.up)).normalize()

    // ----- Integrate walking along a great circle -----------------------
    if (a.move > 0.003 && phase === 'exploring') {
      const angle = (WALK_SPEED * a.move * dt) / PLANET_RADIUS
      // Axis order matters: up × forward advances the position *along*
      // the facing direction (forward × up walks you backward).
      _axis.crossVectors(pose.up, pose.forward).normalize()
      pose.position.applyAxisAngle(_axis, angle)
      pose.position.setLength(PLANET_RADIUS)
      pose.up.copy(pose.position).normalize()
      pose.forward.addScaledVector(pose.up, -pose.forward.dot(pose.up)).normalize()
    }

    // ----- Write the root transform -------------------------------------
    if (placed.current) {
      _right.crossVectors(pose.up, pose.forward)
      _basis.makeBasis(_right, pose.up, pose.forward)
      placed.current.position.copy(pose.position)
      placed.current.quaternion.setFromRotationMatrix(_basis)
    }

    // ----- Walk cycle + breathing ---------------------------------------
    a.stride += dt * 11 * a.move
    const swing = Math.sin(a.stride) * 0.55 * a.move
    if (legL.current && legR.current) {
      legL.current.rotation.x = swing
      legR.current.rotation.x = -swing
    }
    if (bodyGroup.current) {
      const breath = Math.sin(a.t * 2.0) * 0.014 * (1 - a.move)
      bodyGroup.current.scale.set(1 - breath * 0.5, 1 + breath, 1 - breath * 0.5)
      // Step bounce while walking, lazy sway while standing.
      bodyGroup.current.position.y = Math.abs(Math.sin(a.stride)) * 0.03 * a.move
      bodyGroup.current.rotation.z = Math.sin(a.t * 0.7) * 0.015 * (1 - a.move)
      bodyGroup.current.rotation.x = 0.09 * a.move // gentle forward lean
    }

    // ----- Blinking ------------------------------------------------------
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

    // ----- Head: glance around when standing, steady otherwise ----------
    if (head.current) {
      if (phase !== 'greeting' && a.move < 0.2 && a.t >= a.nextLookAt) {
        const wander = Math.random() < 0.75
        a.lookYawTarget = wander ? (Math.random() * 2 - 1) * 0.5 : 0
        a.lookPitchTarget = wander ? (Math.random() - 0.5) * 0.22 : 0
        a.nextLookAt = a.t + 2.2 + Math.random() * 3
      }
      const steady = phase === 'greeting' || a.move >= 0.2
      const yawT = steady ? 0 : a.lookYawTarget
      const pitchT = phase === 'greeting' ? -0.06 : steady ? 0 : a.lookPitchTarget
      a.lookYaw = expDamp(a.lookYaw, yawT, 5, dt)
      a.lookPitch = expDamp(a.lookPitch, pitchT, 5, dt)
      head.current.rotation.y = a.lookYaw
      head.current.rotation.x = a.lookPitch + Math.sin(a.t * 1.3) * 0.012
      head.current.rotation.z = 0
    }

    // ----- Arms: wave during the greeting, swing while walking ----------
    if (armR.current && armL.current) {
      let raise = 0
      let wag = 0
      if (a.waveT >= 0) {
        a.waveT += dt
        raise = smoothstep(0, 0.45, a.waveT) * (1 - smoothstep(1.9, 2.4, a.waveT))
        wag = Math.sin(a.waveT * 9) * 0.35 * smoothstep(0.35, 0.55, a.waveT) * raise
        if (a.waveT > 2.5) {
          a.waveT = -1
          if (useWorldStore.getState().phase === 'greeting') {
            store.setPhase('idle')
            store.setCameraFocus(null) // hand the camera to the chase rig
          }
        }
      }
      const armSwing = Math.sin(a.stride + Math.PI) * 0.4 * a.move
      armR.current.rotation.z = -(REST_ARM_Z + raise * 2.2)
      armR.current.rotation.x = a.waveT >= 0 ? wag : armSwing
      armL.current.rotation.z = REST_ARM_Z + Math.sin(a.t * 2.0 + 1.2) * 0.03 * (1 - a.move)
      armL.current.rotation.x = -armSwing
      if (head.current) head.current.rotation.z = raise * 0.14
    }
  })

  return (
    <group ref={placed}>
      <group ref={bodyGroup}>
        {/* Legs (groups pivot at the hip so steps are rotations) */}
        <group ref={legL} position={[-LEG_X, HIP_Y, 0]}>
          <mesh material={materials.pants} position={[0, -0.11, 0]} castShadow>
            <capsuleGeometry args={[LEG_R, LEG_LEN, 4, 10]} />
          </mesh>
        </group>
        <group ref={legR} position={[LEG_X, HIP_Y, 0]}>
          <mesh material={materials.pants} position={[0, -0.11, 0]} castShadow>
            <capsuleGeometry args={[LEG_R, LEG_LEN, 4, 10]} />
          </mesh>
        </group>

        {/* Torso */}
        <mesh material={materials.shirt} position={[0, TORSO_Y, 0]} castShadow>
          <capsuleGeometry args={[TORSO_R, TORSO_LEN, 4, 14]} />
        </mesh>

        {/* Arms (groups pivot at the shoulder) */}
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
  )
}
