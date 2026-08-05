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
/** Thicker and more tapered than a twig: in the reference the trunk is a
 *  solid, load-bearing shape, not a stick the canopy balances on. */
const TRUNK_GEO = new CylinderGeometry(0.062, 0.085, 0.46, 10)
/** The root flare. Animal Crossing trunks widen into the ground rather
 *  than being stuck into it — a short skirt reads as that at plaza
 *  distance, where individual root lobes would be a couple of pixels. */
const ROOT_GEO = new CylinderGeometry(0.088, 0.155, 0.115, 10)

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
 * lots of little scales.
 *
 * ONE MASS, ONE COLOUR (2026-08-04, from Peter's Animal Crossing
 * reference). The version before this one had two faults he named
 * directly — "too many bumps" and the "texture":
 *
 *   - **The bumps** were satellites sized 0.48–0.70 of the core sitting
 *     0.64–0.88 out from it. Puffs that big bulging that far don't
 *     scallop an outline, they compete with it: the crown read as a
 *     bunch of balls stuck together rather than one tree. They are now
 *     roughly HALF that size and sit closer in, so they break the
 *     silhouette just enough to keep it from being a plain sphere.
 *   - **The texture** was per-puff colour. Each satellite got its own
 *     tone lerped between dark/mid/light by height, which painted a
 *     patchwork ACROSS the crown and fought the actual scene lighting
 *     that was already shading it. The reference canopy is one flat
 *     green; every bit of its form comes from the light. So the whole
 *     canopy is now a SINGLE shared material and the renderer does the
 *     shading. Per-puff tinting is the thing not to reintroduce.
 *
 * Every tree is still an INDIVIDUAL — `seed` drives how many puffs there
 * are, where they sit, how big each is, the trunk's lean, and where the
 * tree's one canopy tone falls between the palette's dark and light. The
 * twelve differ from EACH OTHER; each one is coherent WITHIN itself.
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

    const count = 6 + Math.floor(rng() * 2) // 6–7
    const girth = 0.9 + rng() * 0.3
    const cy = 0.66 + rng() * 0.1
    // Capped so the CANOPY'S TOTAL REACH (core + satellite bulge) can
    // never exceed what was cleared against the panel/grass geometry —
    // see the reach comment on the satellite loop below.
    const coreR = 0.33 * girth * (0.94 + rng() * 0.1)

    // ONE tone for the whole tree. Where it falls between the palette's
    // dark and light is the seed's business, so a stand of trees still
    // varies — but it varies TREE BY TREE, never within a crown.
    const canopyCol = dark.clone().lerp(light, 0.28 + rng() * 0.5).lerp(mid, 0.35)
    const canopyMat = new MeshStandardMaterial({
      color: canopyCol,
      roughness: ROUGHNESS.foliage,
    })

    const parts: { basePos: Vector3; scl: Vector3; phase: number }[] = []

    // The core — now the tree, not merely the biggest of several lumps.
    // Wider than tall (the reference canopy is a broad dome sitting over
    // the trunk, not a ball), and big enough that the satellites read as
    // its edge rather than as separate masses.
    parts.push({
      basePos: new Vector3(0, cy, 0),
      scl: new Vector3(coreR * 1.12, coreR * (0.94 + rng() * 0.12), coreR * 1.08),
      phase: 0,
    })

    // Satellites, buried in the core so they SCALLOP its edge instead of
    // sitting on it. This is the whole "too many bumps" fix and it is a
    // matter of how far each one's edge clears the core, not how many
    // there are: reach (d + r) runs coreR * 1.10–1.28 against a core
    // that is already coreR * 1.12 wide, so a satellite breaks the
    // surface by at most ~0.16 coreR and sometimes not at all. The
    // previous pass had them clearing it by 0.22 and each one read as
    // its own hemisphere. Counterintuitively MORE of them helps once
    // they're this shallow — seven small overlaps make an irregular
    // outline, three deep ones make three lumps.
    //
    // Still inside the coreR * 1.58 reach verified against the panel
    // across all 12 seeded trees, so that clearance holds. Don't loosen
    // these without re-running that check (POD.trees's clearance comment
    // has the panel/dome geometry).
    const spin = rng() * Math.PI * 2
    for (let i = 1; i < count; i++) {
      const ang = spin + (i / (count - 1)) * Math.PI * 2 + (rng() - 0.5) * 0.7
      const r = coreR * (0.44 + rng() * 0.1)
      const d = coreR * (0.66 + rng() * 0.08)
      // Biased upward: satellites crown the dome instead of ringing its
      // waist, where they used to read as bumps stuck on the sides.
      const lift = (rng() * 0.55 + 0.12) * coreR
      const x = Math.cos(ang) * d
      const z = Math.sin(ang) * d * 0.9

      parts.push({
        basePos: new Vector3(x, cy + lift, z),
        scl: new Vector3(r, r * (0.9 + rng() * 0.14), r),
        // Each puff's own drift phase, so the crown ripples rather than
        // moving as one mass — derived from position so it's stable
        // across re-renders without storing an extra random draw.
        phase: x * 5.3 + z * 3.9 + rng() * 0.001,
      })
    }

    return {
      parts,
      canopyMat,
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
      {/* Root flare first — it sits at the very bottom and is not scaled
          by trunkH, so a taller trunk doesn't grow stilts. */}
      <mesh geometry={ROOT_GEO} material={trunkMat} position={[0, 0.048, 0]} castShadow />
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
          material={layout.canopyMat}
          position={p.basePos}
          scale={p.scl}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  )
}
