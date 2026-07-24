import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MeshStandardMaterial, Vector2 } from 'three'
import { getAmbientTime } from '@/hooks/useAmbientLoop'
import { PALETTE } from '@/lib/constants'
import { clay } from '@/lib/clay'
import { Flower, type FlowerKind } from '@/world/Flower'

/** The white planter's cross-section, revolved into a SOLID low pedestal
 *  — a substantial dish with near-vertical opaque sides and only a gently
 *  rounded top lip (NOT a fat torus/"donut"). (radius, height) from the
 *  inner grass shelf, over the modest lip, straight down the wall, a soft
 *  foot, then a flat underside back to the axis (a closed solid revolve). */
const BASIN_PROFILE: Vector2[] = [
  new Vector2(0.0, 0.27), // inner shelf, on the axis (under the grass)
  new Vector2(0.9, 0.27), // flat inner shelf
  new Vector2(1.03, 0.285), // gentle rise toward the lip
  new Vector2(1.14, 0.345), // rounded pillowy top lip (not bulging)
  new Vector2(1.23, 0.32), // over the lip to the outer top corner
  new Vector2(1.26, 0.22), // outer wall — near vertical, solid body
  new Vector2(1.26, 0.08), // taller wall so the pedestal reads substantial
  new Vector2(1.2, 0.015), // soft foot
  new Vector2(1.02, 0.0), // base meeting the plaza floor
  new Vector2(0.0, 0.0), // flat underside, back to the axis
]

// Grass dome that sits on the inner shelf (same construction as the
// panel islands' domes: a low top-hemisphere ellipsoid). Sits inside the
// rim, leaving a white pillowy border.
const GRASS = { base: 0.27, rx: 0.9, cap: 0.14 }
/** Surface height of the grass dome at a local (x, z). */
function domeY(x: number, z: number): number {
  const t = 1 - (x * x + z * z) / (GRASS.rx * GRASS.rx)
  return GRASS.base + GRASS.cap * Math.sqrt(Math.max(0, t))
}

/** Blooms scattered on the grass (kept inside the rim, off the planet
 *  footprint) — the reference's daisies, forget-me-nots and pink dots. */
const FLOWERS: { x: number; z: number; kind: FlowerKind; s?: number }[] = [
  { x: -0.52, z: 0.5, kind: 'daisy', s: 1.3 },
  { x: 0.54, z: 0.42, kind: 'daisy', s: 1.2 },
  { x: -0.3, z: -0.52, kind: 'daisy', s: 1.05 },
  { x: 0.1, z: 0.72, kind: 'daisy', s: 1.15 },
  { x: 0.46, z: 0.6, kind: 'forgetMeNot', s: 1.2 },
  { x: 0.64, z: 0.46, kind: 'forgetMeNot', s: 1.05 },
  { x: -0.66, z: 0.14, kind: 'forgetMeNot', s: 1.1 },
  { x: -0.2, z: 0.62, kind: 'pink', s: 1.1 },
  { x: 0.68, z: -0.2, kind: 'pink' },
  { x: -0.5, z: -0.15, kind: 'pink', s: 0.95 },
]
/** Green leaf sprigs hugging the planet's base. */
const LEAVES: { x: number; z: number; s?: number }[] = [
  { x: 0.3, z: 0.28 },
  { x: -0.28, z: 0.3, s: 1.1 },
  { x: 0.06, z: -0.34 },
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
 * grass bed inside a rounded white planter — the world's own mascot,
 * echoing the flat island it sits on. Its only motion is the world's
 * kind: a slow turn, a gentle bob, the ring precessing like a lazy halo.
 */
export function Fountain() {
  const globe = useRef<Group>(null)

  const materials = useMemo(
    () => ({
      // The SAME clay as the panel islands' base ovals — the plain
      // standard material read as "rubber" (Peter). Now that the profile
      // is a solid pedestal (not a thin donut), the soft clay finish
      // reads solid AND matches the island rims, instead of glassy.
      basin: clay({ color: '#faf7f2', roughness: 0.58, sheen: 0.2, env: 0.12 }),
      grass: new MeshStandardMaterial({ color: '#93d183', roughness: 0.72 }),
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
    globe.current.position.y = 0.64 + Math.sin(t * 0.9) * 0.035
  })

  return (
    <group position={[0, 0, 0]}>
      {/* Basin: one smooth rounded white dish revolved from the profile. */}
      <mesh material={materials.basin} castShadow receiveShadow>
        <latheGeometry args={[BASIN_PROFILE, 48]} />
      </mesh>
      {/* Grass dome nested in the dish (low convex knoll, not a coin). */}
      <mesh
        material={materials.grass}
        position={[0, GRASS.base, 0]}
        scale={[GRASS.rx, GRASS.cap, GRASS.rx]}
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
      <group ref={globe} position={[0, 0.64, 0]}>
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
