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

/** How far a lobe drifts at the peak of its sway, world units. */
const SWAY_AMOUNT = 0.028

/** Shared by every lobe on every tree — sharing geometry across many
 *  meshes is the same trick `Clouds.tsx` uses for its puffs. */
const PUFF_GEO = new SphereGeometry(1, 14, 10)
/** Unit-height cylinders. Trunk and branch lengths are DERIVED per tree
 *  (see the layout below), so these are scaled in Y at render time and
 *  the radii stay exactly as authored. */
const TRUNK_GEO = new CylinderGeometry(0.055, 0.082, 1, 10)
const BRANCH_GEO = new CylinderGeometry(0.021, 0.034, 1, 6)
/** The root flare — trunks widen into the ground rather than being stuck
 *  into it. Deliberately NOT scaled by trunk height, or a taller trunk
 *  would grow stilts. */
const ROOT_GEO = new CylinderGeometry(0.088, 0.155, 0.115, 10)

function makeRng(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

type Lobe = { c: Vector3; r: number }

/**
 * How far the union of the lobes reaches along a unit direction — the
 * canopy's support function. Used at build time to derive the trunk
 * height from the actual canopy underside, and by the offline clearance
 * check to measure the silhouette. (Largest root of |t·u − c| = r.)
 */
function support(lobes: Lobe[], ux: number, uy: number, uz: number): number {
  let best = 0
  for (const { c, r } of lobes) {
    const uc = c.x * ux + c.y * uy + c.z * uz
    const disc = r * r - (c.lengthSq() - uc * uc)
    if (disc > 0) best = Math.max(best, uc + Math.sqrt(disc))
  }
  return best
}

/**
 * A landmark-pod tree: a crown built from a cluster of big overlapping
 * lobes, on a tapered trunk with a root flare and a little branch.
 *
 * WHAT MAKES IT READ AS LEAVES at this size is the SILHOUETTE and the
 * shading, not detail. At ~1.2 units tall seen from 12 units away a
 * canopy is barely 40px on screen: individual leaves cannot resolve, and
 * trying to model them backfires — an early attempt built the crown from
 * ~20 small almond lobes pointing outward and it read as a pinecone.
 *
 * ONE MASS, ONE COLOUR. The canopy is a SINGLE shared material and the
 * renderer does all the shading. Giving each lobe its own tone (a
 * dark→light ramp by height) paints a patchwork ACROSS the crown that
 * fights the scene lighting already shading those same spheres, and it
 * lands as blotchy texture. **Per-lobe tinting is banned** — see
 * ART_BIBLE's dressing section.
 *
 * LOBES ARE TANGENT TO AN ENCLOSING SPHERE (2026-08-05, from Peter's
 * reference photo). Every lobe of radius `r` has its centre placed at
 * distance `R − r` along its direction, so it touches the sphere of
 * radius `R` from the inside. Three things follow:
 *
 *   1. The union is a bumpy ball of radius EXACTLY `R`. Canopy extent is
 *      a controlled input instead of an emergent `d + r`, which is what
 *      previously let the trees quietly drift past the clearance budget
 *      documented on `POD.trees`.
 *   2. Crease depth is set by the single ratio `r / R` — bigger lobes,
 *      shallower creases. At `r/R ≈ 0.6` with four lobes 90° apart the
 *      union dips ~22% between them, which matches the reference. At
 *      0.52 it dips 25–36% and reads as separate balls stuck together.
 *   3. There is NO dominant core, so the crown reads as a cluster. The
 *      previous version was one big core with small satellites buried in
 *      it — a shape that can only ever be a sphere with dents, which is
 *      why it looked generic no matter how it was tuned.
 *
 * The underside falls out of the same construction: four equatorial
 * lobes overlap through the middle, so the crown closes over the trunk
 * but only reaches down to ~0.45 at the trunk axis while hanging lower
 * out at the lobes. That notch — trunk emerging from a hollow — is the
 * reference's underside, and it is what a flat hemisphere bottom can't
 * give you.
 *
 * Every tree is an INDIVIDUAL: `seed` drives the canopy radius, squash,
 * height, lobe count, every lobe's direction and size, the branches, the
 * lean, and where this tree's one canopy tone falls between the
 * palette's dark and light. The twelve differ from EACH OTHER; each one
 * is coherent WITHIN itself.
 *
 * It also flows: each lobe drifts on its own phase from the shared
 * ambient clock, so the crown ripples rather than swinging as one rigid
 * mass — a plain per-frame `position` write on each lobe's mesh.
 *
 * EACH LOBE IS ITS OWN MESH, not a GPU instance. Two rebuilds got this
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
 *      So: stop depending on it. Every lobe is an ordinary `<mesh>`,
 *      exactly how `Clouds.tsx` already renders its puffs successfully
 *      in production.
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

    /** Canopy outer radius — the silhouette. Capped so the widest tree
     *  stays inside the clearance measured on POD.trees. */
    const R = 0.385 + rng() * 0.055
    /** Wider than tall, like the reference's broad dome. */
    const squash = 0.86 + rng() * 0.08
    const cy = 0.62 + rng() * 0.08

    // ONE tone for the whole tree. Where it falls between the palette's
    // dark and light is the seed's business, so a stand of trees still
    // varies — but it varies TREE BY TREE, never within a crown.
    const canopyCol = dark.clone().lerp(light, 0.28 + rng() * 0.5).lerp(mid, 0.35)
    const canopyMat = new MeshStandardMaterial({
      color: canopyCol,
      roughness: ROUGHNESS.foliage,
    })

    const nUp = 2 + Math.floor(rng() * 2)
    const spin = rng() * Math.PI * 2

    const lobes: Lobe[] = []
    /** Tangent placement: centre at R − r, so the lobe touches the
     *  enclosing sphere from inside and the union's reach stays R. */
    const place = (az: number, el: number, r: number) => {
      const d = R - r
      lobes.push({
        c: new Vector3(
          d * Math.cos(el) * Math.cos(az),
          d * Math.sin(el),
          d * Math.cos(el) * Math.sin(az),
        ),
        r,
      })
    }

    // Four near-equatorial lobes make the wide silhouette AND, by
    // overlapping through the centre, the scalloped underside.
    const N_EQ = 4
    for (let k = 0; k < N_EQ; k++) {
      place(
        spin + (k * Math.PI * 2) / N_EQ + (rng() - 0.5) * 0.5,
        -0.12 + rng() * 0.24,
        R * (0.6 + rng() * 0.05),
      )
    }
    // Crown lobes, offset in azimuth so they sit over the equatorial
    // ring's valleys rather than doubling up on its peaks.
    for (let k = 0; k < nUp; k++) {
      place(
        spin + 0.6 + (k * Math.PI * 2) / nUp + (rng() - 0.5) * 0.8,
        0.75 + rng() * 0.35,
        R * (0.52 + rng() * 0.07),
      )
    }

    // The canopy underside at the trunk axis, which DERIVES the trunk
    // height. Drawing trunk height independently (as this did until
    // 2026-08-05) leaves nothing tying the two together — it happened to
    // land close enough to look right, but nothing enforced it.
    const trunkH = cy - support(lobes, 0, -1, 0) * squash + 0.06

    // The little branch. Its LENGTH is derived, not drawn: march along
    // the branch until it enters a lobe, then add a little penetration.
    // A branch that stops short finishes in open air, which looks
    // broken — and picking a length at random did exactly that on half
    // the trees, since how far away the foliage is depends on the canopy
    // layout above it. Same principle as trunkH: anything that has to
    // MEET the canopy gets measured against it.
    //
    // It springs from the LOWER half of the trunk at 36–48° off
    // vertical. The first version attached at 55–70% and only 30–42°
    // off vertical, and the branch was invisible — that high up it
    // entered the canopy almost immediately and what little stuck out
    // sat inside the crown's own shadow. It needs open trunk beneath it
    // and enough lean to travel out before the foliage swallows it.
    const reach = (at: number, az: number, tilt: number): number => {
      const dx = -Math.sin(tilt) * Math.cos(az)
      const dz = Math.sin(tilt) * Math.sin(az)
      const dy = Math.cos(tilt)
      for (let t = 0.1; t <= 0.45; t += 0.01) {
        const px = dx * t
        const py = (at + dy * t - cy) / squash
        const pz = dz * t
        const hit = lobes.some(
          ({ c, r }) => (px - c.x) ** 2 + (py - c.y) ** 2 + (pz - c.z) ** 2 < r * r,
        )
        if (hit) return t + 0.035
      }
      return -1 // never meets the foliage — drop this branch entirely
    }

    const branches: { az: number; at: number; tilt: number; len: number }[] = []
    const addBranch = (az: number, at: number, tilt: number) => {
      const len = reach(at, az, tilt)
      if (len > 0) branches.push({ az, at, tilt, len })
    }
    const bAz = rng() * Math.PI * 2
    addBranch(bAz, trunkH * (0.4 + rng() * 0.15), 0.63 + rng() * 0.21)
    // Roughly one tree in four carries a second one opposite and lower.
    // Steeper than the first on purpose: from further down the trunk a
    // flat branch simply can't reach the foliage inside the march limit,
    // and `reach` drops it. (Two of the twelve end up with one.)
    if (rng() < 0.25) {
      addBranch(bAz + Math.PI * (0.75 + rng() * 0.5), trunkH * (0.32 + rng() * 0.1), 0.5 + rng() * 0.16)
    }

    const parts = lobes.map(({ c, r }) => ({
      basePos: c,
      scl: r,
      // Amplitude by the lobe's height off the ground, so the crown
      // ripples and the low mass near the trunk barely moves.
      amp: SWAY_AMOUNT * Math.max(cy + c.y * squash - 0.3, 0),
      // Derived from position so it's stable across re-renders without
      // storing an extra random draw.
      phase: c.x * 5.3 + c.z * 3.9,
    }))

    return {
      parts,
      canopyMat,
      squash,
      cy,
      trunkH,
      branches,
      lean: (rng() - 0.5) * 0.12,
      tilt: (rng() - 0.5) * 0.07,
    }
  }, [seed, variant, tint])

  useFrame(() => {
    const time = getAmbientTime()
    for (let i = 0; i < layout.parts.length; i++) {
      const mesh = puffRefs.current[i]
      const p = layout.parts[i]
      if (!mesh) continue
      mesh.position.set(
        p.basePos.x + Math.sin(time * 1.05 + p.phase) * p.amp,
        p.basePos.y,
        p.basePos.z + Math.cos(time * 0.86 + p.phase * 1.3) * p.amp * 0.7,
      )
    }
  })

  return (
    <group scale={scale} rotation={[layout.tilt, 0, layout.lean]}>
      <mesh geometry={ROOT_GEO} material={trunkMat} position={[0, 0.048, 0]} castShadow />
      <mesh
        geometry={TRUNK_GEO}
        material={trunkMat}
        position={[0, layout.trunkH / 2, 0]}
        scale={[1, layout.trunkH, 1]}
        castShadow
      />
      {/* Two nested groups so azimuth and tilt compose unambiguously:
          the outer spins the branch around the trunk, the inner tips it
          away from vertical, and the mesh is offset half its length so
          it grows OUT of the attach point. */}
      {layout.branches.map((b, i) => (
        <group key={i} position={[0, b.at, 0]} rotation={[0, b.az, 0]}>
          <group rotation={[0, 0, b.tilt]}>
            <mesh
              geometry={BRANCH_GEO}
              material={trunkMat}
              position={[0, b.len / 2, 0]}
              scale={[1, b.len, 1]}
              castShadow
            />
          </group>
        </group>
      ))}
      {/* The canopy's own group carries the squash, so lobe positions
          stay in a clean unit sphere space and only flatten on render. */}
      <group position={[0, layout.cy, 0]} scale={[1, layout.squash, 1]}>
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
    </group>
  )
}
