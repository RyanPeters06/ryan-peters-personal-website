import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MeshStandardMaterial } from 'three'
import { getAmbientTime } from '@/hooks/useAmbientLoop'
import { PALETTE } from '@/lib/constants'
import { ROUGHNESS } from '@/lib/designSystem'
import { clay } from '@/lib/clay'
import { Flower, type FlowerKind } from '@/world/Flower'

/**
 * The centerpiece is built the SAME way as a panel island (see POD in
 * designSystem / LocationPod): a low white clay disc + a grass dome that
 * fills most of the top, leaving a thin white rim. Identical geometry
 * type + material to the island bases, so the white reads as the exact
 * same clean clay — no bespoke lathe/pedestal that shaded differently
 * and looked "off". Just bigger and round, holding the ringed planet
 * instead of a panel.
 */
// White clay base disc (mirrors POD.base) and the grass dome on top
// (mirrors POD.grass): a low top-hemisphere ellipsoid. Sized round and a
// touch larger than a panel island for centerpiece presence.
const BASE = { r: 1.35, height: 0.18 }
const GRASS = { base: 0.18, r: 1.24, cap: 0.32 }
/** Surface height of the grass dome at a local (x, z). */
function domeY(x: number, z: number): number {
  const t = 1 - (x * x + z * z) / (GRASS.r * GRASS.r)
  return GRASS.base + GRASS.cap * Math.sqrt(Math.max(0, t))
}

/** Blooms scattered on the grass (kept off the planet's footprint) —
 *  daisies, forget-me-nots and pink dots, like the reference. */
const FLOWERS: { x: number; z: number; kind: FlowerKind; s?: number }[] = [
  { x: -0.72, z: 0.6, kind: 'daisy', s: 1.3 },
  { x: 0.72, z: 0.5, kind: 'daisy', s: 1.2 },
  { x: -0.42, z: -0.68, kind: 'daisy', s: 1.05 },
  { x: 0.14, z: 0.9, kind: 'daisy', s: 1.15 },
  { x: 0.6, z: 0.76, kind: 'forgetMeNot', s: 1.2 },
  { x: 0.84, z: 0.58, kind: 'forgetMeNot', s: 1.05 },
  { x: -0.86, z: 0.18, kind: 'forgetMeNot', s: 1.1 },
  { x: -0.26, z: 0.8, kind: 'pink', s: 1.1 },
  { x: 0.88, z: -0.26, kind: 'pink' },
  { x: -0.66, z: -0.2, kind: 'pink', s: 0.95 },
]
/** Green leaf sprigs hugging the planet's base. */
const LEAVES: { x: number; z: number; s?: number }[] = [
  { x: 0.4, z: 0.36 },
  { x: -0.36, z: 0.4, s: 1.1 },
  { x: 0.08, z: -0.44 },
]

/** Faint cloud patches on the planet's surface (sit just proud of the
 *  0.36 sphere, flattened; they drift as the planet turns). */
const CLOUDS: { p: [number, number, number]; s: [number, number, number] }[] = [
  { p: [0.13, 0.15, 0.3], s: [0.14, 0.07, 0.1] },
  { p: [-0.19, 0.04, 0.28], s: [0.11, 0.06, 0.09] },
  { p: [0.04, -0.13, 0.32], s: [0.12, 0.06, 0.08] },
]

/**
 * The plaza centerpiece: a soft-blue ringed planet nestled in a flowered
 * grass bed on a white clay disc — the world's own mascot, echoing the
 * flat island it sits on. Its only motion is the world's kind: a slow
 * turn, a gentle bob, the ring precessing like a lazy halo.
 */
export function Fountain() {
  const globe = useRef<Group>(null)

  const materials = useMemo(
    () => ({
      // EXACTLY the panel islands' base clay (see LocationPod materials.base)
      // so the centerpiece white matches every panel's grass rim.
      base: clay({ color: '#faf7f2', roughness: 0.58, sheen: 0.2, env: 0.12 }),
      // EXACTLY the islands' grass material.
      grass: new MeshStandardMaterial({ color: PALETTE.grass, roughness: ROUGHNESS.foliage }),
      globe: new MeshStandardMaterial({ color: PALETTE.skyTop, roughness: 0.28 }),
      // Faint soft cloud patches on the planet.
      cloud: new MeshStandardMaterial({ color: '#eaf5ff', roughness: 0.5 }),
      // Chunky soft-blue Saturn ring (a lighter tint of the planet).
      ring: new MeshStandardMaterial({ color: '#bfe0f5', roughness: 0.35 }),
    }),
    [],
  )

  useFrame(() => {
    if (!globe.current) return
    const t = getAmbientTime()
    globe.current.rotation.y = t * 0.25
    globe.current.position.y = 0.66 + Math.sin(t * 0.9) * 0.035
  })

  return (
    <group position={[0, 0, 0]}>
      {/* White clay base disc — same geometry + material as a panel island. */}
      <mesh
        material={materials.base}
        position={[0, BASE.height / 2, 0]}
        scale={[BASE.r, BASE.height, BASE.r]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[1, 1, 1, 48]} />
      </mesh>
      {/* Grass dome nested on the disc (low convex knoll, thin white rim). */}
      <mesh
        material={materials.grass}
        position={[0, GRASS.base, 0]}
        scale={[GRASS.r, GRASS.cap, GRASS.r]}
        receiveShadow
      >
        <sphereGeometry args={[1, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      {/* Flowers + leaf sprigs planted ON the dome surface. */}
      {FLOWERS.map((f, i) => (
        <group key={i} position={[f.x, domeY(f.x, f.z) - 0.01, f.z]}>
          <Flower kind={f.kind} scale={f.s ?? 1} />
        </group>
      ))}
      {LEAVES.map((l, i) => (
        <group key={i} position={[l.x, domeY(l.x, l.z) - 0.01, l.z]}>
          <Flower kind="leaf" scale={l.s ?? 1} />
        </group>
      ))}
      {/* The little ringed planet, nestled into the grass. */}
      <group ref={globe} position={[0, 0.66, 0]}>
        <mesh material={materials.globe} castShadow>
          <sphereGeometry args={[0.36, 28, 22]} />
        </mesh>
        {/* Faint soft-white cloud patches on the surface. */}
        {CLOUDS.map((c, i) => (
          <mesh key={i} material={materials.cloud} position={c.p} scale={c.s}>
            <sphereGeometry args={[1, 12, 10]} />
          </mesh>
        ))}
        {/* The Saturn ring — near-horizontal, tilted toward the camera so
            it reads as a halo encircling the equator (not a front hoop);
            it precesses gently as the planet turns. */}
        <mesh material={materials.ring} rotation={[1.2, 0, 0.12]} castShadow>
          <torusGeometry args={[0.5, 0.072, 16, 56]} />
        </mesh>
      </group>
    </group>
  )
}
