import { useEffect, useRef } from 'react'
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
import { resolveCollision } from '@/systems/collision'
import { crowdAgents, registerAgent, unregisterAgent, separate } from '@/systems/crowd'
import { avatarPose } from '@/systems/movement/avatarPose'

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
// Recoloured 2026-07-24 (Peter: the crowd read grey/pale vs. the
// reference's colourful villagers). Hair drops the greys for
// black/blonde/browns; shirts are deeper and warmer (orange/gold/teal/
// coral join the pastels); pants gain variety so no one is uniform grey.
// Still soft, never neon (ART_BIBLE).
// Natural hair only, weighted DARK (Peter, 2026-07-29): the array IS the
// distribution — a style/colour is picked uniformly from it — so the
// first six entries are browns-through-black and the last four are
// lighter naturals. 6/10 = 60% dark, which is the floor Peter asked for.
export const VILLAGER_HAIR = [
  '#221d18', // near-black
  '#191512', // black
  '#3a2a1e', // dark brown
  '#2c2119', // darkest brown
  '#4a3626', // deep brown
  '#33261c', // cool dark brown
  '#6b4a2f', // mid brown
  '#8a5a3b', // warm chestnut
  '#a9713f', // auburn
  '#b99a6b', // ash / dark blonde
]

/** Four silhouettes. The crowd read as clones with a single shared cap;
 *  these give it real variety without leaving the house language —
 *  ellipsoids only, nothing pointy, every part overlapping the cap so
 *  the hair reads as one mass (the rule Avatar's own hair follows).
 *  Only the cap casts a shadow; the rest sit inside its outline, so a
 *  style costs 0–2 extra draw calls rather than doubling. */
export const HAIR_STYLES = 4
export const VILLAGER_SHIRTS = [
  '#ef9455', '#f2c94c', '#7ec98a', '#4fbfc4',
  '#ee8fb0', '#a97fd6', '#e0705f', '#5b93d6',
]
export const VILLAGER_PANTS = ['#5f7391', '#7a6350', '#63707e', '#8a7a5a']

const GEO = {
  head: new SphereGeometry(0.26, 16, 12),
  hood: new SphereGeometry(0.27, 16, 12, 0, Math.PI * 2, 0, 1.75),
  body: new CylinderGeometry(0.115, 0.15, 0.26, 14),
  bodyCap: new SphereGeometry(0.115, 14, 7, 0, Math.PI * 2, 0, Math.PI / 2),
  arm: new CapsuleGeometry(0.03, 0.11, 4, 8),
  leg: new CapsuleGeometry(0.04, 0.07, 4, 8),
  shoe: new SphereGeometry(1, 10, 8),
  eye: new SphereGeometry(0.026, 8, 8),
  /** Unit sphere reused at many per-mesh scales for every hair part —
   *  same trick as `shoe`, so four hairstyles cost no extra geometry. */
  hairBlob: new SphereGeometry(1, 12, 10),
}

const MAT = {
  // Premium molded plastic, matching the player's finish.
  skin: new MeshStandardMaterial({ color: '#f6cfae', roughness: 0.6 }),
  shoe: new MeshStandardMaterial({ color: '#f2f5f7', roughness: 0.55 }),
  face: new MeshStandardMaterial({ color: '#2e2c2a', roughness: 0.55 }),
  hair: VILLAGER_HAIR.map((c) => new MeshStandardMaterial({ color: c, roughness: 0.7 })),
  shirt: VILLAGER_SHIRTS.map((c) => new MeshStandardMaterial({ color: c, roughness: 0.55 })),
  pants: VILLAGER_PANTS.map((c) => new MeshStandardMaterial({ color: c, roughness: 0.65 })),
}

/**
 * One of four hairstyles, all built from the shared cap plus a couple of
 * scaled unit spheres. Parented to the animated head group, so an
 * asymmetric style inherits the nod and glance for free.
 *
 * Only the cap casts a shadow — every other part sits inside its
 * outline, so it would cost fill rate and change nothing (the same call
 * the player's hair makes in Avatar.tsx).
 */
function Hair({ style, mat }: { style: number; mat: MeshStandardMaterial }) {
  return (
    <>
      <mesh
        geometry={GEO.hood}
        material={mat}
        position={[0, style === 0 ? 0.004 : 0.012, -0.015]}
        rotation={[-0.55, 0, 0]}
        scale={style === 3 ? 1.0 : 1.02}
        castShadow
      />
      {/* 1 — bowl cut: two soft swooshes off an open centre part */}
      {style === 1 && (
        <>
          <mesh
            geometry={GEO.hairBlob}
            material={mat}
            position={[-0.12, 0.12, 0.17]}
            rotation={[-0.12, 0, 0.5]}
            scale={[0.12, 0.068, 0.052]}
          />
          <mesh
            geometry={GEO.hairBlob}
            material={mat}
            position={[0.12, 0.12, 0.17]}
            rotation={[-0.12, 0, -0.5]}
            scale={[0.12, 0.068, 0.052]}
          />
        </>
      )}
      {/* 2 — ponytail: a tie at the crown and a tail down the back */}
      {style === 2 && (
        <>
          <mesh
            geometry={GEO.hairBlob}
            material={mat}
            position={[0, 0.05, -0.24]}
            scale={[0.05, 0.05, 0.05]}
          />
          <mesh
            geometry={GEO.hairBlob}
            material={mat}
            position={[0, -0.08, -0.27]}
            scale={[0.07, 0.13, 0.07]}
          />
        </>
      )}
      {/* 3 — top bun */}
      {style === 3 && (
        <mesh
          geometry={GEO.hairBlob}
          material={mat}
          position={[0, 0.26, -0.03]}
          scale={[0.1, 0.09, 0.1]}
        />
      )}
    </>
  )
}

export interface VillagerSpec {
  id: number
  x: number
  z: number
  /** ~1.0 — villagers stand the same height as the player. */
  scale: number
  hair: number
  /** Which of the four silhouettes — see `Hair`. */
  hairStyle: number
  shirt: number
  pants: number
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
const VILLAGER_RADIUS = 0.24 // body radius for collision push-out
// The player's personal-space BUBBLE. A villager inside PLAYER_AWARE
// actively WALKS away (legs animating, facing its travel) to clear out;
// it is never allowed closer than PLAYER_BUBBLE (a hard backstop so the
// player can't shove through). FLEE_SPEED matches the player's pace so a
// fleeing villager stays ahead instead of being caught and slid.
const PLAYER_AWARE = 1.75
const PLAYER_BUBBLE = 1.2
const FLEE_SPEED = 1.6

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
  /** When the current stroll began — used to give up if blocked. */
  walkStartT: number
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
      walkStartT: 0,
      away: false,
      goingHome: false,
      stride: 0,
      move: 0,
      hopAt: spec.seed * 10 + 2 + spec.seed * 5,
      hopT: -1,
    }
  }

  // Join the crowd registry with a LIVE reference to our position so the
  // other villagers can separate from us and we from them.
  useEffect(() => {
    registerAgent({ id: spec.id, pos: st.current!.pos, radius: VILLAGER_RADIUS })
    return () => unregisterAgent(spec.id)
  }, [spec.id])

  useFrame((_, rawDt) => {
    const s = st.current!
    // Ambient-scaled time: reduced motion calms the crowd too.
    const dt = Math.min(rawDt, 0.1) * getAmbientScale()
    s.t += dt

    let moveTarget = 0

    // ---- player bubble: WALK away if the visitor is close -------------
    // Highest priority — overrides strolling/chatting. The villager turns
    // to face away and steps off briskly (legs animate, so it reads as
    // walking out of the way, not being shoved), keeping the player's
    // personal space clear.
    const pdx = s.pos.x - avatarPose.position.x
    const pdz = s.pos.z - avatarPose.position.z
    const pd = Math.hypot(pdx, pdz)
    if (pd < PLAYER_AWARE) {
      const nx = pd > 1e-3 ? pdx / pd : 1
      const nz = pd > 1e-3 ? pdz / pd : 0
      _dir.set(nx, 0, nz)
      s.fwd.lerp(_dir, 1 - Math.exp(-9 * dt)).normalize()
      s.pos.x += nx * FLEE_SPEED * dt
      s.pos.z += nz * FLEE_SPEED * dt
      moveTarget = 1
      // Abandon the current errand; pause a beat before strolling again.
      s.mode = 'idle'
      s.away = true
      s.nextWalkAt = s.t + 1.5
    } else {
      // ---- decide -----------------------------------------------------
      // Everyone strolls. Wanderers roam POI to POI forever; chat-circle
      // members occasionally walk out somewhere, pause, then walk home
      // and rejoin the conversation — circles dissolve and reform.
      if (s.mode === 'idle' && s.t >= s.nextWalkAt) {
        if (!spec.wanderer && s.away) {
          s.target.set(spec.x, 0, spec.z)
          s.goingHome = true
        } else {
          const poi = spec.pois[Math.floor((s.t * 7.31 + spec.seed * 13) % spec.pois.length)]
          // Small deterministic jitter so villagers don't stack on a point
          // (kept modest so targets rarely land inside a solid footprint).
          s.target.set(
            poi.x + Math.sin(spec.seed * 12.9 + s.t) * 1.5,
            0,
            poi.z + Math.cos(spec.seed * 7.7 + s.t) * 1.5,
          )
          s.away = true
          s.goingHome = false
        }
        s.mode = 'walk'
        s.walkStartT = s.t
      }

      // ---- act --------------------------------------------------------
      if (s.mode === 'walk') {
        _dir.copy(s.target).sub(s.pos)
        _dir.y = 0
        const remaining = _dir.length()
        // Give up if arrived OR blocked too long (a solid prop between us
        // and the target, so we can never close the last stretch).
        if (remaining < 0.45 || s.t - s.walkStartT > 14) {
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
    }
    s.fwd.y = 0
    s.fwd.normalize()
    s.move += (moveTarget - s.move) * (1 - Math.exp(-6 * dt))

    // Solid props: push out of any island/planter/prop EVERY frame (not
    // just while walking) so a villager can never end up inside anything,
    // exactly like the player — slides along boundaries instead.
    resolveCollision(s.pos, VILLAGER_RADIUS)

    // Crowd: separate from every other villager (each takes half the
    // correction, so nobody overlaps or walks through anyone), then STEP
    // ASIDE for the player (we take the FULL correction — the player never
    // yields, so the crowd parts around it and it can't walk through us).
    for (let i = 0; i < crowdAgents.length; i++) {
      const a = crowdAgents[i]
      if (a.id === spec.id) continue
      separate(s.pos, a.pos.x, a.pos.z, VILLAGER_RADIUS + a.radius, 0.5)
    }
    separate(s.pos, avatarPose.position.x, avatarPose.position.z, PLAYER_BUBBLE, 1)
    // Re-resolve static props so a crowd shove can't push us into one.
    resolveCollision(s.pos, VILLAGER_RADIUS)

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
  const pantsMat = MAT.pants[spec.pants % MAT.pants.length]

  return (
    <group ref={root} scale={spec.scale}>
      <group ref={body}>
        {/* legs + shoes */}
        <group ref={legL} position={[-0.06, 0.18, 0]}>
          <mesh
            geometry={GEO.leg}
            material={pantsMat}
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
            material={pantsMat}
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
          <Hair style={spec.hairStyle % HAIR_STYLES} mat={hairMat} />
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
