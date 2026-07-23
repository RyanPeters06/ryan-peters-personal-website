import { Suspense, useEffect, useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import { Box3, Group, LoopOnce, Matrix4, Mesh, Vector3 } from 'three'
import { useWorldStore } from '@/store/useWorldStore'
import { expDamp } from '@/lib/math/damp'
import { avatarPose } from '@/systems/movement/avatarPose'
import { getMoveInput } from '@/systems/movement/useMovementInput'
import { TABLEAU_WALK_RADIUS, WALK_SPEED } from '@/lib/constants'
import rogueUrl from '@/assets/rogue.glb?url'

/**
 * The resident of the tiny world — a rounded, stylized clay character
 * (KayKit "Adventurers" Rogue, CC0 by Kay Lousberg), chosen for the soft
 * chunky silhouette that matches the reference plaza avatar. The bundled
 * GLB carries the rig + a full animation library; we drive just three:
 * Idle, Walking (weight-blended by how much we're moving), and Cheer (the
 * arrival greeting).
 *
 * The world CONTROLLER is unchanged from the primitive version: WASD/
 * arrows, camera-relative, integrated as a plain XZ offset across the
 * flat plaza floor and leashed to a walk radius. It publishes pose to
 * `avatarPose` (read by the model's animation blend, the sun, and
 * landmark proximity) and writes the root transform. The model is a
 * child of that root, so nothing about placement/facing changed.
 */

useGLTF.preload(rogueUrl)

// Target on-floor height (world units); the GLB is ~1.8 tall and gets
// scaled to this. The primitive resident was ~0.95, so the crowd still
// reads to scale.
const TARGET_HEIGHT = 0.95
// KayKit ships the Rogue with adventurer weapons parented to the rig.
// We want a plain friendly resident, so these nodes are hidden (the
// little cape + body stay). Names come from the GLB's node list.
const WEAPON_NODES = new Set([
  'Knife',
  'Knife_Offhand',
  '1H_Crossbow',
  '2H_Crossbow',
  'Throwable',
])
// KayKit characters are authored facing +Z; our placed basis already
// puts local +Z on `pose.forward`, so no extra yaw is needed. (Flip to
// Math.PI here if a model faces the wrong way.)
const MODEL_YAW = 0

// Scratch objects — the frame loop never allocates.
const _camFlat = new Vector3()
const _camRight = new Vector3()
const _moveDir = new Vector3()
const _right = new Vector3()
const _basis = new Matrix4()

interface AvatarAnim {
  t: number
  arriveT0: number
  move: number
}

export function Avatar() {
  const camera = useThree((s) => s.camera)
  const placed = useRef<Group>(null)
  const anim = useRef<AvatarAnim>({ t: 0, arriveT0: -1, move: 0 })

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    const a = anim.current
    a.t += dt
    const store = useWorldStore.getState()
    const { phase } = store
    const pose = avatarPose

    // ----- Arrival timeline: a beat after the title dissolves, greet ---
    if (phase === 'arriving') {
      if (a.arriveT0 < 0) a.arriveT0 = a.t
      if (a.t - a.arriveT0 > 0.9) store.setPhase('greeting')
    }

    // ----- Movement input ----------------------------------------------
    const input = getMoveInput()
    const inputActive = input.x !== 0 || input.z !== 0
    if (phase === 'idle' && inputActive) store.setPhase('exploring')

    let moveTarget = 0
    let steering = false
    if (phase === 'exploring' && inputActive) {
      // Camera-relative direction on the flat floor: W walks away from
      // the camera, A/D strafe — the avatar turns to face travel.
      _camFlat.set(pose.position.x - camera.position.x, 0, pose.position.z - camera.position.z)
      if (_camFlat.lengthSq() > 1e-8) {
        _camFlat.normalize()
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
      _moveDir.set(camera.position.x - pose.position.x, 0, camera.position.z - pose.position.z)
      if (_moveDir.lengthSq() > 1e-8) {
        _moveDir.normalize()
        steering = true
      }
    }
    if (steering) {
      const lambda = phase === 'exploring' ? 10 : 4
      pose.forward.lerp(_moveDir, 1 - Math.exp(-lambda * dt))
    }
    pose.forward.y = 0
    pose.forward.normalize()

    // ----- Integrate walking across the flat floor -----------------------
    if (a.move > 0.003 && phase === 'exploring') {
      pose.position.addScaledVector(pose.forward, WALK_SPEED * a.move * dt)
      // Tableau leash: clamp to a circle around the island's center.
      const dist = Math.hypot(pose.position.x, pose.position.z)
      if (dist > TABLEAU_WALK_RADIUS) {
        const scale = TABLEAU_WALK_RADIUS / dist
        pose.position.x *= scale
        pose.position.z *= scale
      }
    }

    // ----- Write the root transform -------------------------------------
    if (placed.current) {
      _right.crossVectors(pose.up, pose.forward)
      _basis.makeBasis(_right, pose.up, pose.forward)
      placed.current.position.copy(pose.position)
      placed.current.quaternion.setFromRotationMatrix(_basis)
    }
  })

  return (
    <group ref={placed}>
      <Suspense fallback={null}>
        <RoguePlayer />
      </Suspense>
    </group>
  )
}

/**
 * The rigged model + its animation blend. Kept separate so it can suspend
 * on the GLB load without stalling the controller above.
 */
function RoguePlayer() {
  const root = useRef<Group>(null)
  const inner = useRef<Group>(null)
  const { scene, animations } = useGLTF(rogueUrl)
  const { actions } = useAnimations(animations, root)
  const cheering = useRef(false)

  // One-time: cast/receive shadows and scale the model to plaza height.
  useLayoutEffect(() => {
    scene.traverse((o) => {
      if (WEAPON_NODES.has(o.name)) o.visible = false
      if ((o as Mesh).isMesh) {
        o.castShadow = true
        o.receiveShadow = true
      }
    })
    const box = new Box3().setFromObject(scene)
    const h = box.max.y - box.min.y || 1
    inner.current?.scale.setScalar(TARGET_HEIGHT / h)
  }, [scene])

  // Idle + Walk both run continuously; we blend them by weight so the
  // transition between standing and walking is seamless.
  useEffect(() => {
    const idle = actions['Idle']
    const walk = actions['Walking_C'] ?? actions['Walking_A']
    idle?.reset().play()
    idle?.setEffectiveWeight(1)
    walk?.reset().play()
    walk?.setEffectiveWeight(0)
    if (walk) walk.timeScale = 1.25
    return () => {
      idle?.stop()
      walk?.stop()
    }
  }, [actions])

  useFrame(() => {
    const idle = actions['Idle']
    const walk = actions['Walking_C'] ?? actions['Walking_A']
    const cheer = actions['Cheer']
    const phase = useWorldStore.getState().phase

    // Start the greeting cheer once, on entering the greeting phase.
    if (phase === 'greeting' && !cheering.current && cheer) {
      cheering.current = true
      cheer.reset()
      cheer.setLoop(LoopOnce, 1)
      cheer.clampWhenFinished = true
      cheer.setEffectiveWeight(1)
      cheer.play()
      idle?.setEffectiveWeight(0)
      walk?.setEffectiveWeight(0)
      const mixer = cheer.getMixer()
      const onFinish = () => {
        cheering.current = false
        cheer.setEffectiveWeight(0)
        mixer.removeEventListener('finished', onFinish)
        if (useWorldStore.getState().phase === 'greeting') {
          useWorldStore.getState().setPhase('idle')
        }
      }
      mixer.addEventListener('finished', onFinish)
    }

    // Idle⇄walk weight blend whenever we're not mid-cheer.
    if (!cheering.current) {
      const m = avatarPose.moving
      idle?.setEffectiveWeight(1 - m)
      walk?.setEffectiveWeight(m)
    }
  })

  return (
    <group ref={root}>
      <group ref={inner} rotation-y={MODEL_YAW}>
        <primitive object={scene} />
      </group>
    </group>
  )
}
