import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  CapsuleGeometry,
  CylinderGeometry,
  Group,
  Matrix4,
  MeshStandardMaterial,
  SphereGeometry,
  Vector3,
} from 'three'
import { getAmbientScale } from '@/hooks/useAmbientLoop'

/**
 * One background villager — a simplified cousin of the player's
 * character (same visual language, fewer parts) living its own tiny
 * life: chatting in a circle, bouncing softly, or strolling between
 * places at a peaceful pace. Everything is deterministic per spec.
 *
 * Shadows: every mesh on the OUTLINE casts — legs, shoes, arms, hood,
 * body, head. Previously only the body cylinder and head sphere did,
 * which is exactly why villager shadows were elliptical blobs: the
 * silhouette being cast genuinely contained no legs or arms. The eyes
 * are the one deliberate omission (inside the head's outline, so they
 * would cost fill rate and change nothing).
 */

// ---- Shared GPU resources (one set for the whole crowd) --------------
export const VILLAGER_HAIR = ['#584639', '#3d3833', '#7a5a3a', '#8a8f96', '#5c4a63']
export const VILLAGER_SHIRTS = [
  '#f2b8c6', '#a9c9e8', '#b8e6c9', '#f7dfa8',
  '#d8c6ef', '#a8dde0', '#f6c8a8', '#c9d2f0',
]

const GEO = {
  head: new SphereGeometry(0.26, 16, 12),
  hood: new SphereGeometry(0.27, 16, 12, 0, Math.PI * 2, 0, 1.75),
  body: new CylinderGeometry(0.115, 0.15, 0.26, 14),
  bodyCap: new SphereGeometry(0.115, 14, 7, 0, Math.PI * 2, 0, Math.PI / 2),
  arm: new CapsuleGeometry(0.03, 0.11, 4, 8),
  leg: new CapsuleGeometry(0.04, 0.07, 4, 8),
  shoe: new SphereGeometry(1, 10, 8),
  eye: new SphereGeometry(0.026, 8, 8),
}

const MAT = {
  // Premium molded plastic, matching the player's finish.
  skin: new MeshStandardMaterial({ color: '#f6cfae', roughness: 0.6 }),
  pants: new MeshStandardMaterial({ color: '#8d99a6', roughness: 0.65 }),
  shoe: new MeshStandardMaterial({ color: '#f2f5f7', roughness: 0.55 }),
  face: new MeshStandardMaterial({ color: '#2e2c2a', roughness: 0.55 }),
  hair: VILLAGER_HAIR.map((c) => new MeshStandardMaterial({ color: c, roughness: 0.7 })),
  shirt: VILLAGER_SHIRTS.map((c) => new MeshStandardMaterial({ color: c, roughness: 0.55 })),
}

export interface VillagerSpec {
  id: number
  x: number
  z: number
  /** ~1.0 — villagers stand the same height as the player. */
  scale: number
  hair: number
  shirt: number
  /** Point to face while chatting (group center), or null for wanderers. */
  chatCenter: Vector3 | null
  /** Wanderers occasionally stroll to another destination. */
  wanderer: boolean
  /** Personal random phase so the crowd never moves in sync. */
  seed: number
  /** Destinations wanderers may stroll between. */
  pois: { x: number; z: number }[]
}

const WALK_SPEED = 0.5 // slow and peaceful — a third of the player's pace

// Scratch (safe: used synchronously within one callback)
const _dir = new Vector3()
const _right = new Vector3()
const _basis = new Matrix4()

interface VillagerState {
  t: number
  pos: Vector3
  fwd: Vector3
  up: Vector3
  mode: 'idle' | 'walk'
  target: Vector3
  nextWalkAt: number
  /** Out on a stroll, away from the home spot / chat circle. */
  away: boolean
  /** Currently walking back to the home spot. */
  goingHome: boolean
  stride: number
  move: number
  hopAt: number
  hopT: number
}

export function Villager({ spec }: { spec: VillagerSpec }) {
  const root = useRef<Group>(null)
  const body = useRef<Group>(null)
  const head = useRef<Group>(null)
  const legL = useRef<Group>(null)
  const legR = useRef<Group>(null)
  const armL = useRef<Group>(null)
  const armR = useRef<Group>(null)

  const st = useRef<VillagerState | null>(null)
  if (st.current === null) {
    const pos = new Vector3(spec.x, 0, spec.z)
    const up = new Vector3(0, 1, 0)
    // Initial facing: chat centers face the group; others face "south"
    // (+Z, toward the camera/spawn side of the plaza).
    const fwd = spec.chatCenter ? spec.chatCenter.clone().sub(pos) : new Vector3(0, 0, 1)
    fwd.y = 0
    if (fwd.lengthSq() < 1e-6) fwd.set(1, 0, 0)
    fwd.normalize()
    st.current = {
      t: spec.seed * 10,
      pos,
      fwd,
      up,
      mode: 'idle',
      target: new Vector3(),
      // Stagger departures: wanderers leave soon, chatters linger first.
      nextWalkAt: spec.seed * 10 + (spec.wanderer ? 3 + spec.seed * 8 : 9 + spec.seed * 22),
      away: false,
      goingHome: false,
      stride: 0,
      move: 0,
      hopAt: spec.seed * 10 + 2 + spec.seed * 5,
      hopT: -1,
    }
  }

  useFrame((_, rawDt) => {
    const s = st.current!
    // Ambient-scaled time: reduced motion calms the crowd too.
    const dt = Math.min(rawDt, 0.1) * getAmbientScale()
    s.t += dt

    // ---- decide -------------------------------------------------------
    // Everyone strolls. Wanderers roam POI to POI forever; chat-circle
    // members occasionally walk out somewhere, pause, then walk home and
    // rejoin the conversation — circles dissolve and reform.
    if (s.mode === 'idle' && s.t >= s.nextWalkAt) {
      if (!spec.wanderer && s.away) {
        s.target.set(spec.x, 0, spec.z)
        s.goingHome = true
      } else {
        const poi = spec.pois[Math.floor((s.t * 7.31 + spec.seed * 13) % spec.pois.length)]
        // Small deterministic jitter so villagers don't stack on a point.
        s.target.set(
          poi.x + Math.sin(spec.seed * 12.9 + s.t) * 3,
          0,
          poi.z + Math.cos(spec.seed * 7.7 + s.t) * 3,
        )
        s.away = true
        s.goingHome = false
      }
      s.mode = 'walk'
    }

    // ---- act ----------------------------------------------------------
    let moveTarget = 0
    if (s.mode === 'walk') {
      _dir.copy(s.target).sub(s.pos)
      _dir.y = 0
      const remaining = _dir.length()
      if (remaining < 0.45) {
        s.mode = 'idle'
        if (s.goingHome) {
          // Back with the group — settle in and chat a good while.
          s.away = false
          s.goingHome = false
          s.nextWalkAt = s.t + 18 + ((spec.seed * 53) % 22)
        } else {
          s.nextWalkAt = s.t + 6 + ((spec.seed * 31) % 12)
        }
      } else {
        _dir.divideScalar(remaining)
        s.fwd.lerp(_dir, 1 - Math.exp(-4 * dt)).normalize()
        moveTarget = 1
        s.pos.addScaledVector(s.fwd, WALK_SPEED * dt)
      }
    } else if (spec.chatCenter && !s.away) {
      // Chat posture: at home, keep facing the group's center.
      _dir.copy(spec.chatCenter).sub(s.pos)
      _dir.y = 0
      if (_dir.lengthSq() > 1e-6) {
        s.fwd.lerp(_dir.normalize(), 1 - Math.exp(-2 * dt))
      }
    }
    s.fwd.y = 0
    s.fwd.normalize()
    s.move += (moveTarget - s.move) * (1 - Math.exp(-6 * dt))

    // ---- write transform ------------------------------------------------
    if (root.current) {
      _right.crossVectors(s.up, s.fwd)
      _basis.makeBasis(_right, s.up, s.fwd)
      root.current.position.copy(s.pos)
      root.current.quaternion.setFromRotationMatrix(_basis)
    }

    // ---- little life ----------------------------------------------------
    s.stride += dt * 9 * s.move
    const swing = Math.sin(s.stride) * 0.5 * s.move
    if (legL.current && legR.current) {
      legL.current.rotation.x = swing
      legR.current.rotation.x = -swing
    }
    if (armL.current && armR.current) {
      armL.current.rotation.x = -swing * 0.7
      armR.current.rotation.x = swing * 0.7
    }
    if (body.current) {
      // Warawara bounce: idle villagers give a happy little hop sometimes.
      if (s.mode === 'idle' && s.hopT < 0 && s.t >= s.hopAt) s.hopT = 0
      let hop = 0
      if (s.hopT >= 0) {
        s.hopT += dt
        const p = s.hopT / 0.45
        hop = Math.sin(Math.min(p, 1) * Math.PI) * 0.05
        if (p >= 1) {
          s.hopT = -1
          s.hopAt = s.t + 3 + ((spec.seed * 47) % 9)
        }
      }
      const breath = Math.sin(s.t * 1.8 + spec.seed * 6) * 0.015 * (1 - s.move)
      body.current.scale.set(1 - breath * 0.5, 1 + breath, 1 - breath * 0.5)
      body.current.position.y = hop + Math.abs(Math.sin(s.stride)) * 0.025 * s.move
    }
    if (head.current) {
      // Chatting villagers nod along; everyone glances gently.
      const nod =
        spec.chatCenter && !s.away ? Math.sin(s.t * 2.1 + spec.seed * 9) * 0.05 : 0
      head.current.rotation.x = nod + Math.sin(s.t * 1.1 + spec.seed * 4) * 0.02
      head.current.rotation.y = Math.sin(s.t * 0.5 + spec.seed * 8) * 0.14
    }
  })

  const hairMat = MAT.hair[spec.hair % MAT.hair.length]
  const shirtMat = MAT.shirt[spec.shirt % MAT.shirt.length]

  return (
    <group ref={root} scale={spec.scale}>
      <group ref={body}>
        {/* legs + shoes */}
        <group ref={legL} position={[-0.06, 0.18, 0]}>
          <mesh
            geometry={GEO.leg}
            material={MAT.pants}
            position={[0, -0.07, 0]}
            castShadow
          />
          <mesh
            geometry={GEO.shoe}
            material={MAT.shoe}
            position={[0, -0.13, 0.02]}
            scale={[0.075, 0.045, 0.11]}
            castShadow
          />
        </group>
        <group ref={legR} position={[0.06, 0.18, 0]}>
          <mesh
            geometry={GEO.leg}
            material={MAT.pants}
            position={[0, -0.07, 0]}
            castShadow
          />
          <mesh
            geometry={GEO.shoe}
            material={MAT.shoe}
            position={[0, -0.13, 0.02]}
            scale={[0.075, 0.045, 0.11]}
            castShadow
          />
        </group>

        {/* body */}
        <mesh
          geometry={GEO.body}
          material={shirtMat}
          position={[0, 0.31, 0]}
          castShadow
          receiveShadow
        />
        <mesh geometry={GEO.bodyCap} material={shirtMat} position={[0, 0.44, 0]} />

        {/* arms */}
        <group ref={armL} position={[-0.14, 0.38, 0]} rotation={[0, 0, -0.12]}>
          <mesh
            geometry={GEO.arm}
            material={shirtMat}
            position={[0, -0.1, 0]}
            castShadow
          />
        </group>
        <group ref={armR} position={[0.14, 0.38, 0]} rotation={[0, 0, 0.12]}>
          <mesh
            geometry={GEO.arm}
            material={shirtMat}
            position={[0, -0.1, 0]}
            castShadow
          />
        </group>

        {/* head */}
        <group ref={head} position={[0, 0.69, 0]}>
          <mesh geometry={GEO.head} material={MAT.skin} castShadow receiveShadow />
          <mesh
            geometry={GEO.hood}
            material={hairMat}
            position={[0, 0.012, -0.015]}
            rotation={[-0.55, 0, 0]}
            scale={[1.02, 1.02, 1.02]}
            castShadow
          />
          <mesh
            geometry={GEO.eye}
            material={MAT.face}
            position={[-0.09, -0.02, 0.235]}
            scale={[1, 1.4, 0.55]}
          />
          <mesh
            geometry={GEO.eye}
            material={MAT.face}
            position={[0.09, -0.02, 0.235]}
            scale={[1, 1.4, 0.55]}
          />
        </group>
      </group>
    </group>
  )
}
