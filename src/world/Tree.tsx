import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Color,
  CylinderGeometry,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  SphereGeometry,
  Vector3,
} from 'three'
import { getAmbientTime } from '@/hooks/useAmbientLoop'
import { PALETTE } from '@/lib/constants'
import { ROUGHNESS } from '@/lib/designSystem'

const CANOPY = {
  green: [PALETTE.grassDark, PALETTE.grass, PALETTE.grassLight],
  pink: [PALETTE.blossomDark, PALETTE.blossom, PALETTE.blossomLight],
} as const

/** How far a tinted canopy is pulled toward its landmark's accent. */
const TINT_STRENGTH = 0.45

/** Buffer size. A tree uses 5–7 of these; spares are scaled to nothing. */
const MAX_PUFFS = 7

const PUFF_GEO = new SphereGeometry(1, 14, 10)
const TRUNK_GEO = new CylinderGeometry(0.05, 0.07, 0.46, 8)

const _q = new Quaternion()
const _pos = new Vector3()
const _scl = new Vector3()
const _col = new Color()
const _zero = new Vector3(0, 0, 0)

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
 * It also flows: the sway is a vertex shader keyed to each puff's own
 * position and driven by the shared ambient clock, so the crown ripples
 * rather than swinging rigidly, at no per-frame CPU cost. Instanced, so
 * a whole canopy is one draw call.
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
  const puffs = useRef<InstancedMesh>(null)

  const material = useMemo(() => {
    const m = new MeshStandardMaterial({ roughness: ROUGHNESS.foliage })
    const uTime = { value: 0 }
    const uSway = { value: 0.035 }
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uTime
      shader.uniforms.uSway = uSway
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          '#include <common>\nuniform float uTime;\nuniform float uSway;',
        )
        // Applied AFTER the instance transform, so the offset lives in the
        // tree's own space and isn't scaled by the puff's matrix.
        .replace(
          'mvPosition = instanceMatrix * mvPosition;',
          `mvPosition = instanceMatrix * mvPosition;
           float ph = instanceMatrix[3].x * 5.3 + instanceMatrix[3].z * 3.9;
           float amp = uSway * max(instanceMatrix[3].y - 0.3, 0.0);
           mvPosition.x += sin(uTime * 1.05 + ph) * amp;
           mvPosition.z += cos(uTime * 0.86 + ph * 1.3) * amp * 0.7;`,
        )
    }
    m.userData.uTime = uTime
    return m
  }, [])

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

    const matrices: Matrix4[] = []
    const colors: Color[] = []

    // The core puff — the mass everything else grows out of.
    _pos.set(0, cy, 0)
    _scl.set(coreR, coreR * (0.88 + rng() * 0.14), coreR)
    matrices.push(new Matrix4().compose(_pos.clone(), _q.identity().clone(), _scl.clone()))
    colors.push(_col.copy(mid).clone())

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
      _pos.set(Math.cos(ang) * d, cy + lift, Math.sin(ang) * d * 0.9)
      _scl.set(r, r * (0.86 + rng() * 0.18), r)
      matrices.push(new Matrix4().compose(_pos.clone(), _q.identity().clone(), _scl.clone()))

      // Higher puffs catch the light; low ones fall into the dark tone.
      const t = Math.min(1, Math.max(0, lift / (coreR * 0.8) + 0.5))
      _col.copy(dark).lerp(mid, t)
      if (t > 0.72) _col.lerp(light, 0.6)
      colors.push(_col.clone())
    }

    // Unused slots collapse to nothing.
    for (let i = count; i < MAX_PUFFS; i++) {
      matrices.push(new Matrix4().compose(_zero, _q.identity().clone(), _zero))
      colors.push(new Color(0, 0, 0))
    }

    return {
      matrices,
      colors,
      lean: (rng() - 0.5) * 0.12,
      tilt: (rng() - 0.5) * 0.07,
      trunkH: 0.9 + rng() * 0.22,
    }
  }, [seed, variant, tint])

  useEffect(() => {
    const mesh = puffs.current
    if (!mesh) return
    for (let i = 0; i < MAX_PUFFS; i++) {
      mesh.setMatrixAt(i, layout.matrices[i])
      mesh.setColorAt(i, layout.colors[i])
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [layout])

  useFrame(() => {
    material.userData.uTime.value = getAmbientTime()
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
      <instancedMesh
        ref={puffs}
        args={[PUFF_GEO, material, MAX_PUFFS]}
        castShadow
        receiveShadow
      />
    </group>
  )
}
