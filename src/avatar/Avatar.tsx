import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { DoubleSide, Group, Matrix4, MeshStandardMaterial, Vector3 } from 'three'
import { useWorldStore } from '@/store/useWorldStore'
import { expDamp } from '@/lib/math/spherical'
import { avatarPose } from '@/systems/movement/avatarPose'
import { getMoveInput } from '@/systems/movement/useMovementInput'
import {
  PALETTE,
  PLANET_RADIUS,
  TABLEAU_WALK_LIMIT_DEG,
  WALK_SPEED,
} from '@/lib/constants'

/**
 * The resident of the tiny world — an original character that speaks
 * the visual language of classic plaza avatars without copying one:
 * the head is ~58% of total height, the body a short tapered cylinder,
 * the limbs thin capsules ending in oversized rounded shoes, and the
 * face sits low on the head. Everything is primitives; all animation
 * is procedural (breathing, blinking, glances, foot shifts, the wave,
 * and the walk cycle are code-driven transforms in the frame loop).
 *
 * Movement: WASD/arrows, camera-relative, integrated as rotations of
 * the position vector around the planet — the avatar always walks a
 * great circle. Pose is published to `avatarPose` for the chase camera.
 */

// --- Proportions (world units; ~0.96 tall, head ≈ 0.58 of it) --------
// Phase-7 silhouette: a chunky, plump hoodie body under the big head —
// stable, huggable, toddler-plush — with stubby legs and white sneakers.
const HEAD_R = 0.28
const HEAD_Y = 0.68
const BODY_R = 0.155 // plump capsule torso (the hoodie)
const BODY_LEN = 0.2
const BODY_Y = 0.34
const ARM_R = 0.035
const ARM_LEN = 0.13
const SHOULDER_X = 0.16
const SHOULDER_Y = 0.42
const LEG_R = 0.034
const LEG_LEN = 0.045
const HIP_Y = 0.17
const LEG_X = 0.065
const EYE_X = 0.095
const EYE_Y = -0.02 // below head center — the face sits low
const MOUTH_Y = -0.115

const REST_ARM_Z = 0.12 // arms hang slightly away from the body

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
const _worldY = new Vector3(0, 1, 0)

/** Mutable animation state kept outside React. */
interface AvatarAnim {
  t: number
  /** When the 'arriving' phase began (the title can last any time). */
  arriveT0: number
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
  shiftAt: number
  shiftT: number
  shiftSide: number
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
      // Premium molded plastic: smooth and slightly glossy, never matte.
      skin: new MeshStandardMaterial({ color: PALETTE.skin, roughness: 0.6 }),
      hair: new MeshStandardMaterial({
        color: PALETTE.hair,
        roughness: 0.7,
        side: DoubleSide,
      }),
      shirt: new MeshStandardMaterial({ color: PALETTE.shirt, roughness: 0.55 }),
      pants: new MeshStandardMaterial({ color: PALETTE.pants, roughness: 0.65 }),
      shoe: new MeshStandardMaterial({ color: PALETTE.shoe, roughness: 0.55 }),
      face: new MeshStandardMaterial({ color: PALETTE.face, roughness: 0.55 }),
    }),
    [],
  )

  const anim = useRef<AvatarAnim>({
    t: 0,
    arriveT0: -1,
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
    shiftAt: 6,
    shiftT: -1,
    shiftSide: 1,
  })

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    const a = anim.current
    a.t += dt
    const store = useWorldStore.getState()
    const { phase } = store
    const pose = avatarPose

    // ----- Arrival timeline (clock starts when the title gives way) ----
    // The tableau camera is fixed, so the greeting needs no distance
    // gate: a short beat after the title dissolves, he turns to the
    // visitor and waves.
    if (phase === 'arriving') {
      if (a.arriveT0 < 0) a.arriveT0 = a.t
      if (a.t - a.arriveT0 > 0.9) {
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

      // Tableau leash: the stage ends where the frame does. If the walk
      // strays past the staged plaza, slide the position back toward
      // the pole by the excess arc — a soft invisible boundary.
      const polar = Math.acos(
        Math.min(1, Math.max(-1, pose.position.y / PLANET_RADIUS)),
      )
      const maxPolar = (TABLEAU_WALK_LIMIT_DEG * Math.PI) / 180
      if (polar > maxPolar) {
        // pos × Y rotated positively moves the position toward the pole.
        _axis.crossVectors(pose.position, _worldY).normalize()
        pose.position.applyAxisAngle(_axis, polar - maxPolar)
        pose.position.setLength(PLANET_RADIUS)
      }

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

    // ----- Foot shifts: tiny weight transfers while standing ------------
    let shiftLift = 0
    let shiftSway = 0
    const standing = phase !== 'greeting' && a.move < 0.05
    if (standing && a.shiftT < 0 && a.t >= a.shiftAt) {
      a.shiftT = 0
      a.shiftSide *= -1
    }
    if (a.shiftT >= 0) {
      a.shiftT += dt
      const p = a.shiftT / 0.55
      const pulse = Math.sin(Math.min(p, 1) * Math.PI)
      shiftLift = pulse * 0.22 * (1 - a.move)
      shiftSway = a.shiftSide * pulse * 0.012 * (1 - a.move)
      if (p >= 1) {
        a.shiftT = -1
        a.shiftAt = a.t + 3.5 + Math.random() * 4
      }
    }

    // ----- Walk cycle + breathing ---------------------------------------
    a.stride += dt * 11 * a.move
    const swing = Math.sin(a.stride) * 0.55 * a.move
    if (legL.current && legR.current) {
      legL.current.rotation.x = swing + (a.shiftSide < 0 ? shiftLift : 0)
      legR.current.rotation.x = -swing + (a.shiftSide > 0 ? shiftLift : 0)
    }
    if (bodyGroup.current) {
      const breath = Math.sin(a.t * 2.0) * 0.016 * (1 - a.move)
      bodyGroup.current.scale.set(1 - breath * 0.5, 1 + breath, 1 - breath * 0.5)
      // Chunky step bounce while walking, lazy sway while standing.
      bodyGroup.current.position.y = Math.abs(Math.sin(a.stride)) * 0.04 * a.move
      bodyGroup.current.position.x = shiftSway
      // The whole body rolls gently side to side with the stride — the
      // waddle that makes the plump silhouette read alive and friendly.
      bodyGroup.current.rotation.z =
        Math.sin(a.stride) * 0.05 * a.move +
        Math.sin(a.t * 0.7) * 0.015 * (1 - a.move)
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

    // ----- Arms: one-arm wave during the greeting, swing while walking --
    // Rotation sign convention: for the RIGHT arm (at +x), a POSITIVE
    // z-rotation swings the hanging arm outward/up away from the body;
    // for the left arm it's negative. (Getting this backwards folds the
    // arm invisibly *into* the torso — the classic hidden-wave bug.)
    if (armR.current && armL.current) {
      let raise = 0
      let wag = 0
      if (a.waveT >= 0) {
        a.waveT += dt
        // Raise the right arm up beside the head, wave the hand a few
        // times side to side, then lower with follow-through.
        raise = smoothstep(0, 0.4, a.waveT) * (1 - smoothstep(2.0, 2.5, a.waveT))
        wag = Math.sin(a.waveT * 9) * 0.3 * smoothstep(0.35, 0.5, a.waveT) * raise
        if (a.waveT > 2.6) {
          a.waveT = -1
          if (useWorldStore.getState().phase === 'greeting') {
            store.setPhase('idle')
            store.setCameraFocus(null) // hand the camera to the chase rig
          }
        }
      }
      const armSwing = Math.sin(a.stride + Math.PI) * 0.4 * a.move
      const idleSway = Math.sin(a.t * 2.0 + 1.2) * 0.03 * (1 - a.move)
      armR.current.rotation.z = REST_ARM_Z + raise * 2.1 + wag
      armL.current.rotation.z = -(REST_ARM_Z + idleSway)
      armR.current.rotation.x = a.waveT >= 0 ? 0 : armSwing
      armL.current.rotation.x = -armSwing
      // The head tilts happily toward the waving arm.
      if (head.current) head.current.rotation.z = -raise * 0.12
    }
  })

  return (
    <group ref={placed}>
      <group ref={bodyGroup}>
        {/* Legs: stubby, ending in oversized rounded shoes */}
        <group ref={legL} position={[-LEG_X, HIP_Y, 0]}>
          <mesh material={materials.pants} position={[0, -0.08, 0]} castShadow>
            <capsuleGeometry args={[LEG_R, LEG_LEN, 4, 10]} />
          </mesh>
          <mesh
            material={materials.shoe}
            position={[0, -0.14, 0.03]}
            scale={[0.095, 0.055, 0.14]}
            castShadow
          >
            <sphereGeometry args={[1, 16, 12]} />
          </mesh>
        </group>
        <group ref={legR} position={[LEG_X, HIP_Y, 0]}>
          <mesh material={materials.pants} position={[0, -0.08, 0]} castShadow>
            <capsuleGeometry args={[LEG_R, LEG_LEN, 4, 10]} />
          </mesh>
          <mesh
            material={materials.shoe}
            position={[0, -0.14, 0.03]}
            scale={[0.095, 0.055, 0.14]}
            castShadow
          >
            <sphereGeometry args={[1, 16, 12]} />
          </mesh>
        </group>

        {/* Body: one plump capsule — the hoodie. Chunky and stable,
            slightly squashed so it reads soft, not tubular. */}
        <mesh
          material={materials.shirt}
          position={[0, BODY_Y, 0]}
          scale={[1.05, 1, 0.92]}
          castShadow
        >
          <capsuleGeometry args={[BODY_R, BODY_LEN, 6, 18]} />
        </mesh>
        {/* The hood: a soft bump on the upper back, same pour. */}
        <mesh
          material={materials.shirt}
          position={[0, BODY_Y + 0.16, -0.1]}
          scale={[1.25, 0.8, 0.7]}
        >
          <sphereGeometry args={[0.105, 16, 12]} />
        </mesh>

        {/* Arms: thin rounded capsules (groups pivot at the shoulder) */}
        <group ref={armL} position={[-SHOULDER_X, SHOULDER_Y, 0]} rotation={[0, 0, -REST_ARM_Z]}>
          <mesh material={materials.shirt} position={[0, -ARM_LEN / 2 - ARM_R, 0]} castShadow>
            <capsuleGeometry args={[ARM_R, ARM_LEN, 4, 10]} />
          </mesh>
        </group>
        <group ref={armR} position={[SHOULDER_X, SHOULDER_Y, 0]} rotation={[0, 0, REST_ARM_Z]}>
          <mesh material={materials.shirt} position={[0, -ARM_LEN / 2 - ARM_R, 0]} castShadow>
            <capsuleGeometry args={[ARM_R, ARM_LEN, 4, 10]} />
          </mesh>
        </group>

        {/* Head: the star of the silhouette (~58% of total height) */}
        <group ref={head} position={[0, HEAD_Y, 0]}>
          <mesh material={materials.skin} castShadow>
            <sphereGeometry args={[HEAD_R, 28, 22]} />
          </mesh>

          {/* Hair: angular center-part style. One "hood" — a large cap
              tilted back so its round opening frames the face — gives
              full coverage over the crown, sides, and nape with no
              seams. Two chunky pointed bangs sweep down-outward from a
              center part, plus little points at the temples. */}
          <group>
            {/* hood */}
            <mesh
              material={materials.hair}
              position={[0, 0.012, -0.015]}
              rotation={[-0.55, 0, 0]}
              scale={[1.06, 1.05, 1.06]}
            >
              <sphereGeometry args={[HEAD_R, 30, 22, 0, Math.PI * 2, 0, 1.75]} />
            </mesh>
            {/* Fringe: two soft rounded swooshes hugging the forehead,
                sloping down-outward from an open center part. Ellipsoids
                (not cones) so they merge with the hood's curves and read
                as one hair mass — nothing pointy, nothing separate. */}
            <mesh
              material={materials.hair}
              position={[-0.135, 0.135, 0.18]}
              rotation={[-0.12, 0, 0.5]}
              scale={[1.15, 0.65, 0.5]}
            >
              <sphereGeometry args={[0.115, 18, 14]} />
            </mesh>
            <mesh
              material={materials.hair}
              position={[0.135, 0.135, 0.18]}
              rotation={[-0.12, 0, -0.5]}
              scale={[1.15, 0.65, 0.5]}
            >
              <sphereGeometry args={[0.115, 18, 14]} />
            </mesh>
            {/* soft sideburn drops in front of the ears */}
            <mesh
              material={materials.hair}
              position={[-0.235, -0.01, 0.09]}
              rotation={[0, 0, 0.15]}
              scale={[0.35, 0.8, 0.5]}
            >
              <sphereGeometry args={[0.09, 14, 12]} />
            </mesh>
            <mesh
              material={materials.hair}
              position={[0.235, -0.01, 0.09]}
              rotation={[0, 0, -0.15]}
              scale={[0.35, 0.8, 0.5]}
            >
              <sphereGeometry args={[0.09, 14, 12]} />
            </mesh>
          </group>

          {/* Eyes: simple black ovals, set low on the face */}
          <group ref={eyes} position={[0, EYE_Y, 0]}>
            <mesh material={materials.face} position={[-EYE_X, 0, HEAD_R * 0.9]} scale={[1, 1.45, 0.55]}>
              <sphereGeometry args={[0.03, 12, 12]} />
            </mesh>
            <mesh material={materials.face} position={[EYE_X, 0, HEAD_R * 0.9]} scale={[1, 1.45, 0.55]}>
              <sphereGeometry args={[0.03, 12, 12]} />
            </mesh>
          </group>

          {/* Nose: the tiniest bump, between eyes and mouth */}
          <mesh material={materials.skin} position={[0, -0.062, HEAD_R * 0.98]}>
            <sphereGeometry args={[0.02, 10, 8]} />
          </mesh>

          {/* Mouth: a small curved line */}
          <mesh
            material={materials.face}
            position={[0, MOUTH_Y, HEAD_R * 0.88]}
            rotation={[0.4, 0, Math.PI + (Math.PI - Math.PI * 0.5) / 2]}
          >
            <torusGeometry args={[0.05, 0.007, 8, 22, Math.PI * 0.5]} />
          </mesh>
        </group>
      </group>
    </group>
  )
}
