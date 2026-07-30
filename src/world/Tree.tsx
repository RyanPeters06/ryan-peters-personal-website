import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, CylinderGeometry, Mesh, MeshStandardMaterial, SphereGeometry, Vector3 } from 'three'
import { getAmbientTime } from '@/hooks/useAmbientLoop'
import { PALETTE } from '@/lib/constants'
import { ROUGHNESS } from '@/lib/designSystem'

const CANOPY = {
  green: [PALETTE.grassDark, PALETTE.grass, PALETTE.grassLight],
  pink: [PALETTE.blossomDark, PALETTE.blossom, PALETTE.blossomLight],
} as const

/** How far a tinted canopy is pulled toward its landmark's accent. */
const TINT_STRENGTH = 0.45

/** How far a puff drifts at the peak of its sway, world units. */
const SWAY_AMOUNT = 0.028

/** Shared by every puff on every tree — sharing geometry across many
 *  meshes is the same trick `Clouds.tsx` uses for its puffs. */
const PUFF_GEO = new SphereGeometry(1, 14, 10)
const TRUNK_GEO = new CylinderGeometry(0.05, 0.07, 0.46, 8)

function makeRng(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/**
 * A landmark-pod tree: a short trunk under a handful of big, soft,
 * overlapping puffs — the same cartoon-cloud construction the world uses
 * everywhere, kept deliberately simple.
 *
 * WHAT MAKES IT READ AS LEAVES at this size is the SILHOUETTE and the
 * shading, not detail. At ~1.2 units tall seen from 12 units away a
 * canopy is barely 40px on screen: individual leaves cannot resolve, and
 * trying to model them backfires. A first attempt built the crown from
 * ~20 small almond lobes pointing outward and it read as a pinecone —
 * lots of little scales. So: few, LARGE, generously overlapping puffs
 * that bulge past one another to give a lobed, clumpy outline, with the
 * light tone on the upward-facing ones and the dark tone underneath.
 * That is what says "leafy crown" at plaza distance.
 *
 * Every tree is still an INDIVIDUAL — `seed` drives how many puffs there
 * are, where they sit, how big each is, and the trunk's lean — so the
 * twelve differ by their clustering rather than by any added detail.
 *
 * Puffs always overlap the core by a wide margin (centre distance is far
 * less than the radii sum), which is what keeps the crown one soft mass
 * instead of a bunch of balls stuck together.
 *
 * It also flows: each puff drifts on its own phase, driven by the shared
 * ambient clock, so the crown ripples rather than swinging as one rigid
 * mass — a plain per-frame `position` write on each puff's mesh.
 *
 * EACH PUFF IS ITS OWN MESH, not a GPU instance. Two rebuilds got this
 * component here (2026-07-29 to 2026-07-30):
 *   1. A vertex-shader `onBeforeCompile` sway on an `InstancedMesh`
 *      matched raw text against three.js's EXPANDED `project_vertex`
 *      chunk body. That text doesn't exist yet at the point
 *      `onBeforeCompile` runs — the shader source still has the
 *      unexpanded `#include <project_vertex>` token — so the match was
 *      never reliable. It happened to still link in `npm run dev` but
 *      failed in the production build, spamming
 *      `WebGL: useProgram: program not valid` and leaving every canopy
 *      invisible (reported live on the deployed site, 2026-07-30).
 *   2. Replacing the shader hack with a plain CPU-side `setMatrixAt`
 *      loop on the SAME `InstancedMesh` did not fix it — trees were
 *      STILL invisible in a from-scratch production build, with zero
 *      shader compile/link failures captured by instrumenting
 *      `compileShader`/`linkProgram` directly. `InstancedMesh` (the raw
 *      R3F primitive, `<instancedMesh>`) was, and remains, the only use
 *      of GPU instancing anywhere in this codebase — no proven track
 *      record here to fall back on, and no confirmed root cause either.
 *      So: stop depending on it. Every puff is an ordinary `<mesh>`,
 *      exactly how `Clouds.tsx` already renders its puffs successfully
 *      in production. Costs 5–7 draw calls per tree (~80 across all
 *      twelve) instead of 1 — a rounding error next to the crowd's own
 *      ~576.
 */
export function Tree({
  variant = 'green',
  scale = 1,
  tint,
  seed = 1,
}: {
  variant?: 'green' | 'pink'
  scale?: number
  tint?: string
  seed?: number
}) {
  const puffRefs = useRef<(Mesh | null)[]>([])

  const trunkMat = useMemo(
    () => new MeshStandardMaterial({ color: PALETTE.trunk, roughness: ROUGHNESS.foliage }),
    [],
  )

  const layout = useMemo(() => {
    const rng = makeRng(seed * 2654435761 + 12345)
    const [dark, mid, light] = CANOPY[variant].map((hex) => {
      const c = new Color(hex)
      if (tint) c.lerp(new Color(tint), TINT_STRENGTH)
      return c
    })

    const count = 5 + Math.floor(rng() * 3) // 5–7
    const girth = 0.9 + rng() * 0.3
    const cy = 0.66 + rng() * 0.1
    // Capped so the CANOPY'S TOTAL REACH (core + satellite bulge) can
    // never exceed what was cleared against the panel/grass geometry —
    // see the reach comment on the satellite loop below.
    const coreR = 0.33 * girth * (0.94 + rng() * 0.1)

    const parts: { basePos: Vector3; scl: Vector3; phase: number; mat: MeshStandardMaterial }[] =
      []

    // The core puff — the mass everything else grows out of. Phase 0 so
    // the trunk-adjacent mass barely drifts; it anchors the crown.
    parts.push({
      basePos: new Vector3(0, cy, 0),
      scl: new Vector3(coreR, coreR * (0.88 + rng() * 0.14), coreR),
      phase: 0,
      mat: new MeshStandardMaterial({ color: mid, roughness: ROUGHNESS.foliage }),
    })

    // Satellites, spread around the core and bulging past it so the
    // outline goes lobed. Reach (d + r, the farthest a satellite's edge
    // gets from the trunk) is capped at coreR * 1.58 — verified
    // numerically against every one of the 12 seeded trees to clear the
    // panel with real margin (worst case 0.15u+, not the ~0.04u a wider
    // spread produced). Don't loosen these without re-running that check
    // (POD.trees's clearance comment has the panel/dome geometry).
    const spin = rng() * Math.PI * 2
    for (let i = 1; i < count; i++) {
      const ang = spin + (i / (count - 1)) * Math.PI * 2 + (rng() - 0.5) * 0.9
      const r = coreR * (0.48 + rng() * 0.22)
      const d = coreR * (0.64 + rng() * 0.24)
      const lift = (rng() - 0.35) * coreR * 1.15
      const x = Math.cos(ang) * d
      const z = Math.sin(ang) * d * 0.9

      // Higher puffs catch the light; low ones fall into the dark tone.
      const t = Math.min(1, Math.max(0, lift / (coreR * 0.8) + 0.5))
      const col = dark.clone().lerp(mid, t)
      if (t > 0.72) col.lerp(light, 0.6)

      parts.push({
        basePos: new Vector3(x, cy + lift, z),
        scl: new Vector3(r, r * (0.86 + rng() * 0.18), r),
        // Each puff's own drift phase, so the crown ripples rather than
        // moving as one mass — derived from position so it's stable
        // across re-renders without storing an extra random draw.
        phase: x * 5.3 + z * 3.9 + rng() * 0.001,
        mat: new MeshStandardMaterial({ color: col, roughness: ROUGHNESS.foliage }),
      })
    }

    return {
      parts,
      lean: (rng() - 0.5) * 0.12,
      tilt: (rng() - 0.5) * 0.07,
      trunkH: 0.9 + rng() * 0.22,
    }
  }, [seed, variant, tint])

  useFrame(() => {
    const time = getAmbientTime()
    for (let i = 0; i < layout.parts.length; i++) {
      const mesh = puffRefs.current[i]
      const p = layout.parts[i]
      if (!mesh) continue
      const amp = SWAY_AMOUNT * Math.max(p.basePos.y - 0.3, 0)
      mesh.position.set(
        p.basePos.x + Math.sin(time * 1.05 + p.phase) * amp,
        p.basePos.y,
        p.basePos.z + Math.cos(time * 0.86 + p.phase * 1.3) * amp * 0.7,
      )
    }
  })

  return (
    <group scale={scale} rotation={[layout.tilt, 0, layout.lean]}>
      <mesh
        geometry={TRUNK_GEO}
        material={trunkMat}
        position={[0, 0.22 * layout.trunkH, 0]}
        scale={[1, layout.trunkH, 1]}
        castShadow
      />
      {layout.parts.map((p, i) => (
        <mesh
          key={i}
          ref={(el) => {
            puffRefs.current[i] = el
          }}
          geometry={PUFF_GEO}
          material={p.mat}
          position={p.basePos}
          scale={p.scl}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  )
}
